const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('qr_taxes', {
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      primaryKey: true
    },
    internal_name: {
      type: DataTypes.STRING(64),
      allowNull: true
    },
    name: {
      type: DataTypes.STRING(64),
      allowNull: true
    },
    description: {
      type: DataTypes.STRING(256),
      allowNull: true
    },
    value: {
      type: DataTypes.DECIMAL(10,2),
      allowNull: true
    },
    value_type: {
      type: DataTypes.ENUM('percentage','fixed'),
      allowNull: true
    },
    type: {
      type: DataTypes.ENUM('inclusive','exclusive'),
      allowNull: true
    },
    billing_type: {
      type: DataTypes.ENUM('personal','business','both'),
      allowNull: true
    },
    countries: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    datetime: {
      type: DataTypes.DATE,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'qr_taxes',
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
