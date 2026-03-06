# FaceAttend — React Frontend

Secure, production-ready React frontend for a Face Recognition Attendance System.

---

## Quick Start

```bash
npm install
cp .env.example .env      # set REACT_APP_API_URL
npm start
```

---

## Folder Structure

```
src/
├── pages/
│   ├── Register.js       Multi-step registration (personal info + face upload)
│   ├── Login.js          JWT login, session-expired detection
│   ├── Dashboard.js      Private student profile with secure photo display
│   ├── Attendance.js     Camera capture + face submission
│   └── NotFound.js       404 fallback
│
├── components/
│   ├── Navbar.js          Sticky nav, adapts to auth state
│   ├── ProtectedRoute.js  Auth guard — redirects to /login if unauthenticated
│   ├── SecureImage.js     Fetches private images through Axios (JWT header)
│   ├── FaceUpload.js      Drag-and-drop face photo uploader with preview
│   ├── FormField.js       Reusable labeled input + accessible error display
│   ├── Alert.js           Dismissible alerts (success/error/warning/info)
│   └── PageLoader.js      Full-page loading spinner
│
├── context/
│   └── AuthContext.js     Central auth state (token + student), login/logout
│
├── hooks/
│   ├── useCamera.js       Camera stream lifecycle management
│   └── useAsync.js        Generic async operation state hook
│
├── services/
│   └── api.js             Axios instance — JWT interceptor + all API calls
│
├── utils/
│   ├── validators.js      Form validation functions
│   └── format.js          Date/file size formatters
│
├── styles/
│   └── global.css         Full design system (CSS variables, all components)
│
├── App.js                 React Router v6 + lazy-loaded protected routes
└── index.js               Entry point
```

---

## Security Architecture

### Authentication
- JWT stored in `localStorage` under key `fa_token`
- `AuthContext` exposes `login()`, `logout()`, `isAuthenticated`
- `ProtectedRoute` wraps all private pages; redirects to `/login` with `state.from` for post-login redirect

### Axios JWT Interceptor
Every request automatically includes:
```
Authorization: Bearer <token>
```
The interceptor in `services/api.js` reads from `localStorage` on every request,
so the token is never stale in headers.

### 401 Auto-Logout
If the backend returns HTTP 401, the response interceptor:
1. Purges `fa_token` and `fa_student` from `localStorage`
2. Redirects to `/login?session=expired`
3. Login page detects the query param and shows a banner

### Private Photo Access
Student face photos are served through a **protected backend route** (`/api/student/me/photo`).

`SecureImage` component fetches the image as a **blob** via Axios (which attaches the JWT),
converts it to an object URL, and renders it — so the raw backend URL is never exposed
in the DOM or network tab without a valid token.

If your backend uses public CDN / pre-signed URLs, pass `publicSrc` instead.

### UI-level Deterrents
- Profile images have `draggable="false"` and `pointer-events: none` via `.profile-img`
- No `right-click → save` shortcut on face images

---

## API Endpoints Expected

| Method | Endpoint                 | Auth? | Description                        |
|--------|--------------------------|-------|------------------------------------|
| POST   | `/api/register`          | No    | Register student (multipart/form-data) |
| POST   | `/api/login`             | No    | Login → `{ token, student }`       |
| GET    | `/api/student/me`        | ✓ JWT | Fetch own profile                  |
| GET    | `/api/student/me/photo`  | ✓ JWT | Serve face image (blob)            |
| POST   | `/api/attendance`        | ✓ JWT | Submit base64 image                |
| GET    | `/api/attendance/history`| ✓ JWT | Attendance history                 |

### POST /api/register
```
Content-Type: multipart/form-data
Fields: name, registerNumber, department, email, password, faceImage (File)
```

### POST /api/attendance
```json
{ "image": "data:image/jpeg;base64,..." }
```
Response:
```json
{ "status": "present|late|absent", "message": "...", "timestamp": "ISO8601" }
```

---

## Future Expansion

Add these with zero refactoring — just drop new files:

```
src/pages/History.js          Attendance history table
src/pages/Profile.js          Edit name / re-upload photo
src/pages/AdminDashboard.js   Admin: list all students
```

For role-based access, extend `ProtectedRoute` with a `role` prop:
```jsx
<ProtectedRoute role="admin"><AdminDashboard /></ProtectedRoute>
```
