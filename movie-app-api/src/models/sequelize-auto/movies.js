const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('movies', {
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    title: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    revenue: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    director: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    runTime: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    rating: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    trailer: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    backgroundImage: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    releaseDate: {
      type: DataTypes.DATEONLY,
      allowNull: true
    },
    overview: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    poster: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    premiereReleaseDate: {
      type: DataTypes.DATEONLY,
      allowNull: true
    },
    theaterLimitedReleaseDate: {
      type: DataTypes.DATEONLY,
      allowNull: true
    },
    theaterReleaseDate: {
      type: DataTypes.DATEONLY,
      allowNull: true
    },
    digitalReleaseDate: {
      type: DataTypes.DATEONLY,
      allowNull: true
    },
    physicalReleaseDate: {
      type: DataTypes.DATEONLY,
      allowNull: true
    },
    tvReleaseDate: {
      type: DataTypes.DATEONLY,
      allowNull: true
    },
    status: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    homepage: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    imdb_id: {
      type: DataTypes.STRING(100),
      allowNull: true,
      unique: "movies_imdb_id_key"
    },
    tmdb_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: "movies_tmdb_id_key"
    },
    originalLanguage: {
      type: DataTypes.STRING(20),
      allowNull: true
    },
    userRating: {
      type: DataTypes.DECIMAL,
      allowNull: false,
      defaultValue: 0.0
    },
    totalUserRatings: {
      type: DataTypes.BIGINT,
      allowNull: false,
      defaultValue: 0
    }
  }, {
    sequelize,
    tableName: 'movies',
    schema: 'public',
    hasTrigger: true,
    timestamps: true,
    indexes: [
      {
        name: "movies_imdb_id_key",
        unique: true,
        fields: [
          { name: "imdb_id" },
        ]
      },
      {
        name: "movies_pkey",
        unique: true,
        fields: [
          { name: "id" },
        ]
      },
      {
        name: "movies_tmdb_id_key",
        unique: true,
        fields: [
          { name: "tmdb_id" },
        ]
      },
    ]
  });
};
