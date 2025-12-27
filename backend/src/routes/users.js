const express = require("express");
const router = express.Router();
const { authenticateToken, requireRole } = require("../middleware/auth");
const User = require("../models/User");
const logger = require("../utils/logger");

router.get("/", authenticateToken, requireRole("admin"), async (req, res) => {
  try {
    const users = await User.getAllUsers();
    res.json({
      success: true,
      data: users,
    });
  } catch (error) {
    logger.error("Users fetch error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch users",
    });
  }
});

router.put(
  "/:id",
  authenticateToken,
  requireRole("admin"),
  async (req, res) => {
    try {
      const { id } = req.params;
      const updateData = req.body;

      const user = await User.updateUser(id, updateData);

      logger.info(`User updated: ${id}`);
      res.json({
        success: true,
        message: "User updated successfully",
        data: user,
      });
    } catch (error) {
      logger.error("User update error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to update user",
      });
    }
  }
);

module.exports = router;
