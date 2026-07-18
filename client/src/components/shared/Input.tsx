import React from 'react';
import type { InputHTMLAttributes } from 'react';
import './Input.css';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  id: string;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  id,
  className = '',
  ...props
}) => {
  return (
    <div className={`bts-input-wrapper ${className}`}>
      <label htmlFor={id} className="bts-label">
        {label}
      </label>
      <input
        id={id}
        className={`bts-input ${error ? 'bts-input-error' : ''}`}
        {...props}
      />
      {error && <span className="bts-error-message">{error}</span>}
    </div>
  );
};
