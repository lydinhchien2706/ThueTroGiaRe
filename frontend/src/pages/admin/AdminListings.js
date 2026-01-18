import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { adminAPI } from '../../services/api';
import AdminLayout from './AdminLayout';

const AdminListings = () => {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [filters, setFilters] = useState({
    search: '',
    type: '',
    status: '',
    approval_status: ''
  });

  const fetchListings = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        page: pagination.page,
        limit: 20,
        ...filters
      };
      Object.keys(params).forEach(key => {
        if (params[key] === '') delete params[key];
      });

      const response = await adminAPI.getListings(params);
      setListings(response.data.data.listings);
      setPagination(prev => ({
        ...prev,
        ...response.data.data.pagination
      }));
    } catch (error) {
      console.error('Error fetching listings:', error);
    } finally {
      setLoading(false);
    }
  }, [pagination.page, filters]);

  useEffect(() => {
    fetchListings();
  }, [fetchListings]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handleApprove = async (id) => {
    const note = prompt('Ghi chú (tùy chọn):');
    try {
      await adminAPI.approveListing(id, note);
      fetchListings();
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
      fetchListings();
      alert('Từ chối tin đăng thành công');
    } catch (error) {
      alert(error.response?.data?.message || 'Lỗi khi từ chối tin đăng');
    }
  };

  const handleToggleVisibility = async (id, currentStatus) => {
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
    const reason = newStatus === 'inactive' ? prompt('Lý do ẩn (tùy chọn):') : '';
    
    try {
      await adminAPI.toggleListingVisibility(id, newStatus, reason);
      fetchListings();
      alert(newStatus === 'active' ? 'Hiển thị tin đăng thành công' : 'Ẩn tin đăng thành công');
    } catch (error) {
      alert(error.response?.data?.message || 'Lỗi khi thay đổi trạng thái');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Bạn có chắc muốn xóa tin đăng này?')) return;
    const reason = prompt('Lý do xóa (tùy chọn):');
    
    try {
      await adminAPI.deleteListing(id, reason);
      fetchListings();
      alert('Xóa tin đăng thành công');
    } catch (error) {
      alert(error.response?.data?.message || 'Lỗi khi xóa tin đăng');
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
          <h2>Quản lý Tin đăng ({pagination.total})</h2>
          <div className="admin-table-filters">
            <input
              type="text"
              name="search"
              placeholder="Tìm kiếm..."
              value={filters.search}
              onChange={handleFilterChange}
              className="admin-filter-input"
            />
            <select
              name="type"
              value={filters.type}
              onChange={handleFilterChange}
              className="admin-filter-select"
            >
              <option value="">Tất cả loại</option>
              <option value="phong-tro">Phòng trọ</option>
              <option value="nha-nguyen-can">Nhà nguyên căn</option>
              <option value="can-ho">Căn hộ</option>
            </select>
            <select
              name="status"
              value={filters.status}
              onChange={handleFilterChange}
              className="admin-filter-select"
            >
              <option value="">Tất cả trạng thái</option>
              <option value="active">Hiển thị</option>
              <option value="inactive">Ẩn</option>
              <option value="deleted">Đã xóa</option>
            </select>
            <select
              name="approval_status"
              value={filters.approval_status}
              onChange={handleFilterChange}
              className="admin-filter-select"
            >
              <option value="">Tất cả duyệt</option>
              <option value="pending">Chờ duyệt</option>
              <option value="approved">Đã duyệt</option>
              <option value="rejected">Đã từ chối</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="admin-loading">Đang tải...</div>
        ) : listings.length === 0 ? (
          <div className="admin-empty-state">
            <div className="icon">🏠</div>
            <p>Không tìm thấy tin đăng nào</p>
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
                  <th>Người đăng</th>
                  <th>Duyệt</th>
                  <th>Trạng thái</th>
                  <th>Ngày tạo</th>
                  <th>Hành động</th>
                </tr>
              </thead>
              <tbody>
                {listings.map((listing) => (
                  <tr key={listing.id}>
                    <td>{listing.id}</td>
                    <td style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      <Link to={`/listings/${listing.id}`} target="_blank" style={{ color: '#4a90e2' }}>
                        {listing.title}
                      </Link>
                    </td>
                    <td>{getTypeLabel(listing.type)}</td>
                    <td>{formatPrice(listing.price)}</td>
                    <td>{listing.user?.name || '-'}</td>
                    <td>
                      <span className={`status-badge status-${listing.approval_status}`}>
                        {listing.approval_status === 'pending' ? 'Chờ duyệt' :
                         listing.approval_status === 'approved' ? 'Đã duyệt' : 'Từ chối'}
                      </span>
                    </td>
                    <td>
                      <span className={`status-badge status-${listing.status}`}>
                        {listing.status === 'active' ? 'Hiển thị' :
                         listing.status === 'inactive' ? 'Ẩn' : 'Đã xóa'}
                      </span>
                    </td>
                    <td>{formatDate(listing.created_at)}</td>
                    <td>
                      {listing.approval_status === 'pending' && (
                        <>
                          <button
                            onClick={() => handleApprove(listing.id)}
                            className="action-btn approve"
                          >
                            Duyệt
                          </button>
                          <button
                            onClick={() => handleReject(listing.id)}
                            className="action-btn reject"
                          >
                            Từ chối
                          </button>
                        </>
                      )}
                      {listing.status !== 'deleted' && (
                        <>
                          <button
                            onClick={() => handleToggleVisibility(listing.id, listing.status)}
                            className={`action-btn ${listing.status === 'active' ? 'edit' : 'view'}`}
                          >
                            {listing.status === 'active' ? 'Ẩn' : 'Hiện'}
                          </button>
                          <button
                            onClick={() => handleDelete(listing.id)}
                            className="action-btn delete"
                          >
                            Xóa
                          </button>
                        </>
                      )}
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

export default AdminListings;
