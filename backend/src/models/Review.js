const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Review = sequelize.define('Review', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  room_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'listings',
      key: 'id'
    }
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  role: {
    type: DataTypes.STRING(20),
    allowNull: false,
    defaultValue: 'renter',
    validate: {
      isIn: [['admin', 'landlord', 'renter']]
    }
  },
  type: {
    type: DataTypes.STRING(20),
    allowNull: false,
    defaultValue: 'mixed',
    validate: {
      isIn: [['video', 'image', 'mixed']]
    }
  },
  title: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  rating: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 1,
      max: 5
    }
  },
  status: {
    type: DataTypes.STRING(20),
    allowNull: false,
    defaultValue: 'pending',
    validate: {
      isIn: [['pending', 'approved', 'rejected']]
    }
  },
  is_featured: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  updated_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'reviews',
  timestamps: false
});

// Set up associations after export
Review.associate = () => {
  const Listing = require('./Listing');
  const User = require('./User');
  const ReviewVideo = require('./ReviewVideo');
  const ReviewImage = require('./ReviewImage');
  const ReviewMedia = require('./ReviewMedia');
  
  Review.belongsTo(Listing, { foreignKey: 'room_id', as: 'room' });
  Review.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
  Review.hasMany(ReviewVideo, { foreignKey: 'review_id', as: 'videos' });
  Review.hasMany(ReviewImage, { foreignKey: 'review_id', as: 'images' });
  Review.hasMany(ReviewMedia, { foreignKey: 'review_id', as: 'media' });
};

module.exports = Review;
