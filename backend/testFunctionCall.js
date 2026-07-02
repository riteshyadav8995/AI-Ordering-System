require('dotenv').config();
const { GoogleGenAI } = require('@google/genai');
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

async function testFunctionCall() {
  const tools = [{
    functionDeclarations: [{
      name: "place_order",
      description: "Places a food order in the kitchen system once the customer has confirmed it.",
      parameters: {
        type: "OBJECT",
        properties: {
          items: {
            type: "ARRAY",
            items: {
              type: "OBJECT",
              properties: {
                name: { type: "STRING" },
                quantity: { type: "NUMBER" },
                modifications: { type: "STRING" }
              },
              required: ["name", "quantity"]
            }
          },
          totalAmount: { type: "NUMBER" },
          customerName: { type: "STRING" }
        },
        required: ["items", "totalAmount"]
      }
    }]
  }];

  const systemInstruction = {
    parts: [{
      text: `You are an AI order taker. Menu: Margherita Pizza ($12). 
CRITICAL REQUIREMENT: To actually place an order, you MUST call the "place_order" function. Saying "I've placed your order" in text DOES NOT place the order. You must trigger the "place_order" tool.`
    }]
  };

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: "I want two Margherita pizzas. Yes, that's my final order, please place it.",
      config: {
        systemInstruction,
        tools
      }
    });

    console.log("Function Calls:", response.functionCalls);
    console.log("Text:", response.text);
  } catch(e) {
    console.error(e);
  }
}

testFunctionCall();
