const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('qr_currencies', {
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      primaryKey: true
    },
    code: {
      type: DataTypes.STRING(3),
      allowNull: true
    },
    name: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    html_entity: {
      type: DataTypes.STRING(30),
      allowNull: true,
      comment: "From Github : An array of currency symbols as HTML entities"
    },
    font_arial: {
      type: DataTypes.STRING(5),
      allowNull: true
    },
    font_code2000: {
      type: DataTypes.STRING(5),
      allowNull: true
    },
    unicode_decimal: {
      type: DataTypes.STRING(5),
      allowNull: true
    },
    unicode_hex: {
      type: DataTypes.STRING(5),
      allowNull: true
    },
    in_left: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: 0
    },
    decimal_places: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true,
      defaultValue: 2,
      comment: "Currency Decimal Places - ISO 4217"
    },
    decimal_separator: {
      type: DataTypes.STRING(10),
      allowNull: true,
      defaultValue: "."
    },
    thousand_separator: {
      type: DataTypes.STRING(10),
      allowNull: true,
      defaultValue: ","
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: true
    },
    updated_at: {
      type: DataTypes.DATE,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'qr_currencies',
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
