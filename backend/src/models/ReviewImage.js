const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ReviewImage = sequelize.define('ReviewImage', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  review_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'reviews',
      key: 'id'
    }
  },
  image_url: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  display_order: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'review_images',
  timestamps: false
});

// Set up associations after export
ReviewImage.associate = () => {
  const Review = require('./Review');
  ReviewImage.belongsTo(Review, { foreignKey: 'review_id', as: 'review' });
};

module.exports = ReviewImage;
