const express = require('express');
const rateLimit = require('express-rate-limit');
const router = express.Router();
const reviewController = require('../controllers/reviewController');
const authMiddleware = require('../middleware/auth');
const { requireAdmin } = require('../middleware/auth');

// Rate limiting for review routes
const reviewRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per 15 minutes
  message: {
    success: false,
    message: 'Quá nhiều yêu cầu. Vui lòng thử lại sau 15 phút.'
  },
  standardHeaders: true,
  legacyHeaders: false
});

// Stricter rate limiting for creating reviews
const createReviewLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // 10 reviews per hour
  message: {
    success: false,
    message: 'Bạn đã đăng quá nhiều review. Vui lòng thử lại sau 1 giờ.'
  },
  standardHeaders: true,
  legacyHeaders: false
});

// Apply general rate limiting
router.use(reviewRateLimiter);

// ============ Public Routes ============
// Get all reviews (global feed)
router.get('/', reviewController.getAllReviews);

// Get reviews for a specific room
router.get('/room/:roomId', reviewController.getReviewsByRoom);

// Get a single review
router.get('/:id', reviewController.getReviewById);

// ============ Protected Routes (require authentication) ============
// Create a review for a room
router.post('/room/:roomId', createReviewLimiter, authMiddleware, reviewController.createReview);

// Update a review
router.put('/:id', authMiddleware, reviewController.updateReview);

// Delete a review
router.delete('/:id', authMiddleware, reviewController.deleteReview);

// ============ Admin Routes ============
// Get all reviews (admin)
router.get('/admin/all', requireAdmin, reviewController.adminGetReviews);

// Get pending reviews
router.get('/admin/pending', requireAdmin, reviewController.adminGetPendingReviews);

// Get review statistics
router.get('/admin/stats', requireAdmin, reviewController.adminGetReviewStats);

// Approve a review
router.patch('/admin/:id/approve', requireAdmin, reviewController.adminApproveReview);

// Reject a review
router.patch('/admin/:id/reject', requireAdmin, reviewController.adminRejectReview);

// Toggle featured status
router.patch('/admin/:id/featured', requireAdmin, reviewController.adminToggleFeatured);

// Delete a review (admin)
router.delete('/admin/:id', requireAdmin, reviewController.adminDeleteReview);

module.exports = router;
