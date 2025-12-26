const pool = require("../config/database");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

class User {
  static async createUser(userData) {
    const { name, email, password, role, productionLineId } = userData;

    try {
      const hashedPassword = await bcrypt.hash(password, 10);

      const [result] = await pool.query(
        "INSERT INTO users (name, email, password, role, production_line_id) VALUES (?, ?, ?, ?, ?)",
        [name, email, hashedPassword, role, productionLineId || null]
      );

      return {
        id: result.insertId,
        name,
        email,
        role,
        productionLineId,
      };
    } catch (error) {
      throw error;
    }
  }

  static async findByEmail(email) {
    try {
      const [rows] = await pool.query(
        "SELECT * FROM users WHERE email = ? AND is_active = TRUE",
        [email]
      );

      return rows;
    } catch (error) {
      throw error;
    }
  }

  static async findById(id) {
    try {
      const [rows] = await pool.query(
        `SELECT id, name, email, role, production_line_id as productionLineId, is_active, created_at
         FROM users WHERE id = ? AND is_active = TRUE`,
        [id]
      );

      return rows;
    } catch (error) {
      throw error;
    }
  }

  static async verifyPassword(plainPassword, hashedPassword) {
    return bcrypt.compare(plainPassword, hashedPassword);
  }

  static async generateToken(user) {
    return jwt.sign(
      {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        productionLineId: user.production_line_id,
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE || "7d" }
    );
  }

  static async getAllUsers(filters = {}) {
    try {
      let query =
        "SELECT id, name, email, role, production_line_id as productionLineId, is_active, created_at FROM users WHERE is_active = TRUE";
      const params = [];

      if (filters.role) {
        query += " AND role = ?";
        params.push(filters.role);
      }

      if (filters.productionLineId) {
        query += " AND production_line_id = ?";
        params.push(filters.productionLineId);
      }

      query += " ORDER BY created_at DESC";

      const [rows] = await pool.query(query, params);
      return rows;
    } catch (error) {
      throw error;
    }
  }

  static async updateUser(id, updateData) {
    try {
      const fields = [];
      const values = [];

      for (const [key, value] of Object.entries(updateData)) {
        if (value !== undefined && value !== null) {
          const dbField = key.replace(/([A-Z])/g, "_$1").toLowerCase();
          fields.push(`${dbField} = ?`);
          values.push(value);
        }
      }

      if (fields.length === 0) {
        return { id };
      }

      values.push(id);
      const query = `UPDATE users SET ${fields.join(", ")} WHERE id = ?`;

      await pool.query(query, values);
      return this.findById(id);
    } catch (error) {
      throw error;
    }
  }

  static async deactivateUser(id) {
    try {
      await pool.query("UPDATE users SET is_active = FALSE WHERE id = ?", [id]);
      return true;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = User;
