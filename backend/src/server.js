const express = require('express');
const cors = require('cors');
require('dotenv').config();

const sequelize = require('./config/database');
const authRoutes = require('./routes/authRoutes');
const listingRoutes = require('./routes/listingRoutes');
const locationRoutes = require('./routes/locationRoutes');
const filterRoutes = require('./routes/filterRoutes');
const adminRoutes = require('./routes/adminRoutes');
const mediaRoutes = require('./routes/mediaRoutes');
const reviewRoutes = require('./routes/reviewRoutes');

// Import models to set up associations
const User = require('./models/User');
const Listing = require('./models/Listing');
const Amenity = require('./models/Amenity');
const EnvironmentTag = require('./models/EnvironmentTag');
const TargetAudience = require('./models/TargetAudience');
const Review = require('./models/Review');
const ReviewVideo = require('./models/ReviewVideo');
const AdminLog = require('./models/AdminLog');
const Report = require('./models/Report');
const ListingVideo = require('./models/ListingVideo');
const ListingMedia = require('./models/ListingMedia');
const MediaLike = require('./models/MediaLike');
const ReviewImage = require('./models/ReviewImage');
const ReviewMedia = require('./models/ReviewMedia');

// Initialize associations
if (Listing.associate) Listing.associate();
if (Amenity.associate) Amenity.associate();
if (EnvironmentTag.associate) EnvironmentTag.associate();
if (TargetAudience.associate) TargetAudience.associate();
if (Review.associate) Review.associate();
if (ReviewVideo.associate) ReviewVideo.associate();
if (ListingVideo.associate) ListingVideo.associate();
if (ListingMedia.associate) ListingMedia.associate();
if (MediaLike.associate) MediaLike.associate();
if (ReviewImage.associate) ReviewImage.associate();
if (ReviewMedia.associate) ReviewMedia.associate();

// Set up AdminLog associations
AdminLog.belongsTo(User, { foreignKey: 'admin_id', as: 'admin' });

// Set up Report associations
Report.belongsTo(User, { foreignKey: 'reporter_id', as: 'reporter' });
Report.belongsTo(User, { foreignKey: 'handled_by', as: 'handler' });

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static files for uploads
app.use('/uploads', express.static('uploads'));

// Routes
app.get('/', (req, res) => {
  res.json({ 
    success: true, 
    message: 'API Thuê Trọ Giá Rẻ',
    version: '1.0.0'
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/listings', listingRoutes);
app.use('/api/locations', locationRoutes);
app.use('/api/filters', filterRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/media', mediaRoutes);
app.use('/api/reviews', reviewRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    success: false, 
    message: 'Đã xảy ra lỗi!',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ 
    success: false, 
    message: 'Không tìm thấy đường dẫn' 
  });
});

// Start server
const startServer = async () => {
  try {
    // Test database connection
    await sequelize.authenticate();
    console.log('✓ Database connected successfully');

    app.listen(PORT, () => {
      console.log(`✓ Server is running on port ${PORT}`);
      console.log(`✓ Environment: ${process.env.NODE_ENV || 'development'}`);
    });
  } catch (error) {
    console.error('✗ Unable to start server:', error);
    process.exit(1);
  }
};

startServer();
