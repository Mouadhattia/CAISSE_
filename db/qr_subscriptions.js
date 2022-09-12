const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('qr_subscriptions', {
    sub_id: {
      autoIncrement: true,
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      primaryKey: true
    },
    sub_title: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    sub_term: {
      type: DataTypes.STRING(10),
      allowNull: false,
      defaultValue: "MONTHLY"
    },
    sub_amount: {
      type: DataTypes.DOUBLE(8,2),
      allowNull: false,
      defaultValue: 0.00
    },
    sub_image: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    group_id: {
      type: DataTypes.SMALLINT,
      allowNull: true
    },
    pay_mode: {
      type: DataTypes.STRING(55),
      allowNull: true
    },
    active: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: 1
    },
    recommended: {
      type: DataTypes.ENUM('yes','no'),
      allowNull: false,
      defaultValue: "no"
    },
    discount_badge: {
      type: DataTypes.STRING(25),
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'qr_subscriptions',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "sub_id" },
        ]
      },
    ]
  });
};
