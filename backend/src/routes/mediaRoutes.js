const express = require('express');
const rateLimit = require('express-rate-limit');
const router = express.Router();
const mediaController = require('../controllers/mediaController');
const authMiddleware = require('../middleware/auth');

// General rate limiting for all media routes
const mediaRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: {
    success: false,
    message: 'Quá nhiều yêu cầu. Vui lòng thử lại sau 15 phút.'
  },
  standardHeaders: true,
  legacyHeaders: false
});

// Stricter rate limiting for media upload routes
const uploadRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // Limit each IP/user to 20 uploads per windowMs
  message: {
    success: false,
    message: 'Quá nhiều lượt upload. Vui lòng thử lại sau 15 phút.'
  },
  standardHeaders: true,
  legacyHeaders: false
});

// Apply general rate limiting to all media routes
router.use(mediaRateLimiter);

// Public routes
router.get('/listings/:id/media', mediaController.getListingMedia);
router.get('/listings/:id/video-reviews', mediaController.getVideoReviews);

// Protected routes (require authentication)
router.post('/listings/:id/media', uploadRateLimiter, authMiddleware, mediaController.uploadListingMedia);
router.post('/listings/:id/video', uploadRateLimiter, authMiddleware, mediaController.uploadListingVideo);
router.post('/listings/:id/review-media', uploadRateLimiter, authMiddleware, mediaController.uploadReviewMedia);
router.put('/listings/:id/media-order', authMiddleware, mediaController.updateMediaOrder);
router.put('/listings/:id/hero-video/:videoId', authMiddleware, mediaController.setHeroVideo);

// Media interaction routes
router.post('/media/:mediaId/like', authMiddleware, mediaController.toggleMediaLike);
router.post('/media/:mediaId/report', authMiddleware, mediaController.reportMedia);
router.delete('/media/:mediaId', authMiddleware, mediaController.deleteMedia);

module.exports = router;
