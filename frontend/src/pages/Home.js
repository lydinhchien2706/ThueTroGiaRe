import React, { useEffect, useState } from 'react';
import SearchBar from '../components/SearchBar';
import ListingCard from '../components/ListingCard';
import { listingsAPI } from '../services/api';
import './Home.css';

const Home = () => {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLatestListings();
  }, []);

  const fetchLatestListings = async () => {
    try {
      const response = await listingsAPI.getListings({ page: 1, limit: 6 });
      setListings(response.data.data.listings);
    } catch (error) {
      console.error('Error fetching listings:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="home-page">
      <section className="hero-section">
        <div className="container">
          <h1 className="hero-title">Tìm Phòng Trọ Giá Rẻ</h1>
          <p className="hero-subtitle">
            Hàng ngàn tin đăng cho thuê phòng trọ, nhà nguyên căn, căn hộ trên toàn quốc
          </p>
          <SearchBar />
        </div>
      </section>

      <section className="listings-section">
        <div className="container">
          <h2 className="section-title">Tin Đăng Mới Nhất</h2>
          {loading ? (
            <div className="loading">Đang tải...</div>
          ) : (
            <>
              {listings.length > 0 ? (
                <div className="listings-grid">
                  {listings.map((listing) => (
                    <ListingCard key={listing.id} listing={listing} />
                  ))}
                </div>
              ) : (
                <div className="no-listings">Chưa có tin đăng nào</div>
              )}
            </>
          )}
        </div>
      </section>

      <section className="features-section">
        <div className="container">
          <h2 className="section-title">Tại Sao Chọn Chúng Tôi?</h2>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">🏠</div>
              <h3>Nhiều Lựa Chọn</h3>
              <p>Hàng ngàn tin đăng phòng trọ, nhà nguyên căn, căn hộ</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">💰</div>
              <h3>Giá Cả Hợp Lý</h3>
              <p>So sánh giá dễ dàng, tìm được phòng phù hợp túi tiền</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">📍</div>
              <h3>Vị Trí Đa Dạng</h3>
              <p>Tìm kiếm theo tỉnh, quận, huyện, phường xã</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">⚡</div>
              <h3>Cập Nhật Nhanh</h3>
              <p>Tin đăng được cập nhật liên tục hàng ngày</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
