const { Model } = require("objection");
const bcrypt = require("bcryptjs");

class User extends Model {
  static get tableName() {
    return "users";
  }

  static get idColumn() {
    return "id";
  }

  static get jsonSchema() {
    return {
      type: "object",
      required: ["email", "password", "role"],
      properties: {
        id: { type: "integer" },
        name: { type: "string", minLength: 2, maxLength: 100 },
        email: { type: "string", format: "email", maxLength: 255 },
        password: { type: "string", minLength: 6 },
        role: { type: "string", enum: ["admin", "qc_manager"] },
        production_line_id: { type: ["integer", "null"] },
        is_active: { type: "boolean", default: true },
        created_at: { type: "string", format: "date-time" },
        updated_at: { type: "string", format: "date-time" },
      },
    };
  }

  static get relationMappings() {
    const ProductionLine = require("./ProductionLine");

    return {
      productionLine: {
        relation: Model.BelongsToOneRelation,
        modelClass: ProductionLine,
        join: {
          from: "users.production_line_id",
          to: "production_lines.id",
        },
      },
    };
  }

  // Hash password before saving
  async $beforeInsert(queryContext) {
    await super.$beforeInsert(queryContext);
    if (this.password) {
      this.password = await bcrypt.hash(this.password, 12);
    }
    this.created_at = new Date().toISOString();
    this.updated_at = new Date().toISOString();
  }

  async $beforeUpdate(opt, queryContext) {
    await super.$beforeUpdate(opt, queryContext);
    if (this.password) {
      this.password = await bcrypt.hash(this.password, 12);
    }
    this.updated_at = new Date().toISOString();
  }

  // Verify password
  async verifyPassword(password) {
    return bcrypt.compare(password, this.password);
  }

  // Remove password from JSON output
  $formatJson(json) {
    json = super.$formatJson(json);
    delete json.password;
    return json;
  }
}

module.exports = User;
