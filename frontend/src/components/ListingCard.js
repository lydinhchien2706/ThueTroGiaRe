import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './ListingCard.css';

const ListingCard = ({ listing }) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

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
  const placeholderImage = 'https://via.placeholder.com/400x300?text=No+Image';

  return (
    <div className="listing-card">
      <Link to={`/listings/${listing.id}`} className="listing-card-link">
        <div className="listing-image image-zoom-container">
          <img
            src={imageError ? placeholderImage : (primaryImage?.image_url || placeholderImage)}
            alt={listing.title}
            className={`progressive-img ${imageLoaded ? 'loaded' : 'loading'}`}
            onLoad={() => setImageLoaded(true)}
            onError={() => setImageError(true)}
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
