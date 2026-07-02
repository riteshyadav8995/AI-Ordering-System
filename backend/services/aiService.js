const { GoogleGenAI } = require('@google/genai');
const Groq = require('groq-sdk');
const { Mistral } = require('@mistralai/mistralai');
const fs = require('fs');
const path = require('path');
const os = require('os');
const menuService = require('./menuService');
const orderService = require('./orderService');

const geminiClient = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
const groqClient = new Groq({ apiKey: process.env.GROQ_API_KEY });
const mistralClient = new Mistral({ apiKey: process.env.mistral_api_key });

const sessionHistory = {};

// Helper to convert base64 to a temp file for Groq Whisper
const createTempAudioFile = (base64Audio, mimeType) => {
  const extension = mimeType.split('/')[1].split(';')[0]; // audio/webm -> webm
  const tempFilePath = path.join(os.tmpdir(), `audio_${Date.now()}.${extension}`);
  fs.writeFileSync(tempFilePath, Buffer.from(base64Audio, 'base64'));
  return tempFilePath;
};

// Helper to format Mistral history
const formatMistralHistory = (history) => {
  const mistralHistory = [];
  for (const msg of history) {
    if (msg.role === 'user') {
      const textParts = msg.parts.filter(p => p.text).map(p => p.text);
      if (textParts.length > 0) {
        mistralHistory.push({ role: 'user', content: textParts.join('\n') });
      }
    } else if (msg.role === 'model') {
      const textParts = msg.parts.filter(p => p.text).map(p => p.text);
      if (textParts.length > 0) {
        mistralHistory.push({ role: 'assistant', content: textParts.join('\n') });
      }
    }
  }
  return mistralHistory;
};

const processWithMistral = async (sessionId, base64Audio, mimeType, io, user) => {
  console.log("Processing with Groq Whisper + Mistral...");
  const tempFilePath = createTempAudioFile(base64Audio, mimeType);
  
  try {
    // 1. Transcribe Audio using Groq Whisper (Blazing fast STT)
    const transcription = await groqClient.audio.transcriptions.create({
      file: fs.createReadStream(tempFilePath),
      model: "whisper-large-v3",
    });
    
    const userText = transcription.text;
    console.log("Whisper Transcription:", userText);
    
    if (!userText || userText.trim() === '') {
      return { text: "I didn't hear anything clearly. Could you please repeat that?", orderPlaced: false };
    }

    // 2. Add transcription to history
    const history = sessionHistory[sessionId];
    history.push({
      role: "user",
      parts: [{ text: userText }]
    });

    // 3. Process with Mistral
    const mistralMessages = formatMistralHistory(history);
    
    const tools = [
      {
        type: "function",
        function: {
          name: "update_cart",
          description: "Use this to update the visual cart on the customer's screen ANY TIME they add, remove, or modify items in their order.",
          parameters: {
            type: "object",
            properties: {
              items: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    name: { type: "string" },
                    quantity: { type: "number" },
                    price: { type: "number" }
                  },
                  required: ["name", "quantity", "price"]
                }
              },
              totalAmount: { type: "number" }
            },
            required: ["items", "totalAmount"]
          }
        }
      }
    ];

    const response = await mistralClient.chat.complete({
      model: "mistral-large-latest",
      messages: mistralMessages,
      tools: tools,
      toolChoice: "auto",
    });

    const responseMessage = response.choices[0].message;
    let outputText = responseMessage.content || "";
    let orderPlaced = false;
    let action = null;
    let paymentDetails = null;

    // 4. Handle Tool Calls
    if (responseMessage.toolCalls && responseMessage.toolCalls.length > 0) {
      for (const toolCall of responseMessage.toolCalls) {
        if (toolCall.function.name === "update_cart") {
          console.log("Mistral triggered update_cart:", toolCall.function.arguments);
          let args;
          try {
             args = JSON.parse(toolCall.function.arguments);
          } catch(e) {
             args = toolCall.function.arguments;
          }
          if (io) {
            io.emit('cartUpdated', args);
          }
          // Do NOT return here. Let it proceed to push the model's text response to history and return the text.
        }
      }
    }

    if (!orderPlaced) {
      history.push({
        role: "model",
        parts: [{ text: outputText }]
      });
    }

    return { text: outputText, orderPlaced, action, paymentDetails };
  } finally {
    if (fs.existsSync(tempFilePath)) {
      fs.unlinkSync(tempFilePath);
    }
  }
};

const processWithGemini = async (sessionId, base64Audio, mimeType, io, user) => {
  // We keep this as an ultimate fallback if Groq/Mistral both fail. 
  // It won't have the payment flow fully baked in to keep it simple, or we can just return an error.
  return { text: "Sorry, I am currently experiencing technical difficulties. Please try again later.", orderPlaced: false };
};

const generateAudioResponse = async (sessionId, base64Audio, mimeType, io, user) => {
  if (!sessionHistory[sessionId]) {
    const menuContext = await menuService.getMenuContextString();
    sessionHistory[sessionId] = [
      {
        role: "user",
        parts: [{ 
            text: `System Instruction: You are an AI order taker for a home-delivery restaurant.
RULES:
1. Speak ONLY in English, regardless of the language the user speaks. If the user speaks Hindi or Urdu, translate it in your head and reply ONLY in English. Do not use bold formatting or markdown in your speech.
2. Be extremely concise. Do not use filler words. Do not list out the full menu unless asked.

${menuContext}

CHECKOUT WORKFLOW:
1. ALWAYS call the "update_cart" function whenever the user adds, removes, or modifies items. Calculate the current total and pass it to the function.
2. When the customer is ready to checkout, politely tell them: "Your order is ready in the Live Cart. Please click the Make Payment button on your screen to finalize your order." Do NOT try to checkout for them.`
        }]
      },
      {
        role: "model",
        parts: [{ text: "Understood. I will follow these rules strictly and reply only in English." }]
      }
    ];
  }

  try {
    if (!process.env.mistral_api_key || !process.env.GROQ_API_KEY) {
      throw new Error("Missing API keys for Mistral or Groq.");
    }
    return await processWithMistral(sessionId, base64Audio, mimeType, io, user);
  } catch (error) {
    console.error("Mistral/Groq Error:", error.message, error);
    return await processWithGemini(sessionId, base64Audio, mimeType, io, user);
  }
};

module.exports = {
  generateAudioResponse
};
