const { Model } = require("objection");

class Production extends Model {
  static get tableName() {
    return "production_records";
  }

  static get idColumn() {
    return "id";
  }

  static get jsonSchema() {
    return {
      type: "object",
      required: ["production_line_id", "type", "timestamp"],
      properties: {
        id: { type: "integer" },
        production_line_id: { type: "integer" },
        qc_manager_id: { type: "integer" },
        type: {
          type: "string",
          enum: [
            "first_time_through",
            "need_improvement",
            "modified",
            "rejected",
          ],
        },
        defects: { type: ["array", "null"] },
        defect_count: { type: ["integer", "null"] },
        modifications: { type: ["array", "null"] },
        modification_count: { type: ["integer", "null"] },
        rejection_reasons: { type: ["array", "null"] },
        reason_count: { type: ["integer", "null"] },
        timestamp: { type: "string", format: "date-time" },
        created_at: { type: "string", format: "date-time" },
        updated_at: { type: "string", format: "date-time" },
      },
    };
  }

  static get relationMappings() {
    const User = require("./User");
    const ProductionLine = require("./ProductionLine");

    return {
      qcManager: {
        relation: Model.BelongsToOneRelation,
        modelClass: User,
        join: {
          from: "production_records.qc_manager_id",
          to: "users.id",
        },
      },
      productionLine: {
        relation: Model.BelongsToOneRelation,
        modelClass: ProductionLine,
        join: {
          from: "production_records.production_line_id",
          to: "production_lines.id",
        },
      },
    };
  }

  async $beforeInsert(queryContext) {
    await super.$beforeInsert(queryContext);
    this.created_at = new Date().toISOString();
    this.updated_at = new Date().toISOString();
  }

  async $beforeUpdate(opt, queryContext) {
    await super.$beforeUpdate(opt, queryContext);
    this.updated_at = new Date().toISOString();
  }

  // Static methods for analytics
  static async getDailyStats(productionLineId, date) {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const stats = await this.query()
      .select("type")
      .count("id as count")
      .where("production_line_id", productionLineId)
      .whereBetween("timestamp", [
        startOfDay.toISOString(),
        endOfDay.toISOString(),
      ])
      .groupBy("type");

    // Initialize default values
    const result = {
      totalProduced: 0,
      firstTimeThrough: 0,
      needImprovement: 0,
      modified: 0,
      rejected: 0,
      defectRate: 0,
      rejectionRate: 0,
      efficiencyRate: 0,
    };

    // Process the results
    stats.forEach((stat) => {
      const count = parseInt(stat.count);
      result.totalProduced += count;

      switch (stat.type) {
        case "first_time_through":
          result.firstTimeThrough = count;
          break;
        case "need_improvement":
          result.needImprovement = count;
          break;
        case "modified":
          result.modified = count;
          break;
        case "rejected":
          result.rejected = count;
          break;
      }
    });

    if (result.totalProduced > 0) {
      result.defectRate = parseFloat(
        (
          ((result.needImprovement + result.rejected) / result.totalProduced) *
          100
        ).toFixed(2)
      );
      result.rejectionRate = parseFloat(
        ((result.rejected / result.totalProduced) * 100).toFixed(2)
      );
      result.efficiencyRate = parseFloat(
        ((result.firstTimeThrough / result.totalProduced) * 100).toFixed(2)
      );
    }

    return result;
  }

  static async getDefectAnalysis(productionLineId, startDate, endDate) {
    const records = await this.query()
      .where("production_line_id", productionLineId)
      .where("type", "need_improvement")
      .whereBetween("timestamp", [startDate, endDate])
      .whereNotNull("defects");

    const defectCounts = {};

    records.forEach((record) => {
      if (record.defects && Array.isArray(record.defects)) {
        record.defects.forEach((defect) => {
          defectCounts[defect] = (defectCounts[defect] || 0) + 1;
        });
      }
    });

    return Object.entries(defectCounts)
      .map(([defect, count]) => ({ defect, count }))
      .sort((a, b) => b.count - a.count);
  }
}

module.exports = Production;
