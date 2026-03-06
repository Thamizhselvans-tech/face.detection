import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const NotFound = () => {
  const { isAuthenticated } = useAuth();

  return (
    <div className="page">
      <div className="not-found">
        <div className="not-found__code">404</div>
        <h1 className="not-found__title">Page Not Found</h1>
        <p className="not-found__sub">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <Link
          to={isAuthenticated ? '/dashboard' : '/login'}
          className="btn btn--primary"
          style={{ display: 'inline-flex', width: 'auto' }}
        >
          ← Go Home
        </Link>
      </div>
    </div>
  );
};

export default NotFound;