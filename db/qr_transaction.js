const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('qr_transaction', {
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    product_name: {
      type: DataTypes.STRING(225),
      allowNull: true
    },
    product_id: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    seller_id: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    amount: {
      type: DataTypes.DOUBLE(9,2),
      allowNull: true
    },
    base_amount: {
      type: DataTypes.DOUBLE(9,2),
      allowNull: true
    },
    featured: {
      type: DataTypes.ENUM('0','1'),
      allowNull: true,
      defaultValue: "0"
    },
    urgent: {
      type: DataTypes.ENUM('0','1'),
      allowNull: true,
      defaultValue: "0"
    },
    highlight: {
      type: DataTypes.ENUM('0','1'),
      allowNull: true,
      defaultValue: "0"
    },
    transaction_time: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    status: {
      type: DataTypes.ENUM('pending','success','failed','cancel'),
      allowNull: true
    },
    payment_id: {
      type: DataTypes.STRING(64),
      allowNull: true
    },
    transaction_gatway: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    transaction_ip: {
      type: DataTypes.STRING(15),
      allowNull: true
    },
    transaction_description: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    transaction_method: {
      type: DataTypes.STRING(20),
      allowNull: true
    },
    frequency: {
      type: DataTypes.ENUM('MONTHLY','YEARLY','LIFETIME'),
      allowNull: true
    },
    billing: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    taxes_ids: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'qr_transaction',
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
