import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import SearchBar from '../components/SearchBar';
import ListingCard from '../components/ListingCard';
import { listingsAPI } from '../services/api';
import './Listings.css';

const Listings = () => {
  const [searchParams] = useSearchParams();
  const [listings, setListings] = useState([]);
  const [pagination, setPagination] = useState({});
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    fetchListings();
  }, [searchParams, currentPage]);

  const fetchListings = async () => {
    setLoading(true);
    try {
      const params = Object.fromEntries(searchParams);
      const response = await listingsAPI.getListings({ ...params, page: currentPage, limit: 12 });
      setListings(response.data.data.listings);
      setPagination(response.data.data.pagination);
    } catch (error) {
      console.error('Error fetching listings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="listings-page">
      <div className="container">
        <h1 className="page-title">Tìm Kiếm Phòng Trọ</h1>
        <SearchBar />

        {loading ? (
          <div className="loading">Đang tải...</div>
        ) : (
          <>
            <div className="listings-header">
              <h2>Kết quả tìm kiếm</h2>
              <p>Tìm thấy {pagination.total || 0} kết quả</p>
            </div>

            {listings.length > 0 ? (
              <>
                <div className="listings-grid">
                  {listings.map((listing) => (
                    <ListingCard key={listing.id} listing={listing} />
                  ))}
                </div>

                {pagination.totalPages > 1 && (
                  <div className="pagination">
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="btn btn-outline"
                    >
                      Trước
                    </button>
                    <span className="page-info">
                      Trang {currentPage} / {pagination.totalPages}
                    </span>
                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === pagination.totalPages}
                      className="btn btn-outline"
                    >
                      Sau
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="no-listings">
                <p>Không tìm thấy kết quả phù hợp</p>
                <p>Vui lòng thử lại với các tiêu chí khác</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Listings;
