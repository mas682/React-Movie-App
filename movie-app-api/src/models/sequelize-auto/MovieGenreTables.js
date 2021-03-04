const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('MovieGenreTables', {
    GenreId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      references: {
        model: 'Genres',
        key: 'id'
      }
    },
    movieId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      references: {
        model: 'movies',
        key: 'id'
      }
    }
  }, {
    sequelize,
    tableName: 'MovieGenreTables',
    schema: 'public',
    timestamps: false,
    indexes: [
      {
        name: "MovieGenreTables_pkey",
        unique: true,
        fields: [
          { name: "GenreId" },
          { name: "movieId" },
        ]
      },
    ]
  });
};
