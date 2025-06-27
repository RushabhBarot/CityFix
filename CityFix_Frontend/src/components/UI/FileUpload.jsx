import React, { useState } from 'react';
import { Upload, X } from 'lucide-react';
import './FileUpload.css';

const FileUpload = ({ label, onChange, error, accept = "image/*", required = false, name }) => {
  const [preview, setPreview] = useState(null);
  const [fileName, setFileName] = useState('');

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFileName(file.name);
      onChange(file);
      
      // Create preview for images
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => setPreview(e.target.result);
        reader.readAsDataURL(file);
      }
    }
  };

  const clearFile = () => {
    setFileName('');
    setPreview(null);
    onChange(null);
  };

  return (
    <div className="file-upload-wrapper">
      <label className="file-upload-label">
        {label} {required && <span style={{ color: '#ef4444' }}>*</span>}
      </label>
      <div className="file-upload-container">
        <input
          type="file"
          accept={accept}
          onChange={handleFileChange}
          className="file-upload-input"
          id={`file-${label}`}
          required={required}
          name={name}
        />
        <label
          htmlFor={`file-${label}`}
          className={`file-upload-dropzone${error ? ' error' : ''}`}
        >
          <Upload className="file-upload-icon" />
          <span className="file-upload-text">
            {fileName || 'Click to upload file'}
          </span>
        </label>
        {fileName && (
          <button
            type="button"
            onClick={clearFile}
            className="file-upload-clear"
          >
            <X className="file-upload-clear-icon" />
          </button>
        )}
      </div>
      {preview && (
        <div className="file-upload-preview">
          <img src={preview} alt="Preview" />
        </div>
      )}
      {error && <p className="file-upload-error">{error}</p>}
    </div>
  );
};

export default FileUpload;