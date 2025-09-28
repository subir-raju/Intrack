const bcrypt = require("bcryptjs");

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.seed = async function (knex) {
  // Deletes ALL existing entries
  await knex("production_records").del();
  await knex("users").del();

  // Hash passwords
  const adminPassword = await bcrypt.hash("password123", 12);
  const qcManagerPassword = await bcrypt.hash("password123", 12);

  // Insert demo users
  await knex("users").insert([
    {
      id: 1,
      name: "System Administrator",
      email: "admin@intrack.com",
      password: adminPassword,
      role: "admin",
      production_line_id: null,
      is_active: true,
      created_at: new Date(),
      updated_at: new Date(),
    },
    {
      id: 2,
      name: "QC Manager Line 1",
      email: "qc@intrack.com",
      password: qcManagerPassword,
      role: "qc_manager",
      production_line_id: 1,
      is_active: true,
      created_at: new Date(),
      updated_at: new Date(),
    },
    {
      id: 3,
      name: "QC Manager Line 2",
      email: "qc2@intrack.com",
      password: qcManagerPassword,
      role: "qc_manager",
      production_line_id: 2,
      is_active: true,
      created_at: new Date(),
      updated_at: new Date(),
    },
    {
      id: 4,
      name: "QC Manager Line 3",
      email: "qc3@intrack.com",
      password: qcManagerPassword,
      role: "qc_manager",
      production_line_id: 3,
      is_active: true,
      created_at: new Date(),
      updated_at: new Date(),
    },
  ]);

  console.log("Demo users created:");
  console.log("Admin: admin@intrack.com / password123");
  console.log("QC Manager: qc@intrack.com / password123");
  console.log("QC Manager 2: qc2@intrack.com / password123");
  console.log("QC Manager 3: qc3@intrack.com / password123");
};
