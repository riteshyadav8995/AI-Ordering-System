const WebSocket = require('ws');
require('dotenv').config();

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const geminiUrl = `wss://generativelanguage.googleapis.com/ws/google.ai.generativelanguage.v1alpha.GenerativeService.BidiGenerateContent?key=${GEMINI_API_KEY}`;

const modelsToTest = [
  "models/gemini-2.0-flash-exp",
  "models/gemini-2.0-flash",
  "models/gemini-2.5-flash",
  "models/gemini-2.0-flash-lite-preview-02-05",
  "gemini-2.0-flash",
  "models/gemini-2.0-flash-realtime"
];

let currentIndex = 0;

function testNext() {
  if (currentIndex >= modelsToTest.length) {
    console.log("All tested");
    return;
  }
  const model = modelsToTest[currentIndex++];
  console.log("Testing:", model);
  
  const ws = new WebSocket(geminiUrl);
  ws.on('open', () => {
    ws.send(JSON.stringify({ setup: { model } }));
  });
  ws.on('message', data => console.log("Success with", model, data.toString()));
  ws.on('close', (code, reason) => {
    console.log("Closed:", code, reason.toString());
    testNext();
  });
}

testNext();
