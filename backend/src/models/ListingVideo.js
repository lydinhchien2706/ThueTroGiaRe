const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ListingVideo = sequelize.define('ListingVideo', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  listing_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'listings',
      key: 'id'
    }
  },
  video_url: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  thumbnail_url: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  duration_seconds: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  is_hero: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  display_order: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  room_tag: {
    type: DataTypes.STRING(50),
    allowNull: true,
    validate: {
      isIn: [['bedroom', 'bathroom', 'kitchen', 'balcony', 'living_room', 'entrance', 'other']]
    }
  },
  visibility_status: {
    type: DataTypes.STRING(20),
    defaultValue: 'visible',
    validate: {
      isIn: [['visible', 'hidden', 'pending']]
    }
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
  tableName: 'listing_videos',
  timestamps: false
});

// Set up associations after export
ListingVideo.associate = () => {
  const Listing = require('./Listing');
  ListingVideo.belongsTo(Listing, { foreignKey: 'listing_id', as: 'listing' });
};

module.exports = ListingVideo;
