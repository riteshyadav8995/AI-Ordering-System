const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Helper to generate JWT token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'fallback_secret', {
    expiresIn: '30d',
  });
};

// In-memory OTP store for registration
const otpStore = new Map();

exports.sendOtp = async (req, res) => {
  try {
    let { email, firstName } = req.body;
    if (!email || !firstName) return res.status(400).json({ message: 'Email and First Name required' });
    email = email.trim().toLowerCase();

    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) return res.status(400).json({ message: 'Email already registered' });

    // Generate 6 digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    otpStore.set(email, { otp, expiresAt: Date.now() + 10 * 60 * 1000 }); // 10 minutes

    // Send email via Brevo REST API
    const senderEmail = process.env.BREVO_SENDER_EMAIL;
    const senderName  = process.env.BREVO_SENDER_NAME || 'Neon Bite';

    if (!senderEmail) {
      console.error('BREVO_SENDER_EMAIL is not set in .env');
      return res.status(500).json({ message: 'Email service not configured (missing BREVO_SENDER_EMAIL)' });
    }
    if (!process.env.BREVO_API_KEY) {
      console.error('BREVO_API_KEY is not set in .env');
      return res.status(500).json({ message: 'Email service not configured (missing BREVO_API_KEY)' });
    }

    const brevoPayload = {
      sender: { name: senderName, email: senderEmail },
      to: [{ email: email, name: firstName }],
      subject: `Your ${senderName} Verification Code`,
      htmlContent: `
        <html><body style="font-family:sans-serif;padding:24px;">
          <h2 style="color:#111;">Welcome to ${senderName}!</h2>
          <p>Hi ${firstName}, use the code below to verify your email address:</p>
          <div style="font-size:36px;font-weight:bold;letter-spacing:8px;padding:20px;background:#f3f4f6;border-radius:12px;display:inline-block;margin:16px 0;">${otp}</div>
          <p style="color:#555;">This code expires in <strong>10 minutes</strong>. Do not share it with anyone.</p>
        </body></html>
      `
    };

    console.log('Sending OTP via Brevo to:', email, '| Sender:', senderEmail);

    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'api-key': process.env.BREVO_API_KEY
      },
      body: JSON.stringify(brevoPayload)
    });

    const responseText = await response.text();

    if (!response.ok) {
      console.error('Brevo API Error:', response.status, responseText);
      return res.status(500).json({ message: 'Failed to send OTP email', detail: responseText });
    }

    console.log('OTP sent successfully to', email);
    res.json({ message: 'OTP sent successfully' });
  } catch (error) {
    console.error('sendOtp error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.register = async (req, res) => {
  try {
    let { firstName, lastName, mobile, email, password, otp } = req.body;

    // Validation
    if (!firstName || !mobile || !email || !password || !otp) {
      return res.status(400).json({ message: 'Please provide all required fields including OTP' });
    }

    // Normalize email (lowercase and trim)
    email = email.trim().toLowerCase();
    firstName = firstName.trim();
    lastName = lastName ? lastName.trim() : '';
    mobile = mobile.trim();

    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    // Verify OTP
    const storedData = otpStore.get(email);
    if (!storedData) {
      return res.status(400).json({ message: 'No OTP requested for this email' });
    }
    if (Date.now() > storedData.expiresAt) {
      otpStore.delete(email);
      return res.status(400).json({ message: 'OTP expired. Please request a new one.' });
    }
    if (storedData.otp !== otp) {
      return res.status(400).json({ message: 'Invalid OTP' });
    }
    
    // OTP verified, remove from store
    otpStore.delete(email);

    // Determine role based on email domain
    const role = email.endsWith('@ai.com') ? 'admin' : 'user';

    // Create user
    const user = await User.create({
      firstName,
      lastName,
      mobile,
      email,
      password,
      role
    });

    if (user) {
      res.status(201).json({
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        token: generateToken(user._id)
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    let { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide email and password' });
    }

    email = email.trim().toLowerCase();

    // Find user
    const user = await User.findOne({ email });

    // Verify password
    if (user && (await user.comparePassword(password))) {
      res.json({
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        token: generateToken(user._id)
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
