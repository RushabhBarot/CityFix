import React, { useState, useRef } from 'react';
import { Upload, X, File, Image, Video, Music, FileText } from 'lucide-react';
import './FileUpload.css';

const FileUpload = ({ 
  label, 
  onChange, 
  accept = '*/*', 
  multiple = false, 
  maxSize = 10 * 1024 * 1024, // 10MB default
  error,
  className = '',
  ...props 
}) => {
  const [files, setFiles] = useState([]);
  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  const getFileIcon = (file) => {
    if (file.type.startsWith('image/')) return <Image size={16} />;
    if (file.type.startsWith('video/')) return <Video size={16} />;
    if (file.type.startsWith('audio/')) return <Music size={16} />;
    if (file.type.includes('pdf') || file.type.includes('document')) return <FileText size={16} />;
    return <File size={16} />;
  };

  const getFileTypeClass = (file) => {
    if (file.type.startsWith('image/')) return 'image';
    if (file.type.startsWith('video/')) return 'video';
    if (file.type.startsWith('audio/')) return 'audio';
    if (file.type.includes('pdf') || file.type.includes('document')) return 'document';
    return 'other';
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const validateFile = (file) => {
    if (maxSize && file.size > maxSize) {
      return `File size must be less than ${formatFileSize(maxSize)}`;
    }
    return null;
  };

  const handleFileSelect = (selectedFiles) => {
    const fileArray = Array.from(selectedFiles);
    const validFiles = [];
    const errors = [];

    fileArray.forEach(file => {
      const error = validateFile(file);
      if (error) {
        errors.push(`${file.name}: ${error}`);
      } else {
        validFiles.push(file);
      }
    });

    if (errors.length > 0) {
      console.error('File validation errors:', errors);
    }

    if (multiple) {
      setFiles(prev => [...prev, ...validFiles]);
      onChange?.(multiple ? [...files, ...validFiles] : validFiles[0]);
    } else {
      setFiles(validFiles.slice(0, 1));
      onChange?.(validFiles[0] || null);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const droppedFiles = e.dataTransfer.files;
    handleFileSelect(droppedFiles);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragOver(false);
  };

  const removeFile = (index) => {
    const newFiles = files.filter((_, i) => i !== index);
    setFiles(newFiles);
    onChange?.(multiple ? newFiles : newFiles[0] || null);
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className={`file-upload-container ${className}`}>
      {label && <label className="file-upload-label">{label}</label>}
      
      <div
        className={`file-upload-area ${dragOver ? 'dragover' : ''} ${error ? 'error' : ''}`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={handleClick}
      >
        <input
          ref={fileInputRef}
          type="file"
          className="file-upload-input"
          accept={accept}
          multiple={multiple}
          onChange={(e) => handleFileSelect(e.target.files)}
          {...props}
        />
        
        {uploading && (
          <div className="file-upload-loading">
            <div className="file-upload-spinner"></div>
          </div>
        )}
        
        <div className="file-upload-content">
          <div className="file-upload-icon">
            <Upload size={24} />
          </div>
          
          <div className="file-upload-text">
            <div className="file-upload-title">
              {dragOver ? 'Drop files here' : 'Choose files or drag and drop'}
            </div>
            <div className="file-upload-subtitle">
              {accept === '*/*' ? 'Any file type' : `Accepted: ${accept}`} • Max size: {formatFileSize(maxSize)}
            </div>
          </div>
          
          <button type="button" className="file-upload-button">
            Browse Files
          </button>
        </div>
      </div>

      {/* File Previews */}
      {files.length > 0 && (
        <div className={multiple ? 'file-upload-multiple' : ''}>
          {files.map((file, index) => (
            <div key={index} className="file-preview">
              <div className="file-preview-header">
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <div className={`file-type-icon ${getFileTypeClass(file)}`}>
                    {getFileIcon(file)}
                  </div>
                  <div>
                    <div className="file-preview-name">{file.name}</div>
                    <div className="file-preview-size">{formatFileSize(file.size)}</div>
                  </div>
                </div>
                <button
                  type="button"
                  className="file-preview-remove"
                  onClick={() => removeFile(index)}
                >
                  <X size={16} />
                </button>
              </div>
              
              {file.type.startsWith('image/') && (
                <img
                  src={URL.createObjectURL(file)}
                  alt={file.name}
                  className="file-preview-image"
                />
              )}
            </div>
          ))}
        </div>
      )}

      {error && <div className="file-upload-error">{error}</div>}
    </div>
  );
};

export default FileUpload;