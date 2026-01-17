const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Listing = require('./Listing');

const ListingImage = sequelize.define('ListingImage', {
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
  image_url: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  is_primary: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'listing_images',
  timestamps: false
});

// Associations
ListingImage.belongsTo(Listing, { foreignKey: 'listing_id', as: 'listing' });
Listing.hasMany(ListingImage, { foreignKey: 'listing_id', as: 'images' });

module.exports = ListingImage;
