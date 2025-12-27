const Production = require("../models/Production");
const User = require("../models/User");
const logger = require("../utils/logger");
const moment = require("moment");

exports.getDashboard = async (req, res) => {
  try {
    const { days = 7 } = req.query;
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));

    const productionLines = [
      { id: 1, name: "Production Line 1" },
      { id: 2, name: "Production Line 2" },
      { id: 3, name: "Production Line 3" },
      { id: 4, name: "Production Line 4" },
      { id: 5, name: "Production Line 5" },
    ];

    const dailyProductionData = [];
    const defectsOverTime = [];

    for (
      let d = new Date(startDate);
      d <= endDate;
      d.setDate(d.getDate() + 1)
    ) {
      const currentDate = new Date(d);
      const dateStr = currentDate.toISOString().split("T");

      const dailyData = { date: dateStr, lines: [] };
      const defectData = { date: dateStr, lines: [] };

      for (const line of productionLines) {
        const stats = await Production.getDailyStats(line.id, dateStr);
        dailyData.lines.push({ lineId: line.id, ...stats });
        defectData.lines.push({
          lineId: line.id,
          defectRate: parseFloat(stats.defectRate),
        });
      }

      dailyProductionData.push(dailyData);
      defectsOverTime.push(defectData);
    }

    const reworkRates = productionLines.map((line) => {
      const totalDefects = dailyProductionData.reduce(
        (sum, day) =>
          sum +
          (day.lines.find((l) => l.lineId === line.id)?.totalDefects || 0),
        0
      );

      const totalProduced = dailyProductionData.reduce(
        (sum, day) =>
          sum +
          (day.lines.find((l) => l.lineId === line.id)?.totalProduced || 0),
        0
      );

      return {
        lineId: line.id,
        name: line.name,
        defectCount: totalDefects,
        reworkRate:
          totalProduced > 0
            ? ((totalDefects / totalProduced) * 100).toFixed(2)
            : 0,
      };
    });

    res.json({
      success: true,
      data: {
        dailyProductionData,
        defectsOverTime,
        reworkRates,
        productionLines,
      },
    });
  } catch (error) {
    logger.error("Dashboard error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch dashboard data",
    });
  }
};

exports.getProductionSummary = async (req, res) => {
  try {
    const { startDate, endDate, productionLineId } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: "startDate and endDate are required",
      });
    }

    const filters = {
      productionLineId: productionLineId ? parseInt(productionLineId) : null,
      startDate,
      endDate,
    };

    const result = await Production.getProductionHistory(filters, 1, 10000);
    const summary = {};

    result.data.forEach((record) => {
      const lineId = record.production_line_id;
      if (!summary[lineId]) {
        summary[lineId] = {
          lineId,
          firstTimeThrough: 0,
          needImprovement: 0,
          modified: 0,
          rejected: 0,
          totalProduced: 0,
          totalDefects: 0,
        };
      }

      const count = 1;
      summary[lineId].totalProduced += count;
      summary[lineId].totalDefects += record.defect_count || 0;

      switch (record.type) {
        case "firsttimethrough":
          summary[lineId].firstTimeThrough += count;
          break;
        case "needimprovement":
          summary[lineId].needImprovement += count;
          break;
        case "modified":
          summary[lineId].modified += count;
          break;
        case "rejected":
          summary[lineId].rejected += count;
          break;
      }
    });

    // Calculate rates
    Object.values(summary).forEach((line) => {
      if (line.totalProduced > 0) {
        line.efficiencyRate = (
          (line.firstTimeThrough / line.totalProduced) *
          100
        ).toFixed(2);
        line.defectRate = (
          ((line.needImprovement + line.rejected) / line.totalProduced) *
          100
        ).toFixed(2);
        line.rejectionRate = (
          (line.rejected / line.totalProduced) *
          100
        ).toFixed(2);
        line.reworkRate = (
          ((line.needImprovement + line.modified) / line.totalProduced) *
          100
        ).toFixed(2);
      } else {
        line.efficiencyRate = 0;
        line.defectRate = 0;
        line.rejectionRate = 0;
        line.reworkRate = 0;
      }
    });

    res.json({
      success: true,
      data: Object.values(summary),
    });
  } catch (error) {
    logger.error("Production summary error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch production summary",
    });
  }
};

exports.getDefectTrends = async (req, res) => {
  try {
    const { startDate, endDate, productionLineId } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: "startDate and endDate are required",
      });
    }

    const filters = {
      productionLineId: productionLineId ? parseInt(productionLineId) : null,
      startDate,
      endDate,
    };

    const result = await Production.getProductionHistory(filters, 1, 10000);
    const defectCounts = {};
    const defectsByLine = {};

    result.data.forEach((record) => {
      if (record.type === "needimprovement" && record.defects) {
        const defects = JSON.parse(record.defects);
        if (Array.isArray(defects)) {
          defects.forEach((defect) => {
            defectCounts[defect] = (defectCounts[defect] || 0) + 1;

            if (!defectsByLine[record.production_line_id]) {
              defectsByLine[record.production_line_id] = {};
            }
            defectsByLine[record.production_line_id][defect] =
              (defectsByLine[record.production_line_id][defect] || 0) + 1;
          });
        }
      }
    });

    const overallDefects = Object.entries(defectCounts)
      .map(([defect, count]) => ({ defect, count }))
      .sort((a, b) => b.count - a.count);

    const defectsByLineArray = Object.entries(defectsByLine).map(
      ([lineId, defects]) => ({
        lineId: parseInt(lineId),
        defects: Object.entries(defects)
          .map(([defect, count]) => ({ defect, count }))
          .sort((a, b) => b.count - a.count),
      })
    );

    res.json({
      success: true,
      data: {
        overallDefects,
        defectsByLine: defectsByLineArray,
        totalDefectRecords: result.data.filter(
          (r) => r.type === "needimprovement"
        ).length,
      },
    });
  } catch (error) {
    logger.error("Defect trends error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch defect trends",
    });
  }
};

exports.getUsers = async (req, res) => {
  try {
    const { role, productionLineId } = req.query;

    const filters = {
      role,
      productionLineId: productionLineId ? parseInt(productionLineId) : null,
    };

    const users = await User.getAllUsers(filters);

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
};
