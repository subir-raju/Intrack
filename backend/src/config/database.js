const Knex = require("knex");
const { Model } = require("objection");
const knexConfig = require("../../knexfile");
const { logger } = require("../utils/logger");

let knex;

const setupDatabase = async () => {
  try {
    const environment = process.env.NODE_ENV || "development";
    knex = Knex(knexConfig[environment]);

    // Test the connection
    await knex.raw("SELECT 1");

    // Bind Objection to Knex
    Model.knex(knex);

    logger.info(`Database connected successfully in ${environment} mode`);
    return knex;
  } catch (error) {
    logger.error("Database connection failed:", error);
    throw error;
  }
};

const getKnex = () => {
  if (!knex) {
    throw new Error("Database not initialized. Call setupDatabase() first.");
  }
  return knex;
};

module.exports = {
  setupDatabase,
  getKnex,
};
