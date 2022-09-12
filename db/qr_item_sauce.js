const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('qr_item_sauce', {
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    items_id: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    sauce_id: {
        type: DataTypes.INTEGER,
        allowNull: true
      },
  
  }, {
    sequelize,
    tableName: 'qr_item_sauce',
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
