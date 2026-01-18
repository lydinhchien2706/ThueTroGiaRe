const { Op } = require('sequelize');
const sequelize = require('../config/database');
const Review = require('../models/Review');
const ReviewMedia = require('../models/ReviewMedia');
const Listing = require('../models/Listing');
const User = require('../models/User');

// Configuration constants
const REVIEW_CONFIG = {
  MAX_IMAGES_PER_REVIEW: parseInt(process.env.MAX_IMAGES_PER_REVIEW) || 10,
  MAX_VIDEO_DURATION_SECONDS: parseInt(process.env.MAX_VIDEO_DURATION_SECONDS) || 120, // 2 minutes
  DEFAULT_PAGE_SIZE: 10
};

// URL validation helper
const isValidUrl = (string) => {
  try {
    const url = new URL(string);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
};

// Validate media array items
const validateMediaItems = (mediaArray) => {
  if (!Array.isArray(mediaArray)) return false;
  
  for (const item of mediaArray) {
    if (!item || typeof item !== 'object') return false;
    if (!['video', 'image'].includes(item.media_type)) return false;
    if (!item.url || typeof item.url !== 'string' || !isValidUrl(item.url)) return false;
    if (item.thumbnail_url && !isValidUrl(item.thumbnail_url)) return false;
  }
  return true;
};

// Get reviews for a room/listing
exports.getReviewsByRoom = async (req, res) => {
  try {
    const { roomId } = req.params;
    const { 
      page = 1, 
      limit = REVIEW_CONFIG.DEFAULT_PAGE_SIZE,
      type,
      sort = 'newest',
      minRating
    } = req.query;
    const offset = (page - 1) * limit;

    const where = { 
      room_id: roomId,
      status: 'approved'
    };

    if (type && ['video', 'image', 'mixed'].includes(type)) {
      where.type = type;
    }

    if (minRating) {
      where.rating = { [Op.gte]: parseInt(minRating) };
    }

    // Determine sort order
    let order = [['created_at', 'DESC']]; // newest
    if (sort === 'rating') {
      order = [['rating', 'DESC'], ['created_at', 'DESC']];
    } else if (sort === 'featured') {
      order = [['is_featured', 'DESC'], ['created_at', 'DESC']];
    }

    const { count, rows: reviews } = await Review.findAndCountAll({
      where,
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name']
        },
        {
          model: ReviewMedia,
          as: 'media',
          order: [['display_order', 'ASC']]
        }
      ],
      order,
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    // Calculate review statistics
    const stats = await Review.findAll({
      where: { room_id: roomId, status: 'approved' },
      attributes: [
        [sequelize.fn('COUNT', sequelize.col('id')), 'totalCount'],
        [sequelize.fn('AVG', sequelize.col('rating')), 'averageRating'],
        [sequelize.fn('COUNT', sequelize.literal("CASE WHEN type = 'video' THEN 1 END")), 'videoCount'],
        [sequelize.fn('COUNT', sequelize.literal("CASE WHEN type = 'image' THEN 1 END")), 'imageCount']
      ],
      raw: true
    });

    // Get featured review
    const featuredReview = await Review.findOne({
      where: { room_id: roomId, status: 'approved', is_featured: true },
      include: [
        { model: User, as: 'user', attributes: ['id', 'name'] },
        { model: ReviewMedia, as: 'media' }
      ]
    });

    res.json({
      success: true,
      data: {
        reviews,
        featuredReview,
        stats: stats[0] ? {
          totalCount: parseInt(stats[0].totalCount) || 0,
          averageRating: parseFloat(stats[0].averageRating) || 0,
          videoCount: parseInt(stats[0].videoCount) || 0,
          imageCount: parseInt(stats[0].imageCount) || 0
        } : { totalCount: 0, averageRating: 0, videoCount: 0, imageCount: 0 },
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: count,
          totalPages: Math.ceil(count / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get reviews error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server',
      error: error.message
    });
  }
};

// Get all reviews (global feed)
exports.getAllReviews = async (req, res) => {
  try {
    const {
      page = 1,
      limit = REVIEW_CONFIG.DEFAULT_PAGE_SIZE,
      type,
      minRating,
      sort = 'newest'
    } = req.query;
    const offset = (page - 1) * limit;

    const where = { status: 'approved' };

    if (type && ['video', 'image', 'mixed'].includes(type)) {
      where.type = type;
    }

    if (minRating) {
      where.rating = { [Op.gte]: parseInt(minRating) };
    }

    // Determine sort order
    let order = [['created_at', 'DESC']];
    if (sort === 'rating') {
      order = [['rating', 'DESC'], ['created_at', 'DESC']];
    } else if (sort === 'featured') {
      order = [['is_featured', 'DESC'], ['created_at', 'DESC']];
    }

    const { count, rows: reviews } = await Review.findAndCountAll({
      where,
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name']
        },
        {
          model: Listing,
          as: 'room',
          attributes: ['id', 'title', 'price', 'address']
        },
        {
          model: ReviewMedia,
          as: 'media',
          order: [['display_order', 'ASC']]
        }
      ],
      order,
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    res.json({
      success: true,
      data: {
        reviews,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: count,
          totalPages: Math.ceil(count / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get all reviews error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server',
      error: error.message
    });
  }
};

// Get a single review by ID
exports.getReviewById = async (req, res) => {
  try {
    const { id } = req.params;

    const review = await Review.findByPk(id, {
      include: [
        { model: User, as: 'user', attributes: ['id', 'name'] },
        { model: Listing, as: 'room', attributes: ['id', 'title', 'price', 'address'] },
        { model: ReviewMedia, as: 'media', order: [['display_order', 'ASC']] }
      ]
    });

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy review'
      });
    }

    res.json({
      success: true,
      data: { review }
    });
  } catch (error) {
    console.error('Get review by id error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server',
      error: error.message
    });
  }
};

// Create a new review
exports.createReview = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const { roomId } = req.params;
    const { title, content, rating, type, media } = req.body;
    const userId = req.user.id;

    // Validate room exists
    const room = await Listing.findByPk(roomId);
    if (!room) {
      await transaction.rollback();
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy phòng trọ'
      });
    }

    // Validate rating
    if (!rating || rating < 1 || rating > 5) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: 'Đánh giá phải từ 1 đến 5 sao'
      });
    }

    // Validate media array if provided
    if (media && media.length > 0) {
      if (!validateMediaItems(media)) {
        await transaction.rollback();
        return res.status(400).json({
          success: false,
          message: 'Dữ liệu media không hợp lệ. URL phải là http/https hợp lệ.'
        });
      }
    }

    // Determine role based on user (room.user_id may be null for some listings)
    let role = 'renter';
    if (req.user.role === 'admin') {
      role = 'admin';
    } else if (room.user_id && room.user_id === userId) {
      role = 'landlord';
    }

    // Determine type based on media
    let reviewType = 'mixed';
    if (media && media.length > 0) {
      const hasVideo = media.some(m => m.media_type === 'video');
      const hasImage = media.some(m => m.media_type === 'image');
      if (hasVideo && !hasImage) reviewType = 'video';
      else if (hasImage && !hasVideo) reviewType = 'image';
    }

    // Create review
    const review = await Review.create({
      room_id: roomId,
      user_id: userId,
      role,
      type: type || reviewType,
      title,
      content,
      rating,
      status: role === 'admin' ? 'approved' : 'pending' // Auto-approve admin reviews
    }, { transaction });

    // Add media if provided
    if (media && Array.isArray(media) && media.length > 0) {
      // Validate limits
      const imageCount = media.filter(m => m.media_type === 'image').length;
      if (imageCount > REVIEW_CONFIG.MAX_IMAGES_PER_REVIEW) {
        await transaction.rollback();
        return res.status(400).json({
          success: false,
          message: `Tối đa ${REVIEW_CONFIG.MAX_IMAGES_PER_REVIEW} ảnh mỗi review`
        });
      }

      // Validate video duration
      const videoWithLongDuration = media.find(
        m => m.media_type === 'video' && m.duration > REVIEW_CONFIG.MAX_VIDEO_DURATION_SECONDS
      );
      if (videoWithLongDuration) {
        await transaction.rollback();
        return res.status(400).json({
          success: false,
          message: `Video không được dài quá ${REVIEW_CONFIG.MAX_VIDEO_DURATION_SECONDS / 60} phút`
        });
      }

      const mediaRecords = media.map((m, index) => ({
        review_id: review.id,
        media_type: m.media_type,
        url: m.url,
        thumbnail_url: m.thumbnail_url,
        duration: m.duration,
        display_order: m.display_order || index
      }));

      await ReviewMedia.bulkCreate(mediaRecords, { transaction });
    }

    await transaction.commit();

    // Fetch the created review with associations
    const createdReview = await Review.findByPk(review.id, {
      include: [
        { model: User, as: 'user', attributes: ['id', 'name'] },
        { model: ReviewMedia, as: 'media' }
      ]
    });

    res.status(201).json({
      success: true,
      message: role === 'admin' 
        ? 'Đăng review thành công' 
        : 'Đăng review thành công, đang chờ duyệt',
      data: { review: createdReview }
    });
  } catch (error) {
    await transaction.rollback();
    console.error('Create review error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server',
      error: error.message
    });
  }
};

