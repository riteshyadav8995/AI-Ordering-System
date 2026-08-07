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
      },
      {
        type: "function",
        function: {
          name: "request_handoff",
          description: "Use this when the customer explicitly asks to speak to a human, or if you are completely stuck and cannot fulfill the order.",
          parameters: {
            type: "object",
            properties: {
              reason: { type: "string" }
            },
            required: ["reason"]
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
        } else if (toolCall.function.name === "request_handoff") {
          console.log("Mistral triggered request_handoff:", toolCall.function.arguments);
          let args;
          try {
            args = JSON.parse(toolCall.function.arguments);
          } catch(e) {
            args = toolCall.function.arguments;
          }
          if (io) {
            io.emit('handoffRequested', { sessionId, reason: args.reason });
          }
          outputText = "I am transferring you to a human manager. Please hold on.";
          // We could also set a flag in the DB or session that this session is handed off.
        }
      }
    }

    if (!orderPlaced) {
      outputText = outputText.replace(/[*#]/g, '').trim();
      history.push({
        role: "model",
        parts: [{ text: outputText }]
      });
    }

    return { text: outputText.replace(/[*#]/g, '').trim(), orderPlaced, action, paymentDetails };
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
            text: `System Instruction: You are "Aura", an advanced AI order-taking assistant for a premium restaurant. You handle web chat, phone calls, and WhatsApp messages.
RULES:
1. Speak ONLY in English. If the user speaks Hindi or Urdu, translate it and reply in English.
2. Be polite, extremely concise, and do not use filler words. Do not list the full menu unless explicitly asked.
3. If a user asks about ingredients, allergens, or prices, answer accurately based on the menu context provided.
4. If a user asks to speak to a human or manager, OR if you cannot fulfill their request after 2 attempts, call the "request_handoff" tool immediately and let them know you are transferring them.
5. DO NOT use markdown formatting (no asterisks, no hashes, no bold). Speak in plain natural text.

MENU CONTEXT:
${menuContext}

CHECKOUT & OMNICHANNEL WORKFLOW:
1. ALWAYS call the "update_cart" function whenever the user adds, removes, or modifies items. Calculate the current total and pass it to the function.
2. Address Collection: Before finalizing, ask for the user's delivery address and phone number if not already provided.
3. Web Checkout: When the customer is ready to checkout on the web, politely tell them: "Your order is ready. Please click the Make Payment button on your screen to finalize your order."
4. WhatsApp/Phone Checkout: Say "I have captured your order and address. I will now send a payment link to your WhatsApp. Thank you for ordering!"`
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

// ── UPI link generator ─────────────────────────────────────────────
const generateUpiLink = (amount, note = 'Neon Bite Order') => {
  const vpa = process.env.UPI_VPA || 'neonbite@upi';
  const name = encodeURIComponent('Neon Bite');
  const encodedNote = encodeURIComponent(note);
  return `upi://pay?pa=${vpa}&pn=${name}&am=${amount}&cu=INR&tn=${encodedNote}`;
};

// ── Shared tool definitions ────────────────────────────────────────
const getAiTools = () => [
  {
    type: "function",
    function: {
      name: "update_cart",
      description: "Call this EVERY TIME the customer adds, removes, or modifies items. Pass the full current cart.",
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
                price: { type: "number" },
                customizations: { type: "array", items: { type: "string" } }
              },
              required: ["name", "quantity", "price"]
            }
          },
          totalAmount: { type: "number" }
        },
        required: ["items", "totalAmount"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "select_payment",
      description: "Call this when the customer has confirmed their order and chosen a payment method (UPI or COD). This finalises the order.",
      parameters: {
        type: "object",
        properties: {
          paymentMethod: { type: "string", enum: ["upi", "cash"] },
          deliveryAddress: { type: "string" },
          customerName: { type: "string" },
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
        required: ["paymentMethod", "items", "totalAmount"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "request_handoff",
      description: "Call this when the customer explicitly asks for a human, or you cannot resolve their issue after 2 attempts.",
      parameters: {
        type: "object",
        properties: {
          reason: { type: "string" }
        },
        required: ["reason"]
      }
    }
  }
];

// ── Build system prompt ────────────────────────────────────────────
const buildSystemPrompt = (menuContext, channel = 'web') => `
System Instruction: You are "Aura", an AI ordering assistant for Neon Bite restaurant. You handle ${channel === 'web' ? 'web chat orders' : channel === 'whatsapp' ? 'WhatsApp orders' : 'phone call orders'}.

RULES:
1. Reply ONLY in English regardless of the customer's language.
2. Be warm, polite, and concise. Do NOT list the full menu unprompted.
3. Answer ingredient, allergen, availability, and price questions accurately from the menu.
4. For returning customers, proactively offer to repeat their last order.
5. If you cannot help after 2 tries, call "request_handoff" immediately.
6. DO NOT use markdown formatting (no asterisks, no hashes, no bold). Output plain text only.

MENU:
${menuContext}

ORDER WORKFLOW:
1. Take order → call "update_cart" for every change.
2. Ask for delivery address and customer name before payment.
3. Ask: "Would you like to pay via UPI (instant link) or Cash on Delivery?"
4. Once confirmed, call "select_payment" with all details.
5. ${channel === 'web'
    ? 'For web: tell the customer to click Make Payment on their screen.'
    : 'For WhatsApp/phone: tell the customer a UPI payment link will be sent, or confirm COD.'}
`;

const processTextChat = async (sessionId, text, io, user, channel = 'web', phoneNumber = null) => {
  if (!sessionHistory[sessionId]) {
    const menuContext = await menuService.getMenuContextString();
    sessionHistory[sessionId] = [
      { role: "user", parts: [{ text: buildSystemPrompt(menuContext, channel) }] },
      { role: "model", parts: [{ text: "Understood. Ready to take orders for Neon Bite." }] }
    ];
  }

  const history = sessionHistory[sessionId];
  history.push({ role: "user", parts: [{ text }] });

  const mistralMessages = formatMistralHistory(history);
  const tools = getAiTools();

  try {
    const response = await mistralClient.chat.complete({
      model: "mistral-large-latest",
      messages: mistralMessages,
      tools,
      toolChoice: "auto",
    });

    const responseMessage = response.choices[0].message;
    let outputText = responseMessage.content || "";
    let orderPlaced = false;
    let orderData = null;

    if (responseMessage.toolCalls && responseMessage.toolCalls.length > 0) {
      for (const toolCall of responseMessage.toolCalls) {
        let args = toolCall.function.arguments;
        if (typeof args === 'string') { try { args = JSON.parse(args); } catch(e) {} }

        if (toolCall.function.name === "update_cart") {
          if (io) io.emit('cartUpdated', args);

        } else if (toolCall.function.name === "select_payment") {
          // Build the order data for DB commit
          orderData = {
            items: args.items,
            totalAmount: args.totalAmount,
            paymentMethod: args.paymentMethod === 'upi' ? 'upi' : 'cash',
            paymentStatus: args.paymentMethod === 'cash' ? 'Pending' : 'Pending',
            customerName: args.customerName || 'Guest',
            deliveryAddress: args.deliveryAddress || '',
            isDelivery: !!args.deliveryAddress,
            channel: channel || 'web',
            phoneNumber: phoneNumber || ''
          };
          orderPlaced = true;

          if (args.paymentMethod === 'upi') {
            const upiLink = generateUpiLink(args.totalAmount, `Order from ${args.customerName || 'Customer'}`);
            outputText = `Great! Your order is confirmed. Here is your UPI payment link: ${upiLink} — Pay ₹${args.totalAmount} to complete your order. Once paid, your food will be prepared!`;
            if (io) io.emit('upiPaymentRequested', { sessionId, upiLink, total: args.totalAmount });
          } else {
            outputText = `Perfect! Your order is confirmed with Cash on Delivery. Our team will collect ₹${args.totalAmount} at your doorstep. Thank you for ordering from Neon Bite!`;
          }

          if (io) io.emit('cartUpdated', { items: args.items, totalAmount: args.totalAmount });

        } else if (toolCall.function.name === "request_handoff") {
          if (io) io.emit('handoffRequested', { sessionId, reason: args.reason, channel, phoneNumber });
          outputText = "I'm transferring you to our team right away. Please hold on!";
        }
      }
    }

    outputText = outputText.replace(/[*#]/g, '').trim();
    history.push({ role: "model", parts: [{ text: outputText }] });
    return { text: outputText, orderPlaced, orderData };

  } catch (err) {
    console.error("Text chat processing error:", err);
    return { text: "I'm having trouble right now. Please try again in a moment." };
  }
};

module.exports = {
  generateAudioResponse,
  processTextChat
};
