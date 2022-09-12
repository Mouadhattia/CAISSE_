const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('qr_upgrades', {
    upgrade_id: {
      autoIncrement: true,
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      primaryKey: true
    },
    sub_id: {
      type: DataTypes.STRING(16),
      allowNull: false,
      defaultValue: "0"
    },
    user_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      defaultValue: 0
    },
    pay_mode: {
      type: DataTypes.ENUM('one_time','recurring'),
      allowNull: false,
      defaultValue: "one_time"
    },
    upgrade_lasttime: {
      type: DataTypes.BIGINT,
      allowNull: false,
      defaultValue: 0
    },
    upgrade_expires: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      defaultValue: 0
    },
    unique_id: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    invoice_id: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    paypal_subscription_id: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    paypal_profile_id: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    stripe_customer_id: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    stripe_subscription_id: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    authorizenet_subscription_id: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    billing_day: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    length: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    interval: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    trial_days: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    status: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    date_trial_ends: {
      type: DataTypes.DATEONLY,
      allowNull: true
    },
    date_canceled: {
      type: DataTypes.DATE,
      allowNull: true
    },
    date_created: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: Sequelize.Sequelize.literal('CURRENT_TIMESTAMP')
    }
  }, {
    sequelize,
    tableName: 'qr_upgrades',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "upgrade_id" },
        ]
      },
    ]
  });
};
