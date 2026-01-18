import React, { useState, useRef, useCallback } from 'react';
import './MediaUploader.css';

const MediaUploader = ({ 
  onUpload, 
  maxFiles = 10, 
  maxVideoSeconds = 60,
  acceptedTypes = ['image/*', 'video/*'],
  showRoomTags = false,
  isReviewMedia = false 
}) => {
  const [files, setFiles] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({});
  const [errors, setErrors] = useState([]);
  const fileInputRef = useRef(null);

  const roomTags = [
    { value: 'bedroom', label: 'Phòng ngủ' },
    { value: 'bathroom', label: 'Phòng tắm' },
    { value: 'kitchen', label: 'Bếp' },
    { value: 'balcony', label: 'Ban công' },
    { value: 'living_room', label: 'Phòng khách' },
    { value: 'entrance', label: 'Lối vào' },
    { value: 'other', label: 'Khác' }
  ];

  const validateFile = useCallback((file) => {
    const errors = [];
    
    // Check file type
    const isImage = file.type.startsWith('image/');
    const isVideo = file.type.startsWith('video/');
    
    if (!isImage && !isVideo) {
      errors.push(`${file.name}: Chỉ chấp nhận file ảnh hoặc video`);
    }

    // Check file size (10MB for images, 100MB for videos)
    const maxSize = isVideo ? 100 * 1024 * 1024 : 10 * 1024 * 1024;
    if (file.size > maxSize) {
      errors.push(`${file.name}: File quá lớn (tối đa ${isVideo ? '100MB' : '10MB'})`);
    }

    return errors;
  }, []);

  const processFile = useCallback(async (file) => {
    const isVideo = file.type.startsWith('video/');
    const preview = URL.createObjectURL(file);
    
    const fileData = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`,
      file,
      name: file.name,
      type: isVideo ? 'video' : 'image',
      size: file.size,
      preview,
      roomTag: null,
      duration: null
    };

    // Get video duration
    if (isVideo) {
      const video = document.createElement('video');
      video.preload = 'metadata';
      video.src = preview;
      
      await new Promise((resolve) => {
        video.onloadedmetadata = () => {
          fileData.duration = Math.round(video.duration);
          resolve();
        };
        video.onerror = resolve;
      });

      // Check duration limit
      if (fileData.duration > maxVideoSeconds) {
        setErrors(prev => [...prev, `${file.name}: Video không được dài quá ${maxVideoSeconds} giây`]);
        return null;
      }
    }

    return fileData;
  }, [maxVideoSeconds]);

  const handleFiles = useCallback(async (fileList) => {
    const newErrors = [];
    const validFiles = [];

    // Check total file count
    if (files.length + fileList.length > maxFiles) {
      newErrors.push(`Chỉ được upload tối đa ${maxFiles} file`);
      setErrors(prev => [...prev, ...newErrors]);
      return;
    }

    for (const file of Array.from(fileList)) {
      const validationErrors = validateFile(file);
      
      if (validationErrors.length > 0) {
        newErrors.push(...validationErrors);
        continue;
      }

      const processedFile = await processFile(file);
      if (processedFile) {
        validFiles.push(processedFile);
      }
    }

    if (newErrors.length > 0) {
      setErrors(prev => [...prev, ...newErrors]);
    }

    if (validFiles.length > 0) {
      setFiles(prev => [...prev, ...validFiles]);
    }
  }, [files.length, maxFiles, validateFile, processFile]);

  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    const droppedFiles = e.dataTransfer.files;
    handleFiles(droppedFiles);
  };

  const handleFileInput = (e) => {
    handleFiles(e.target.files);
    e.target.value = '';
  };

  const removeFile = (fileId) => {
    setFiles(prev => {
      const file = prev.find(f => f.id === fileId);
      if (file?.preview) {
        URL.revokeObjectURL(file.preview);
      }
      return prev.filter(f => f.id !== fileId);
    });
  };

  const updateFileTag = (fileId, tag) => {
    setFiles(prev => prev.map(f => 
      f.id === fileId ? { ...f, roomTag: tag } : f
    ));
  };

  const reorderFiles = (fromIndex, toIndex) => {
    setFiles(prev => {
      const result = [...prev];
      const [removed] = result.splice(fromIndex, 1);
      result.splice(toIndex, 0, removed);
      return result;
    });
  };

  const handleUpload = async () => {
    if (files.length === 0) return;

    const uploadData = files.map((f, index) => ({
      file: f.file,
      type: f.type,
      roomTag: f.roomTag,
      duration: f.duration,
      order: index
    }));

    try {
      // Simulate upload progress
      for (const file of files) {
        setUploadProgress(prev => ({ ...prev, [file.id]: 0 }));
        
        // Simulate progress
        for (let i = 0; i <= 100; i += 10) {
          await new Promise(r => setTimeout(r, 50));
          setUploadProgress(prev => ({ ...prev, [file.id]: i }));
        }
      }

      if (onUpload) {
        await onUpload(uploadData);
      }

      // Clear files after successful upload
      files.forEach(f => URL.revokeObjectURL(f.preview));
      setFiles([]);
      setUploadProgress({});
    } catch (error) {
      setErrors(prev => [...prev, 'Lỗi upload. Vui lòng thử lại.']);
    }
  };

  const clearErrors = () => setErrors([]);

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="media-uploader">
      {/* Dropzone */}
      <div
        className={`dropzone ${isDragging ? 'dragging' : ''} ${files.length > 0 ? 'has-files' : ''}`}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={acceptedTypes.join(',')}
          onChange={handleFileInput}
          className="file-input"
        />

        <div className="dropzone-content">
          <div className="dropzone-icon">
            {isDragging ? '📥' : '📷'}
          </div>
          <p className="dropzone-text">
            {isDragging 
              ? 'Thả file vào đây' 
              : 'Kéo thả hoặc click để chọn file'}
          </p>
          <p className="dropzone-hint">
            Ảnh (JPEG, PNG, WebP) hoặc Video (MP4, WebM)
            <br />
            {isReviewMedia 
              ? `Tối đa 5 file, video ≤ ${maxVideoSeconds}s`
              : `Tối đa ${maxFiles} file`}
          </p>
        </div>
      </div>

      {/* Error Messages */}
      {errors.length > 0 && (
        <div className="upload-errors">
          {errors.map((error, index) => (
            <div key={index} className="error-message">
              <span>⚠️ {error}</span>
              <button onClick={clearErrors} className="clear-errors">✕</button>
            </div>
          ))}
        </div>
      )}

      {/* File Preview Grid */}
      {files.length > 0 && (
        <div className="file-preview-grid">
          {files.map((file, index) => (
            <div 
              key={file.id} 
              className={`file-preview-item ${uploadProgress[file.id] !== undefined ? 'uploading' : ''}`}
              draggable
              onDragStart={(e) => e.dataTransfer.setData('text/plain', index)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                const fromIndex = parseInt(e.dataTransfer.getData('text/plain'));
                reorderFiles(fromIndex, index);
              }}
            >
              {/* Preview */}
              <div className="preview-media">
                {file.type === 'video' ? (
                  <video src={file.preview} className="preview-video" />
                ) : (
                  <img src={file.preview} alt={file.name} className="preview-image" />
                )}

                {/* Type Badge */}
                <span className={`type-badge ${file.type}`}>
                  {file.type === 'video' ? '🎬' : '📷'}
                </span>

                {/* Duration Badge */}
                {file.duration && (
                  <span className="duration-badge">
                    {formatDuration(file.duration)}
                  </span>
                )}

                {/* Remove Button */}
                <button 
                  className="remove-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeFile(file.id);
                  }}
                >
                  ✕
                </button>

                {/* Upload Progress */}
                {uploadProgress[file.id] !== undefined && (
                  <div className="upload-progress-overlay">
                    <div 
                      className="progress-ring"
                      style={{ '--progress': uploadProgress[file.id] }}
                    >
                      <span className="progress-text">{uploadProgress[file.id]}%</span>
                    </div>
                  </div>
                )}
              </div>

              {/* File Info */}
              <div className="file-info">
                <span className="file-name">{file.name}</span>
                <span className="file-size">{formatFileSize(file.size)}</span>
              </div>

              {/* Room Tag Selector */}
              {showRoomTags && (
                <select
                  className="room-tag-select"
                  value={file.roomTag || ''}
                  onChange={(e) => updateFileTag(file.id, e.target.value)}
                  onClick={(e) => e.stopPropagation()}
                >
                  <option value="">Chọn vị trí...</option>
                  {roomTags.map(tag => (
                    <option key={tag.value} value={tag.value}>
                      {tag.label}
                    </option>
                  ))}
                </select>
              )}

              {/* Order Badge */}
              <span className="order-badge">{index + 1}</span>
            </div>
          ))}
        </div>
      )}

      {/* Upload Button */}
      {files.length > 0 && (
        <div className="upload-actions">
          <button 
            className="btn btn-outline"
            onClick={() => {
              files.forEach(f => URL.revokeObjectURL(f.preview));
              setFiles([]);
            }}
          >
            Xóa tất cả
          </button>
          <button 
            className="btn btn-primary"
            onClick={handleUpload}
            disabled={Object.keys(uploadProgress).length > 0}
          >
            {Object.keys(uploadProgress).length > 0 
              ? 'Đang upload...' 
              : `Upload ${files.length} file`}
          </button>
        </div>
      )}
    </div>
  );
};

export default MediaUploader;
