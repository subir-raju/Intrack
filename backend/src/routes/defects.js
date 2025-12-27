const express = require("express");
const router = express.Router();
const { authenticateToken } = require("../middleware/auth");
const productionController = require("../controllers/productionController");

router.get(
  "/categories",
  authenticateToken,
  productionController.getDefectCategories
);
router.post(
  "/categories",
  authenticateToken,
  productionController.addDefectCategory
);
router.get(
  "/rejection-reasons",
  authenticateToken,
  productionController.getRejectionReasons
);
router.post(
  "/rejection-reasons",
  authenticateToken,
  productionController.addRejectionReason
);

module.exports = router;
