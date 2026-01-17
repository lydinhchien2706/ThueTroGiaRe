const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./User');
const Location = require('./Location');

const Listing = sequelize.define('Listing', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  title: {
    type: DataTypes.STRING(500),
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  price: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false
  },
  area: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true
  },
  type: {
    type: DataTypes.STRING(50),
    allowNull: false,
    validate: {
      isIn: [['phong-tro', 'nha-nguyen-can', 'can-ho']]
    }
  },
  address: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  province_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'locations',
      key: 'id'
    }
  },
  district_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'locations',
      key: 'id'
    }
  },
  ward_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'locations',
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
  status: {
    type: DataTypes.STRING(50),
    defaultValue: 'active',
    validate: {
      isIn: [['active', 'inactive', 'deleted']]
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
  tableName: 'listings',
  timestamps: false
});

// Associations
Listing.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
Listing.belongsTo(Location, { foreignKey: 'province_id', as: 'province' });
Listing.belongsTo(Location, { foreignKey: 'district_id', as: 'district' });
Listing.belongsTo(Location, { foreignKey: 'ward_id', as: 'ward' });

module.exports = Listing;
