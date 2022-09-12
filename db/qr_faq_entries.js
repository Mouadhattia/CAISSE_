const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('qr_faq_entries', {
    faq_id: {
      autoIncrement: true,
      type: DataTypes.MEDIUMINT.UNSIGNED,
      allowNull: false,
      primaryKey: true
    },
    translation_lang: {
      type: DataTypes.STRING(10),
      allowNull: true
    },
    translation_of: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true
    },
    parent_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true
    },
    faq_pid: {
      type: DataTypes.SMALLINT,
      allowNull: false,
      defaultValue: 0
    },
    faq_weight: {
      type: DataTypes.MEDIUMINT,
      allowNull: false,
      defaultValue: 0
    },
    faq_title: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    faq_content: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    active: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: 1
    }
  }, {
    sequelize,
    tableName: 'qr_faq_entries',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "faq_id" },
        ]
      },
    ]
  });
};
