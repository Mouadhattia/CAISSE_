const Sequelize = require("sequelize");
module.exports = function (sequelize, DataTypes) {
  return sequelize.define(
    "qr_menu_sauce",
    {
      id: {
        autoIncrement: true,
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
      },
      user_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      restro_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      name: {
        type: DataTypes.STRING(256),
        allowNull: false,
      },
      in_stock: {
        type: DataTypes.BOOLEAN,
        defaultValue: 1,
      },
      
      details: {
        type: DataTypes.STRING(256),
        allowNull: true,
      },
      image: {
        type: DataTypes.STRING(260),
        allowNull: true
      },

    },
    {
      sequelize,
      tableName: "qr_menu_sauce",
      timestamps: false,
      indexes: [
        {
          name: "PRIMARY",
          unique: true,
          using: "BTREE",
          fields: [{ name: "id" }],
        },
      ],
    }
  );
};
