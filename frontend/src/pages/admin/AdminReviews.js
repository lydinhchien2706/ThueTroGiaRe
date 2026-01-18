import React, { useEffect, useState, useCallback } from 'react';
import { reviewsAPI } from '../../services/api';
import AdminLayout from './AdminLayout';

const AdminReviews = () => {
  const [reviews, setReviews] = useState([]);
  const [stats, setStats] = useState({ pending: 0, approved: 0, rejected: 0, total: 0 });
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('pending');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, totalPages: 1 });
  const [selectedReview, setSelectedReview] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const fetchReviews = useCallback(async () => {
    try {
      setLoading(true);
      const params = {
        page,
        limit: 20,
        status: filter !== 'all' ? filter : undefined
      };

      const response = await reviewsAPI.adminGetReviews(params);
      const data = response.data.data;

      setReviews(data.reviews);
      setStats(data.stats);
      setPagination(data.pagination);
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setLoading(false);
    }
  }, [filter, page]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  const handleApprove = async (id) => {
    try {
      await reviewsAPI.adminApproveReview(id);
      fetchReviews();
    } catch (error) {
      console.error('Error approving review:', error);
      alert('Có lỗi xảy ra khi duyệt review');
    }
  };

  const handleReject = async (id) => {
    try {
      await reviewsAPI.adminRejectReview(id);
      fetchReviews();
    } catch (error) {
      console.error('Error rejecting review:', error);
      alert('Có lỗi xảy ra khi từ chối review');
    }
  };

  const handleToggleFeatured = async (id) => {
    try {
      await reviewsAPI.adminToggleFeatured(id);
      fetchReviews();
    } catch (error) {
      console.error('Error toggling featured:', error);
      alert('Có lỗi xảy ra');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Bạn có chắc muốn xóa review này?')) {
      try {
        await reviewsAPI.adminDeleteReview(id);
        fetchReviews();
        setShowModal(false);
      } catch (error) {
        console.error('Error deleting review:', error);
        alert('Có lỗi xảy ra khi xóa review');
      }
    }
  };

  const openModal = (review) => {
    setSelectedReview(review);
    setShowModal(true);
  };

  const closeModal = () => {
    setSelectedReview(null);
    setShowModal(false);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('vi-VN');
  };

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      <span key={i} style={{ color: i < rating ? '#f1c40f' : '#ddd' }}>★</span>
    ));
  };

  const getStatusBadge = (status) => {
    const styles = {
      pending: { background: '#ffeaa7', color: '#d35400' },
      approved: { background: '#d4edda', color: '#155724' },
      rejected: { background: '#f8d7da', color: '#721c24' }
    };
    const labels = {
      pending: 'Chờ duyệt',
      approved: 'Đã duyệt',
      rejected: 'Đã từ chối'
    };
    return (
      <span
        className="status-badge"
        style={{
          padding: '4px 8px',
          borderRadius: '4px',
          fontSize: '0.75rem',
          fontWeight: 600,
          ...styles[status]
        }}
      >
        {labels[status]}
      </span>
    );
  };

  const getRoleBadge = (role) => {
    const styles = {
      admin: { background: '#e74c3c', color: '#fff' },
      landlord: { background: '#9b59b6', color: '#fff' },
      renter: { background: '#3498db', color: '#fff' }
    };
    const labels = {
      admin: 'Admin',
      landlord: 'Chủ trọ',
      renter: 'Người thuê'
    };
    return (
      <span
        style={{
          padding: '2px 6px',
          borderRadius: '4px',
          fontSize: '0.75rem',
          fontWeight: 500,
          ...styles[role]
        }}
      >
        {labels[role] || role}
      </span>
    );
  };

  return (
    <AdminLayout>
      {/* Stats Cards */}
      <div className="admin-stats-grid">
        <div
          className={`admin-stat-card ${filter === 'pending' ? 'warning' : ''}`}
          onClick={() => { setFilter('pending'); setPage(1); }}
          style={{ cursor: 'pointer' }}
        >
          <div className="stat-header">
            <span className="stat-icon">⏳</span>
          </div>
          <div className="stat-value">{stats.pending}</div>
          <div className="stat-label">Chờ duyệt</div>
        </div>

        <div
          className={`admin-stat-card ${filter === 'approved' ? 'success' : ''}`}
          onClick={() => { setFilter('approved'); setPage(1); }}
          style={{ cursor: 'pointer' }}
        >
          <div className="stat-header">
            <span className="stat-icon">✅</span>
          </div>
          <div className="stat-value">{stats.approved}</div>
          <div className="stat-label">Đã duyệt</div>
        </div>

        <div
          className={`admin-stat-card ${filter === 'rejected' ? 'danger' : ''}`}
          onClick={() => { setFilter('rejected'); setPage(1); }}
          style={{ cursor: 'pointer' }}
        >
          <div className="stat-header">
            <span className="stat-icon">❌</span>
          </div>
          <div className="stat-value">{stats.rejected}</div>
          <div className="stat-label">Đã từ chối</div>
        </div>

        <div
          className={`admin-stat-card ${filter === 'all' ? 'info' : ''}`}
          onClick={() => { setFilter('all'); setPage(1); }}
          style={{ cursor: 'pointer' }}
        >
          <div className="stat-header">
            <span className="stat-icon">📝</span>
          </div>
          <div className="stat-value">{stats.total}</div>
          <div className="stat-label">Tổng review</div>
        </div>
      </div>

      {/* Reviews Table */}
      <div className="admin-table-container">
        <div className="admin-table-header">
          <h2>
            {filter === 'pending' && 'Review chờ duyệt'}
            {filter === 'approved' && 'Review đã duyệt'}
            {filter === 'rejected' && 'Review đã từ chối'}
            {filter === 'all' && 'Tất cả review'}
          </h2>
        </div>

        {loading ? (
          <div className="admin-loading">Đang tải...</div>
        ) : reviews.length === 0 ? (
          <div className="admin-empty-state">
            <div className="icon">📝</div>
            <p>Không có review nào</p>
          </div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Phòng trọ</th>
                <th>Người đánh giá</th>
                <th>Rating</th>
                <th>Nội dung</th>
                <th>Trạng thái</th>
                <th>Ngày tạo</th>
                <th>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {reviews.map((review) => (
                <tr key={review.id}>
                  <td>{review.id}</td>
                  <td>
                    <div>
                      <strong>{review.room?.title || `Phòng #${review.room_id}`}</strong>
                    </div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <span>{review.user?.name}</span>
                      {getRoleBadge(review.role)}
                    </div>
                  </td>
                  <td>{renderStars(review.rating)}</td>
                  <td>
                    <div style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {review.content || <em style={{ color: '#b2bec3' }}>Không có nội dung</em>}
                    </div>
                  </td>
                  <td>{getStatusBadge(review.status)}</td>
                  <td>{formatDate(review.created_at)}</td>
                  <td>
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                      <button
                        className="action-btn view"
                        onClick={() => openModal(review)}
                      >
                        Xem
                      </button>
                      
                      {review.status === 'pending' && (
                        <>
                          <button
                            className="action-btn approve"
                            onClick={() => handleApprove(review.id)}
                          >
                            Duyệt
                          </button>
                          <button
                            className="action-btn reject"
                            onClick={() => handleReject(review.id)}
                          >
                            Từ chối
                          </button>
                        </>
                      )}

                      {review.status === 'approved' && (
                        <button
                          className="action-btn edit"
                          onClick={() => handleToggleFeatured(review.id)}
                        >
                          {review.is_featured ? 'Bỏ ghim' : 'Ghim'}
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="admin-pagination">
            <button
              disabled={page === 1}
              onClick={() => setPage(p => p - 1)}
            >
              ← Trước
            </button>
            <span>Trang {page} / {pagination.totalPages}</span>
            <button
              disabled={page === pagination.totalPages}
              onClick={() => setPage(p => p + 1)}
            >
              Sau →
            </button>
          </div>
        )}
      </div>

      {/* Review Detail Modal */}
      {showModal && selectedReview && (
        <div className="admin-modal-overlay" onClick={closeModal}>
          <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h3>Chi tiết Review #{selectedReview.id}</h3>
              <button className="modal-close" onClick={closeModal}>✕</button>
            </div>

            <div className="admin-modal-body">
              {/* Room Info */}
              <div style={{ marginBottom: '20px' }}>
                <h4 style={{ margin: '0 0 8px', color: '#2d3436' }}>Phòng trọ</h4>
                <p style={{ margin: 0, color: '#636e72' }}>
                  {selectedReview.room?.title || `ID: ${selectedReview.room_id}`}
                </p>
              </div>

              {/* User Info */}
              <div style={{ marginBottom: '20px' }}>
                <h4 style={{ margin: '0 0 8px', color: '#2d3436' }}>Người đánh giá</h4>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #0984e3, #00b894)',
                    color: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 600
                  }}>
                    {selectedReview.user?.name?.charAt(0)?.toUpperCase() || '?'}
                  </div>
                  <div>
                    <div style={{ fontWeight: 600 }}>{selectedReview.user?.name}</div>
                    <div style={{ fontSize: '0.875rem', color: '#636e72' }}>{selectedReview.user?.email}</div>
                  </div>
                  {getRoleBadge(selectedReview.role)}
                </div>
              </div>

              {/* Rating */}
              <div style={{ marginBottom: '20px' }}>
                <h4 style={{ margin: '0 0 8px', color: '#2d3436' }}>Đánh giá</h4>
                <div style={{ fontSize: '1.5rem' }}>{renderStars(selectedReview.rating)}</div>
              </div>

              {/* Title */}
              {selectedReview.title && (
                <div style={{ marginBottom: '20px' }}>
                  <h4 style={{ margin: '0 0 8px', color: '#2d3436' }}>Tiêu đề</h4>
                  <p style={{ margin: 0 }}>{selectedReview.title}</p>
                </div>
              )}

              {/* Content */}
              <div style={{ marginBottom: '20px' }}>
                <h4 style={{ margin: '0 0 8px', color: '#2d3436' }}>Nội dung</h4>
                <p style={{ margin: 0, lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
                  {selectedReview.content || <em style={{ color: '#b2bec3' }}>Không có nội dung</em>}
                </p>
              </div>

              {/* Media */}
              {selectedReview.media && selectedReview.media.length > 0 && (
                <div style={{ marginBottom: '20px' }}>
                  <h4 style={{ margin: '0 0 12px', color: '#2d3436' }}>
                    Media ({selectedReview.media.length})
                  </h4>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
                    {selectedReview.media.map((media) => (
                      <div
                        key={media.id}
                        style={{
                          width: '120px',
                          height: '120px',
                          borderRadius: '8px',
                          overflow: 'hidden',
                          background: '#f0f0f0'
                        }}
                      >
                        {media.media_type === 'video' ? (
                          <video
                            src={media.url}
                            poster={media.thumbnail_url}
                            controls
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          />
                        ) : (
                          <img
                            src={media.url}
                            alt="Review media"
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Status */}
              <div style={{ marginBottom: '20px' }}>
                <h4 style={{ margin: '0 0 8px', color: '#2d3436' }}>Trạng thái</h4>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  {getStatusBadge(selectedReview.status)}
                  {selectedReview.is_featured && (
                    <span style={{
                      padding: '4px 8px',
                      borderRadius: '4px',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      background: '#f39c12',
                      color: '#fff'
                    }}>
                      ⭐ Nổi bật
                    </span>
                  )}
                </div>
              </div>

              {/* Dates */}
              <div style={{ fontSize: '0.875rem', color: '#b2bec3' }}>
                <p style={{ margin: '4px 0' }}>Ngày tạo: {formatDate(selectedReview.created_at)}</p>
                <p style={{ margin: '4px 0' }}>Cập nhật: {formatDate(selectedReview.updated_at)}</p>
              </div>
            </div>

            <div className="admin-modal-footer">
              {selectedReview.status === 'pending' && (
                <>
                  <button
                    className="action-btn approve"
                    onClick={() => { handleApprove(selectedReview.id); closeModal(); }}
                  >
                    ✓ Duyệt review
                  </button>
                  <button
                    className="action-btn reject"
                    onClick={() => { handleReject(selectedReview.id); closeModal(); }}
                  >
                    ✕ Từ chối
                  </button>
                </>
              )}
              
              {selectedReview.status === 'approved' && (
                <button
                  className="action-btn edit"
                  onClick={() => handleToggleFeatured(selectedReview.id)}
                >
                  {selectedReview.is_featured ? 'Bỏ ghim nổi bật' : '⭐ Ghim nổi bật'}
                </button>
              )}

              <button
                className="action-btn delete"
                onClick={() => handleDelete(selectedReview.id)}
              >
                🗑️ Xóa review
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Styles */}
      <style>{`
        .admin-modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }

        .admin-modal {
          background: #fff;
          border-radius: 12px;
          width: 90%;
          max-width: 600px;
          max-height: 90vh;
          overflow: hidden;
          display: flex;
          flex-direction: column;
        }

        .admin-modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 20px;
          border-bottom: 1px solid #eee;
        }

        .admin-modal-header h3 {
          margin: 0;
        }

        .modal-close {
          width: 32px;
          height: 32px;
          border: none;
          background: #f0f0f0;
          border-radius: 50%;
          cursor: pointer;
          font-size: 1rem;
        }

        .modal-close:hover {
          background: #e0e0e0;
        }

        .admin-modal-body {
          padding: 20px;
          overflow-y: auto;
          flex: 1;
        }

        .admin-modal-footer {
          display: flex;
          gap: 12px;
          padding: 20px;
          border-top: 1px solid #eee;
          flex-wrap: wrap;
        }

        .admin-pagination {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 16px;
          padding: 20px;
        }

        .admin-pagination button {
          padding: 8px 16px;
          border: 1px solid #ddd;
          background: #fff;
          border-radius: 8px;
          cursor: pointer;
        }

        .admin-pagination button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .admin-pagination button:hover:not(:disabled) {
          background: #f0f0f0;
        }
      `}</style>
    </AdminLayout>
  );
};

export default AdminReviews;