// Update a review (owner only)
exports.updateReview = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content, rating } = req.body;
    const userId = req.user.id;

    const review = await Review.findByPk(id);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy review'
      });
    }

    if (review.user_id !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Bạn không có quyền chỉnh sửa review này'
      });
    }

    // Update review (set status back to pending for re-moderation)
    await review.update({
      title: title !== undefined ? title : review.title,
      content: content !== undefined ? content : review.content,
      rating: rating !== undefined ? rating : review.rating,
      status: 'pending',
      updated_at: new Date()
    });

    res.json({
      success: true,
      message: 'Cập nhật review thành công, đang chờ duyệt lại',
      data: { review }
    });
  } catch (error) {
    console.error('Update review error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server',
      error: error.message
    });
  }
};

// Delete a review (owner only)
exports.deleteReview = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const review = await Review.findByPk(id);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy review'
      });
    }

    if (review.user_id !== userId && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Bạn không có quyền xóa review này'
      });
    }

    await review.destroy();

    res.json({
      success: true,
      message: 'Xóa review thành công'
    });
  } catch (error) {
    console.error('Delete review error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server',
      error: error.message
    });
  }
};

// ============ Admin Review Management ============

// Get all reviews for admin (including pending)
exports.adminGetReviews = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      status,
      roomId,
      sort = 'newest'
    } = req.query;
    const offset = (page - 1) * limit;

    const where = {};

    if (status && ['pending', 'approved', 'rejected'].includes(status)) {
      where.status = status;
    }

    if (roomId) {
      where.room_id = roomId;
    }

    let order = [['created_at', 'DESC']];
    if (sort === 'oldest') {
      order = [['created_at', 'ASC']];
    }

    const { count, rows: reviews } = await Review.findAndCountAll({
      where,
      include: [
        { model: User, as: 'user', attributes: ['id', 'name', 'email'] },
        { model: Listing, as: 'room', attributes: ['id', 'title'] },
        { model: ReviewMedia, as: 'media' }
      ],
      order,
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    // Get stats
    const pendingCount = await Review.count({ where: { status: 'pending' } });
    const approvedCount = await Review.count({ where: { status: 'approved' } });
    const rejectedCount = await Review.count({ where: { status: 'rejected' } });

    res.json({
      success: true,
      data: {
        reviews,
        stats: {
          pending: pendingCount,
          approved: approvedCount,
          rejected: rejectedCount,
          total: pendingCount + approvedCount + rejectedCount
        },
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: count,
          totalPages: Math.ceil(count / limit)
        }
      }
    });
  } catch (error) {
    console.error('Admin get reviews error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server',
      error: error.message
    });
  }
};

