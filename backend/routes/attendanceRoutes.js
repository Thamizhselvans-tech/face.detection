const express        = require('express');
const Attendance     = require('../models/Attendance');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// ══════════════════════════════════════════════════════════════════
// @route   POST /api/attendance
// @desc    Mark attendance using captured face image (base64)
// @access  Protected
// ══════════════════════════════════════════════════════════════════
router.post('/', authMiddleware, async (req, res, next) => {
  try {
    const { image } = req.body;
    const student   = req.student;

    // ── Validate image data ───────────────────────────────────────
    if (!image) {
      return res.status(400).json({
        success: false,
        message: 'Captured image is required.',
      });
    }

    // ── Determine attendance status ───────────────────────────────
    // Current time logic:
    //   Before 09:00  → Present
    //   09:00–10:00   → Late
    //   After 10:00   → Absent (manual / admin override only)
    const now  = new Date();
    const hour = now.getHours();
    const min  = now.getMinutes();

    let status = 'Present';
    if (hour === 9 && min >= 0) status = 'Late';
    if (hour >= 10)             status = 'Late';

    // ── Save attendance record ────────────────────────────────────
    const attendance = await Attendance.create({
      student:        student._id,
      studentName:    student.name,
      registerNumber: student.registerNumber,
      status,
      markedAt:       now,
      // Optionally store base64: capturedImage: image
    });

    return res.status(200).json({
      success:     true,
      status,
      message:     `Attendance marked as ${status}.`,
      studentName: student.name,
      timestamp:   now.toISOString(),
      attendanceId: attendance._id,
    });

  } catch (error) {
    next(error);
  }
});

// ══════════════════════════════════════════════════════════════════
// @route   GET /api/attendance/history
// @desc    Get attendance history for logged-in student
// @access  Protected
// ══════════════════════════════════════════════════════════════════
router.get('/history', authMiddleware, async (req, res, next) => {
  try {
    const records = await Attendance.find({ student: req.student._id })
      .sort({ markedAt: -1 })
      .limit(50)
      .select('-capturedImage'); // don't return heavy image data

    const summary = {
      total:   records.length,
      present: records.filter((r) => r.status === 'Present').length,
      late:    records.filter((r) => r.status === 'Late').length,
      absent:  records.filter((r) => r.status === 'Absent').length,
    };

    return res.status(200).json({
      success: true,
      summary,
      records,
    });

  } catch (error) {
    next(error);
  }
});

// ══════════════════════════════════════════════════════════════════
// @route   GET /api/attendance/history/:studentId
// @desc    Get attendance history by student ID (admin or self)
// @access  Protected
// ══════════════════════════════════════════════════════════════════
router.get('/history/:studentId', authMiddleware, async (req, res, next) => {
  try {
    // Students can only view their own records
    if (req.student._id.toString() !== req.params.studentId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only view your own attendance.',
      });
    }

    const records = await Attendance.find({ student: req.params.studentId })
      .sort({ markedAt: -1 })
      .select('-capturedImage');

    return res.status(200).json({
      success: true,
      total:   records.length,
      records,
    });

  } catch (error) {
    next(error);
  }
});

module.exports = router;
