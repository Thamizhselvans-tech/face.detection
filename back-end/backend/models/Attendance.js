const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema(
  {
    student: {
      type:     mongoose.Schema.Types.ObjectId,
      ref:      'Student',
      required: true,
    },

    studentName: {
      type: String,
      required: true,
    },

    registerNumber: {
      type: String,
      required: true,
    },

    status: {
      type:    String,
      enum:    ['Present', 'Late', 'Absent'],
      default: 'Present',
    },

    markedAt: {
      type:    Date,
      default: Date.now,
    },

    capturedImage: {
      type:    String, // base64 or path (optional — store if needed)
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Attendance', attendanceSchema);
