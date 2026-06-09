/**
 * Helper untuk format response API yang konsisten
 * Semua response menggunakan format standar dari AGENT.md
 */

/**
 * Response sukses
 * @param {object} res - Express response object
 * @param {string} message - Pesan deskriptif
 * @param {*} data - Data response
 * @param {number} [statusCode=200] - HTTP status code
 */
const successResponse = (res, message, data, statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  });
};

/**
 * Response sukses dengan pagination
 * @param {object} res - Express response object
 * @param {string} message - Pesan deskriptif
 * @param {Array} data - Array data
 * @param {object} pagination - { page, limit, total }
 * @param {number} [statusCode=200] - HTTP status code
 */
const paginatedResponse = (
  res,
  message,
  data,
  pagination,
  statusCode = 200,
) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
    pagination,
  });
};

/**
 * Response error
 * @param {object} res - Express response object
 * @param {string} message - Pesan error
 * @param {number} [statusCode=400] - HTTP status code
 */
const errorResponse = (res, message, statusCode = 400) => {
  return res.status(statusCode).json({
    success: false,
    message,
  });
};

module.exports = { successResponse, paginatedResponse, errorResponse };
