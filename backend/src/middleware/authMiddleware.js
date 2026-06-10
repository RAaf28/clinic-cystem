const jwt = require("jsonwebtoken");
const { errorResponse } = require("../utils/responseHelper");

const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return errorResponse(res, "Akses ditolak. Token tidak ditemukan.", 401);
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // { id, role, profileId }
    next();
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return errorResponse(res, "Token kadaluarsa. Silakan login kembali.", 401);
    }
    return errorResponse(res, "Token tidak valid.", 401);
  }
};

module.exports = { verifyToken };
