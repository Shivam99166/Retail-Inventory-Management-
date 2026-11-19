import React from 'react';

const Input = React.forwardRef(({
  label,
  id,
  type = 'text',
  error,
  hint,
  className = '',
  ...props
}, ref) => {
  const inputId = id || `input-${Math.random().toString(36).substring(2, 9)}`;
  const inputClass = `form-input ${error ? 'form-input-error' : ''} ${className}`;

  return (
    <div className="form-group">
      {label && <label htmlFor={inputId} className="form-label">{label}</label>}
      {type === 'textarea' ? (
        <textarea
          id={inputId}
          ref={ref}
          className={`form-textarea ${error ? 'form-input-error' : ''} ${className}`}
          {...props}
        />
      ) : type === 'select' ? (
        <select
          id={inputId}
          ref={ref}
          className={`form-select ${error ? 'form-input-error' : ''} ${className}`}
          {...props}
        >
          {props.children}
        </select>
      ) : (
        <input
          id={inputId}
          type={type}
          ref={ref}
          className={inputClass}
          {...props}
        />
      )}
      {error && <span className="form-error">{error}</span>}
      {hint && !error && <span className="form-hint">{hint}</span>}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;
