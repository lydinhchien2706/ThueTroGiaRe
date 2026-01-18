import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { reviewsAPI } from '../../services/api';
import './ReviewForm.css';

const ReviewForm = ({ roomId, onSubmitted, onCancel }) => {
  const { user, isAuthenticated } = useAuth();
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    rating: 5
  });
  const [media, setMedia] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

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

  const handleMediaAdd = () => {
    const url = window.prompt('Nhập URL ảnh hoặc video:');
    if (url && url.trim()) {
      const isVideo = url.includes('video') || url.endsWith('.mp4') || url.endsWith('.webm');
      setMedia(prev => [...prev, {
        url: url.trim(),
        media_type: isVideo ? 'video' : 'image',
        thumbnail_url: isVideo ? '' : url.trim()
      }]);
    }
  };

  const handleMediaRemove = (index) => {
    setMedia(prev => prev.filter((_, i) => i !== index));
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
      const reviewData = {
        ...formData,
        rating: parseInt(formData.rating),
        media: media.length > 0 ? media : undefined
      };

      await reviewsAPI.createReview(roomId, reviewData);
      
      // Reset form
      setFormData({ title: '', content: '', rating: 5 });
      setMedia([]);
      
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
          <div className="media-preview">
            {media.map((item, index) => (
              <div key={index} className="media-preview-item">
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
            
            {media.length < 10 && (
              <button
                type="button"
                className="add-media-btn"
                onClick={handleMediaAdd}
              >
                <span className="add-icon">+</span>
                <span className="add-label">Thêm ảnh/video</span>
              </button>
            )}
          </div>
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
