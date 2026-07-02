const fetch = require('node-fetch');

async function testOrder() {
  try {
    const response = await fetch('http://localhost:5000/api/ai/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sessionId: 'test-order-session',
        // Instead of real audio base64, we will send an empty string.
        // Wait, if we send an empty string for audio, Gemini might return an error or ignore it.
        // Let's modify geminiService to allow text testing if audio is missing.
      })
    });
    
  } catch(err) {
    console.error(err);
  }
}

testOrder();
