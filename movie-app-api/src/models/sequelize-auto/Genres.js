const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('Genres', {
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    value: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: "Genres_value_key"
    }
  }, {
    sequelize,
    tableName: 'Genres',
    schema: 'public',
    hasTrigger: true,
    timestamps: true,
    indexes: [
      {
        name: "Genres_pkey",
        unique: true,
        fields: [
          { name: "id" },
        ]
      },
      {
        name: "Genres_value_key",
        unique: true,
        fields: [
          { name: "value" },
        ]
      },
    ]
  });
};
