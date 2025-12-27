const express = require("express");
const router = express.Router();
const { validateRequest, schemas } = require("../middleware/validation");
const { authenticateToken } = require("../middleware/auth");
const authController = require("../controllers/authController");

router.post(
  "/login",
  validateRequest(schemas.loginSchema),
  authController.login
);
router.post(
  "/register",
  validateRequest(schemas.registerSchema),
  authController.register
);
router.get("/verify", authenticateToken, authController.verify);

module.exports = router;
