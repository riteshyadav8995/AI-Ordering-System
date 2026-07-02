require('dotenv').config();
const { GoogleGenAI } = require('@google/genai');

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

async function testRest() {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: "Say 'Hello World' in a funny voice.",
      config: {
        responseModalities: ["AUDIO"],
      }
    });
    console.log("Response text:", response.text);
    const audioPart = response.candidates?.[0]?.content?.parts?.find(p => p.inlineData);
    if (audioPart) {
        console.log("Got audio!", audioPart.inlineData.mimeType, audioPart.inlineData.data.substring(0, 50));
    } else {
        console.log("No audio part in response");
    }
  } catch (err) {
    console.error(err);
  }
}

testRest();
