const { Op } = require('sequelize');
const sequelize = require('../config/database');
const ListingMedia = require('../models/ListingMedia');
const ListingVideo = require('../models/ListingVideo');
const MediaLike = require('../models/MediaLike');
const Listing = require('../models/Listing');
const User = require('../models/User');
const Review = require('../models/Review');
const ReviewVideo = require('../models/ReviewVideo');
const ReviewImage = require('../models/ReviewImage');

// Configuration constants
const MEDIA_CONFIG = {
  MAX_REVIEW_MEDIA_PER_USER: parseInt(process.env.MAX_REVIEW_MEDIA_PER_USER) || 5,
  MAX_VIDEO_DURATION_SECONDS: parseInt(process.env.MAX_VIDEO_DURATION_SECONDS) || 60,
  REPORT_HIDE_THRESHOLD: parseInt(process.env.REPORT_HIDE_THRESHOLD) || 3
};

// Room tag labels for display
const ROOM_TAG_LABELS = {
  bedroom: 'Phòng ngủ',
  bathroom: 'Phòng tắm',
  kitchen: 'Bếp',
  balcony: 'Ban công',
  living_room: 'Phòng khách',
  entrance: 'Lối vào',
  other: 'Khác'
};

// Get all media for a listing
exports.getListingMedia = async (req, res) => {
  try {
    const { id } = req.params;
    const { type, role } = req.query;

    const where = { 
      listing_id: id,
      visibility_status: 'visible'
    };

    if (type) where.media_type = type;
    if (role) where.media_role = role;

    // Get listing videos (owner videos)
    const videos = await ListingVideo.findAll({
      where: { 
        listing_id: id,
        visibility_status: 'visible'
      },
      order: [['is_hero', 'DESC'], ['display_order', 'ASC'], ['created_at', 'DESC']]
    });

    // Get listing media (unified media including reviews)
    const media = await ListingMedia.findAll({
      where,
      include: [
        {
          model: User,
          as: 'uploader',
          attributes: ['id', 'name']
        }
      ],
      order: [['display_order', 'ASC'], ['created_at', 'DESC']]
    });

    // Get hero video
    const heroVideo = videos.find(v => v.is_hero) || videos[0] || null;

    // Separate owner media and user review media
    const ownerMedia = media.filter(m => m.media_role === 'owner_media');
    const userReviewMedia = media.filter(m => m.media_role === 'user_review_media');

    res.json({
      success: true,
      data: {
        heroVideo,
        ownerVideos: videos,
        ownerMedia,
        userReviewMedia,
        allMedia: media,
        roomTagLabels: ROOM_TAG_LABELS
      }
    });
  } catch (error) {
    console.error('Get listing media error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server',
      error: error.message
    });
  }
};

// Get video reviews for a listing (TikTok-style feed)
exports.getVideoReviews = async (req, res) => {
  try {
    const { id } = req.params;
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    // Get reviews with videos
    const reviews = await Review.findAll({
      where: { listing_id: id },
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name']
        },
        {
          model: ReviewVideo,
          as: 'videos',
          required: true
        }
      ],
      order: [['created_at', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    // Also get user review media (video type)
    const videoReviewMedia = await ListingMedia.findAll({
      where: {
        listing_id: id,
        media_type: 'video',
        media_role: 'user_review_media',
        visibility_status: 'visible'
      },
      include: [
        {
          model: User,
          as: 'uploader',
          attributes: ['id', 'name']
        }
      ],
      order: [['like_count', 'DESC'], ['created_at', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    res.json({
      success: true,
      data: {
        reviews,
        videoReviewMedia,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit)
        }
      }
    });
  } catch (error) {
    console.error('Get video reviews error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server',
      error: error.message
    });
  }
};

// Upload media for a listing (owner)
exports.uploadListingMedia = async (req, res) => {
  try {
    const { id } = req.params;
    const { media_type, media_url, thumbnail_url, duration_seconds, room_tag, display_order } = req.body;

    // Check if listing exists and user owns it
    const listing = await Listing.findByPk(id);
    if (!listing) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy tin đăng'
      });
    }

    if (listing.user_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Bạn không có quyền thêm media cho tin đăng này'
      });
    }

    // Validate media_url
    if (!media_url) {
      return res.status(400).json({
        success: false,
        message: 'URL media là bắt buộc'
      });
    }

    const media = await ListingMedia.create({
      listing_id: id,
      uploader_id: req.user.id,
      media_type: media_type || 'image',
      media_role: 'owner_media',
      media_url,
      thumbnail_url,
      duration_seconds,
      room_tag,
      display_order: display_order || 0
    });

    res.status(201).json({
      success: true,
      message: 'Thêm media thành công',
      data: { media }
    });
  } catch (error) {
    console.error('Upload listing media error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server',
      error: error.message
    });
  }
};

