const pool = require("../config/database");
const moment = require("moment");

class Production {
  static async recordProduction(data) {
    const {
      productionLineId,
      qcManagerId,
      type,
      timestamp,
      defects,
      modifications,
      rejectionReasons,
      notes,
    } = data;

    try {
      const [result] = await pool.query(
        `INSERT INTO production_records 
         (production_line_id, qc_manager_id, type, timestamp, defects, defect_count, 
          modifications, modification_count, rejection_reasons, reason_count, notes)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          productionLineId,
          qcManagerId,
          type,
          timestamp,
          JSON.stringify(defects || []),
          (defects || []).length,
          JSON.stringify(modifications || []),
          (modifications || []).length,
          JSON.stringify(rejectionReasons || []),
          (rejectionReasons || []).length,
          notes || null,
        ]
      );

      return {
        id: result.insertId,
        productionLineId,
        qcManagerId,
        type,
        timestamp,
      };
    } catch (error) {
      throw error;
    }
  }

  static async getDailyStats(productionLineId, date) {
    try {
      const startOfDay = moment(date).startOf("day").toISOString();
      const endOfDay = moment(date).endOf("day").toISOString();

      const [rows] = await pool.query(
        `SELECT 
           type,
           COUNT(*) as count,
           SUM(defect_count) as totalDefects
         FROM production_records
         WHERE production_line_id = ? AND timestamp BETWEEN ? AND ?
         GROUP BY type`,
        [productionLineId, startOfDay, endOfDay]
      );

      const stats = {
        date,
        firstTimeThrough: 0,
        needImprovement: 0,
        modified: 0,
        rejected: 0,
        totalProduced: 0,
        totalDefects: 0,
        defectRate: 0,
        rejectionRate: 0,
      };

      rows.forEach((row) => {
        const count = parseInt(row.count);
        stats.totalProduced += count;
        stats.totalDefects += parseInt(row.totalDefects) || 0;

        switch (row.type) {
          case "firsttimethrough":
            stats.firstTimeThrough = count;
            break;
          case "needimprovement":
            stats.needImprovement = count;
            break;
          case "modified":
            stats.modified = count;
            break;
          case "rejected":
            stats.rejected = count;
            break;
        }
      });

      if (stats.totalProduced > 0) {
        stats.defectRate = (
          ((stats.needImprovement + stats.rejected) / stats.totalProduced) *
          100
        ).toFixed(2);
        stats.rejectionRate = (
          (stats.rejected / stats.totalProduced) *
          100
        ).toFixed(2);
      }

      return stats;
    } catch (error) {
      throw error;
    }
  }

  static async getDefectAnalysis(productionLineId, startDate, endDate) {
    try {
      const [rows] = await pool.query(
        `SELECT defects FROM production_records
         WHERE production_line_id = ? AND type = 'needimprovement' 
         AND timestamp BETWEEN ? AND ?
         AND defects IS NOT NULL`,
        [productionLineId, startDate, endDate]
      );

      const defectCounts = {};

      rows.forEach((row) => {
        try {
          const defects = JSON.parse(row.defects);
          if (Array.isArray(defects)) {
            defects.forEach((defect) => {
              defectCounts[defect] = (defectCounts[defect] || 0) + 1;
            });
          }
        } catch (e) {
          // Skip invalid JSON
        }
      });

      const analysis = Object.entries(defectCounts)
        .map(([defect, count]) => ({ defect, count }))
        .sort((a, b) => b.count - a.count);

      return analysis;
    } catch (error) {
      throw error;
    }
  }

  static async getProductionHistory(filters = {}, page = 1, limit = 50) {
    try {
      let query = "SELECT * FROM production_records WHERE 1=1";
      const params = [];

      if (filters.productionLineId) {
        query += " AND production_line_id = ?";
        params.push(filters.productionLineId);
      }

      if (filters.type) {
        query += " AND type = ?";
        params.push(filters.type);
      }

      if (filters.startDate && filters.endDate) {
        query += " AND timestamp BETWEEN ? AND ?";
        params.push(filters.startDate, filters.endDate);
      }

      // Count total
      const [countRows] = await pool.query(
        `SELECT COUNT(*) as total FROM (${query}) as counted`,
        params
      );
      const total = countRows.total;

      // Get paginated results
      const offset = (page - 1) * limit;
      query += " ORDER BY timestamp DESC LIMIT ? OFFSET ?";

      const [rows] = await pool.query(query, [...params, limit, offset]);

      return {
        data: rows,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      throw error;
    }
  }
}

module.exports = Production;
