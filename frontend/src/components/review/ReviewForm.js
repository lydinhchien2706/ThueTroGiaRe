import React, { useState, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { reviewsAPI } from '../../services/api';
import './ReviewForm.css';

// URL validation helper
const isValidUrl = (string) => {
  try {
    const url = new URL(string);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
};

const ReviewForm = ({ roomId, onSubmitted, onCancel }) => {
  const { user, isAuthenticated } = useAuth();
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    rating: 5
  });
  const [media, setMedia] = useState([]); // For URL-based media
  const [uploadedFiles, setUploadedFiles] = useState([]); // For uploaded files
  const [mediaUrl, setMediaUrl] = useState('');
  const [mediaError, setMediaError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [uploadMode, setUploadMode] = useState('file'); // 'file' or 'url'
  const fileInputRef = useRef(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleRatingChange = (rating) => {
    setFormData(prev => ({
      ...prev,
      rating
    }));
  };

  const handleMediaUrlChange = (e) => {
    setMediaUrl(e.target.value);
    setMediaError(null);
  };

  const handleMediaAdd = () => {
    const url = mediaUrl.trim();
    
    if (!url) {
      setMediaError('Vui lòng nhập URL');
      return;
    }

    if (!isValidUrl(url)) {
      setMediaError('URL không hợp lệ. Vui lòng nhập URL http/https hợp lệ.');
      return;
    }

    const isVideo = url.includes('video') || url.endsWith('.mp4') || url.endsWith('.webm') || url.endsWith('.mov');
    setMedia(prev => [...prev, {
      url: url,
      media_type: isVideo ? 'video' : 'image',
      thumbnail_url: isVideo ? '' : url
    }]);
    setMediaUrl('');
    setMediaError(null);
  };

  const handleMediaRemove = (index) => {
    setMedia(prev => prev.filter((_, i) => i !== index));
  };

  // File upload handlers
  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    const totalCount = uploadedFiles.length + files.length;
    
    if (totalCount > 10) {
      setMediaError('Tối đa 10 file');
      return;
    }

    const validFiles = [];
    const newErrors = [];

    files.forEach(file => {
      const isImage = file.type.startsWith('image/');
      const isVideo = file.type.startsWith('video/');

      if (!isImage && !isVideo) {
        newErrors.push(`${file.name}: Chỉ chấp nhận file ảnh hoặc video`);
        return;
      }

      // Check file size (10MB for images, 100MB for videos)
      const maxSize = isVideo ? 100 * 1024 * 1024 : 10 * 1024 * 1024;
      if (file.size > maxSize) {
        newErrors.push(`${file.name}: File quá lớn (tối đa ${isVideo ? '100MB' : '10MB'})`);
        return;
      }

      validFiles.push({
        file,
        preview: URL.createObjectURL(file),
        type: isVideo ? 'video' : 'image',
        name: file.name
      });
    });

    if (newErrors.length > 0) {
      setMediaError(newErrors.join(', '));
    } else {
      setMediaError(null);
    }

    setUploadedFiles(prev => [...prev, ...validFiles]);
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemoveUploadedFile = (index) => {
    setUploadedFiles(prev => {
      const file = prev[index];
      if (file?.preview) {
        URL.revokeObjectURL(file.preview);
      }
      return prev.filter((_, i) => i !== index);
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!isAuthenticated) {
      setError('Bạn cần đăng nhập để gửi review');
      return;
    }

    if (!formData.content.trim()) {
      setError('Vui lòng nhập nội dung đánh giá');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // If there are uploaded files, use the upload endpoint
      if (uploadedFiles.length > 0) {
        const submitFormData = new FormData();
        submitFormData.append('title', formData.title);
        submitFormData.append('content', formData.content);
        submitFormData.append('rating', formData.rating.toString());
        
        uploadedFiles.forEach(item => {
          submitFormData.append('media', item.file);
        });

        await reviewsAPI.createReviewWithUpload(roomId, submitFormData);
      } else {
        // Use the regular endpoint for URL-based media
        const reviewData = {
          ...formData,
          rating: parseInt(formData.rating),
          media: media.length > 0 ? media : undefined
        };

        await reviewsAPI.createReview(roomId, reviewData);
      }
      
      // Reset form
      setFormData({ title: '', content: '', rating: 5 });
      setMedia([]);
      uploadedFiles.forEach(f => URL.revokeObjectURL(f.preview));
      setUploadedFiles([]);
      
      if (onSubmitted) onSubmitted();
    } catch (err) {
      console.error('Error submitting review:', err);
      setError(err.response?.data?.message || 'Có lỗi xảy ra. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="review-form-login-prompt">
        <h3>Đăng nhập để gửi review</h3>
        <p>Bạn cần đăng nhập để có thể chia sẻ trải nghiệm của mình.</p>
        <a href="/login" className="login-btn">Đăng nhập</a>
      </div>
    );
  }

  const totalMediaCount = uploadedFiles.length + media.length;

  return (
    <div className="review-form">
      <h3 className="form-title">✍️ Chia sẻ trải nghiệm của bạn</h3>
      
      {error && (
        <div className="form-error">{error}</div>
      )}

      <form onSubmit={handleSubmit}>
        {/* Rating */}
        <div className="form-group">
          <label>Đánh giá của bạn</label>
          <div className="rating-selector">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                className={`star-btn ${formData.rating >= star ? 'active' : ''}`}
                onClick={() => handleRatingChange(star)}
              >
                ★
              </button>
            ))}
            <span className="rating-label">
              {formData.rating === 1 && 'Rất tệ'}
              {formData.rating === 2 && 'Tệ'}
              {formData.rating === 3 && 'Bình thường'}
              {formData.rating === 4 && 'Tốt'}
              {formData.rating === 5 && 'Xuất sắc'}
            </span>
          </div>
        </div>

        {/* Title */}
        <div className="form-group">
          <label htmlFor="title">Tiêu đề (không bắt buộc)</label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleInputChange}
            placeholder="Tóm tắt ngắn gọn trải nghiệm của bạn"
            maxLength={255}
          />
        </div>

        {/* Content */}
        <div className="form-group">
          <label htmlFor="content">Nội dung đánh giá *</label>
          <textarea
            id="content"
            name="content"
            value={formData.content}
            onChange={handleInputChange}
            placeholder="Chia sẻ chi tiết về trải nghiệm thuê phòng của bạn..."
            rows={5}
            required
          />
        </div>

        {/* Media Upload */}
        <div className="form-group">
          <label>Ảnh / Video (không bắt buộc)</label>
          
          {/* Upload Mode Toggle */}
          <div className="upload-mode-toggle">
            <button
              type="button"
              className={`mode-btn ${uploadMode === 'file' ? 'active' : ''}`}
              onClick={() => setUploadMode('file')}
            >
              📁 Tải từ thiết bị
            </button>
            <button
              type="button"
              className={`mode-btn ${uploadMode === 'url' ? 'active' : ''}`}
              onClick={() => setUploadMode('url')}
            >
              🔗 Nhập URL
            </button>
          </div>

          {/* File Upload Section */}
          {uploadMode === 'file' && totalMediaCount < 10 && (
            <div className="file-upload-section">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,video/*"
                multiple
                onChange={handleFileSelect}
                className="file-input-hidden"
                id="media-file-input"
              />
              <label htmlFor="media-file-input" className="file-upload-label">
                <span className="upload-icon">📷</span>
                <span>Chọn ảnh hoặc video</span>
                <span className="upload-hint">JPEG, PNG, WebP, MP4, WebM</span>
              </label>
            </div>
          )}

          {/* URL Input Section */}
          {uploadMode === 'url' && totalMediaCount < 10 && (
            <div className="media-url-input">
              <input
                type="url"
                value={mediaUrl}
                onChange={handleMediaUrlChange}
                placeholder="Nhập URL ảnh hoặc video (https://...)"
                className="media-url-field"
              />
              <button
                type="button"
                className="add-media-btn-inline"
                onClick={handleMediaAdd}
              >
                + Thêm
              </button>
            </div>
          )}

          {/* Uploaded Files Preview */}
          {uploadedFiles.length > 0 && (
            <div className="media-preview">
              {uploadedFiles.map((item, index) => (
                <div key={`file-${index}`} className="media-preview-item">
                  {item.type === 'video' ? (
                    <div className="video-preview">
                      <video src={item.preview} className="preview-video-thumb" />
                      <span className="video-icon">🎬</span>
                    </div>
                  ) : (
                    <img src={item.preview} alt={`Preview ${index + 1}`} />
                  )}
                  <button
                    type="button"
                    className="remove-media-btn"
                    onClick={() => handleRemoveUploadedFile(index)}
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* URL-based Media Preview */}
          {media.length > 0 && (
            <div className="media-preview">
              {media.map((item, index) => (
                <div key={`url-${index}`} className="media-preview-item">
                  {item.media_type === 'video' ? (
                    <div className="video-preview">
                      <span className="video-icon">🎬</span>
                      <span className="video-label">Video</span>
                    </div>
                  ) : (
                    <img src={item.url} alt={`Preview ${index + 1}`} />
                  )}
                  <button
                    type="button"
                    className="remove-media-btn"
                    onClick={() => handleMediaRemove(index)}
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}
          
          {mediaError && (
            <p className="media-error">{mediaError}</p>
          )}
          <p className="media-hint">Tối đa 10 ảnh và video dài tối đa 2 phút</p>
        </div>

        {/* User Info */}
        <div className="form-user-info">
          <div className="user-avatar">
            {user?.name?.charAt(0)?.toUpperCase() || '?'}
          </div>
          <div className="user-details">
            <span className="user-name">{user?.name}</span>
            <span className="review-notice">Review sẽ được kiểm duyệt trước khi hiển thị</span>
          </div>
        </div>

        {/* Submit Button */}
        <div className="form-actions">
          {onCancel && (
            <button
              type="button"
              className="cancel-btn"
              onClick={onCancel}
            >
              Hủy
            </button>
          )}
          <button
            type="submit"
            className="submit-btn"
            disabled={loading}
          >
            {loading ? 'Đang gửi...' : 'Gửi review'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ReviewForm;
