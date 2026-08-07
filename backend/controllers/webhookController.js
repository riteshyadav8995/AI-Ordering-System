const aiService = require('../services/aiService');
const Order = require('../models/Order');
const MissedCall = require('../models/MissedCall');
const orderService = require('../services/orderService');

// ─── WhatsApp Webhook Verification ───────────────────────────────────────────
exports.verifyWhatsApp = (req, res) => {
  const verify_token = process.env.WHATSAPP_VERIFY_TOKEN;
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode === 'subscribe' && token === verify_token) {
    console.log('WHATSAPP_WEBHOOK_VERIFIED');
    return res.status(200).send(challenge);
  }
  res.sendStatus(403);
};

// ─── WhatsApp Incoming Message ────────────────────────────────────────────────
exports.handleWhatsAppMessage = async (req, res) => {
  res.sendStatus(200); // Acknowledge immediately

  try {
    const body = req.body;
    if (!body.object) return;

    const value = body.entry?.[0]?.changes?.[0]?.value;
    if (!value?.messages?.[0]) return;

    const message = value.messages[0];
    const senderId = message.from; // Customer WhatsApp phone number

    let messageText = '';
    if (message.type === 'text') {
      messageText = message.text.body;
    } else if (message.type === 'audio') {
      messageText = '[Voice message received. Please type your order for now.]';
    }

    if (!messageText) return;

    // Check for repeat order shortcut
    let repeatOrderContext = '';
    if (/repeat|same|last order|previous order/i.test(messageText)) {
      const lastOrder = await orderService.getLastOrderByPhone(senderId);
      if (lastOrder) {
        const itemsSummary = lastOrder.items.map(i => `${i.quantity}x ${i.name}`).join(', ');
        repeatOrderContext = `\n\n[SYSTEM NOTE: Customer may want to repeat their last order: ${itemsSummary} (Total: ₹${lastOrder.totalAmount}). Confirm with them before placing.]`;
      }
    }

    const io = req.io;
    const aiResponse = await aiService.processTextChat(
      `wa_${senderId}`,
      messageText + repeatOrderContext,
      io,
      null,
      'whatsapp',
      senderId
    );

    if (aiResponse?.text) {
      await sendWhatsAppMessage(senderId, aiResponse.text);
    }

    // If AI placed an order, push it to dashboard
    if (aiResponse?.orderPlaced && aiResponse?.orderData) {
      const saved = await orderService.createOrder({
        ...aiResponse.orderData,
        phoneNumber: senderId,
        channel: 'whatsapp'
      });
      io?.emit('newOrder', saved);
    }

  } catch (error) {
    console.error('WhatsApp webhook error:', error);
  }
};

// ─── Exotel Voice Webhook ─────────────────────────────────────────────────────
exports.handleExotelCall = async (req, res) => {
  try {
    const { CallSid, From, CallStatus, Body } = { ...req.body, ...req.query };
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:5000';

    console.log(`Exotel webhook | From: ${From} | CallSid: ${CallSid} | Status: ${CallStatus}`);

    // Log missed calls (no-answer, busy)
    if (CallStatus === 'no-answer' || CallStatus === 'busy') {
      await MissedCall.create({ phoneNumber: From, callSid: CallSid });
      console.log(`Missed call logged from: ${From}`);
      return res.status(200).send('OK');
    }

    res.set('Content-Type', 'application/xml');

    if (!Body) {
      // Initial incoming call — greet and record
      const lastOrder = await orderService.getLastOrderByPhone(From).catch(() => null);
      const greeting = lastOrder
        ? `Welcome back to Neon Bite! Your last order was ${lastOrder.items.map(i => `${i.quantity} ${i.name}`).join(', ')}. Would you like to repeat that, or order something new?`
        : `Welcome to Neon Bite! I am Aura, your AI ordering assistant. What would you like to order today?`;

      return res.send(`<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="alice">${greeting}</Say>
  <Record maxLength="15" playBeep="false" action="${backendUrl}/api/webhooks/exotel" method="POST" />
</Response>`);
    }

    // Exotel returned transcribed speech in Body
    const io = req.io;
    const aiResponse = await aiService.processTextChat(
      `exotel_${CallSid || From}`,
      Body,
      io,
      null,
      'voice',
      From
    );

    const reply = aiResponse?.text || "I'm sorry, I didn't understand that. Please try again.";

    return res.send(`<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="alice">${reply}</Say>
  <Record maxLength="15" playBeep="false" action="${backendUrl}/api/webhooks/exotel" method="POST" />
</Response>`);

  } catch (error) {
    console.error('Exotel webhook error:', error);
    res.set('Content-Type', 'application/xml');
    res.send(`<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say>Sorry, we are experiencing technical difficulties. Please call back shortly.</Say>
</Response>`);
  }
};

// ─── Helper: Send WhatsApp message via Meta API ───────────────────────────────
async function sendWhatsAppMessage(to, text) {
  const WHATSAPP_TOKEN = process.env.WHATSAPP_TOKEN;
  const PHONE_NUMBER_ID = process.env.PHONE_NUMBER_ID;

  if (!WHATSAPP_TOKEN || !PHONE_NUMBER_ID) {
    console.log(`[Simulated WhatsApp → ${to}]: ${text}`);
    return;
  }

  try {
    const res = await fetch(`https://graph.facebook.com/v17.0/${PHONE_NUMBER_ID}/messages`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${WHATSAPP_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        to,
        text: { body: text }
      })
    });
    if (!res.ok) console.error('WhatsApp send error:', await res.text());
  } catch (err) {
    console.error('WhatsApp send exception:', err);
  }
}
