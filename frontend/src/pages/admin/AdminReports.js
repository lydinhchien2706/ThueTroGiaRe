import React, { useEffect, useState, useCallback } from 'react';
import { adminAPI } from '../../services/api';
import AdminLayout from './AdminLayout';

const AdminReports = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [filters, setFilters] = useState({
    status: '',
    severity: '',
    target_type: ''
  });

  const fetchReports = useCallback(async () => {
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

      const response = await adminAPI.getReports(params);
      setReports(response.data.data.reports);
      setPagination(prev => ({
        ...prev,
        ...response.data.data.pagination
      }));
    } catch (error) {
      console.error('Error fetching reports:', error);
    } finally {
      setLoading(false);
    }
  }, [pagination.page, filters]);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handleAction = async (reportId, action) => {
    const note = prompt('Ghi chú xử lý (tùy chọn):');
    try {
      await adminAPI.handleReport(reportId, action, note);
      fetchReports();
      alert('Xử lý báo cáo thành công');
    } catch (error) {
      alert(error.response?.data?.message || 'Lỗi khi xử lý báo cáo');
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('vi-VN');
  };

  const getSeverityBadge = (severity) => {
    const colors = {
      low: { bg: '#d5f5e3', color: '#27ae60' },
      medium: { bg: '#ffeaa7', color: '#d68910' },
      high: { bg: '#f5b7b1', color: '#c0392b' },
      critical: { bg: '#c0392b', color: '#fff' }
    };
    const style = colors[severity] || colors.low;
    return (
      <span style={{ 
        background: style.bg, 
        color: style.color, 
        padding: '4px 10px', 
        borderRadius: '4px',
        fontSize: '0.8rem',
        fontWeight: '600',
        textTransform: 'uppercase'
      }}>
        {severity}
      </span>
    );
  };

  const getTargetTypeLabel = (type) => {
    const labels = {
      listing: '🏠 Tin đăng',
      user: '👤 Người dùng',
      review: '💬 Đánh giá'
    };
    return labels[type] || type;
  };

  return (
    <AdminLayout>
      <div className="admin-table-container">
        <div className="admin-table-header">
          <h2>⚠️ Báo cáo vi phạm ({pagination.total})</h2>
          <div className="admin-table-filters">
            <select
              name="status"
              value={filters.status}
              onChange={handleFilterChange}
              className="admin-filter-select"
            >
              <option value="">Tất cả trạng thái</option>
              <option value="pending">Chờ xử lý</option>
              <option value="reviewed">Đang xem xét</option>
              <option value="resolved">Đã giải quyết</option>
              <option value="dismissed">Đã bỏ qua</option>
            </select>
            <select
              name="severity"
              value={filters.severity}
              onChange={handleFilterChange}
              className="admin-filter-select"
            >
              <option value="">Tất cả mức độ</option>
              <option value="critical">Nghiêm trọng</option>
              <option value="high">Cao</option>
              <option value="medium">Trung bình</option>
              <option value="low">Thấp</option>
            </select>
            <select
              name="target_type"
              value={filters.target_type}
              onChange={handleFilterChange}
              className="admin-filter-select"
            >
              <option value="">Tất cả loại</option>
              <option value="listing">Tin đăng</option>
              <option value="user">Người dùng</option>
              <option value="review">Đánh giá</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="admin-loading">Đang tải...</div>
        ) : reports.length === 0 ? (
          <div className="admin-empty-state">
            <div className="icon">✅</div>
            <p>Không có báo cáo vi phạm nào</p>
          </div>
        ) : (
          <>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Loại</th>
                  <th>Lý do</th>
                  <th>Mức độ</th>
                  <th>Người báo cáo</th>
                  <th>Trạng thái</th>
                  <th>Ngày báo cáo</th>
                  <th>Hành động</th>
                </tr>
              </thead>
              <tbody>
                {reports.map((report) => (
                  <tr key={report.id}>
                    <td>{report.id}</td>
                    <td>
                      {getTargetTypeLabel(report.target_type)}
                      <br />
                      <small style={{ color: '#666' }}>ID: {report.target_id}</small>
                    </td>
                    <td style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {report.reason}
                    </td>
                    <td>{getSeverityBadge(report.severity)}</td>
                    <td>{report.reporter?.name || 'Ẩn danh'}</td>
                    <td>
                      <span className={`status-badge status-${report.status === 'pending' ? 'pending' : 
                        report.status === 'resolved' ? 'approved' : 
                        report.status === 'dismissed' ? 'inactive' : 'pending'}`}>
                        {report.status === 'pending' ? 'Chờ xử lý' :
                         report.status === 'reviewed' ? 'Đang xem xét' :
                         report.status === 'resolved' ? 'Đã giải quyết' : 'Đã bỏ qua'}
                      </span>
                    </td>
                    <td>{formatDate(report.created_at)}</td>
                    <td>
                      {report.status === 'pending' && (
                        <>
                          {report.target_type === 'listing' && (
                            <button
                              onClick={() => handleAction(report.id, 'hide_content')}
                              className="action-btn reject"
                            >
                              Ẩn tin
                            </button>
                          )}
                          {report.target_type === 'user' && (
                            <button
                              onClick={() => handleAction(report.id, 'lock_user')}
                              className="action-btn lock"
                            >
                              Khóa user
                            </button>
                          )}
                          <button
                            onClick={() => handleAction(report.id, 'dismiss')}
                            className="action-btn edit"
                          >
                            Bỏ qua
                          </button>
                        </>
                      )}
                      {report.status !== 'pending' && report.handler && (
                        <small style={{ color: '#666' }}>
                          Xử lý bởi: {report.handler.name}
                        </small>
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

export default AdminReports;
