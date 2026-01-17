import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Header.css';

const Header = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="header">
      <div className="container">
        <div className="header-content">
          <Link to="/" className="logo">
            <h1>Thuê Trọ Giá Rẻ</h1>
          </Link>
          
          <nav className="nav">
            <Link to="/" className="nav-link">Trang chủ</Link>
            <Link to="/listings?type=phong-tro" className="nav-link">Phòng trọ</Link>
            <Link to="/listings?type=nha-nguyen-can" className="nav-link">Nhà nguyên căn</Link>
            <Link to="/listings?type=can-ho" className="nav-link">Căn hộ</Link>
          </nav>

          <div className="auth-section">
            {isAuthenticated ? (
              <>
                <span className="user-name">Xin chào, {user?.name}</span>
                <Link to="/dashboard" className="btn btn-primary">Dashboard</Link>
                <button onClick={handleLogout} className="btn btn-outline">
                  Đăng xuất
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="btn btn-outline">
                  Đăng nhập
                </Link>
                <Link to="/register" className="btn btn-primary">
                  Đăng ký
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
