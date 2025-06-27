import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import './Input.css';

const Input = ({ label, type = 'text', value, onChange, error, placeholder, icon: Icon, ...props }) => {
  const [showPassword, setShowPassword] = useState(false);
  const inputType = type === 'password' && showPassword ? 'text' : type;

  return (
    <div className="input-wrapper">
      <label className="input-label">
        {label}
      </label>
      <div className="input-container">
        {Icon && (
          <Icon className="input-icon" />
        )}
        <input
          type={inputType}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className={`input-field${error ? ' error' : ''}${Icon ? ' with-icon' : ''}`}
          {...props}
        />
        {type === 'password' && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="input-password-toggle"
          >
            {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
          </button>
        )}
      </div>
      {error && <p className="input-error">{error}</p>}
    </div>
  );
};

export default Input; 