import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './AdminLayout.css';

const AdminLayout = ({ children }) => {
  const { user, logout, isAdmin } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // Redirect if not admin
  React.useEffect(() => {
    if (!isAdmin) {
      navigate('/login');
    }
  }, [isAdmin, navigate]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const menuItems = [
    { path: '/admin', label: 'Dashboard', icon: '📊' },
    { path: '/admin/users', label: 'Quản lý User', icon: '👥' },
    { path: '/admin/listings', label: 'Quản lý Tin đăng', icon: '🏠' },
    { path: '/admin/pending', label: 'Chờ duyệt', icon: '⏳' },
    { path: '/admin/reviews', label: 'Quản lý Review', icon: '📝' },
    { path: '/admin/reports', label: 'Báo cáo vi phạm', icon: '⚠️' },
  ];

  const isActive = (path) => {
    if (path === '/admin') {
      return location.pathname === '/admin';
    }
    return location.pathname.startsWith(path);
  };

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="admin-layout">
      {/* Sidebar */}
      <aside className="admin-sidebar">
        <div className="admin-logo">
          <Link to="/admin">
            <h2>🔒 Admin Panel</h2>
          </Link>
        </div>

        <nav className="admin-nav">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`admin-nav-item ${isActive(item.path) ? 'active' : ''}`}
            >
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-label">{item.label}</span>
            </Link>
          ))}
        </nav>

        <div className="admin-sidebar-footer">
          <Link to="/" className="admin-nav-item">
            <span className="nav-icon">🌐</span>
            <span className="nav-label">Về trang chính</span>
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <div className="admin-main">
        {/* Topbar */}
        <header className="admin-topbar">
          <div className="admin-topbar-left">
            <h1 className="admin-page-title">
              {menuItems.find(item => isActive(item.path))?.label || 'Admin'}
            </h1>
          </div>
          <div className="admin-topbar-right">
            <span className="admin-user-info">
              <span className="admin-user-role">{user?.role}</span>
              <span className="admin-user-name">{user?.name}</span>
            </span>
            <button onClick={handleLogout} className="admin-logout-btn">
              Đăng xuất
            </button>
          </div>
        </header>

        {/* Content Area */}
        <main className="admin-content">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
