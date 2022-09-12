const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('qr_countries', {
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      primaryKey: true
    },
    code: {
      type: DataTypes.CHAR(2),
      allowNull: true
    },
    latitude: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    longitude: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    iso3: {
      type: DataTypes.CHAR(3),
      allowNull: true
    },
    iso_numeric: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true
    },
    fips: {
      type: DataTypes.CHAR(2),
      allowNull: true
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    asciiname: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    capital: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    area: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true
    },
    population: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true
    },
    continent_code: {
      type: DataTypes.CHAR(4),
      allowNull: true
    },
    tld: {
      type: DataTypes.CHAR(4),
      allowNull: true
    },
    currency_code: {
      type: DataTypes.STRING(3),
      allowNull: true
    },
    phone: {
      type: DataTypes.STRING(20),
      allowNull: true
    },
    postal_code_format: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    postal_code_regex: {
      type: DataTypes.STRING(200),
      allowNull: true
    },
    languages: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    neighbours: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    equivalent_fips_code: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    active: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: 1
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
    tableName: 'qr_countries',
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
