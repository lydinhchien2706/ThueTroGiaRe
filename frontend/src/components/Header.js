import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Header.css';

const Header = () => {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  // Detect scroll for sticky morphing effect
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      setIsScrolled(scrollTop > 50);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
    setMobileMenuOpen(false);
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  return (
    <header className={`header ${isScrolled ? 'scrolled' : ''}`}>
      <div className="container">
        <div className="header-content">
          <Link to="/" className="logo" onClick={closeMobileMenu}>
            <h1>Thuê Trọ Giá Rẻ</h1>
          </Link>
          
          {/* Hamburger Menu Button - Mobile Only */}
          <button 
            className="hamburger-menu" 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            <span className={`hamburger-line ${mobileMenuOpen ? 'open' : ''}`}></span>
            <span className={`hamburger-line ${mobileMenuOpen ? 'open' : ''}`}></span>
            <span className={`hamburger-line ${mobileMenuOpen ? 'open' : ''}`}></span>
          </button>

          {/* Navigation - Collapsible on Mobile */}
          <div className={`nav-wrapper ${mobileMenuOpen ? 'open' : ''}`}>
            <nav className="nav">
              <Link to="/" className="nav-link" onClick={closeMobileMenu}>Trang chủ</Link>
              <Link to="/listings?type=phong-tro" className="nav-link" onClick={closeMobileMenu}>Phòng trọ</Link>
              <Link to="/listings?type=nha-nguyen-can" className="nav-link" onClick={closeMobileMenu}>Nhà nguyên căn</Link>
              <Link to="/listings?type=can-ho" className="nav-link" onClick={closeMobileMenu}>Căn hộ</Link>
              <Link to="/reviews" className="nav-link" onClick={closeMobileMenu}>🎬 Review</Link>
            </nav>

            <div className="auth-section">
              {isAuthenticated ? (
                <>
                  <span className="user-name">Xin chào, {user?.name}</span>
                  <Link to="/dashboard" className="btn btn-primary" onClick={closeMobileMenu}>Dashboard</Link>
                  {isAdmin && (
                    <Link to="/admin" className="btn btn-admin" onClick={closeMobileMenu}>🔒 Admin</Link>
                  )}
                  <button onClick={handleLogout} className="btn btn-outline">
                    Đăng xuất
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login" className="btn btn-outline" onClick={closeMobileMenu}>
                    Đăng nhập
                  </Link>
                  <Link to="/register" className="btn btn-primary" onClick={closeMobileMenu}>
                    Đăng ký
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
