const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('reviews', {
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    rating: {
      type: DataTypes.DECIMAL,
      allowNull: false
    },
    review: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id'
      },
      unique: "reviews_userId_movieId_key"
    },
    movieId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'movies',
        key: 'id'
      },
      unique: "reviews_userId_movieId_key"
    }
  }, {
    sequelize,
    tableName: 'reviews',
    schema: 'public',
    hasTrigger: true,
    timestamps: true,
    indexes: [
      {
        name: "reviews_pkey",
        unique: true,
        fields: [
          { name: "id" },
        ]
      },
      {
        name: "reviews_userId_movieId_key",
        unique: true,
        fields: [
          { name: "userId" },
          { name: "movieId" },
        ]
      },
    ]
  });
};
