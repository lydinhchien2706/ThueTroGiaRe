import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { adminAPI } from '../../services/api';
import AdminLayout from './AdminLayout';

const AdminPending = () => {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });

  const fetchPendingListings = useCallback(async () => {
    setLoading(true);
    try {
      const response = await adminAPI.getPendingListings({
        page: pagination.page,
        limit: 20
      });
      setListings(response.data.data.listings);
      setPagination(prev => ({
        ...prev,
        ...response.data.data.pagination
      }));
    } catch (error) {
      console.error('Error fetching pending listings:', error);
    } finally {
      setLoading(false);
    }
  }, [pagination.page]);

  useEffect(() => {
    fetchPendingListings();
  }, [fetchPendingListings]);

  const handleApprove = async (id) => {
    const note = prompt('Ghi chú (tùy chọn):');
    try {
      await adminAPI.approveListing(id, note);
      fetchPendingListings();
      alert('Duyệt tin đăng thành công');
    } catch (error) {
      alert(error.response?.data?.message || 'Lỗi khi duyệt tin đăng');
    }
  };

  const handleReject = async (id) => {
    const reason = prompt('Lý do từ chối (bắt buộc):');
    if (!reason) {
      alert('Vui lòng nhập lý do từ chối');
      return;
    }
    try {
      await adminAPI.rejectListing(id, reason);
      fetchPendingListings();
      alert('Từ chối tin đăng thành công');
    } catch (error) {
      alert(error.response?.data?.message || 'Lỗi khi từ chối tin đăng');
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('vi-VN');
  };

  const getTypeLabel = (type) => {
    const types = {
      'phong-tro': 'Phòng trọ',
      'nha-nguyen-can': 'Nhà nguyên căn',
      'can-ho': 'Căn hộ',
    };
    return types[type] || type;
  };

  return (
    <AdminLayout>
      <div className="admin-table-container">
        <div className="admin-table-header">
          <h2>⏳ Tin đăng chờ duyệt ({pagination.total})</h2>
        </div>

        {loading ? (
          <div className="admin-loading">Đang tải...</div>
        ) : listings.length === 0 ? (
          <div className="admin-empty-state">
            <div className="icon">✅</div>
            <p>Không có tin đăng nào chờ duyệt</p>
          </div>
        ) : (
          <>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Tiêu đề</th>
                  <th>Loại</th>
                  <th>Giá</th>
                  <th>Diện tích</th>
                  <th>Người đăng</th>
                  <th>SĐT</th>
                  <th>Ngày đăng</th>
                  <th>Hành động</th>
                </tr>
              </thead>
              <tbody>
                {listings.map((listing) => (
                  <tr key={listing.id}>
                    <td>{listing.id}</td>
                    <td style={{ maxWidth: '250px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      <Link to={`/listings/${listing.id}`} target="_blank" style={{ color: '#4a90e2' }}>
                        {listing.title}
                      </Link>
                    </td>
                    <td>{getTypeLabel(listing.type)}</td>
                    <td>{formatPrice(listing.price)}</td>
                    <td>{listing.area}m²</td>
                    <td>
                      <div>
                        <strong>{listing.user?.name}</strong>
                        <br />
                        <small style={{ color: '#666' }}>{listing.user?.email}</small>
                      </div>
                    </td>
                    <td>{listing.user?.phone || '-'}</td>
                    <td>{formatDate(listing.created_at)}</td>
                    <td>
                      <button
                        onClick={() => handleApprove(listing.id)}
                        className="action-btn approve"
                      >
                        ✓ Duyệt
                      </button>
                      <button
                        onClick={() => handleReject(listing.id)}
                        className="action-btn reject"
                      >
                        ✕ Từ chối
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="admin-pagination">
              <button
                onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                disabled={pagination.page === 1}
              >
                ← Trước
              </button>
              <span>
                Trang {pagination.page} / {pagination.totalPages}
              </span>
              <button
                onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                disabled={pagination.page >= pagination.totalPages}
              >
                Sau →
              </button>
            </div>
          </>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminPending;
