const Customer = require('../models/customer.model');
const bcrypt = require('bcryptjs');
const generateTokenAndSetCookie = require('../utils/generateToken');

// @desc    Register a customer
// @route   POST /customers/register
exports.registerCustomer = async (req, res) => {
  try {
    const { fullName, email, password, phone } = req.body || {};
    const normalizedEmail = email?.trim().toLowerCase();

    // Validation
    if (!fullName?.trim() || !normalizedEmail || !password || !phone?.trim()) {
      return res.status(400).json({ message: 'All fields are mandatory' });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    const existingCustomer = await Customer.findOne({ email: normalizedEmail });
    if (existingCustomer) {
      return res.status(409).json({ message: 'Email already exists' });
    }

    // Hash Password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newCustomer = await Customer.create({
      fullName,
      email: normalizedEmail,
      password: hashedPassword,
      phone: phone.trim()
    });

    res.status(201).json({
      success: true,
      message: 'Customer registered successfully',
      customer: {
        _id: newCustomer._id,
        fullName: newCustomer.fullName,
        email: newCustomer.email,
        phone: newCustomer.phone
      }
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ message: 'Email already exists' });
    }
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Login customer
// @route   POST /customers/login
exports.loginCustomer = async (req, res) => {
  try {
    const { email, password } = req.body || {};
    const normalizedEmail = email?.trim().toLowerCase();

    if (!normalizedEmail || !password) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const customer = await Customer.findOne({ email: normalizedEmail }).select('+password');
    if (!customer) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, customer.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Generate Token & set Cookie
    generateTokenAndSetCookie(res, customer._id);

    res.status(200).json({
      success: true,
      message: 'Login successful'
    });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Get customer profile
// @route   GET /customers/me
exports.getProfile = async (req, res) => {
  try {
    res.status(200).json(req.user);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Logout customer
// @route   POST /customers/logout
exports.logoutCustomer = async (req, res) => {
  try {
    res.clearCookie('jwt', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/'
    });

    res.status(200).json({
      success: true,
      message: 'Logged out successfully'
    });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// BONUS CHALLENGE: Change Password
// @route   PATCH /customers/change-password
exports.changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body || {};
    if (!oldPassword || !newPassword || newPassword.length < 6) {
      return res.status(400).json({ message: 'A valid current and new password are required' });
    }
    const customer = await Customer.findById(req.user._id);

    const isMatch = await bcrypt.compare(oldPassword, customer.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Incorrect current password' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'New password must be at least 6 characters' });
    }

    const salt = await bcrypt.genSalt(10);
    customer.password = await bcrypt.hash(newPassword, salt);
    await customer.save();

    res.status(200).json({ success: true, message: 'Password updated successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};