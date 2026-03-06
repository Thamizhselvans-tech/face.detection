import React, { useState, useRef } from 'react';
import { formatFileSize } from '../utils/format';
import { isSupportedImage, isUnderSizeLimit } from '../utils/validators';

const FaceUpload = ({ onFileSelect, error }) => {
  const [preview,    setPreview]    = useState(null);
  const [file,       setFile]       = useState(null);
  const [dragging,   setDragging]   = useState(false);
  const [localError, setLocalError] = useState('');
  const inputRef = useRef();

  const process = (f) => {
    setLocalError('');
    if (!f) return;

    if (!isSupportedImage(f)) {
      setLocalError('Unsupported format. Use JPEG, PNG, or WEBP.');
      return;
    }
    if (!isUnderSizeLimit(f)) {
      setLocalError('File too large. Maximum size is 5 MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target.result);
    reader.readAsDataURL(f);
    setFile(f);

    // ✅ Safe call — check if function before calling
    if (typeof onFileSelect === 'function') {
      onFileSelect(f);
    }
  };

  const handleChange   = (e) => process(e.target.files[0]);
  const handleDrop     = (e) => { e.preventDefault(); setDragging(false); process(e.dataTransfer.files[0]); };
  const handleDragOver = (e) => { e.preventDefault(); setDragging(true); };
  const handleDragLeave = ()  => setDragging(false);

  const handleRemove = (e) => {
    e.stopPropagation();
    setPreview(null);
    setFile(null);
    setLocalError('');
    if (inputRef.current) inputRef.current.value = '';

    // ✅ Safe call
    if (typeof onFileSelect === 'function') {
      onFileSelect(null);
    }
  };

  const displayError = localError || error;

  if (preview && file) {
    return (
      <div className="field">
        <span className="field__label">
          Face Photo <span className="req">*</span>
        </span>
        <div className="upload-preview">
          <img
            src={preview}
            alt="Face preview"
            className="upload-preview__img"
          />
          <div className="upload-preview__info">
            <div className="upload-preview__name">{file.name}</div>
            <div className="upload-preview__size">{formatFileSize(file.size)}</div>
          </div>
          <button
            type="button"
            className="upload-preview__remove"
            onClick={handleRemove}
            aria-label="Remove photo"
          >
            ✕
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="field">
      <span className="field__label">
        Face Photo <span className="req">*</span>
      </span>

      <div
        className={`upload-zone ${dragging ? 'upload-zone--active' : ''}`}
        style={{ border: displayError ? '2px dashed var(--red)' : undefined }}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => inputRef.current?.click()}
        role="button"
        tabIndex={0}
        onKeyDown={(e) =>
          (e.key === 'Enter' || e.key === ' ') && inputRef.current?.click()
        }
        aria-label="Upload face photo"
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={handleChange}
          className="upload-zone__input"
          tabIndex={-1}
          aria-hidden="true"
        />
        <div className="upload-zone__icon">🧑</div>
        <p className="upload-zone__text">
          <strong>Click to upload</strong> or drag & drop
        </p>
        <p className="upload-zone__hint">JPEG, PNG, WEBP — max 5 MB</p>
      </div>

      {displayError && (
        <p className="field__error" role="alert">
          <span aria-hidden="true">⚠</span> {displayError}
        </p>
      )}
    </div>
  );
};

export default FaceUpload;