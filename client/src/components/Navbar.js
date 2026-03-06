import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { isAuthenticated, student, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <header className="navbar">
      {/* Brand */}
      <NavLink to={isAuthenticated ? '/dashboard' : '/'} className="navbar__brand">
        <div className="navbar__logo">📷</div>
        FaceAttend
      </NavLink>

      {/* Nav links */}
      <nav className="navbar__nav">
        {isAuthenticated ? (
          <>
            <NavLink
              to="/dashboard"
              className={({ isActive }) =>
                `navbar__link ${isActive ? 'navbar__link--active' : ''}`
              }
            >
              Dashboard
            </NavLink>

            <NavLink
              to="/attendance"
              className={({ isActive }) =>
                `navbar__link ${isActive ? 'navbar__link--active' : ''}`
              }
            >
              Attendance
            </NavLink>

            {student?.name && (
              <span className="navbar__badge">
                {student.name.split(' ')[0]}
              </span>
            )}

            <button
              onClick={handleLogout}
              className="navbar__link navbar__link--logout"
              type="button"
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <NavLink
              to="/login"
              className={({ isActive }) =>
                `navbar__link ${isActive ? 'navbar__link--active' : ''}`
              }
            >
              Login
            </NavLink>
            <NavLink
              to="/register"
              className={({ isActive }) =>
                `navbar__link ${isActive ? 'navbar__link--active' : ''}`
              }
            >
              Register
            </NavLink>
          </>
        )}
      </nav>
    </header>
  );
};

export default Navbar;
