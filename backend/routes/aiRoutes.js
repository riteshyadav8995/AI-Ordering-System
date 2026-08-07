const express = require('express');
const router = express.Router();
const aiService = require('../services/aiService');

const { protect } = require('../middleware/authMiddleware');

router.post('/chat', protect, async (req, res) => {
  try {
    const { sessionId, base64Audio, mimeType } = req.body;
    
    if (!sessionId || !base64Audio || !mimeType) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Pass the user info so the AI service can use it
    const result = await aiService.generateAudioResponse(sessionId, base64Audio, mimeType, req.io, req.user);
    
    res.json(result);
  } catch (error) {
    console.error('Error in AI Chat Route:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/text-chat', protect, async (req, res) => {
  try {
    const { sessionId, text } = req.body;
    
    if (!sessionId || !text) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const result = await aiService.processTextChat(sessionId, text, req.io, req.user, 'web');
    res.json(result);
  } catch (error) {
    console.error('Error in AI Text Chat Route:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
