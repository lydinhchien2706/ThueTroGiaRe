import React, { useEffect, useState, useCallback } from 'react';
import { adminAPI } from '../../services/api';
import { useAuth, ROLES } from '../../context/AuthContext';
import AdminLayout from './AdminLayout';

const AdminUsers = () => {
  const { isSuperAdmin } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [filters, setFilters] = useState({
    search: '',
    role: '',
    is_locked: ''
  });

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        page: pagination.page,
        limit: 20,
        ...filters
      };
      // Remove empty params
      Object.keys(params).forEach(key => {
        if (params[key] === '') delete params[key];
      });

      const response = await adminAPI.getUsers(params);
      setUsers(response.data.data.users);
      setPagination(prev => ({
        ...prev,
        ...response.data.data.pagination
      }));
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  }, [pagination.page, filters]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handleRoleChange = async (userId, newRole) => {
    if (!window.confirm(`Bạn có chắc muốn thay đổi role thành ${newRole}?`)) return;
    
    try {
      await adminAPI.updateUserRole(userId, newRole);
      fetchUsers();
      alert('Cập nhật role thành công');
    } catch (error) {
      alert(error.response?.data?.message || 'Lỗi khi cập nhật role');
    }
  };

  const handleToggleLock = async (userId, currentLocked) => {
    const action = currentLocked ? 'mở khóa' : 'khóa';
    const reason = !currentLocked ? prompt('Lý do khóa tài khoản:') : '';
    
    if (!currentLocked && reason === null) return; // Cancelled

    try {
      await adminAPI.toggleUserLock(userId, !currentLocked, reason);
      fetchUsers();
      alert(`${action.charAt(0).toUpperCase() + action.slice(1)} tài khoản thành công`);
    } catch (error) {
      alert(error.response?.data?.message || `Lỗi khi ${action} tài khoản`);
    }
  };

  const handleResetPassword = async (userId) => {
    const newPassword = prompt('Nhập mật khẩu mới (tối thiểu 6 ký tự):');
    if (!newPassword) return;
    if (newPassword.length < 6) {
      alert('Mật khẩu phải có ít nhất 6 ký tự');
      return;
    }

    try {
      await adminAPI.resetUserPassword(userId, newPassword);
      alert('Đặt lại mật khẩu thành công');
    } catch (error) {
      alert(error.response?.data?.message || 'Lỗi khi đặt lại mật khẩu');
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('vi-VN');
  };

  return (
    <AdminLayout>
      <div className="admin-table-container">
        <div className="admin-table-header">
          <h2>Danh sách người dùng ({pagination.total})</h2>
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
              name="role"
              value={filters.role}
              onChange={handleFilterChange}
              className="admin-filter-select"
            >
              <option value="">Tất cả Role</option>
              <option value="USER">USER</option>
              <option value="ADMIN">ADMIN</option>
              <option value="SUPER_ADMIN">SUPER_ADMIN</option>
            </select>
            <select
              name="is_locked"
              value={filters.is_locked}
              onChange={handleFilterChange}
              className="admin-filter-select"
            >
              <option value="">Tất cả trạng thái</option>
              <option value="false">Đang hoạt động</option>
              <option value="true">Đã khóa</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="admin-loading">Đang tải...</div>
        ) : users.length === 0 ? (
          <div className="admin-empty-state">
            <div className="icon">👥</div>
            <p>Không tìm thấy người dùng nào</p>
          </div>
        ) : (
          <>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Tên</th>
                  <th>Email</th>
                  <th>SĐT</th>
                  <th>Role</th>
                  <th>Trạng thái</th>
                  <th>Ngày tạo</th>
                  <th>Hành động</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id}>
                    <td>{user.id}</td>
                    <td>{user.name}</td>
                    <td>{user.email}</td>
                    <td>{user.phone || '-'}</td>
                    <td>
                      <span className={`role-badge role-${user.role}`}>{user.role}</span>
                    </td>
                    <td>
                      <span className={`status-badge ${user.is_locked ? 'status-locked' : 'status-active'}`}>
                        {user.is_locked ? 'Đã khóa' : 'Hoạt động'}
                      </span>
                    </td>
                    <td>{formatDate(user.created_at)}</td>
                    <td>
                      {user.role !== ROLES.SUPER_ADMIN && (
                        <>
                          <select
                            onChange={(e) => handleRoleChange(user.id, e.target.value)}
                            value=""
                            className="admin-filter-select"
                            style={{ marginRight: '5px', padding: '4px 8px' }}
                          >
                            <option value="" disabled>Đổi role</option>
                            <option value="USER">USER</option>
                            <option value="ADMIN">ADMIN</option>
                            {isSuperAdmin && <option value="SUPER_ADMIN">SUPER_ADMIN</option>}
                          </select>
                          <button
                            onClick={() => handleToggleLock(user.id, user.is_locked)}
                            className={`action-btn ${user.is_locked ? 'unlock' : 'lock'}`}
                          >
                            {user.is_locked ? 'Mở khóa' : 'Khóa'}
                          </button>
                          {isSuperAdmin && (
                            <button
                              onClick={() => handleResetPassword(user.id)}
                              className="action-btn edit"
                            >
                              Reset PW
                            </button>
                          )}
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Pagination */}
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

export default AdminUsers;
