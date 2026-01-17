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

        <div className="dashboard-content">
          <h2>Tin đăng của tôi ({listings.length})</h2>

          {listings.length > 0 ? (
            <div className="listings-table">
              <table>
                <thead>
                  <tr>
                    <th>Tiêu đề</th>
                    <th>Loại</th>
                    <th>Giá</th>
                    <th>Trạng thái</th>
                    <th>Ngày đăng</th>
                    <th>Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  {listings.map((listing) => (
                    <tr key={listing.id}>
                      <td>
                        <Link to={`/listings/${listing.id}`} className="listing-link">
                          {listing.title}
                        </Link>
                      </td>
                      <td>{getTypeLabel(listing.type)}</td>
                      <td>{formatPrice(listing.price)}</td>
                      <td>
                        <span className={`status-badge status-${listing.status}`}>
                          {listing.status === 'active' ? 'Đang hiển thị' : 'Không hiển thị'}
                        </span>
                      </td>
                      <td>{new Date(listing.created_at).toLocaleDateString('vi-VN')}</td>
                      <td>
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
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
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
