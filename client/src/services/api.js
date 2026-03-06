/**
 * services/api.js
 * ───────────────
 * Centralised Axios instance.
 * The request interceptor automatically attaches the JWT from localStorage
 * to every outgoing request — no manual headers needed at call sites.
 *
 * The response interceptor handles 401 globally (token expired / invalid).
 */

import axios from 'axios';

// ── Axios instance ────────────────────────────────────────────────────
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000',
  timeout: 20_000,
});

// ── Request interceptor: attach JWT ───────────────────────────────────
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('fa_token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ── Response interceptor: global 401 handler ──────────────────────────
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid — purge local state and redirect
      localStorage.removeItem('fa_token');
      localStorage.removeItem('fa_student');
      // Avoid import cycle by using window.location instead of navigate()
      if (!window.location.pathname.startsWith('/login')) {
        window.location.href = '/login?session=expired';
      }
    }
    return Promise.reject(error);
  }
);

// ════════════════════════════════════════════════════════════════════
// Auth endpoints
// ════════════════════════════════════════════════════════════════════

/**
 * Register a new student.
 * @param {FormData} formData  — must include: name, registerNumber,
 *                               department, email, password, faceImage (File)
 */
export const registerStudent = (formData) =>
  api.post('/api/register', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

/**
 * Login.
 * @param {{ email: string, password: string }} credentials
 * @returns {{ token: string, student: StudentObject }}
 */
export const loginStudent = (credentials) =>
  api.post('/api/login', credentials);

// ════════════════════════════════════════════════════════════════════
// Profile endpoints (protected — JWT attached automatically)
// ════════════════════════════════════════════════════════════════════

/**
 * Fetch the currently authenticated student's profile.
 * The image URL returned is scoped to this student only.
 */
export const getMyProfile = () => api.get('/api/student/me');

// ════════════════════════════════════════════════════════════════════
// Attendance endpoints (protected)
// ════════════════════════════════════════════════════════════════════

/**
 * Mark attendance via a captured face image.
 * @param {string} imageBase64 — JPEG base64 data-URL
 * @returns {{ status: 'present'|'late'|'absent', message: string, timestamp: string }}
 */
export const markAttendance = (imageBase64) =>
  api.post('/api/attendance', { image: imageBase64 });

/**
 * Get attendance history for the logged-in student.
 */
export const getAttendanceHistory = () => api.get('/api/attendance/history');

// ════════════════════════════════════════════════════════════════════
// Secure image fetching
// ════════════════════════════════════════════════════════════════════

/**
 * Fetch a private student image as a blob and convert to object URL.
 * Use this when the image URL requires the Authorization header
 * (i.e. the backend serves images through a protected route).
 *
 * If the backend serves images as public URLs (CDN / pre-signed), just use
 * the URL directly and skip this function.
 *
 * @param {string} imagePath  — e.g. '/api/student/me/photo'
 * @returns {Promise<string>}  object URL (revoke after use)
 */
export const fetchSecureImage = async (imagePath) => {
  const response = await api.get(imagePath, { responseType: 'blob' });
  return URL.createObjectURL(response.data);
};

export default api;
