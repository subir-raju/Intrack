const express = require("express");
const jwt = require("jsonwebtoken");
const Joi = require("joi");
const User = require("../models/User");
const { authenticateToken } = require("../middleware/auth");
const { logger } = require("../utils/logger");

const router = express.Router();

// Validation schemas
const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
});

const registerSchema = Joi.object({
  name: Joi.string().min(2).max(100).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  role: Joi.string().valid("admin", "qc_manager").required(),
  production_line_id: Joi.number().integer().allow(null),
});

// Generate JWT token
const generateToken = (user) => {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role,
      production_line_id: user.production_line_id,
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || "24h" }
  );
};

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post("/login", async (req, res) => {
  try {
    // Validate request body
    const { error, value } = loginSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: "Validation error",
        errors: error.details.map((detail) => detail.message),
      });
    }

    const { email, password } = value;

    // Find user by email
    const user = await User.query()
      .findOne({ email, is_active: true })
      .withGraphFetched("productionLine");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // Verify password
    const isValidPassword = await user.verifyPassword(password);
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // Generate token
    const token = generateToken(user);

    // Log successful login
    logger.info(`User login successful: ${user.email} (${user.role})`);

    res.json({
      success: true,
      message: "Login successful",
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        production_line_id: user.production_line_id,
        productionLine: user.productionLine,
      },
    });
  } catch (error) {
    logger.error("Login error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

// @route   POST /api/auth/register
// @desc    Register new user (Admin only)
// @access  Private
router.post("/register", authenticateToken, async (req, res) => {
  try {
    // Only admins can register new users
    if (req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Access denied. Admin role required.",
      });
    }

    // Validate request body
    const { error, value } = registerSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: "Validation error",
        errors: error.details.map((detail) => detail.message),
      });
    }

    const { name, email, password, role, production_line_id } = value;

    // Check if user already exists
    const existingUser = await User.query().findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User with this email already exists",
      });
    }

    // Create new user
    const newUser = await User.query().insert({
      name,
      email,
      password,
      role,
      production_line_id,
    });

    logger.info(
      `New user registered: ${newUser.email} (${newUser.role}) by ${req.user.email}`
    );

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        production_line_id: newUser.production_line_id,
      },
    });
  } catch (error) {
    logger.error("Registration error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

// @route   GET /api/auth/verify
// @desc    Verify JWT token
// @access  Private
router.get("/verify", authenticateToken, async (req, res) => {
  try {
    const user = await User.query()
      .findById(req.user.id)
      .withGraphFetched("productionLine");

    if (!user || !user.is_active) {
      return res.status(401).json({
        success: false,
        message: "User not found or inactive",
      });
    }

    res.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        production_line_id: user.production_line_id,
        productionLine: user.productionLine,
      },
    });
  } catch (error) {
    logger.error("Token verification error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

// @route   POST /api/auth/logout
// @desc    Logout user (client-side token removal)
// @access  Private
router.post("/logout", authenticateToken, (req, res) => {
  logger.info(`User logout: ${req.user.email}`);
  res.json({
    success: true,
    message: "Logout successful",
  });
});

module.exports = router;
