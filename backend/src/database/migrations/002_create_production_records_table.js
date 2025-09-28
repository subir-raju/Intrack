/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.createTable("production_records", function (table) {
    table.increments("id").primary();
    table.integer("production_line_id").unsigned().notNullable();
    table.integer("qc_manager_id").unsigned().notNullable();
    table
      .enum("type", [
        "first_time_through",
        "need_improvement",
        "modified",
        "rejected",
      ])
      .notNullable();
    table.json("defects").nullable();
    table.integer("defect_count").unsigned().nullable();
    table.json("modifications").nullable();
    table.integer("modification_count").unsigned().nullable();
    table.json("rejection_reasons").nullable();
    table.integer("reason_count").unsigned().nullable();
    table.timestamp("timestamp").notNullable();
    table.timestamp("created_at").defaultTo(knex.fn.now());
    table.timestamp("updated_at").defaultTo(knex.fn.now());

    // Foreign keys
    table
      .foreign("qc_manager_id")
      .references("id")
      .inTable("users")
      .onDelete("CASCADE");

    // Indexes for better query performance
    table.index(["production_line_id"]);
    table.index(["qc_manager_id"]);
    table.index(["type"]);
    table.index(["timestamp"]);
    table.index(["created_at"]);
    table.index(["production_line_id", "timestamp"]);
    table.index(["production_line_id", "type"]);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.dropTable("production_records");
};