// Upload video for a listing (owner)
exports.uploadListingVideo = async (req, res) => {
  try {
    const { id } = req.params;
    const { video_url, thumbnail_url, duration_seconds, is_hero, room_tag, display_order } = req.body;

    // Check if listing exists and user owns it
    const listing = await Listing.findByPk(id);
    if (!listing) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy tin đăng'
      });
    }

    if (listing.user_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Bạn không có quyền thêm video cho tin đăng này'
      });
    }

    // Validate video_url
    if (!video_url) {
      return res.status(400).json({
        success: false,
        message: 'URL video là bắt buộc'
      });
    }

    // If setting as hero, unset other hero videos
    if (is_hero) {
      await ListingVideo.update(
        { is_hero: false },
        { where: { listing_id: id } }
      );
    }

    const video = await ListingVideo.create({
      listing_id: id,
      video_url,
      thumbnail_url,
      duration_seconds,
      is_hero: is_hero || false,
      room_tag,
      display_order: display_order || 0
    });

    res.status(201).json({
      success: true,
      message: 'Thêm video thành công',
      data: { video }
    });
  } catch (error) {
    console.error('Upload listing video error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server',
      error: error.message
    });
  }
};

// Upload review media (user)
exports.uploadReviewMedia = async (req, res) => {
  try {
    const { id } = req.params;
    const { media_type, media_url, thumbnail_url, duration_seconds } = req.body;

    // Check if listing exists
    const listing = await Listing.findByPk(id);
    if (!listing) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy tin đăng'
      });
    }

    // Validate media_url
    if (!media_url) {
      return res.status(400).json({
        success: false,
        message: 'URL media là bắt buộc'
      });
    }

    // Limit check
    const existingCount = await ListingMedia.count({
      where: {
        listing_id: id,
        uploader_id: req.user.id,
        media_role: 'user_review_media'
      }
    });

    if (existingCount >= MEDIA_CONFIG.MAX_REVIEW_MEDIA_PER_USER) {
      return res.status(400).json({
        success: false,
        message: `Bạn đã đạt giới hạn ${MEDIA_CONFIG.MAX_REVIEW_MEDIA_PER_USER} media cho tin đăng này`
      });
    }

    // Video duration limit
    if (media_type === 'video' && duration_seconds && duration_seconds > MEDIA_CONFIG.MAX_VIDEO_DURATION_SECONDS) {
      return res.status(400).json({
        success: false,
        message: `Video không được dài quá ${MEDIA_CONFIG.MAX_VIDEO_DURATION_SECONDS} giây`
      });
    }

    const media = await ListingMedia.create({
      listing_id: id,
      uploader_id: req.user.id,
      media_type: media_type || 'image',
      media_role: 'user_review_media',
      media_url,
      thumbnail_url,
      duration_seconds,
      visibility_status: 'pending' // Require moderation
    });

    res.status(201).json({
      success: true,
      message: 'Thêm review media thành công, đang chờ duyệt',
      data: { media }
    });
  } catch (error) {
    console.error('Upload review media error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server',
      error: error.message
    });
  }
};

