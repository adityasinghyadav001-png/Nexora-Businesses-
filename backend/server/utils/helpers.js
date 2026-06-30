// ============================================================
// server/utils/responseHelper.js
// Consistent API response shape across all endpoints
// ============================================================

/**
 * Send a successful JSON response.
 * @param {object} res     - Express response object
 * @param {*}      data    - Payload to include
 * @param {string} message - Human-readable success message
 * @param {number} status  - HTTP status code (default 200)
 */
const sendSuccess = (res, data = null, message = "Success", status = 200) => {
  const response = {
    success: true,
    message,
    timestamp: new Date().toISOString(),
  };
  if (data !== null) response.data = data;
  return res.status(status).json(response);
};

/**
 * Send an error JSON response.
 * @param {object} res     - Express response object
 * @param {string} message - Error description
 * @param {number} status  - HTTP status code (default 500)
 * @param {*}      errors  - Optional validation errors or details
 */
const sendError = (res, message = "Internal server error", status = 500, errors = null) => {
  const response = {
    success: false,
    message,
    timestamp: new Date().toISOString(),
  };
  if (errors) response.errors = errors;
  return res.status(status).json(response);
};

module.exports = { sendSuccess, sendError };


// ============================================================
// server/utils/logger.js
// Simple structured logger (swap with Winston/Pino in prod)
// ============================================================

const logger = {
  info: (msg, meta = {}) => {
    console.log(`[INFO]  ${new Date().toISOString()} — ${msg}`, meta);
  },
  warn: (msg, meta = {}) => {
    console.warn(`[WARN]  ${new Date().toISOString()} — ${msg}`, meta);
  },
  error: (msg, meta = {}) => {
    console.error(`[ERROR] ${new Date().toISOString()} — ${msg}`, meta);
  },
};

module.exports = logger;
