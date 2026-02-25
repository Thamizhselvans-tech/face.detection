// ── Load environment variables first ───────────────────────────────
require('dotenv').config();

const express      = require('express');
const cors         = require('cors');
const path         = require('path');
const connectDB    = require('./config/db');
const authRoutes   = require('./routes/authRoutes');
const attendanceRoutes = require('./routes/attendanceRoutes');
const errorHandler = require('./middleware/errorHandler');

// ── Connect to MongoDB ──────────────────────────────────────────────
connectDB();

// ── Initialize Express ──────────────────────────────────────────────
const app  = express();
const PORT = process.env.PORT || 5000;

// ══════════════════════════════════════════════════════════════════
// Middleware
// ══════════════════════════════════════════════════════════════════

// CORS — allow requests from React frontend
app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://localhost:3001',
  ],
  methods:     ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));

// Parse JSON bodies (up to 10mb for base64 images)
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve uploaded images as static files
// Access via: http://localhost:5000/uploads/<filename>
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ══════════════════════════════════════════════════════════════════
// Routes
// ══════════════════════════════════════════════════════════════════

// Health check
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: '🚀 FaceAttend API is running',
    version: '1.0.0',
    endpoints: {
      register:         'POST /api/register',
      login:            'POST /api/login',
      profile:          'GET  /api/profile          (protected)',
      studentMe:        'GET  /api/student/me        (protected)',
      markAttendance:   'POST /api/attendance        (protected)',
      attendanceHistory:'GET  /api/attendance/history(protected)',
    },
  });
});

// Auth routes: register, login, profile
app.use('/api', authRoutes);

// Attendance routes
app.use('/api/attendance', attendanceRoutes);

// ── 404 handler ─────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
});

// ── Global error handler (must be last) ─────────────────────────────
app.use(errorHandler);

// ══════════════════════════════════════════════════════════════════
// Start Server
// ══════════════════════════════════════════════════════════════════
app.listen(PORT, () => {
  console.log('');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🚀  FaceAttend Backend Started');
  console.log(`🌐  Server   : http://localhost:${PORT}`);
  console.log(`📁  Uploads  : http://localhost:${PORT}/uploads`);
  console.log(`🔧  Env      : ${process.env.NODE_ENV || 'development'}`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('');
});

// ── Handle unhandled promise rejections ─────────────────────────────
process.on('unhandledRejection', (err) => {
  console.error('❌ Unhandled Rejection:', err.message);
  process.exit(1);
});

module.exports = app;
