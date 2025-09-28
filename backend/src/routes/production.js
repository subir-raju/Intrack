const express = require("express");
const Joi = require("joi");
const Production = require("../models/Production");
const { authenticateToken } = require("../middleware/auth");
const { publishMessage } = require("../config/rabbitmq");
const { logger } = require("../utils/logger");
const moment = require("moment");

const router = express.Router();

// Validation schemas
const recordProductionSchema = Joi.object({
  production_line_id: Joi.string().required(),
  type: Joi.string()
    .valid("first_time_through", "need_improvement", "modified", "rejected")
    .required(),
  timestamp: Joi.string().isoDate().required(),
  defects: Joi.array().items(Joi.string()).optional(),
  defect_count: Joi.number().integer().min(0).optional(),
  modifications: Joi.array().items(Joi.string()).optional(),
  modification_count: Joi.number().integer().min(0).optional(),
  rejection_reasons: Joi.array().items(Joi.string()).optional(),
  reason_count: Joi.number().integer().min(0).optional(),
});

// @route   POST /api/production/record
// @desc    Record production data
// @access  Private (QC Manager)
router.post("/record", authenticateToken, async (req, res) => {
  try {
    // Validate request body
    const { error, value } = recordProductionSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: "Validation error",
        errors: error.details.map((detail) => detail.message),
      });
    }

    // Ensure QC manager can only record for their assigned line
    if (
      req.user.role === "qc_manager" &&
      req.user.production_line_id &&
      req.user.production_line_id.toString() !== value.production_line_id
    ) {
      return res.status(403).json({
        success: false,
        message:
          "Access denied. You can only record data for your assigned production line.",
      });
    }

    // Create production record
    const productionData = {
      ...value,
      production_line_id: parseInt(value.production_line_id),
      qc_manager_id: req.user.id,
    };

    const productionRecord = await Production.query().insert(productionData);

    // Publish message to RabbitMQ for analytics processing
    try {
      await publishMessage(
        process.env.RABBITMQ_QUEUE_PRODUCTION || "production_queue",
        {
          type: "production_recorded",
          data: productionRecord,
          timestamp: new Date().toISOString(),
        }
      );
    } catch (mqError) {
      logger.warn("Failed to publish to message queue:", mqError);
      // Continue with the response even if MQ fails
    }

    logger.info(
      `Production recorded: ${productionRecord.type} for line ${productionRecord.production_line_id} by user ${req.user.id}`
    );

    res.status(201).json({
      success: true,
      message: "Production data recorded successfully",
      data: productionRecord,
    });
  } catch (error) {
    logger.error("Production recording error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

// @route   GET /api/production/daily-stats
// @desc    Get daily production statistics
// @access  Private
router.get("/daily-stats", authenticateToken, async (req, res) => {
  try {
    const { production_line_id, date } = req.query;

    if (!production_line_id || !date) {
      return res.status(400).json({
        success: false,
        message: "production_line_id and date are required",
      });
    }

    // Ensure QC manager can only view their assigned line
    if (
      req.user.role === "qc_manager" &&
      req.user.production_line_id &&
      req.user.production_line_id.toString() !== production_line_id
    ) {
      return res.status(403).json({
        success: false,
        message:
          "Access denied. You can only view data for your assigned production line.",
      });
    }

    const stats = await Production.getDailyStats(
      parseInt(production_line_id),
      date
    );

    res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    logger.error("Daily stats error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

// @route   GET /api/production/defect-analysis
// @desc    Get defect analysis for a production line
// @access  Private
router.get("/defect-analysis", authenticateToken, async (req, res) => {
  try {
    const { production_line_id, start_date, end_date } = req.query;

    if (!production_line_id || !start_date || !end_date) {
      return res.status(400).json({
        success: false,
        message: "production_line_id, start_date, and end_date are required",
      });
    }

    // Ensure QC manager can only view their assigned line
    if (
      req.user.role === "qc_manager" &&
      req.user.production_line_id &&
      req.user.production_line_id.toString() !== production_line_id
    ) {
      return res.status(403).json({
        success: false,
        message:
          "Access denied. You can only view data for your assigned production line.",
      });
    }

    const defectAnalysis = await Production.getDefectAnalysis(
      parseInt(production_line_id),
      start_date,
      end_date
    );

    res.json({
      success: true,
      data: defectAnalysis,
    });
  } catch (error) {
    logger.error("Defect analysis error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

// @route   GET /api/production/history
// @desc    Get production history with pagination
// @access  Private
router.get("/history", authenticateToken, async (req, res) => {
  try {
    const {
      production_line_id,
      start_date,
      end_date,
      type,
      page = 1,
      limit = 50,
    } = req.query;

    let query = Production.query()
      .withGraphFetched("[qcManager(selectBasic), productionLine]")
      .modifiers({
        selectBasic: (builder) => {
          builder.select("id", "name", "email");
        },
      })
      .orderBy("timestamp", "desc");

    // Apply filters
    if (production_line_id) {
      // Ensure QC manager can only view their assigned line
      if (
        req.user.role === "qc_manager" &&
        req.user.production_line_id &&
        req.user.production_line_id.toString() !== production_line_id
      ) {
        return res.status(403).json({
          success: false,
          message:
            "Access denied. You can only view data for your assigned production line.",
        });
      }
      query = query.where("production_line_id", parseInt(production_line_id));
    } else if (req.user.role === "qc_manager" && req.user.production_line_id) {
      // If QC manager doesn't specify line, use their assigned line
      query = query.where("production_line_id", req.user.production_line_id);
    }

    if (start_date && end_date) {
      query = query.whereBetween("timestamp", [start_date, end_date]);
    }

    if (type) {
      query = query.where("type", type);
    }

    // Pagination
    const offset = (parseInt(page) - 1) * parseInt(limit);
    const results = await query.page(parseInt(page) - 1, parseInt(limit));

    res.json({
      success: true,
      data: results.results,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: results.total,
        pages: Math.ceil(results.total / parseInt(limit)),
      },
    });
  } catch (error) {
    logger.error("Production history error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

module.exports = router;
