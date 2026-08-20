import React from 'react';
import type { InputHTMLAttributes } from 'react';
import './Input.css';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  id: string;
  icon?: React.ReactNode;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  id,
  icon,
  className = '',
  ...props
}) => {
  return (
    <div className={`bts-input-wrapper ${className}`}>
      <label htmlFor={id} className="bts-label">
        {label}
      </label>
      <div style={{ position: 'relative' }}>
        {icon && (
          <div style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-gray-disabled)' }}>
            {icon}
          </div>
        )}
        <input
          id={id}
          className={`bts-input ${error ? 'bts-input-error' : ''}`}
          style={icon ? { paddingLeft: '2.5rem' } : undefined}
          {...props}
        />
      </div>
      {error && <span className="bts-error-message">{error}</span>}
    </div>
  );
};