// Get pending reviews for admin
exports.adminGetPendingReviews = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    const { count, rows: reviews } = await Review.findAndCountAll({
      where: { status: 'pending' },
      include: [
        { model: User, as: 'user', attributes: ['id', 'name', 'email'] },
        { model: Listing, as: 'room', attributes: ['id', 'title'] },
        { model: ReviewMedia, as: 'media' }
      ],
      order: [['created_at', 'ASC']], // Oldest first (FIFO)
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    res.json({
      success: true,
      data: {
        reviews,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: count,
          totalPages: Math.ceil(count / limit)
        }
      }
    });
  } catch (error) {
    console.error('Admin get pending reviews error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server',
      error: error.message
    });
  }
};

// Approve a review
exports.adminApproveReview = async (req, res) => {
  try {
    const { id } = req.params;

    const review = await Review.findByPk(id);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy review'
      });
    }

    await review.update({
      status: 'approved',
      updated_at: new Date()
    });

    res.json({
      success: true,
      message: 'Đã duyệt review',
      data: { review }
    });
  } catch (error) {
    console.error('Admin approve review error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server',
      error: error.message
    });
  }
};

// Reject a review
exports.adminRejectReview = async (req, res) => {
  try {
    const { id } = req.params;

    const review = await Review.findByPk(id);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy review'
      });
    }

    await review.update({
      status: 'rejected',
      updated_at: new Date()
    });

    res.json({
      success: true,
      message: 'Đã từ chối review',
      data: { review }
    });
  } catch (error) {
    console.error('Admin reject review error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server',
      error: error.message
    });
  }
};

