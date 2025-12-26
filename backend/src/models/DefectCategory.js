const pool = require("../config/database");

class DefectCategory {
  static async getAll() {
    try {
      const [rows] = await pool.query(
        "SELECT id, name, category, is_active FROM defect_categories WHERE is_active = TRUE ORDER BY name"
      );
      return rows;
    } catch (error) {
      throw error;
    }
  }

  static async create(name, category) {
    try {
      const [result] = await pool.query(
        "INSERT INTO defect_categories (name, category, is_active) VALUES (?, ?, TRUE)",
        [name, category]
      );
      return {
        id: result.insertId,
        name,
        category,
        isActive: true,
      };
    } catch (error) {
      throw error;
    }
  }

  static async findByName(name) {
    try {
      const [rows] = await pool.query(
        "SELECT * FROM defect_categories WHERE name = ?",
        [name]
      );
      return rows;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = DefectCategory;
