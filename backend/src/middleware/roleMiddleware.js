/**
 * Factory function untuk role-based access control
 * Membatasi akses endpoint berdasarkan role user
 * @param  {...string} roles - Daftar role yang diizinkan (contoh: 'Admin', 'Dokter', 'Pasien')
 * @returns {Function} Express middleware
 *
 * Contoh penggunaan:
 *   router.get('/users', verifyToken, allowRoles('Admin'), controller)
 *   router.post('/records', verifyToken, allowRoles('Dokter'), controller)
 */
const allowRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Akses ditolak. Autentikasi diperlukan",
      });
    }
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Akses ditolak. Hanya ${roles.join(", ")} yang diizinkan`,
      });
    }
    next();
  };
};
module.exports = allowRoles;
