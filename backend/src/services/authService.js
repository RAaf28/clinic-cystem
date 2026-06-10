const { pool } = require('../config/db');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

/**
 * Authenticate user dengan email + password
 */
exports.authenticateUser = async (email, password) => {
  const conn = await pool.getConnection();
  const [users] = await conn.query(
    `SELECT u.id, u.password, u.role_id, r.name as role
     FROM users u
     JOIN roles r ON u.role_id = r.id
     WHERE u.email = ?`,
    [email]
  );
  conn.release();

  if (users.length === 0) {
    throw new Error('Invalid email or password');
  }

  const user = users[0];
  const validPassword = await bcrypt.compare(password, user.password);

  if (!validPassword) {
    throw new Error('Invalid email or password');
  }

  return user;
};

/**
 * Get profile berdasarkan role dan user_id
 */
exports.getUserProfile = async (userId, roleId) => {
  const conn = await pool.getConnection();
  
  let profileData = null;
  if (roleId === 2) { // Dokter
    const [doctors] = await conn.query(
      'SELECT id FROM doctors WHERE user_id = ?',
      [userId]
    );
    profileData = doctors[0];
  } else if (roleId === 3) { // Pasien
    const [patients] = await conn.query(
      'SELECT id FROM patients WHERE user_id = ?',
      [userId]
    );
    profileData = patients[0];
  }

  conn.release();
  return profileData;
};

/**
 * Generate JWT token
 */
exports.generateToken = (userId, role, profileId) => {
  return jwt.sign(
    {
      id: userId,
      role,
      profileId
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN }
  );
};

/**
 * Verify JWT token
 */
exports.verifyToken = (token) => {
  return jwt.verify(token, process.env.JWT_SECRET);
};
