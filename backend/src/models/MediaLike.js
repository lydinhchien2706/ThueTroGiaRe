const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const MediaLike = sequelize.define('MediaLike', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  media_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'listing_media',
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
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'media_likes',
  timestamps: false,
  indexes: [
    {
      unique: true,
      fields: ['media_id', 'user_id']
    }
  ]
});

// Set up associations after export
MediaLike.associate = () => {
  const ListingMedia = require('./ListingMedia');
  const User = require('./User');
  
  MediaLike.belongsTo(ListingMedia, { foreignKey: 'media_id', as: 'media' });
  MediaLike.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
};

module.exports = MediaLike;
