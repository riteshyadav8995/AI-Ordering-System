require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

const updateAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const email = 'rk5061288@gmail.com';
    const password = 'Password@123';
    
    // Check if the user exists
    let admin = await User.findOne({ email });
    
    if (admin) {
      admin.password = password;
      admin.role = 'admin'; // Ensure role is admin
      await admin.save();
      console.log('Admin user updated successfully');
    } else {
      // Create new admin user
      admin = new User({
        firstName: 'Admin',
        lastName: 'User',
        email: email,
        password: password,
        mobile: '0000000000',
        role: 'admin'
      });
      await admin.save();
      console.log('Admin user created successfully');
    }

  } catch (error) {
    console.error('Error updating admin:', error);
  } finally {
    mongoose.disconnect();
  }
};

updateAdmin();
