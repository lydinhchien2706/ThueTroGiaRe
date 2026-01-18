import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if available
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
};

// Listings API
export const listingsAPI = {
  getListings: (params) => api.get('/listings', { params }),
  getListingById: (id) => api.get(`/listings/${id}`),
  createListing: (data) => api.post('/listings', data),
  updateListing: (id, data) => api.put(`/listings/${id}`, data),
  deleteListing: (id) => api.delete(`/listings/${id}`),
  getMyListings: (params) => api.get('/listings/user/my-listings', { params }),
};

// Locations API
export const locationsAPI = {
  getProvinces: () => api.get('/locations/provinces'),
  getDistricts: (provinceId) => api.get('/locations/districts', { params: { province_id: provinceId } }),
  getWards: (districtId) => api.get('/locations/wards', { params: { district_id: districtId } }),
};

// Filters API
export const filtersAPI = {
  getAmenities: () => api.get('/filters/amenities'),
  getEnvironments: () => api.get('/filters/environments'),
  getAudiences: () => api.get('/filters/audiences'),
};

// Media API
export const mediaAPI = {
  // Get media for a listing
  getListingMedia: (listingId, params) => api.get(`/media/listings/${listingId}/media`, { params }),
  getVideoReviews: (listingId, params) => api.get(`/media/listings/${listingId}/video-reviews`, { params }),
  
  // Upload media (owner)
  uploadListingMedia: (listingId, data) => api.post(`/media/listings/${listingId}/media`, data),
  uploadListingVideo: (listingId, data) => api.post(`/media/listings/${listingId}/video`, data),
  updateMediaOrder: (listingId, data) => api.put(`/media/listings/${listingId}/media-order`, data),
  setHeroVideo: (listingId, videoId) => api.put(`/media/listings/${listingId}/hero-video/${videoId}`),
  
  // Upload review media (user)
  uploadReviewMedia: (listingId, data) => api.post(`/media/listings/${listingId}/review-media`, data),
  
  // Media interactions
  toggleLike: (mediaId) => api.post(`/media/media/${mediaId}/like`),
  reportMedia: (mediaId, data) => api.post(`/media/media/${mediaId}/report`, data),
  deleteMedia: (mediaId) => api.delete(`/media/media/${mediaId}`),
};

// Admin API
export const adminAPI = {
  // Dashboard
  getDashboardStats: () => api.get('/admin/dashboard/stats'),
  getActivityLogs: (params) => api.get('/admin/dashboard/activity-logs', { params }),

  // User Management
  getUsers: (params) => api.get('/admin/users', { params }),
  getUserById: (id) => api.get(`/admin/users/${id}`),
  updateUserRole: (id, role) => api.patch(`/admin/users/${id}/role`, { role }),
  toggleUserLock: (id, is_locked, reason) => api.patch(`/admin/users/${id}/lock`, { is_locked, reason }),
  resetUserPassword: (id, new_password) => api.post(`/admin/users/${id}/reset-password`, { new_password }),

  // Listing Management
  getListings: (params) => api.get('/admin/listings', { params }),
  getPendingListings: (params) => api.get('/admin/listings/pending', { params }),
  approveListing: (id, admin_note) => api.patch(`/admin/listings/${id}/approve`, { admin_note }),
  rejectListing: (id, admin_note) => api.patch(`/admin/listings/${id}/reject`, { admin_note }),
  toggleListingVisibility: (id, status, reason) => api.patch(`/admin/listings/${id}/visibility`, { status, reason }),
  updateListing: (id, data) => api.put(`/admin/listings/${id}`, data),
  deleteListing: (id, reason) => api.delete(`/admin/listings/${id}`, { data: { reason } }),

  // Report Management
  getReports: (params) => api.get('/admin/reports', { params }),
  getPendingReports: (params) => api.get('/admin/reports/pending', { params }),
  getReportById: (id) => api.get(`/admin/reports/${id}`),
  updateReportStatus: (id, data) => api.patch(`/admin/reports/${id}`, data),
  handleReport: (id, action, admin_note) => api.post(`/admin/reports/${id}/handle`, { action, admin_note }),
};

export default api;
