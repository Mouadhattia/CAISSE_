const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('qr_balance', {
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    current_balance: {
      type: DataTypes.DOUBLE(9,2),
      allowNull: true
    },
    total_earning: {
      type: DataTypes.DOUBLE(9,2),
      allowNull: true
    },
    total_withdrawal: {
      type: DataTypes.DOUBLE(9,2),
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'qr_balance',
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
