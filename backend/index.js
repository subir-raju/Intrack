const express = require("express");
const cors = require("cors");
require("dotenv").config();
const routes = require("./src/routes");
const logger = require("./src/utils/logger");

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.path}`);
  next();
});

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({ status: "OK", message: "InTrack API is running" });
});

// API Routes
app.use("/api/auth", routes.auth);
app.use("/api/users", routes.users);
app.use("/api/production", routes.production);
app.use("/api/admin", routes.admin);
app.use("/api/defects", routes.defects);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
    path: req.path,
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  logger.error("Unhandled error:", err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal server error",
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
});

// Start server
app.listen(PORT, () => {
  logger.info(`🚀 InTrack API Server running on http://localhost:${PORT}`);
  logger.info(`📊 Database: ${process.env.DB_NAME}`);
  logger.info(`🔐 Node Environment: ${process.env.NODE_ENV}`);
});

module.exports = app;
