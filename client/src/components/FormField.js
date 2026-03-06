import React from 'react';

/**
 * FormField
 * Props:
 *   label, name, type, value, onChange, placeholder,
 *   error, required, autoComplete, children (overrides input)
 */
const FormField = ({
  label,
  name,
  type = 'text',
  value,
  onChange,
  placeholder,
  error,
  required,
  autoComplete,
  children,
  inputProps = {},
}) => {
  const inputId = `field-${name}`;
  const errId   = `${inputId}-err`;

  return (
    <div className="field">
      {label && (
        <label className="field__label" htmlFor={inputId}>
          {label}
          {required && <span className="req" aria-hidden="true"> *</span>}
        </label>
      )}

      {children ? (
        children
      ) : (
        <input
          id={inputId}
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          autoComplete={autoComplete}
          aria-required={required}
          aria-invalid={!!error}
          aria-describedby={error ? errId : undefined}
          className={`field__input ${error ? 'field__input--error' : ''}`}
          {...inputProps}
        />
      )}

      {error && (
        <p id={errId} className="field__error" role="alert">
          <span aria-hidden="true">⚠</span> {error}
        </p>
      )}
    </div>
  );
};

export default FormField;
