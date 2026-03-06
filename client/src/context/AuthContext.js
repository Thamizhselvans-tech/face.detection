import React, { createContext, useContext, useState, useCallback } from 'react';

const AuthContext = createContext(null);

const TOKEN_KEY   = 'fa_token';
const STUDENT_KEY = 'fa_student';

// ── helpers ──────────────────────────────────────────────────────────
const persist = (token, student) => {
  if (token)   localStorage.setItem(TOKEN_KEY,   token);
  if (student) localStorage.setItem(STUDENT_KEY, JSON.stringify(student));
};

const hydrate = () => {
  const token   = localStorage.getItem(TOKEN_KEY)   || null;
  const raw     = localStorage.getItem(STUDENT_KEY) || null;
  let student   = null;
  try { student = raw ? JSON.parse(raw) : null; } catch { /* ignore */ }
  return { token, student };
};

const purge = () => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(STUDENT_KEY);
};

// ── Provider ──────────────────────────────────────────────────────────
export const AuthProvider = ({ children }) => {
  const initial = hydrate();
  const [token,   setToken]   = useState(initial.token);
  const [student, setStudent] = useState(initial.student);

  const isAuthenticated = Boolean(token);

  const login = useCallback((newToken, newStudent) => {
    setToken(newToken);
    setStudent(newStudent);
    persist(newToken, newStudent);
  }, []);

  const logout = useCallback(() => {
    setToken(null);
    setStudent(null);
    purge();
  }, []);

  // Update student profile data without re-login (e.g. after photo upload)
  const updateStudent = useCallback((updates) => {
    setStudent((prev) => {
      const next = { ...prev, ...updates };
      localStorage.setItem(STUDENT_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  return (
    <AuthContext.Provider value={{ token, student, isAuthenticated, login, logout, updateStudent }}>
      {children}
    </AuthContext.Provider>
  );
};

// ── Hook ──────────────────────────────────────────────────────────────
export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
};
