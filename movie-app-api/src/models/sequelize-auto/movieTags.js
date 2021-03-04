const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('movieTags', {
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    value: {
      type: DataTypes.STRING(255),
      allowNull: true,
      unique: "movieTags_value_key"
    }
  }, {
    sequelize,
    tableName: 'movieTags',
    schema: 'public',
    timestamps: true,
    indexes: [
      {
        name: "movieTags_pkey",
        unique: true,
        fields: [
          { name: "id" },
        ]
      },
      {
        name: "movieTags_value_key",
        unique: true,
        fields: [
          { name: "value" },
        ]
      },
    ]
  });
};
