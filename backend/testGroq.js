require('dotenv').config();
const Groq = require('groq-sdk');
const groqClient = new Groq({ apiKey: process.env.GROQ_API_KEY });

async function testLlama() {
  const tools = [
    {
      type: "function",
      function: {
        name: "place_order",
        description: "Places a food order in the kitchen system once the customer has confirmed it.",
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
                  modifications: { type: "string" }
                },
                required: ["name", "quantity"]
              }
            },
            totalAmount: { type: "number" },
            customerName: { type: "string" }
          },
          required: ["items", "totalAmount"]
        }
      }
    }
  ];

  try {
    const response = await groqClient.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: 'system',
          content: 'You are a restaurant AI. CRITICAL INSTRUCTION: When the customer explicitly confirms their final order, you MUST execute the "place_order" function call. DO NOT simply reply with "I have placed your order". You MUST actually trigger the "place_order" tool with the required arguments so the backend can process it into the database.'
        },
        {
          role: 'user',
          content: 'I want two Margherita pizzas. Yes, that is my final order.'
        }
      ],
      tools: tools,
      tool_choice: "auto",
    });

    console.log("Response Message:", JSON.stringify(response.choices[0].message, null, 2));
  } catch(e) {
    console.error(e);
  }
}

testLlama();