// Toggle featured status
exports.adminToggleFeatured = async (req, res) => {
  try {
    const { id } = req.params;

    const review = await Review.findByPk(id);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy review'
      });
    }

    await review.update({
      is_featured: !review.is_featured,
      updated_at: new Date()
    });

    res.json({
      success: true,
      message: review.is_featured ? 'Đã bỏ ghim review' : 'Đã ghim review nổi bật',
      data: { review }
    });
  } catch (error) {
    console.error('Admin toggle featured error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server',
      error: error.message
    });
  }
};

// Delete review (admin)
exports.adminDeleteReview = async (req, res) => {
  try {
    const { id } = req.params;

    const review = await Review.findByPk(id);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy review'
      });
    }

    await review.destroy();

    res.json({
      success: true,
      message: 'Đã xóa review'
    });
  } catch (error) {
    console.error('Admin delete review error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server',
      error: error.message
    });
  }
};

// Get review statistics by room
exports.adminGetReviewStats = async (req, res) => {
  try {
    // Reviews by status
    const byStatus = await Review.findAll({
      attributes: [
        'status',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      group: ['status'],
      raw: true
    });

    // Reviews by rating
    const byRating = await Review.findAll({
      where: { status: 'approved' },
      attributes: [
        'rating',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      group: ['rating'],
      order: [['rating', 'DESC']],
      raw: true
    });

    // Top reviewed rooms
    const topRooms = await Review.findAll({
      where: { status: 'approved' },
      attributes: [
        'room_id',
        [sequelize.fn('COUNT', sequelize.col('Review.id')), 'reviewCount'],
        [sequelize.fn('AVG', sequelize.col('rating')), 'avgRating']
      ],
      include: [
        { model: Listing, as: 'room', attributes: ['id', 'title'] }
      ],
      group: ['room_id', 'room.id', 'room.title'],
      order: [[sequelize.literal('"reviewCount"'), 'DESC']],
      limit: 10,
      raw: false
    });

    res.json({
      success: true,
      data: {
        byStatus,
        byRating,
        topRooms
      }
    });
  } catch (error) {
    console.error('Admin get review stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server',
      error: error.message
    });
  }
};
