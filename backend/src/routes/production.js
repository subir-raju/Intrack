const express = require("express");
const router = express.Router();
const { validateRequest, schemas } = require("../middleware/validation");
const { authenticateToken } = require("../middleware/auth");
const productionController = require("../controllers/productionController");

router.post(
  "/record",
  authenticateToken,
  validateRequest(schemas.productionRecordSchema),
  productionController.recordProduction
);
router.get(
  "/daily-stats",
  authenticateToken,
  productionController.getDailyStats
);
router.get(
  "/defect-analysis",
  authenticateToken,
  productionController.getDefectAnalysis
);
router.get("/history", authenticateToken, productionController.getHistory);
router.get(
  "/categories",
  authenticateToken,
  productionController.getDefectCategories
);
router.get(
  "/rejection-reasons",
  authenticateToken,
  productionController.getRejectionReasons
);
router.post(
  "/categories",
  authenticateToken,
  productionController.addDefectCategory
);
router.post(
  "/rejection-reasons",
  authenticateToken,
  productionController.addRejectionReason
);

module.exports = router;
