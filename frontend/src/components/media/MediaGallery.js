import React, { useState, useCallback, useEffect } from 'react';
import './MediaGallery.css';

const MediaGallery = ({ images = [], videos = [], onImageClick }) => {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loadedImages, setLoadedImages] = useState({});

  // Combine all media for lightbox navigation
  const allMedia = [
    ...images.map(img => ({ ...img, type: 'image' })),
    ...videos.map(vid => ({ ...vid, type: 'video' }))
  ];

  const handleImageLoad = (id) => {
    setLoadedImages(prev => ({ ...prev, [id]: true }));
  };

  const openLightbox = useCallback((index) => {
    setCurrentIndex(index);
    setLightboxOpen(true);
    document.body.style.overflow = 'hidden';
  }, []);

  const closeLightbox = useCallback(() => {
    setLightboxOpen(false);
    document.body.style.overflow = '';
  }, []);

  const goNext = useCallback(() => {
    setCurrentIndex(prev => (prev + 1) % allMedia.length);
  }, [allMedia.length]);

  const goPrev = useCallback(() => {
    setCurrentIndex(prev => (prev - 1 + allMedia.length) % allMedia.length);
  }, [allMedia.length]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!lightboxOpen) return;
      
      switch (e.key) {
        case 'Escape':
          closeLightbox();
          break;
        case 'ArrowRight':
          goNext();
          break;
        case 'ArrowLeft':
          goPrev();
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lightboxOpen, closeLightbox, goNext, goPrev]);

  // Touch swipe handling
  const [touchStart, setTouchStart] = useState(null);
  
  const handleTouchStart = (e) => {
    setTouchStart(e.touches[0].clientX);
  };

  const handleTouchEnd = (e) => {
    if (!touchStart) return;
    
    const touchEnd = e.changedTouches[0].clientX;
    const diff = touchStart - touchEnd;

    if (Math.abs(diff) > 50) {
      if (diff > 0) {
        goNext();
      } else {
        goPrev();
      }
    }
    setTouchStart(null);
  };

  const getRoomTagLabel = (tag) => {
    const labels = {
      bedroom: 'Phòng ngủ',
      bathroom: 'Phòng tắm',
      kitchen: 'Bếp',
      balcony: 'Ban công',
      living_room: 'Phòng khách',
      entrance: 'Lối vào',
      other: 'Khác'
    };
    return labels[tag] || tag;
  };

  if (allMedia.length === 0) {
    return null;
  }

  return (
    <>
      {/* Masonry Grid Gallery */}
      <div className="media-gallery">
        <div className="gallery-header">
          <h3 className="gallery-title">📷 Thư viện ảnh</h3>
          <span className="gallery-count">{allMedia.length} ảnh/video</span>
        </div>
        
        <div className="masonry-grid">
          {allMedia.map((media, index) => (
            <div 
              key={media.id || index}
              className={`masonry-item ${loadedImages[media.id] ? 'loaded' : ''}`}
              onClick={() => openLightbox(index)}
            >
              {/* Skeleton */}
              {!loadedImages[media.id] && (
                <div className="masonry-skeleton skeleton" />
              )}
              
              {media.type === 'image' ? (
                <img
                  src={media.image_url || media.media_url}
                  alt={media.room_tag ? getRoomTagLabel(media.room_tag) : `Ảnh ${index + 1}`}
                  className="masonry-image"
                  loading="lazy"
                  onLoad={() => handleImageLoad(media.id)}
                />
              ) : (
                <div className="masonry-video-thumb">
                  <img
                    src={media.thumbnail_url}
                    alt={`Video ${index + 1}`}
                    className="masonry-image"
                    loading="lazy"
                    onLoad={() => handleImageLoad(media.id)}
                  />
                  <div className="video-play-overlay">
                    <span className="video-play-icon">▶</span>
                  </div>
                </div>
              )}
              
              {/* Hover Overlay */}
              <div className="masonry-overlay">
                <span className="zoom-icon">🔍</span>
                {media.room_tag && (
                  <span className="room-tag">{getRoomTagLabel(media.room_tag)}</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Lightbox Modal */}
      {lightboxOpen && (
        <div 
          className="lightbox-backdrop"
          onClick={closeLightbox}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          <div className="lightbox-content" onClick={e => e.stopPropagation()}>
            {/* Close Button */}
            <button className="lightbox-close" onClick={closeLightbox}>
              ✕
            </button>

            {/* Navigation */}
            {allMedia.length > 1 && (
              <>
                <button className="lightbox-nav lightbox-prev" onClick={goPrev}>
                  ‹
                </button>
                <button className="lightbox-nav lightbox-next" onClick={goNext}>
                  ›
                </button>
              </>
            )}

            {/* Media Display */}
            <div className="lightbox-media">
              {allMedia[currentIndex]?.type === 'video' ? (
                <video
                  src={allMedia[currentIndex].video_url || allMedia[currentIndex].media_url}
                  controls
                  autoPlay
                  className="lightbox-video"
                />
              ) : (
                <img
                  src={allMedia[currentIndex]?.image_url || allMedia[currentIndex]?.media_url}
                  alt={`Ảnh ${currentIndex + 1}`}
                  className="lightbox-image"
                />
              )}
            </div>

            {/* Counter */}
            <div className="lightbox-counter">
              {currentIndex + 1} / {allMedia.length}
            </div>

            {/* Thumbnails */}
            <div className="lightbox-thumbnails">
              {allMedia.map((media, index) => (
                <button
                  key={media.id || index}
                  className={`thumbnail-btn ${index === currentIndex ? 'active' : ''}`}
                  onClick={() => setCurrentIndex(index)}
                >
                  <img
                    src={media.thumbnail_url || media.image_url || media.media_url}
                    alt=""
                    className="thumbnail-image"
                  />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default MediaGallery;
