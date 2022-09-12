const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('qr_plans', {
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false,
      defaultValue: ""
    },
    badge: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    monthly_price: {
      type: DataTypes.FLOAT,
      allowNull: true
    },
    annual_price: {
      type: DataTypes.FLOAT,
      allowNull: true
    },
    lifetime_price: {
      type: DataTypes.FLOAT,
      allowNull: true
    },
    recommended: {
      type: DataTypes.ENUM('yes','no'),
      allowNull: false,
      defaultValue: "no"
    },
    settings: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    taxes_ids: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    status: {
      type: DataTypes.TINYINT,
      allowNull: false
    },
    date: {
      type: DataTypes.DATE,
      allowNull: false
    }
  }, {
    sequelize,
    tableName: 'qr_plans',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "id" },
        ]
      },
    ]
  });
};
