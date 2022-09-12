const Sequelize = require("sequelize");
module.exports = function (sequelize, DataTypes) {
  return sequelize.define(
    "qr_client",
    {
      id: {
        autoIncrement: true,
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
      },
      nom_prenom: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      ville: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      telephone: {
        type: DataTypes.STRING(50),
        allowNull: true,
      },
      adresse: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      email: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      societe: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      code_1: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      code_2: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      interphone: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      etage: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      supprimer: {
        type: DataTypes.TINYINT,
        allowNull: true,
      },
      user_id: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      code_postal: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
    },
    {
      sequelize,
      tableName: "qr_client",
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
