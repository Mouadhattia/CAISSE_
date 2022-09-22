const Sequelize = require("sequelize");
module.exports = function (sequelize, DataTypes) {
  return sequelize.define(
    "qr_coupon",
    {
      id: {
        autoIncrement: true,
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
      },
     
      created_at: { type: DataTypes.DATE },
      expires_at: { type: DataTypes.DATE },
      discount_percent: { type: DataTypes.INTEGER },
      discount: { type: DataTypes.FLOAT },
      used_at_restaurant: { type: DataTypes.INTEGER },
      number_use: { type: DataTypes.INTEGER },
      used: { type: DataTypes.INTEGER },
      user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      code: {
        type: DataTypes.STRING(50),
        allowNull: false,
      },
      id_client: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
    },
   
    {
      sequelize,
      tableName: "qr_coupon",
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
