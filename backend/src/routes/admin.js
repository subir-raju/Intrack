const express = require("express");
const Production = require("../models/Production");
const User = require("../models/User");
const { authenticateToken, requireRole } = require("../middleware/auth");
const { logger } = require("../utils/logger");
const moment = require("moment");

const router = express.Router();

// @route   GET /api/admin/dashboard
// @desc    Get comprehensive dashboard data
// @access  Private (Admin only)
router.get(
  "/dashboard",
  authenticateToken,
  requireRole("admin"),
  async (req, res) => {
    try {
      const { days = 7 } = req.query;
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - parseInt(days));

      // Get production lines
      const productionLines = [
        { line_id: 1, name: "Production Line 1" },
        { line_id: 2, name: "Production Line 2" },
        { line_id: 3, name: "Production Line 3" },
        { line_id: 4, name: "Production Line 4" },
        { line_id: 5, name: "Production Line 5" },
      ];

      // Get daily production data for all lines
      const dailyProductionData = [];
      const defectsOverTime = [];

      for (
        let d = new Date(startDate);
        d <= endDate;
        d.setDate(d.getDate() + 1)
      ) {
        const currentDate = new Date(d);
        const dateStr = currentDate.toISOString().split("T")[0];

        const dailyData = {
          date: dateStr,
          lines: [],
        };

        const defectData = {
          date: dateStr,
          lines: [],
        };

        for (const line of productionLines) {
          const stats = await Production.getDailyStats(
            line.line_id,
            currentDate
          );

          dailyData.lines.push({
            line_id: line.line_id,
            ...stats,
          });

          defectData.lines.push({
            line_id: line.line_id,
            defect_rate: parseFloat(stats.defectRate) || 0,
          });
        }

        dailyProductionData.push(dailyData);
        defectsOverTime.push(defectData);
      }

      // Calculate rework rates for each production line
      const reworkRates = [];
      for (const line of productionLines) {
        const totalRecords = await Production.query()
          .where("production_line_id", line.line_id)
          .whereBetween("timestamp", [
            startDate.toISOString(),
            endDate.toISOString(),
          ])
          .count("id as total")
          .first();

        const reworkRecords = await Production.query()
          .where("production_line_id", line.line_id)
          .whereIn("type", ["need_improvement", "modified"])
          .whereBetween("timestamp", [
            startDate.toISOString(),
            endDate.toISOString(),
          ])
          .count("id as rework")
          .first();

        const total = parseInt(totalRecords.total) || 0;
        const rework = parseInt(reworkRecords.rework) || 0;
        const reworkRate =
          total > 0 ? parseFloat(((rework / total) * 100).toFixed(2)) : 0;

        reworkRates.push({
          line_id: line.line_id,
          name: line.name,
          total_records: total,
          rework_records: rework,
          rework_rate: reworkRate,
        });
      }

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
      logger.error("Dashboard data error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }
);

// @route   GET /api/admin/production-summary
// @desc    Get production summary by date range
// @access  Private (Admin only)
router.get(
  "/production-summary",
  authenticateToken,
  requireRole("admin"),
  async (req, res) => {
    try {
      const { start_date, end_date, production_line_id } = req.query;

      if (!start_date || !end_date) {
        return res.status(400).json({
          success: false,
          message: "start_date and end_date are required",
        });
      }

      let query = Production.query()
        .select("production_line_id", "type")
        .count("id as count")
        .sum("defect_count as total_defects")
        .whereBetween("timestamp", [start_date, end_date])
        .groupBy("production_line_id", "type");

      if (production_line_id) {
        query = query.where("production_line_id", parseInt(production_line_id));
      }

      const results = await query;

      // Process results into structured format
      const summary = {};

      results.forEach((result) => {
        const lineId = result.production_line_id;
        if (!summary[lineId]) {
          summary[lineId] = {
            line_id: lineId,
            first_time_through: 0,
            need_improvement: 0,
            modified: 0,
            rejected: 0,
            total_produced: 0,
            total_defects: 0,
          };
        }

        const count = parseInt(result.count);
        summary[lineId][result.type] = count;
        summary[lineId].total_produced += count;
        summary[lineId].total_defects += parseInt(result.total_defects || 0);
      });

      // Calculate rates for each line
      Object.values(summary).forEach((line) => {
        if (line.total_produced > 0) {
          line.efficiency_rate = parseFloat(
            ((line.first_time_through / line.total_produced) * 100).toFixed(2)
          );
          line.defect_rate = parseFloat(
            (
              ((line.need_improvement + line.rejected) / line.total_produced) *
              100
            ).toFixed(2)
          );
          line.rejection_rate = parseFloat(
            ((line.rejected / line.total_produced) * 100).toFixed(2)
          );
          line.rework_rate = parseFloat(
            (
              ((line.need_improvement + line.modified) / line.total_produced) *
              100
            ).toFixed(2)
          );
        } else {
          line.efficiency_rate = 0;
          line.defect_rate = 0;
          line.rejection_rate = 0;
          line.rework_rate = 0;
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
        message: "Internal server error",
      });
    }
  }
);

// @route   GET /api/admin/defect-trends
// @desc    Get defect trends analysis
// @access  Private (Admin only)
router.get(
  "/defect-trends",
  authenticateToken,
  requireRole("admin"),
  async (req, res) => {
    try {
      const { start_date, end_date, production_line_id } = req.query;

      if (!start_date || !end_date) {
        return res.status(400).json({
          success: false,
          message: "start_date and end_date are required",
        });
      }

      let query = Production.query()
        .where("type", "need_improvement")
        .whereNotNull("defects")
        .whereBetween("timestamp", [start_date, end_date]);

      if (production_line_id) {
        query = query.where("production_line_id", parseInt(production_line_id));
      }

      const records = await query;

      // Analyze defects
      const defectCounts = {};
      const defectsByLine = {};

      records.forEach((record) => {
        if (record.defects && Array.isArray(record.defects)) {
          // Initialize line data if not exists
          if (!defectsByLine[record.production_line_id]) {
            defectsByLine[record.production_line_id] = {};
          }

          record.defects.forEach((defect) => {
            // Overall defect counts
            defectCounts[defect] = (defectCounts[defect] || 0) + 1;

            // Defects by line
            defectsByLine[record.production_line_id][defect] =
              (defectsByLine[record.production_line_id][defect] || 0) + 1;
          });
        }
      });

      // Convert to arrays and sort
      const overallDefects = Object.entries(defectCounts)
        .map(([defect, count]) => ({ defect, count }))
        .sort((a, b) => b.count - a.count);

      const defectsByLineArray = Object.entries(defectsByLine).map(
        ([lineId, defects]) => ({
          line_id: parseInt(lineId),
          defects: Object.entries(defects)
            .map(([defect, count]) => ({ defect, count }))
            .sort((a, b) => b.count - a.count),
        })
      );

      res.json({
        success: true,
        data: {
          overall_defects: overallDefects,
          defects_by_line: defectsByLineArray,
          total_defect_records: records.length,
        },
      });
    } catch (error) {
      logger.error("Defect trends error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }
);

// @route   GET /api/admin/users
// @desc    Get all users (Admin only)
// @access  Private (Admin only)
router.get(
  "/users",
  authenticateToken,
  requireRole("admin"),
  async (req, res) => {
    try {
      const users = await User.query()
        .select(
          "id",
          "name",
          "email",
          "role",
          "production_line_id",
          "is_active",
          "created_at"
        )
        .withGraphFetched("productionLine")
        .orderBy("created_at", "desc");

      res.json({
        success: true,
        data: users,
      });
    } catch (error) {
      logger.error("Users fetch error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }
);

// @route   PUT /api/admin/users/:id/status
// @desc    Update user status (Admin only)
// @access  Private (Admin only)
router.put(
  "/users/:id/status",
  authenticateToken,
  requireRole("admin"),
  async (req, res) => {
    try {
      const { id } = req.params;
      const { is_active } = req.body;

      if (typeof is_active !== "boolean") {
        return res.status(400).json({
          success: false,
          message: "is_active must be a boolean value",
        });
      }

      const user = await User.query().findById(id);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      await User.query().findById(id).patch({ is_active });

      logger.info(
        `User ${user.email} status updated to ${
          is_active ? "active" : "inactive"
        } by ${req.user.email}`
      );

      res.json({
        success: true,
        message: `User ${is_active ? "activated" : "deactivated"} successfully`,
      });
    } catch (error) {
      logger.error("User status update error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }
);

module.exports = router;
