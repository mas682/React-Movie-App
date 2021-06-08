const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('FeaturedMovies', {
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    movieId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'movies',
        key: 'id'
      },
      unique: "FeaturedMovies_uniq_key"
    },
    order: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    }
  }, {
    sequelize,
    tableName: 'FeaturedMovies',
    schema: 'public',
    hasTrigger: true,
    timestamps: true,
    indexes: [
      {
        name: "FeaturedMovies_pkey",
        unique: true,
        fields: [
          { name: "id" },
        ]
      },
      {
        name: "FeaturedMovies_uniq_key",
        unique: true,
        fields: [
          { name: "movieId" },
        ]
      },
    ]
  });
};
