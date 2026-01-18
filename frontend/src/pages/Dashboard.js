import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { listingsAPI } from '../services/api';
import './Dashboard.css';

const Dashboard = () => {
  const { user, isAuthenticated } = useAuth();
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    fetchMyListings();
  }, [isAuthenticated, navigate]);

  const fetchMyListings = async () => {
    try {
      const response = await listingsAPI.getMyListings();
      setListings(response.data.data.listings);
    } catch (error) {
      console.error('Error fetching my listings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Bạn có chắc muốn xóa tin đăng này?')) {
      try {
        await listingsAPI.deleteListing(id);
        setListings(listings.filter((listing) => listing.id !== id));
        alert('Xóa tin đăng thành công');
      } catch (error) {
        console.error('Error deleting listing:', error);
        alert('Xóa tin đăng thất bại');
      }
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price);
  };

  const getTypeLabel = (type) => {
    const types = {
      'phong-tro': 'Phòng trọ',
      'nha-nguyen-can': 'Nhà nguyên căn',
      'can-ho': 'Căn hộ',
    };
    return types[type] || type;
  };

  // Calculate stats
  const activeListings = listings.filter(l => l.status === 'active').length;
  const inactiveListings = listings.filter(l => l.status !== 'active').length;

  if (loading) {
    return (
      <div className="container">
        <div className="loading">Đang tải...</div>
      </div>
    );
  }

  return (
    <div className="dashboard-page">
      <div className="container">
        <div className="dashboard-header">
          <div>
            <h1>Dashboard</h1>
            <p>Xin chào, {user?.name}!</p>
          </div>
          <Link to="/create-listing" className="btn btn-primary">
            + Đăng tin mới
          </Link>
        </div>

        {/* Statistics Cards */}
        <div className="dashboard-stats">
          <div className="stat-card">
            <div className="stat-icon">📋</div>
            <div className="stat-value">{listings.length}</div>
            <div className="stat-label">Tổng tin đăng</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">✅</div>
            <div className="stat-value">{activeListings}</div>
            <div className="stat-label">Đang hiển thị</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">⏸️</div>
            <div className="stat-value">{inactiveListings}</div>
            <div className="stat-label">Đang ẩn</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">👁️</div>
            <div className="stat-value">--</div>
            <div className="stat-label">Lượt xem</div>
          </div>
        </div>

        <div className="dashboard-content">
          <h2>Tin đăng của tôi ({listings.length})</h2>

          {listings.length > 0 ? (
            <div className="dashboard-listings-grid">
              {listings.map((listing) => (
                <div key={listing.id} className="dashboard-listing-card">
                  <div className="card-header">
                    <h3 className="card-title">
                      <Link to={`/listings/${listing.id}`}>{listing.title}</Link>
                    </h3>
                    <span className={`status-badge status-${listing.status}`}>
                      {listing.status === 'active' ? 'Hiển thị' : 'Ẩn'}
                    </span>
                  </div>
                  <div className="card-body">
                    <div className="card-info">
                      <span className="card-info-item">
                        🏠 {getTypeLabel(listing.type)}
                      </span>
                      <span className="card-info-item">
                        📐 {listing.area}m²
                      </span>
                    </div>
                    <div className="card-price">{formatPrice(listing.price)}/tháng</div>
                  </div>
                  <div className="card-footer">
                    <span className="card-date">
                      {new Date(listing.created_at).toLocaleDateString('vi-VN')}
                    </span>
                    <div className="action-buttons">
                      <Link to={`/listings/${listing.id}`} className="btn btn-sm btn-outline">
                        Xem
                      </Link>
                      <button
                        onClick={() => handleDelete(listing.id)}
                        className="btn btn-sm btn-danger"
                      >
                        Xóa
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="no-listings">
              <p>Bạn chưa có tin đăng nào</p>
              <Link to="/create-listing" className="btn btn-primary">
                Đăng tin ngay
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
