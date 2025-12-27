const Production = require("../models/Production");
const DefectCategory = require("../models/DefectCategory");
const RejectionReason = require("../models/RejectionReason");
const logger = require("../utils/logger");

exports.recordProduction = async (req, res) => {
  try {
    const data = {
      ...req.validatedData,
      qcManagerId: req.user.id,
    };

    const record = await Production.recordProduction(data);

    logger.info(
      `Production recorded: ${data.type} for line ${data.productionLineId}`
    );

    res.status(201).json({
      success: true,
      message: "Production recorded successfully",
      data: record,
    });
  } catch (error) {
    logger.error("Production recording error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to record production",
    });
  }
};

exports.getDailyStats = async (req, res) => {
  try {
    const { productionLineId, date } = req.query;

    if (!productionLineId || !date) {
      return res.status(400).json({
        success: false,
        message: "productionLineId and date are required",
      });
    }

    const stats = await Production.getDailyStats(productionLineId, date);

    res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    logger.error("Daily stats error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch stats",
    });
  }
};

exports.getDefectAnalysis = async (req, res) => {
  try {
    const { productionLineId, startDate, endDate } = req.query;

    if (!productionLineId || !startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: "productionLineId, startDate, and endDate are required",
      });
    }

    const analysis = await Production.getDefectAnalysis(
      productionLineId,
      startDate,
      endDate
    );

    res.json({
      success: true,
      data: analysis,
    });
  } catch (error) {
    logger.error("Defect analysis error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch analysis",
    });
  }
};

exports.getHistory = async (req, res) => {
  try {
    const {
      productionLineId,
      type,
      startDate,
      endDate,
      page = 1,
      limit = 50,
    } = req.query;

    const filters = {
      productionLineId: productionLineId ? parseInt(productionLineId) : null,
      type,
      startDate,
      endDate,
    };

    const result = await Production.getProductionHistory(
      filters,
      parseInt(page),
      parseInt(limit)
    );

    res.json({
      success: true,
      ...result,
    });
  } catch (error) {
    logger.error("History fetch error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch history",
    });
  }
};

exports.getDefectCategories = async (req, res) => {
  try {
    const categories = await DefectCategory.getAll();
    res.json({
      success: true,
      data: categories,
    });
  } catch (error) {
    logger.error("Defect categories error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch defect categories",
    });
  }
};

exports.getRejectionReasons = async (req, res) => {
  try {
    const reasons = await RejectionReason.getAll();
    res.json({
      success: true,
      data: reasons,
    });
  } catch (error) {
    logger.error("Rejection reasons error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch rejection reasons",
    });
  }
};

exports.addDefectCategory = async (req, res) => {
  try {
    const { name, category } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: "Defect name is required",
      });
    }

    const existing = await DefectCategory.findByName(name);
    if (existing) {
      return res.status(409).json({
        success: false,
        message: "Defect category already exists",
      });
    }

    const newCategory = await DefectCategory.create(name, category || null);

    logger.info(`New defect category added: ${name}`);
    res.status(201).json({
      success: true,
      message: "Defect category added successfully",
      data: newCategory,
    });
  } catch (error) {
    logger.error("Add defect category error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to add defect category",
    });
  }
};

exports.addRejectionReason = async (req, res) => {
  try {
    const { name, category } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: "Reason name is required",
      });
    }

    const existing = await RejectionReason.findByName(name);
    if (existing) {
      return res.status(409).json({
        success: false,
        message: "Rejection reason already exists",
      });
    }

    const newReason = await RejectionReason.create(name, category || null);

    logger.info(`New rejection reason added: ${name}`);
    res.status(201).json({
      success: true,
      message: "Rejection reason added successfully",
      data: newReason,
    });
  } catch (error) {
    logger.error("Add rejection reason error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to add rejection reason",
    });
  }
};
