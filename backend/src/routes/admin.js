const express = require("express");
const router = express.Router();
const { authenticateToken, requireRole } = require("../middleware/auth");
const adminController = require("../controllers/adminController");

router.get(
  "/dashboard",
  authenticateToken,
  requireRole("admin"),
  adminController.getDashboard
);
router.get(
  "/production-summary",
  authenticateToken,
  requireRole("admin"),
  adminController.getProductionSummary
);
router.get(
  "/defect-trends",
  authenticateToken,
  requireRole("admin"),
  adminController.getDefectTrends
);
router.get(
  "/users",
  authenticateToken,
  requireRole("admin"),
  adminController.getUsers
);

module.exports = router;
