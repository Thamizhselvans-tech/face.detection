const jwt     = require('jsonwebtoken');
const Student = require('../models/Student');

/**
 * authMiddleware
 * ──────────────
 * Verifies the JWT token from the Authorization header.
 * Attaches the authenticated student to req.student.
 *
 * Header format:  Authorization: Bearer <token>
 */
const authMiddleware = async (req, res, next) => {
  try {
    // ── 1. Extract token ──────────────────────────────────────────
    const authHeader = req.headers['authorization'] || req.headers['Authorization'];

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.',
      });
    }

    const token = authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. Invalid token format.',
      });
    }

    // ── 2. Verify token ───────────────────────────────────────────
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // ── 3. Find student in DB (exclude password) ──────────────────
    const student = await Student.findById(decoded.id).select('-password');

    if (!student) {
      return res.status(401).json({
        success: false,
        message: 'Token is valid but student no longer exists.',
      });
    }

    // ── 4. Attach student to request ──────────────────────────────
    req.student = student;
    next();

  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token.',
      });
    }

    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token has expired. Please log in again.',
      });
    }

    console.error('Auth middleware error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error during authentication.',
    });
  }
};

module.exports = authMiddleware;
