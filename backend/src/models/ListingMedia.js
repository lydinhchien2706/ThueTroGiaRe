const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ListingMedia = sequelize.define('ListingMedia', {
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
  uploader_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  media_type: {
    type: DataTypes.STRING(10),
    allowNull: false,
    validate: {
      isIn: [['image', 'video']]
    }
  },
  media_role: {
    type: DataTypes.STRING(20),
    allowNull: false,
    validate: {
      isIn: [['owner_media', 'user_review_media']]
    }
  },
  media_url: {
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
  like_count: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  report_count: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  visibility_status: {
    type: DataTypes.STRING(20),
    defaultValue: 'visible',
    validate: {
      isIn: [['visible', 'hidden', 'pending', 'reported']]
    }
  },
  is_verified: {
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
  tableName: 'listing_media',
  timestamps: false
});

// Set up associations after export
ListingMedia.associate = () => {
  const Listing = require('./Listing');
  const User = require('./User');
  
  ListingMedia.belongsTo(Listing, { foreignKey: 'listing_id', as: 'listing' });
  ListingMedia.belongsTo(User, { foreignKey: 'uploader_id', as: 'uploader' });
};

module.exports = ListingMedia;
