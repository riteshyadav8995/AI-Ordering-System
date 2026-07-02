const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Helper to generate JWT token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'fallback_secret', {
    expiresIn: '30d',
  });
};

exports.register = async (req, res) => {
  try {
    let { firstName, lastName, mobile, email, password } = req.body;

    // Validation
    if (!firstName || !mobile || !email || !password) {
      return res.status(400).json({ message: 'Please provide all required fields' });
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
