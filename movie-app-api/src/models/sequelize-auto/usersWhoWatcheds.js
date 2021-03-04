const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('usersWhoWatcheds', {
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      references: {
        model: 'users',
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
    tableName: 'usersWhoWatcheds',
    schema: 'public',
    timestamps: true,
    indexes: [
      {
        name: "usersWhoWatcheds_pkey",
        unique: true,
        fields: [
          { name: "userId" },
          { name: "movieId" },
        ]
      },
    ]
  });
};
