import React, { useEffect, useState, useRef } from 'react';
import SearchBar from '../components/SearchBar';
import ListingCard from '../components/ListingCard';
import { SkeletonGrid } from '../components/SkeletonCard';
import { listingsAPI } from '../services/api';
import './Home.css';

const Home = () => {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [visibleCardIds, setVisibleCardIds] = useState(new Set());
  const gridRef = useRef(null);

  useEffect(() => {
    fetchLatestListings();
  }, []);

  // Intersection Observer for scroll-based animations
  useEffect(() => {
    if (!gridRef.current || loading) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const id = entry.target.dataset.id;
            if (id) {
              setVisibleCardIds((prev) => {
                if (prev.has(id)) return prev;
                const next = new Set(prev);
                next.add(id);
                return next;
              });
            }
          }
        });
      },
      { threshold: 0.1, rootMargin: '50px' }
    );

    const cards = gridRef.current.querySelectorAll('.listing-card-wrapper');
    cards.forEach((card) => observer.observe(card));

    return () => observer.disconnect();
  }, [loading, listings]);

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
          <h1 className="hero-title animate-slide-up">Tìm Phòng Trọ Giá Rẻ</h1>
          <p className="hero-subtitle animate-slide-up" style={{ animationDelay: '100ms' }}>
            Hàng ngàn tin đăng cho thuê phòng trọ, nhà nguyên căn, căn hộ trên toàn quốc
          </p>
          <div className="animate-slide-up" style={{ animationDelay: '200ms' }}>
            <SearchBar />
          </div>
        </div>
      </section>

      <section className="listings-section">
        <div className="container">
          <h2 className="section-title">Tin Đăng Mới Nhất</h2>
          {loading ? (
            <SkeletonGrid count={6} />
          ) : (
            <>
              {listings.length > 0 ? (
                <div className="listings-grid" ref={gridRef}>
                  {listings.map((listing, index) => (
                    <div
                      key={listing.id}
                      className={`listing-card-wrapper animate-on-scroll ${
                        visibleCardIds.has(String(listing.id)) ? 'visible' : ''
                      }`}
                      data-id={listing.id}
                      style={{ transitionDelay: `${index * 60}ms` }}
                    >
                      <ListingCard listing={listing} />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="no-listings animate-fade-in">Chưa có tin đăng nào</div>
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
