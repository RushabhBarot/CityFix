import React from 'react';
import './Button.css';

const Button = ({ 
  children, 
  variant = 'primary', 
  size = 'medium',
  loading = false, 
  disabled = false, 
  icon,
  className = '',
  ...props 
}) => {
  const getVariantClass = () => {
    switch (variant) {
      case 'secondary': return 'secondary';
      case 'success': return 'success';
      case 'danger': return 'danger';
      case 'ghost': return 'ghost';
      case 'outline': return 'outline';
      default: return 'primary';
    }
  };

  const getSizeClass = () => {
    switch (size) {
      case 'small': return 'small';
      case 'large': return 'large';
      default: return '';
    }
  };

  const buttonClasses = [
    'btn',
    getVariantClass(),
    getSizeClass(),
    loading ? 'btn-loading' : '',
    className
  ].filter(Boolean).join(' ');

  return (
    <button
      className={buttonClasses}
      disabled={disabled || loading}
      {...props}
    >
      {icon && <span className="btn-icon">{icon}</span>}
      {loading ? (
        <div className="btn-loading">
          <div className="spinner"></div>
          Loading...
        </div>
      ) : (
        children
      )}
    </button>
  );
};

export default Button;