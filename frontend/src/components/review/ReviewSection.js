import React, { useState, useEffect, useCallback } from 'react';
import { reviewsAPI } from '../../services/api';
import ReviewCard from './ReviewCard';
import ReviewForm from './ReviewForm';
import './ReviewSection.css';

const ReviewSection = ({ roomId, onReviewSubmitted }) => {
  const [reviews, setReviews] = useState([]);
  const [featuredReview, setFeaturedReview] = useState(null);
  const [stats, setStats] = useState({ totalCount: 0, averageRating: 0, videoCount: 0, imageCount: 0 });
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, video, image
  const [sort, setSort] = useState('newest'); // newest, rating
  const [showForm, setShowForm] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const fetchReviews = useCallback(async (resetPage = false) => {
    try {
      setLoading(true);
      const currentPage = resetPage ? 1 : page;
      
      const params = {
        page: currentPage,
        limit: 10,
        sort
      };

      if (filter !== 'all') {
        params.type = filter;
      }

      const response = await reviewsAPI.getReviewsByRoom(roomId, params);
      const data = response.data.data;

      if (resetPage) {
        setReviews(data.reviews);
        setPage(1);
      } else {
        setReviews(prev => currentPage === 1 ? data.reviews : [...prev, ...data.reviews]);
      }

      setFeaturedReview(data.featuredReview);
      setStats(data.stats);
      setHasMore(data.pagination.page < data.pagination.totalPages);
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setLoading(false);
    }
  }, [roomId, filter, sort, page]);

  useEffect(() => {
    fetchReviews(true);
  }, [roomId, filter, sort]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleLoadMore = () => {
    if (hasMore && !loading) {
      setPage(prev => prev + 1);
    }
  };

  useEffect(() => {
    if (page > 1) {
      fetchReviews();
    }
  }, [page]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleReviewSubmitted = () => {
    setShowForm(false);
    fetchReviews(true);
    if (onReviewSubmitted) onReviewSubmitted();
  };

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      <span key={i} className={`star ${i < Math.round(rating) ? 'filled' : ''}`}>
        ★
      </span>
    ));
  };

  return (
    <div className="review-section">
      {/* Section Header */}
      <div className="review-section-header">
        <div className="review-section-title">
          <h2>📝 Review thực tế</h2>
          <span className="review-count">{stats.totalCount} đánh giá</span>
        </div>

        {/* Stats Summary */}
        <div className="review-stats-summary">
          <div className="rating-overview">
            <span className="rating-number">{stats.averageRating.toFixed(1)}</span>
            <div className="rating-stars">{renderStars(stats.averageRating)}</div>
          </div>
          <div className="media-counts">
            <span className="media-count video">🎬 {stats.videoCount} video</span>
            <span className="media-count image">📷 {stats.imageCount} ảnh</span>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="review-filters">
        <div className="filter-group">
          <button
            className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            Tất cả
          </button>
          <button
            className={`filter-btn ${filter === 'video' ? 'active' : ''}`}
            onClick={() => setFilter('video')}
          >
            🎬 Video
          </button>
          <button
            className={`filter-btn ${filter === 'image' ? 'active' : ''}`}
            onClick={() => setFilter('image')}
          >
            📷 Ảnh
          </button>
        </div>

        <div className="sort-group">
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="sort-select"
          >
            <option value="newest">Mới nhất</option>
            <option value="rating">Rating cao</option>
            <option value="featured">Nổi bật</option>
          </select>
        </div>
      </div>

      {/* Featured Review */}
      {featuredReview && (
        <div className="featured-review">
          <div className="featured-badge">⭐ Review nổi bật</div>
          <ReviewCard review={featuredReview} isFeatured />
        </div>
      )}

      {/* Review Grid */}
      <div className="review-grid">
        {loading && reviews.length === 0 ? (
          // Skeleton Loading
          Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="review-card-skeleton">
              <div className="skeleton-header">
                <div className="skeleton-avatar" />
                <div className="skeleton-info">
                  <div className="skeleton-line short" />
                  <div className="skeleton-line shorter" />
                </div>
              </div>
              <div className="skeleton-content">
                <div className="skeleton-line" />
                <div className="skeleton-line" />
                <div className="skeleton-line medium" />
              </div>
              <div className="skeleton-media" />
            </div>
          ))
        ) : reviews.length > 0 ? (
          reviews.map((review, index) => (
            <div
              key={review.id}
              className="review-card-wrapper"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <ReviewCard review={review} />
            </div>
          ))
        ) : (
          <div className="no-reviews">
            <div className="no-reviews-icon">📝</div>
            <h3>Chưa có review nào</h3>
            <p>Hãy là người đầu tiên chia sẻ trải nghiệm!</p>
          </div>
        )}
      </div>

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

      {/* CTA Buttons */}
      <div className="review-cta">
        <button
          className="cta-btn primary"
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? 'Đóng form' : '✍️ Gửi review của bạn'}
        </button>
      </div>

      {/* Review Form Modal */}
      {showForm && (
        <div className="review-form-overlay">
          <div className="review-form-modal">
            <button
              className="close-modal-btn"
              onClick={() => setShowForm(false)}
            >
              ✕
            </button>
            <ReviewForm
              roomId={roomId}
              onSubmitted={handleReviewSubmitted}
              onCancel={() => setShowForm(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default ReviewSection;
