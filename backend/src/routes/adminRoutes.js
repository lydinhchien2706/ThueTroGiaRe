const express = require('express');
const rateLimit = require('express-rate-limit');
const router = express.Router();
const { requireAdmin, requireSuperAdmin } = require('../middleware/auth');

// Controllers
const adminDashboardController = require('../controllers/adminDashboardController');
const adminUserController = require('../controllers/adminUserController');
const adminListingController = require('../controllers/adminListingController');
const adminReportController = require('../controllers/adminReportController');

// Rate limiting for admin routes - stricter than public routes
const adminRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per 15 minutes
  message: {
    success: false,
    message: 'Quá nhiều yêu cầu từ địa chỉ IP này, vui lòng thử lại sau 15 phút'
  },
  standardHeaders: true,
  legacyHeaders: false
});

// Stricter rate limiting for sensitive operations
const sensitiveActionLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 20, // 20 sensitive actions per hour
  message: {
    success: false,
    message: 'Quá nhiều thao tác nhạy cảm, vui lòng thử lại sau 1 giờ'
  },
  standardHeaders: true,
  legacyHeaders: false
});

// Apply general rate limiting to all admin routes
router.use(adminRateLimiter);

// ============ Dashboard Routes ============
router.get('/dashboard/stats', requireAdmin, adminDashboardController.getDashboardStats);
router.get('/dashboard/activity-logs', requireAdmin, adminDashboardController.getActivityLogs);

// ============ User Management Routes ============
router.get('/users', requireAdmin, adminUserController.getUsers);
router.get('/users/:id', requireAdmin, adminUserController.getUserById);
router.patch('/users/:id/role', sensitiveActionLimiter, requireAdmin, adminUserController.updateUserRole);
router.patch('/users/:id/lock', sensitiveActionLimiter, requireAdmin, adminUserController.toggleUserLock);
router.post('/users/:id/reset-password', sensitiveActionLimiter, requireSuperAdmin, adminUserController.resetUserPassword);

// ============ Listing Management Routes ============
router.get('/listings', requireAdmin, adminListingController.getListings);
router.get('/listings/pending', requireAdmin, adminListingController.getPendingListings);
router.patch('/listings/:id/approve', requireAdmin, adminListingController.approveListing);
router.patch('/listings/:id/reject', requireAdmin, adminListingController.rejectListing);
router.patch('/listings/:id/visibility', requireAdmin, adminListingController.toggleListingVisibility);
router.put('/listings/:id', requireAdmin, adminListingController.updateListing);
router.delete('/listings/:id', sensitiveActionLimiter, requireAdmin, adminListingController.deleteListing);

// ============ Report Management Routes ============
router.get('/reports', requireAdmin, adminReportController.getReports);
router.get('/reports/pending', requireAdmin, adminReportController.getPendingReports);
router.get('/reports/:id', requireAdmin, adminReportController.getReportById);
router.patch('/reports/:id', requireAdmin, adminReportController.updateReportStatus);
router.post('/reports/:id/handle', requireAdmin, adminReportController.handleReport);

module.exports = router;
