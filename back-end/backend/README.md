# FaceAttend — Backend API

Node.js + Express + MongoDB backend for the Face Recognition Attendance System.

## Quick Start

```bash
npm install
npm run dev       # development (nodemon)
npm start         # production
```

Server runs at: http://localhost:5000

## Folder Structure

```
backend/
├── config/
│   └── db.js                  MongoDB connection
├── models/
│   ├── Student.js             Student schema + password hashing
│   └── Attendance.js          Attendance record schema
├── routes/
│   ├── authRoutes.js          Register, Login, Profile
│   └── attendanceRoutes.js    Mark attendance, History
├── middleware/
│   ├── authMiddleware.js      JWT verification
│   ├── uploadMiddleware.js    Multer file upload config
│   └── errorHandler.js        Global error handler
├── uploads/                   Stored face images
├── server.js                  Express app entry point
├── .env                       Environment variables
└── package.json
```

## API Endpoints

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| GET  | `/` | No | Health check |
| POST | `/api/register` | No | Register student + upload face |
| POST | `/api/login` | No | Login → JWT token |
| GET  | `/api/profile` | ✅ JWT | Get own profile |
| GET  | `/api/student/me` | ✅ JWT | Get own profile (alias) |
| POST | `/api/attendance` | ✅ JWT | Mark attendance |
| GET  | `/api/attendance/history` | ✅ JWT | View attendance history |

## Environment Variables (.env)

```
PORT=5000
MONGO_URI=mongodb://localhost:27017/faceAttendanceDB
JWT_SECRET=your_secret_key_here
JWT_EXPIRES_IN=1d
NODE_ENV=development
```
