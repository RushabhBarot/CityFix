import React from 'react';
import './Button.css';

const Button = ({ children, variant = 'primary', loading = false, disabled = false, ...props }) => {
  const baseClasses = 'w-full py-2 px-4 rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2';
  const variants = {
    primary: 'bg-blue-600 hover:bg-blue-700 text-white focus:ring-blue-500 disabled:bg-blue-300',
    secondary: 'bg-gray-200 hover:bg-gray-300 text-gray-800 focus:ring-gray-500 disabled:bg-gray-100',
  };

  return (
    <button
      className={`btn ${variant}` + (loading ? ' btn-loading' : '')}
      disabled={disabled || loading}
      {...props}
    >
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