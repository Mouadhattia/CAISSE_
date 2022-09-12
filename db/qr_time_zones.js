const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('qr_time_zones', {
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      primaryKey: true
    },
    country_code: {
      type: DataTypes.STRING(2),
      allowNull: true
    },
    time_zone_id: {
      type: DataTypes.STRING(40),
      allowNull: true,
      defaultValue: ""
    },
    gmt: {
      type: DataTypes.FLOAT,
      allowNull: true
    },
    dst: {
      type: DataTypes.FLOAT,
      allowNull: true
    },
    raw: {
      type: DataTypes.FLOAT,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'qr_time_zones',
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
