import React from 'react';
import { Link } from 'react-router-dom';
import './ListingCard.css';

const ListingCard = ({ listing }) => {
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

  const primaryImage = listing.images?.find((img) => img.is_primary) || listing.images?.[0];

  return (
    <div className="listing-card">
      <Link to={`/listings/${listing.id}`} className="listing-card-link">
        <div className="listing-image">
          <img
            src={primaryImage?.image_url || 'https://via.placeholder.com/400x300?text=No+Image'}
            alt={listing.title}
          />
          <div className="listing-type-badge">{getTypeLabel(listing.type)}</div>
        </div>
        <div className="listing-content">
          <h3 className="listing-title">{listing.title}</h3>
          <div className="listing-price">{formatPrice(listing.price)}/tháng</div>
          <div className="listing-details">
            <span className="listing-area">
              📐 {listing.area}m²
            </span>
            <span className="listing-location">
              📍 {listing.district?.name}, {listing.province?.name}
            </span>
          </div>
          {listing.user && (
            <div className="listing-contact">
              <span>👤 {listing.user.name}</span>
              <span>📞 {listing.user.phone}</span>
            </div>
          )}
        </div>
      </Link>
    </div>
  );
};

export default ListingCard;
