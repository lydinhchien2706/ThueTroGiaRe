import React, { useState, useRef } from 'react';
import './ReviewCard.css';

const ReviewCard = ({ review, isFeatured = false }) => {
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [activeMediaIndex, setActiveMediaIndex] = useState(0);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const videoRef = useRef(null);

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

  const getRoleBadge = (role) => {
    const badges = {
      admin: { label: 'Admin', className: 'admin' },
      landlord: { label: 'Chủ trọ', className: 'landlord' },
      renter: { label: 'Người thuê', className: 'renter' }
    };
    return badges[role] || badges.renter;
  };

  const handleVideoHover = (isHovering) => {
    if (videoRef.current) {
      if (isHovering) {
        videoRef.current.play().catch(() => {});
        setIsVideoPlaying(true);
      } else {
        videoRef.current.pause();
        setIsVideoPlaying(false);
      }
    }
  };

  const openMediaModal = (index) => {
    setActiveMediaIndex(index);
    setShowVideoModal(true);
  };

  const closeModal = () => {
    setShowVideoModal(false);
    setActiveMediaIndex(0);
  };

  const navigateMedia = (direction) => {
    const mediaCount = review.media?.length || 0;
    if (direction === 'next') {
      setActiveMediaIndex((prev) => (prev + 1) % mediaCount);
    } else {
      setActiveMediaIndex((prev) => (prev - 1 + mediaCount) % mediaCount);
    }
  };

  const roleBadge = getRoleBadge(review.role);
  const hasMedia = review.media && review.media.length > 0;
  const primaryMedia = hasMedia ? review.media[0] : null;
  const isVideo = primaryMedia?.media_type === 'video';

  return (
    <div className={`review-card ${isFeatured ? 'featured' : ''}`}>
      {/* Header */}
      <div className="review-card-header">
        <div className="reviewer-info">
          <div className="reviewer-avatar">
            {review.user?.name?.charAt(0)?.toUpperCase() || '?'}
          </div>
          <div className="reviewer-details">
            <span className="reviewer-name">{review.user?.name || 'Người dùng'}</span>
            <span className={`role-badge ${roleBadge.className}`}>
              {roleBadge.label}
            </span>
          </div>
        </div>
        <div className="review-meta">
          <div className="review-rating">{renderStars(review.rating)}</div>
          <span className="review-date">{formatDate(review.created_at)}</span>
        </div>
      </div>

      {/* Title */}
      {review.title && (
        <h4 className="review-title">{review.title}</h4>
      )}

      {/* Content */}
      {review.content && (
        <p className="review-content">{review.content}</p>
      )}

      {/* Media Grid */}
      {hasMedia && (
        <div className={`review-media-grid ${review.media.length > 1 ? 'multiple' : ''}`}>
          {/* Primary Media */}
          <div
            className={`media-item primary ${isVideo ? 'video' : 'image'}`}
            onMouseEnter={() => isVideo && handleVideoHover(true)}
            onMouseLeave={() => isVideo && handleVideoHover(false)}
            onClick={() => openMediaModal(0)}
          >
            {isVideo ? (
              <>
                <video
                  ref={videoRef}
                  src={primaryMedia.url}
                  poster={primaryMedia.thumbnail_url}
                  muted
                  loop
                  playsInline
                />
                <div className={`video-play-indicator ${isVideoPlaying ? 'playing' : ''}`}>
                  {isVideoPlaying ? '▐▐' : '▶'}
                </div>
                {primaryMedia.duration && (
                  <span className="video-duration">
                    {Math.floor(primaryMedia.duration / 60)}:{String(primaryMedia.duration % 60).padStart(2, '0')}
                  </span>
                )}
              </>
            ) : (
              <img src={primaryMedia.url} alt="Review media" loading="lazy" />
            )}
          </div>

          {/* Secondary Media (if more than 1) */}
          {review.media.length > 1 && (
            <div className="secondary-media">
              {review.media.slice(1, 4).map((media, index) => (
                <div
                  key={media.id}
                  className={`media-item secondary ${media.media_type}`}
                  onClick={() => openMediaModal(index + 1)}
                >
                  {media.media_type === 'video' ? (
                    <>
                      <img src={media.thumbnail_url || media.url} alt="Video thumbnail" />
                      <div className="video-indicator">▶</div>
                    </>
                  ) : (
                    <img src={media.url} alt="Review media" loading="lazy" />
                  )}
                  
                  {/* Show +X more overlay on last visible item */}
                  {index === 2 && review.media.length > 4 && (
                    <div className="more-media-overlay">
                      +{review.media.length - 4}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Media Type Badge */}
      <div className="review-type-badge">
        {review.type === 'video' && '🎬 Video'}
        {review.type === 'image' && '📷 Ảnh'}
        {review.type === 'mixed' && '📸 Ảnh & Video'}
      </div>

      {/* Fullscreen Media Modal */}
      {showVideoModal && hasMedia && (
        <div className="media-modal-overlay" onClick={closeModal}>
          <div className="media-modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close-btn" onClick={closeModal}>✕</button>
            
            {/* Navigation */}
            {review.media.length > 1 && (
              <>
                <button
                  className="modal-nav-btn prev"
                  onClick={() => navigateMedia('prev')}
                >
                  ‹
                </button>
                <button
                  className="modal-nav-btn next"
                  onClick={() => navigateMedia('next')}
                >
                  ›
                </button>
              </>
            )}

            {/* Active Media */}
            <div className="modal-media-container">
              {review.media[activeMediaIndex]?.media_type === 'video' ? (
                <video
                  src={review.media[activeMediaIndex].url}
                  controls
                  autoPlay
                  className="modal-video"
                />
              ) : (
                <img
                  src={review.media[activeMediaIndex]?.url}
                  alt="Review media"
                  className="modal-image"
                />
              )}
            </div>

            {/* Thumbnails */}
            {review.media.length > 1 && (
              <div className="modal-thumbnails">
                {review.media.map((media, index) => (
                  <div
                    key={media.id}
                    className={`thumbnail-item ${index === activeMediaIndex ? 'active' : ''}`}
                    onClick={() => setActiveMediaIndex(index)}
                  >
                    <img
                      src={media.thumbnail_url || media.url}
                      alt={`Thumbnail ${index + 1}`}
                    />
                    {media.media_type === 'video' && (
                      <span className="thumbnail-video-icon">▶</span>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Counter */}
            <div className="modal-counter">
              {activeMediaIndex + 1} / {review.media.length}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReviewCard;
