const Sequelize = require("sequelize");
module.exports = function (sequelize, DataTypes) {
  return sequelize.define(
    "qr_catagory_main",
    {
      cat_id: {
        autoIncrement: true,
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
      },
      user_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      cat_name: {
        type: DataTypes.STRING(300),
        allowNull: true,
      },
      cat_order: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      slug: {
        type: DataTypes.STRING(150),
        allowNull: true,
      },
      icon: {
        type: DataTypes.STRING(300),
        allowNull: false,
        defaultValue: "fa-usd",
      },
      picture: {
        type: DataTypes.STRING(300),
        allowNull: true,
      },
      state: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1,
      },
      color: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
    },
    {
      sequelize,
      tableName: "qr_catagory_main",
      timestamps: false,
      indexes: [
        {
          name: "PRIMARY",
          unique: true,
          using: "BTREE",
          fields: [{ name: "cat_id" }],
        },
      ],
    }
  );
};
