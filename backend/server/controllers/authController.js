const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const User = require("../models/User");
const { sendWelcomeEmail } = require("../utils/emailService");

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });
};

const createSendToken = (user, statusCode, res) => {
  const token = signToken(user._id);

  // Remove password from output
  user.password = undefined;

  res.status(statusCode).json({
    status: "success",
    token,
    data: {
      user,
    },
  });
};

exports.signup = async (req, res) => {
  try {
    // Prevent hanging requests if Database is disconnected
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({
        error: "Database connection failed"
      });
    }

    const { name, email, password } = req.body;

    // Check if email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        error: "User already exists",
      });
    }

    // Make accounts with @nexora.com email admins by default
    const role = email.endsWith('@nexora.com') ? 'admin' : 'user';

    const newUser = await User.create({
      name,
      email,
      password,
      role
    });

    // Send welcome email (non-blocking)
    sendWelcomeEmail(email, name).catch(err => console.error("[EMAIL]", err.message));

    createSendToken(newUser, 201, res);
  } catch (err) {
    res.status(400).json({
      error: err.message || "An error occurred during signup",
    });
  }
};

exports.login = async (req, res) => {
  try {
    // Prevent hanging requests if Database is disconnected
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({
        error: "Database connection failed"
      });
    }

    const { email, password } = req.body;

    // 1) Check if email and password exist
    if (!email || !password) {
      return res.status(400).json({
        error: "Please provide email and password!",
      });
    }

    // 2) Check if user exists && password is correct
    const user = await User.findOne({ email }).select("+password"); // Need to explicitly select password for comparison

    if (!user || !(await user.correctPassword(password, user.password))) {
      return res.status(401).json({
        error: "Invalid email or password",
      });
    }

    // 3) If everything ok, send token to client
    createSendToken(user, 200, res);
  } catch (err) {
    res.status(400).json({
      error: err.message || "An error occurred during login",
    });
  }
};
