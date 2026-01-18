import React, { useRef, useState, useEffect } from 'react';
import './HeroMediaSection.css';

const HeroMediaSection = ({ heroVideo, images, onPlayFullscreen, onOpenGallery }) => {
  const videoRef = useRef(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);

  useEffect(() => {
    const video = videoRef.current;
    if (video && heroVideo) {
      // Auto-play muted video when in viewport
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            video.play().catch(() => {});
            setIsPlaying(true);
          } else {
            video.pause();
            setIsPlaying(false);
          }
        },
        { threshold: 0.5 }
      );

      observer.observe(video);
      return () => observer.disconnect();
    }
  }, [heroVideo]);

  const handlePlayFullscreen = () => {
    if (videoRef.current) {
      videoRef.current.requestFullscreen?.() || 
      videoRef.current.webkitRequestFullscreen?.() ||
      videoRef.current.mozRequestFullScreen?.();
      videoRef.current.muted = false;
      setIsMuted(false);
    }
    if (onPlayFullscreen) onPlayFullscreen();
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !videoRef.current.muted;
      setIsMuted(videoRef.current.muted);
    }
  };

  const handleVideoLoad = () => {
    setIsLoaded(true);
  };

  // If no hero video, show first image as hero
  const hasVideo = heroVideo && heroVideo.video_url;
  const heroImage = images && images.length > 0 ? images[0] : null;

  return (
    <div className="hero-media-section">
      {/* Skeleton loader */}
      {!isLoaded && (
        <div className="hero-skeleton">
          <div className="skeleton hero-skeleton-content" />
        </div>
      )}

      {/* Video Hero */}
      {hasVideo ? (
        <div className={`hero-video-container ${isLoaded ? 'loaded' : ''}`}>
          <video
            ref={videoRef}
            className="hero-video"
            src={heroVideo.video_url}
            poster={heroVideo.thumbnail_url}
            loop
            muted={isMuted}
            playsInline
            onLoadedData={handleVideoLoad}
          />
          
          {/* Gradient Overlay */}
          <div className="hero-gradient-overlay" />
          
          {/* Video Controls */}
          <div className="hero-controls">
            <button 
              className="hero-btn hero-btn-play"
              onClick={handlePlayFullscreen}
              aria-label="Xem fullscreen"
            >
              <span className="play-icon">▶</span>
              <span>Xem video</span>
            </button>
            
            <button 
              className="hero-btn hero-btn-mute"
              onClick={toggleMute}
              aria-label={isMuted ? "Bật tiếng" : "Tắt tiếng"}
            >
              {isMuted ? '🔇' : '🔊'}
            </button>
            
            {images && images.length > 0 && (
              <button 
                className="hero-btn hero-btn-gallery"
                onClick={onOpenGallery}
                aria-label="Xem album ảnh"
              >
                <span className="gallery-icon">📷</span>
                <span>Xem {images.length} ảnh</span>
              </button>
            )}
          </div>

          {/* Video Badge */}
          <div className="hero-badge">
            <span className="badge-verified">🎬 Video thực tế</span>
          </div>

          {/* Progress Bar */}
          {isPlaying && (
            <div className="hero-progress-bar">
              <div className="hero-progress-fill" />
            </div>
          )}
        </div>
      ) : heroImage ? (
        // Image Hero (fallback)
        <div className={`hero-image-container ${isLoaded ? 'loaded' : ''}`}>
          <img 
            className="hero-image"
            src={heroImage.image_url}
            alt="Ảnh phòng trọ"
            onLoad={handleVideoLoad}
          />
          
          <div className="hero-gradient-overlay" />
          
          <div className="hero-controls">
            {images && images.length > 1 && (
              <button 
                className="hero-btn hero-btn-gallery"
                onClick={onOpenGallery}
                aria-label="Xem album ảnh"
              >
                <span className="gallery-icon">📷</span>
                <span>Xem {images.length} ảnh</span>
              </button>
            )}
          </div>
        </div>
      ) : (
        // Placeholder
        <div className="hero-placeholder">
          <div className="hero-placeholder-content">
            <span className="placeholder-icon">🏠</span>
            <p>Chưa có ảnh hoặc video</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default HeroMediaSection;
