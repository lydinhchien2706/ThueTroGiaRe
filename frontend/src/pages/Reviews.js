import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import { reviewsAPI } from '../services/api';
import './Reviews.css';

const Reviews = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({ type: 'all', minRating: '', sort: 'newest' });
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [activeVideoIndex, setActiveVideoIndex] = useState(0);
  const containerRef = useRef(null);
  const videoRefs = useRef({});

  const fetchReviews = useCallback(async (resetPage = false) => {
    try {
      setLoading(true);
      const currentPage = resetPage ? 1 : page;

      const params = {
        page: currentPage,
        limit: 10,
        sort: filter.sort
      };

      if (filter.type !== 'all') {
        params.type = filter.type;
      }

      if (filter.minRating) {
        params.minRating = filter.minRating;
      }

      const response = await reviewsAPI.getAllReviews(params);
      const data = response.data.data;

      if (resetPage) {
        setReviews(data.reviews);
        setPage(1);
      } else {
        setReviews(prev => currentPage === 1 ? data.reviews : [...prev, ...data.reviews]);
      }

      setHasMore(data.pagination.page < data.pagination.totalPages);
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setLoading(false);
    }
  }, [page, filter]);

  useEffect(() => {
    fetchReviews(true);
  }, [filter]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (page > 1) {
      fetchReviews();
    }
  }, [page]); // eslint-disable-line react-hooks/exhaustive-deps

  // Intersection Observer for autoplay
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const index = parseInt(entry.target.dataset.index);
          const video = videoRefs.current[index];

          if (entry.isIntersecting) {
            video?.play().catch(() => {});
            setActiveVideoIndex(index);
          } else {
            video?.pause();
          }
        });
      },
      { threshold: 0.7 }
    );

    const items = containerRef.current?.querySelectorAll('.review-feed-item');
    items?.forEach((item) => observer.observe(item));

    return () => observer.disconnect();
  }, [reviews]);

  const handleFilterChange = (key, value) => {
    setFilter(prev => ({ ...prev, [key]: value }));
    setPage(1);
  };

  const handleLoadMore = () => {
    if (hasMore && !loading) {
      setPage(prev => prev + 1);
    }
  };

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

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      <span key={i} className={`star ${i < rating ? 'filled' : ''}`}>
        ★
      </span>
    ));
  };

  return (
    <div className="reviews-page">
      {/* Header */}
      <div className="reviews-header">
        <div className="container">
          <h1>🎬 Review thực tế từ người thuê</h1>
          <p>Xem những đánh giá chân thực từ cộng đồng người thuê trọ</p>
        </div>
      </div>

      {/* Filters */}
      <div className="reviews-filters">
        <div className="container">
          <div className="filter-row">
            <div className="filter-group">
              <button
                className={`filter-btn ${filter.type === 'all' ? 'active' : ''}`}
                onClick={() => handleFilterChange('type', 'all')}
              >
                Tất cả
              </button>
              <button
                className={`filter-btn ${filter.type === 'video' ? 'active' : ''}`}
                onClick={() => handleFilterChange('type', 'video')}
              >
                🎬 Video
              </button>
              <button
                className={`filter-btn ${filter.type === 'image' ? 'active' : ''}`}
                onClick={() => handleFilterChange('type', 'image')}
              >
                📷 Ảnh
              </button>
            </div>

            <div className="filter-selects">
              <select
                value={filter.minRating}
                onChange={(e) => handleFilterChange('minRating', e.target.value)}
                className="filter-select"
              >
                <option value="">Tất cả rating</option>
                <option value="5">5 sao</option>
                <option value="4">4+ sao</option>
                <option value="3">3+ sao</option>
              </select>

              <select
                value={filter.sort}
                onChange={(e) => handleFilterChange('sort', e.target.value)}
                className="filter-select"
              >
                <option value="newest">Mới nhất</option>
                <option value="rating">Rating cao</option>
                <option value="featured">Nổi bật</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Reviews Feed */}
      <div className="reviews-feed" ref={containerRef}>
        <div className="container">
          {loading && reviews.length === 0 ? (
            <div className="reviews-loading">
              <div className="spinner"></div>
              <p>Đang tải review...</p>
            </div>
          ) : reviews.length > 0 ? (
            <div className="feed-grid">
              {reviews.map((review, index) => {
                const hasVideo = review.media?.some(m => m.media_type === 'video');
                const primaryMedia = review.media?.[0];

                return (
                  <div
                    key={review.id}
                    className={`review-feed-item ${index === activeVideoIndex ? 'active' : ''}`}
                    data-index={index}
                  >
                    {/* Media Section */}
                    <div className="feed-media">
                      {primaryMedia?.media_type === 'video' ? (
                        <video
                          ref={(el) => (videoRefs.current[index] = el)}
                          src={primaryMedia.url}
                          poster={primaryMedia.thumbnail_url}
                          loop
                          muted
                          playsInline
                          className="feed-video"
                        />
                      ) : primaryMedia ? (
                        <img
                          src={primaryMedia.url}
                          alt="Review"
                          className="feed-image"
                        />
                      ) : (
                        <div className="feed-no-media">
                          <span className="no-media-icon">📝</span>
                        </div>
                      )}

                      {/* Media Type Badge */}
                      {hasVideo && (
                        <div className="media-type-badge video">🎬 Video</div>
                      )}

                      {/* Media Count */}
                      {review.media?.length > 1 && (
                        <div className="media-count-badge">
                          +{review.media.length - 1}
                        </div>
                      )}
                    </div>

                    {/* Content Section */}
                    <div className="feed-content">
                      {/* Room Info */}
                      {review.room && (
                        <Link to={`/listings/${review.room.id}`} className="room-link">
                          <div className="room-info">
                            <h4 className="room-title">{review.room.title}</h4>
                            <span className="room-price">{formatPrice(review.room.price)}/tháng</span>
                          </div>
                        </Link>
                      )}

                      {/* User Info */}
                      <div className="feed-user">
                        <div className="user-avatar">
                          {review.user?.name?.charAt(0)?.toUpperCase() || '?'}
                        </div>
                        <div className="user-details">
                          <span className="user-name">{review.user?.name || 'Người dùng'}</span>
                          <span className="review-date">{formatDate(review.created_at)}</span>
                        </div>
                        <div className="review-rating">{renderStars(review.rating)}</div>
                      </div>

                      {/* Review Content */}
                      {review.title && (
                        <h5 className="review-title">{review.title}</h5>
                      )}
                      {review.content && (
                        <p className="review-text">{review.content}</p>
                      )}

                      {/* Actions */}
                      <div className="feed-actions">
                        <Link to={`/listings/${review.room?.id}`} className="action-btn view-room">
                          Xem phòng →
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="no-reviews">
              <div className="no-reviews-icon">📝</div>
              <h3>Chưa có review nào</h3>
              <p>Hãy thuê phòng và chia sẻ trải nghiệm của bạn!</p>
              <Link to="/listings" className="browse-btn">
                Xem danh sách phòng trọ
              </Link>
            </div>
          )}

          {/* Load More */}
          {hasMore && reviews.length > 0 && (
            <div className="load-more-container">
              <button
                className="load-more-btn"
                onClick={handleLoadMore}
                disabled={loading}
              >
                {loading ? 'Đang tải...' : 'Xem thêm review'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Reviews;
