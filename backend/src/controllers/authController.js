const User = require("../models/User");
const logger = require("../utils/logger");

exports.login = async (req, res) => {
  try {
    const { email, password } = req.validatedData;

    const user = await User.findByEmail(email);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const isPasswordValid = await User.verifyPassword(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const token = await User.generateToken(user);

    logger.info(`User logged in: ${email}`);
    res.json({
      success: true,
      message: "Login successful",
      data: {
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          productionLineId: user.production_line_id,
        },
      },
    });
  } catch (error) {
    logger.error("Login error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

exports.register = async (req, res) => {
  try {
    const { name, email, password, role, productionLineId } = req.validatedData;

    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "Email already exists",
      });
    }

    const user = await User.createUser({
      name,
      email,
      password,
      role,
      productionLineId,
    });

    const token = await User.generateToken({
      ...user,
      production_line_id: productionLineId,
    });

    logger.info(`New user registered: ${email}`);
    res.status(201).json({
      success: true,
      message: "Registration successful",
      data: {
        token,
        user,
      },
    });
  } catch (error) {
    logger.error("Registration error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

exports.verify = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.json({
      success: true,
      data: user,
    });
  } catch (error) {
    logger.error("Token verification error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
