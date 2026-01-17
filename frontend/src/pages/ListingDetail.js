import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { listingsAPI } from '../services/api';
import './ListingDetail.css';

const ListingDetail = () => {
  const { id } = useParams();
  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchListing();
  }, [id]);

  const fetchListing = async () => {
    try {
      const response = await listingsAPI.getListingById(id);
      setListing(response.data.data.listing);
    } catch (error) {
      console.error('Error fetching listing:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price);
  };

  const getTypeLabel = (type) => {
    const types = {
      'phong-tro': 'Phòng trọ',
      'nha-nguyen-can': 'Nhà nguyên căn',
      'can-ho': 'Căn hộ',
    };
    return types[type] || type;
  };

  if (loading) {
    return (
      <div className="container">
        <div className="loading">Đang tải...</div>
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="container">
        <div className="error">Không tìm thấy tin đăng</div>
      </div>
    );
  }

  return (
    <div className="listing-detail-page">
      <div className="container">
        <div className="listing-detail">
          <div className="listing-images">
            {listing.images && listing.images.length > 0 ? (
              <div className="images-gallery">
                {listing.images.map((image) => (
                  <img key={image.id} src={image.image_url} alt={listing.title} />
                ))}
              </div>
            ) : (
              <img src="https://via.placeholder.com/800x600?text=No+Image" alt={listing.title} />
            )}
          </div>

          <div className="listing-info">
            <div className="listing-type-badge">{getTypeLabel(listing.type)}</div>
            <h1 className="listing-title">{listing.title}</h1>
            <div className="listing-price">{formatPrice(listing.price)}/tháng</div>

            <div className="listing-specs">
              <div className="spec-item">
                <span className="spec-label">Diện tích:</span>
                <span className="spec-value">{listing.area} m²</span>
              </div>
              <div className="spec-item">
                <span className="spec-label">Địa chỉ:</span>
                <span className="spec-value">{listing.address}</span>
              </div>
              <div className="spec-item">
                <span className="spec-label">Khu vực:</span>
                <span className="spec-value">
                  {listing.ward?.name}, {listing.district?.name}, {listing.province?.name}
                </span>
              </div>
            </div>

            <div className="listing-description">
              <h2>Mô tả</h2>
              <p>{listing.description || 'Chưa có mô tả'}</p>
            </div>

            {listing.user && (
              <div className="listing-contact-card">
                <h2>Thông tin liên hệ</h2>
                <div className="contact-info">
                  <div className="contact-item">
                    <span className="contact-label">Người đăng:</span>
                    <span className="contact-value">{listing.user.name}</span>
                  </div>
                  <div className="contact-item">
                    <span className="contact-label">Số điện thoại:</span>
                    <span className="contact-value">
                      <a href={`tel:${listing.user.phone}`}>{listing.user.phone}</a>
                    </span>
                  </div>
                  <div className="contact-item">
                    <span className="contact-label">Email:</span>
                    <span className="contact-value">
                      <a href={`mailto:${listing.user.email}`}>{listing.user.email}</a>
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ListingDetail;
