const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('qr_items_supp', {
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    order_item_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    drink_id: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
   
  
  }, {
    sequelize,
    tableName: 'qr_items_supp',
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
