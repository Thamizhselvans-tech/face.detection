const express        = require('express');
const jwt            = require('jsonwebtoken');
const Student        = require('../models/Student');
const authMiddleware = require('../middleware/authMiddleware');
const upload         = require('../middleware/uploadMiddleware');
const path           = require('path');

const router = express.Router();

// ══════════════════════════════════════════════════════════════════
// Helper: generate JWT token
// ══════════════════════════════════════════════════════════════════
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '1d',
  });
};

// ══════════════════════════════════════════════════════════════════
// @route   POST /api/register
// @desc    Register a new student with face image
// @access  Public
// ══════════════════════════════════════════════════════════════════
router.post('/register', upload.single('faceImage'), async (req, res, next) => {
  try {
    const { name, registerNumber, department, email, password } = req.body;

    // ── Validate required fields ──────────────────────────────────
    if (!name || !registerNumber || !department || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required: name, registerNumber, department, email, password.',
      });
    }

    // ── Check if email already exists ────────────────────────────
    const existingEmail = await Student.findOne({ email: email.toLowerCase() });
    if (existingEmail) {
      return res.status(409).json({
        success: false,
        message: 'Email is already registered.',
      });
    }

    // ── Check if register number already exists ───────────────────
    const existingRegNum = await Student.findOne({
      registerNumber: registerNumber.toUpperCase(),
    });
    if (existingRegNum) {
      return res.status(409).json({
        success: false,
        message: 'Register number is already in use.',
      });
    }

    // ── Build face image path ─────────────────────────────────────
    const faceImagePath = req.file
      ? `uploads/${req.file.filename}`
      : null;

    // ── Create student (password hashed via pre-save hook) ────────
    const student = await Student.create({
      name:           name.trim(),
      registerNumber: registerNumber.trim().toUpperCase(),
      department:     department.trim(),
      email:          email.trim().toLowerCase(),
      password,
      faceImage:      faceImagePath,
    });

    // ── Generate token ────────────────────────────────────────────
    const token = generateToken(student._id);

    return res.status(201).json({
      success: true,
      message: 'Student registered successfully.',
      token,
      student: {
        id:             student._id,
        name:           student.name,
        registerNumber: student.registerNumber,
        department:     student.department,
        email:          student.email,
        faceImage:      student.faceImage,
        createdAt:      student.createdAt,
      },
    });

  } catch (error) {
    next(error);
  }
});

// ══════════════════════════════════════════════════════════════════
// @route   POST /api/login
// @desc    Login student and return JWT
// @access  Public
// ══════════════════════════════════════════════════════════════════
router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // ── Validate input ────────────────────────────────────────────
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required.',
      });
    }

    // ── Find student (include password for comparison) ────────────
    const student = await Student.findOne({
      email: email.trim().toLowerCase(),
    }).select('+password');

    if (!student) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    // ── Compare password ──────────────────────────────────────────
    const isMatch = await student.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    // ── Generate token ────────────────────────────────────────────
    const token = generateToken(student._id);

    return res.status(200).json({
      success: true,
      message: 'Login successful.',
      token,
      student: {
        id:             student._id,
        name:           student.name,
        registerNumber: student.registerNumber,
        department:     student.department,
        email:          student.email,
        faceImage:      student.faceImage,
        createdAt:      student.createdAt,
      },
    });

  } catch (error) {
    next(error);
  }
});

// ══════════════════════════════════════════════════════════════════
// @route   GET /api/profile
// @desc    Get logged-in student's profile
// @access  Protected
// ══════════════════════════════════════════════════════════════════
router.get('/profile', authMiddleware, async (req, res, next) => {
  try {
    // req.student is set by authMiddleware (password excluded)
    const student = req.student;

    return res.status(200).json({
      success: true,
      student: {
        id:             student._id,
        name:           student.name,
        registerNumber: student.registerNumber,
        department:     student.department,
        email:          student.email,
        faceImage:      student.faceImage,
        createdAt:      student.createdAt,
      },
    });

  } catch (error) {
    next(error);
  }
});

// ══════════════════════════════════════════════════════════════════
// @route   GET /api/student/me
// @desc    Alias for profile (used by frontend)
// @access  Protected
// ══════════════════════════════════════════════════════════════════
router.get('/student/me', authMiddleware, async (req, res, next) => {
  try {
    const student = req.student;

    return res.status(200).json({
      success: true,
      student: {
        id:             student._id,
        name:           student.name,
        registerNumber: student.registerNumber,
        department:     student.department,
        email:          student.email,
        faceImage:      student.faceImage
          ? `${req.protocol}://${req.get('host')}/${student.faceImage}`
          : null,
        photoUrl: student.faceImage
          ? `${req.protocol}://${req.get('host')}/${student.faceImage}`
          : null,
        createdAt: student.createdAt,
      },
    });

  } catch (error) {
    next(error);
  }
});

module.exports = router;
