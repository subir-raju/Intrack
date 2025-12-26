const fs = require("fs");
const path = require("path");

const logDir = path.join(__dirname, "../logs");

// Create logs directory if it doesn't exist
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

const getTimestamp = () => new Date().toISOString();

const logger = {
  info: (message) => {
    const timestamp = getTimestamp();
    console.log(`[${timestamp}] INFO: ${message}`);
  },
  error: (message, error) => {
    const timestamp = getTimestamp();
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.error(`[${timestamp}] ERROR: ${message}`, errorMsg);
  },
  warn: (message) => {
    const timestamp = getTimestamp();
    console.warn(`[${timestamp}] WARN: ${message}`);
  },
  debug: (message) => {
    if (process.env.NODE_ENV === "development") {
      const timestamp = getTimestamp();
      console.log(`[${timestamp}] DEBUG: ${message}`);
    }
  },
};

module.exports = logger;
