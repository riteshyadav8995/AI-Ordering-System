require('dotenv').config();
const { GoogleGenAI } = require('@google/genai');

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

async function testLive() {
  try {
    const session = await ai.live.connect({
      model: 'gemini-2.0-flash-exp', // Test this model!
      config: {
        systemInstruction: { parts: [{ text: "You are an AI" }] }
      },
      callbacks: {
        onopen: () => console.log('Connected!'),
        onmessage: (e) => console.log('Message:', JSON.stringify(e)),
        onclose: (e) => console.log('Closed', e)
      }
    });
    
    // Test sending something
    session.sendClientContent({
      turns: [{ role: "user", parts: [{ text: "Hello!" }] }],
      turnComplete: true
    });
  } catch (err) {
    console.error(err);
  }
}

testLive();