// Like/unlike media
exports.toggleMediaLike = async (req, res) => {
  try {
    const { mediaId } = req.params;

    const media = await ListingMedia.findByPk(mediaId);
    if (!media) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy media'
      });
    }

    // Check if already liked
    const existingLike = await MediaLike.findOne({
      where: {
        media_id: mediaId,
        user_id: req.user.id
      }
    });

    if (existingLike) {
      // Unlike
      await existingLike.destroy();
      await media.decrement('like_count');
      
      res.json({
        success: true,
        message: 'Đã bỏ thích',
        data: { liked: false, like_count: media.like_count - 1 }
      });
    } else {
      // Like
      await MediaLike.create({
        media_id: mediaId,
        user_id: req.user.id
      });
      await media.increment('like_count');

      res.json({
        success: true,
        message: 'Đã thích',
        data: { liked: true, like_count: media.like_count + 1 }
      });
    }
  } catch (error) {
    console.error('Toggle media like error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server',
      error: error.message
    });
  }
};

// Report media
exports.reportMedia = async (req, res) => {
  try {
    const { mediaId } = req.params;
    const { reason, description } = req.body;

    if (!reason) {
      return res.status(400).json({
        success: false,
        message: 'Lý do báo cáo là bắt buộc'
      });
    }

    const media = await ListingMedia.findByPk(mediaId);
    if (!media) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy media'
      });
    }

    // Increment report count
    await media.increment('report_count');

    // If report count exceeds threshold, mark as reported
    if (media.report_count >= MEDIA_CONFIG.REPORT_HIDE_THRESHOLD) {
      await media.update({ visibility_status: 'reported' });
    }

    res.json({
      success: true,
      message: 'Báo cáo thành công'
    });
  } catch (error) {
    console.error('Report media error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server',
      error: error.message
    });
  }
};

// Update media order (owner)
exports.updateMediaOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const { mediaOrder } = req.body; // Array of { id, display_order }

    // Check if listing exists and user owns it
    const listing = await Listing.findByPk(id);
    if (!listing) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy tin đăng'
      });
    }

    if (listing.user_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Bạn không có quyền sắp xếp media cho tin đăng này'
      });
    }

    // Update each media's display_order
    const updatePromises = mediaOrder.map(item =>
      ListingMedia.update(
        { display_order: item.display_order },
        { where: { id: item.id, listing_id: id } }
      )
    );

    await Promise.all(updatePromises);

    res.json({
      success: true,
      message: 'Cập nhật thứ tự thành công'
    });
  } catch (error) {
    console.error('Update media order error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server',
      error: error.message
    });
  }
};

// Delete media (owner)
exports.deleteMedia = async (req, res) => {
  try {
    const { mediaId } = req.params;

    const media = await ListingMedia.findByPk(mediaId, {
      include: [{ model: Listing, as: 'listing' }]
    });

    if (!media) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy media'
      });
    }

    // Check ownership
    if (media.uploader_id !== req.user.id && media.listing.user_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Bạn không có quyền xóa media này'
      });
    }

    await media.destroy();

    res.json({
      success: true,
      message: 'Xóa media thành công'
    });
  } catch (error) {
    console.error('Delete media error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server',
      error: error.message
    });
  }
};

// Set hero video (owner)
exports.setHeroVideo = async (req, res) => {
  try {
    const { id, videoId } = req.params;

    // Check if listing exists and user owns it
    const listing = await Listing.findByPk(id);
    if (!listing) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy tin đăng'
      });
    }

    if (listing.user_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Bạn không có quyền cập nhật video hero'
      });
    }

    // Unset all hero videos
    await ListingVideo.update(
      { is_hero: false },
      { where: { listing_id: id } }
    );

    // Set new hero video
    await ListingVideo.update(
      { is_hero: true },
      { where: { id: videoId, listing_id: id } }
    );

    res.json({
      success: true,
      message: 'Đã đặt video hero thành công'
    });
  } catch (error) {
    console.error('Set hero video error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server',
      error: error.message
    });
  }
};
