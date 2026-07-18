import React from 'react';
import type { SelectHTMLAttributes } from 'react';
import './Select.css';

interface Option {
  value: string;
  label: string;
  disabled?: boolean;
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  options: Option[];
  error?: string;
  id: string;
  placeholder?: string;
}

export const Select: React.FC<SelectProps> = ({
  label,
  options,
  error,
  id,
  placeholder,
  className = '',
  ...props
}) => {
  return (
    <div className={`bts-select-wrapper ${className}`}>
      {label && (
        <label htmlFor={id} className="bts-label">
          {label}
        </label>
      )}
      <select
        id={id}
        className={`bts-select ${error ? 'bts-select-error' : ''}`}
        {...props}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((opt) => (
          <option key={opt.value} value={opt.value} disabled={opt.disabled}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && <span className="bts-error-message">{error}</span>}
    </div>
  );
};
