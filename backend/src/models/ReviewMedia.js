const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ReviewMedia = sequelize.define('ReviewMedia', {
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
  media_type: {
    type: DataTypes.STRING(10),
    allowNull: false,
    validate: {
      isIn: [['video', 'image']]
    }
  },
  url: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  thumbnail_url: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  duration: {
    type: DataTypes.INTEGER,
    allowNull: true
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
  tableName: 'review_media',
  timestamps: false
});

// Set up associations after export
ReviewMedia.associate = () => {
  const Review = require('./Review');
  ReviewMedia.belongsTo(Review, { foreignKey: 'review_id', as: 'review' });
};

module.exports = ReviewMedia;
