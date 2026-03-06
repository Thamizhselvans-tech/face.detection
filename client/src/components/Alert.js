import React from 'react';

const META = {
  success: { icon: '✓', label: 'Success' },
  error:   { icon: '✕', label: 'Error' },
  warning: { icon: '⚠', label: 'Warning' },
  info:    { icon: 'ℹ', label: 'Info' },
};

/**
 * Alert component
 * Props:
 *   type     — 'success' | 'error' | 'warning' | 'info'
 *   title    — optional bold heading
 *   message  — main text (required)
 *   onDismiss — optional close handler
 */
const Alert = ({ type = 'info', title, message, onDismiss }) => {
  if (!message) return null;
  const { icon, label } = META[type] || META.info;

  return (
    <div className={`alert alert--${type}`} role="alert" aria-live="polite">
      <span className="alert__icon" aria-hidden="true">{icon}</span>
      <div className="alert__body">
        {title && <div className="alert__title">{title}</div>}
        <div>{message}</div>
      </div>
      {onDismiss && (
        <button
          className="alert__close"
          onClick={onDismiss}
          aria-label={`Dismiss ${label} alert`}
          type="button"
        >
          ×
        </button>
      )}
    </div>
  );
};

export default Alert;
