import React, { useEffect, useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { listingsAPI, mediaAPI } from '../services/api';
import { HeroMediaSection, MediaGallery, VideoReviewFeed } from '../components/media';
import { ReviewSection } from '../components/review';
import './ListingDetail.css';

const ListingDetail = () => {
  const { id } = useParams();
  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [mediaData, setMediaData] = useState(null);
  const [videoReviews, setVideoReviews] = useState([]);
  // showGallery state can be used for modal gallery in future enhancement
  const [, setShowGallery] = useState(false);

  const fetchListing = useCallback(async () => {
    try {
      const response = await listingsAPI.getListingById(id);
      setListing(response.data.data.listing);
    } catch (error) {
      console.error('Error fetching listing:', error);
    } finally {
      setLoading(false);
    }
  }, [id]);

  const fetchMedia = useCallback(async () => {
    try {
      const response = await mediaAPI.getListingMedia(id);
      setMediaData(response.data.data);
    } catch (error) {
      console.error('Error fetching media:', error);
    }
  }, [id]);

  const fetchVideoReviews = useCallback(async () => {
    try {
      const response = await mediaAPI.getVideoReviews(id);
      const reviews = response.data.data.reviews || [];
      const videoMedia = response.data.data.videoReviewMedia || [];
      setVideoReviews([...reviews, ...videoMedia]);
    } catch (error) {
      console.error('Error fetching video reviews:', error);
    }
  }, [id]);

  const handleMediaLike = async (mediaId) => {
    try {
      await mediaAPI.toggleLike(mediaId);
    } catch (error) {
      console.error('Error toggling like:', error);
      throw error;
    }
  };

  const handleMediaReport = async (mediaId) => {
    const reason = window.prompt('Lý do báo cáo:');
    if (reason) {
      try {
        await mediaAPI.reportMedia(mediaId, { reason });
        alert('Báo cáo thành công');
      } catch (error) {
        console.error('Error reporting media:', error);
        alert('Có lỗi xảy ra');
      }
    }
  };

  useEffect(() => {
    fetchListing();
    fetchMedia();
    fetchVideoReviews();
  }, [fetchListing, fetchMedia, fetchVideoReviews]);

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
          {/* Hero Media Section */}
          <HeroMediaSection
            heroVideo={mediaData?.heroVideo}
            images={listing?.images || []}
            onPlayFullscreen={() => {}}
            onOpenGallery={() => setShowGallery(true)}
          />

          {/* Media Gallery */}
          {(listing?.images?.length > 0 || mediaData?.ownerMedia?.length > 0) && (
            <MediaGallery
              images={listing?.images || []}
              videos={mediaData?.ownerVideos || []}
            />
          )}

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

          {/* Review Section - Real Reviews with Video + Photos */}
          <ReviewSection 
            roomId={id}
            onReviewSubmitted={() => {
              fetchVideoReviews();
            }}
          />

          {/* Video Review Feed - TikTok Style (Legacy) */}
          {videoReviews.length > 0 && (
            <VideoReviewFeed
              reviews={videoReviews}
              onLike={handleMediaLike}
              onReport={handleMediaReport}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default ListingDetail;
