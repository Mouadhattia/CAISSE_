const Sequelize = require("sequelize");
module.exports = function (sequelize, DataTypes) {
  return sequelize.define(
    "qr_borne",
    {
      id: {
        autoIncrement: true,
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
      },
      rest_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      id_in_rest: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      printer_url: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      printer_ip: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
    },
    {
      sequelize,
      tableName: "qr_borne",
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
}