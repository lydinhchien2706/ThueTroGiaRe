import React, { useState, useRef, useEffect, useCallback } from 'react';
import './VideoReviewFeed.css';

const VideoReviewFeed = ({ reviews = [], onLike, onReport, currentUserId }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [likedVideos, setLikedVideos] = useState({});
  const [showLikeAnimation, setShowLikeAnimation] = useState({});
  const containerRef = useRef(null);
  const videoRefs = useRef({});

  // Intersection Observer for auto-play
  useEffect(() => {
    const options = {
      root: containerRef.current,
      threshold: 0.7
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        const videoId = entry.target.dataset.videoId;
        const video = videoRefs.current[videoId];
        
        if (entry.isIntersecting) {
          video?.play().catch(() => {});
          setActiveIndex(parseInt(entry.target.dataset.index));
        } else {
          video?.pause();
        }
      });
    }, options);

    const items = containerRef.current?.querySelectorAll('.video-feed-item');
    items?.forEach(item => observer.observe(item));

    return () => observer.disconnect();
  }, [reviews]);

  const handleLike = useCallback(async (mediaId, index) => {
    // Store original state for rollback
    const originalLikeState = likedVideos[mediaId] || false;
    
    // Optimistic update
    setLikedVideos(prev => ({
      ...prev,
      [mediaId]: !prev[mediaId]
    }));

    // Show burst animation
    setShowLikeAnimation(prev => ({ ...prev, [mediaId]: true }));
    setTimeout(() => {
      setShowLikeAnimation(prev => ({ ...prev, [mediaId]: false }));
    }, 800);

    if (onLike) {
      try {
        await onLike(mediaId);
      } catch (error) {
        // Revert to original state on error
        setLikedVideos(prev => ({
          ...prev,
          [mediaId]: originalLikeState
        }));
      }
    }
  }, [onLike, likedVideos]);

  const handleDoubleTap = useCallback((mediaId, index) => {
    if (!likedVideos[mediaId]) {
      handleLike(mediaId, index);
    } else {
      // Just show animation for already liked videos
      setShowLikeAnimation(prev => ({ ...prev, [mediaId]: true }));
      setTimeout(() => {
        setShowLikeAnimation(prev => ({ ...prev, [mediaId]: false }));
      }, 800);
    }
  }, [likedVideos, handleLike]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) return 'Hôm nay';
    if (days === 1) return 'Hôm qua';
    if (days < 7) return `${days} ngày trước`;
    if (days < 30) return `${Math.floor(days / 7)} tuần trước`;
    return date.toLocaleDateString('vi-VN');
  };

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      <span key={i} className={`star ${i < rating ? 'filled' : ''}`}>
        ★
      </span>
    ));
  };

  if (reviews.length === 0) {
    return (
      <div className="video-feed-empty">
        <div className="empty-icon">🎬</div>
        <h3>Chưa có video review</h3>
        <p>Hãy là người đầu tiên chia sẻ trải nghiệm của bạn!</p>
      </div>
    );
  }

  return (
    <div className="video-review-section">
      <div className="section-header">
        <h3 className="section-title">🎬 Video Review từ người thuê & chủ nhà</h3>
        <span className="review-count">{reviews.length} video</span>
      </div>

      <div className="video-feed-container" ref={containerRef}>
        {reviews.map((review, index) => {
          const media = review.videos?.[0] || review;
          const mediaId = media.id;
          const videoUrl = media.video_url || media.media_url;
          const user = review.user || review.uploader;
          const isLiked = likedVideos[mediaId];

          return (
            <div
              key={mediaId}
              className={`video-feed-item ${index === activeIndex ? 'active' : ''}`}
              data-video-id={mediaId}
              data-index={index}
              onDoubleClick={() => handleDoubleTap(mediaId, index)}
            >
              {/* Video */}
              <video
                ref={el => videoRefs.current[mediaId] = el}
                className="feed-video"
                src={videoUrl}
                poster={media.thumbnail_url}
                loop
                muted
                playsInline
              />

              {/* Like Animation Overlay */}
              {showLikeAnimation[mediaId] && (
                <div className="like-burst-animation">
                  <span className="burst-heart">❤️</span>
                  {[...Array(6)].map((_, i) => (
                    <span key={i} className={`particle particle-${i + 1}`}>❤️</span>
                  ))}
                </div>
              )}

              {/* Info Overlay */}
              <div className="feed-overlay">
                {/* User Info (slide-up) */}
                <div className="feed-user-info">
                  <div className="user-avatar">
                    {user?.name?.charAt(0)?.toUpperCase() || '?'}
                  </div>
                  <div className="user-details">
                    <span className="user-name">{user?.name || 'Người dùng'}</span>
                    <div className="review-rating">
                      {review.rating && renderStars(review.rating)}
                    </div>
                  </div>
                  <span className="review-date">{formatDate(review.created_at || media.created_at)}</span>
                </div>

                {/* Comment Preview */}
                {review.comment && (
                  <p className="feed-comment">{review.comment}</p>
                )}
              </div>

              {/* Side Actions */}
              <div className="feed-actions">
                <button
                  className={`action-btn like-btn ${isLiked ? 'liked' : ''}`}
                  onClick={() => handleLike(mediaId, index)}
                  aria-label="Thích"
                >
                  <span className="action-icon">{isLiked ? '❤️' : '🤍'}</span>
                  <span className="action-count">
                    {(media.like_count || 0) + (isLiked ? 1 : 0)}
                  </span>
                </button>

                <button
                  className="action-btn comment-btn"
                  aria-label="Bình luận"
                >
                  <span className="action-icon">💬</span>
                  <span className="action-count">0</span>
                </button>

                <button
                  className="action-btn share-btn"
                  aria-label="Chia sẻ"
                >
                  <span className="action-icon">📤</span>
                  <span className="action-count">Chia sẻ</span>
                </button>

                <button
                  className="action-btn report-btn"
                  onClick={() => onReport && onReport(mediaId)}
                  aria-label="Báo cáo"
                >
                  <span className="action-icon">⚠️</span>
                </button>
              </div>

              {/* Verified Badge */}
              {media.is_verified && (
                <div className="verified-badge">
                  ✓ Review xác thực
                </div>
              )}

              {/* Video Progress */}
              <div className="video-progress">
                <div className="progress-bar" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Scroll Indicator */}
      {reviews.length > 1 && (
        <div className="scroll-indicator">
          {reviews.map((_, index) => (
            <span 
              key={index} 
              className={`indicator-dot ${index === activeIndex ? 'active' : ''}`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default VideoReviewFeed;
