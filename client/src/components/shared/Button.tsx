import React from 'react';
import type { ButtonHTMLAttributes } from 'react';
import './Button.css';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost';
  size?: 'small' | 'medium' | 'large';
  isLoading?: boolean;
  fullWidth?: boolean;
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'medium',
  isLoading = false,
  fullWidth = false,
  className = '',
  children,
  disabled,
  ...props
}) => {
  const baseClass = 'bts-button';
  const variantClass = `bts-button-${variant}`;
  const sizeClass = `bts-button-${size}`;
  const widthClass = fullWidth ? 'bts-button-full' : '';
  const classes = `${baseClass} ${variantClass} ${sizeClass} ${widthClass} ${className}`.trim();

  return (
    <button
      className={classes}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <span className="spinner">Loading...</span>
      ) : (
        children
      )}
    </button>
  );
};
