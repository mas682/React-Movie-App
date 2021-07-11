const usersWatchedMovies = (sequelize, DataTypes) => {
    const UsersWatchedMovies = sequelize.define('UsersWatchedMovies', {
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
        tableName: 'UsersWatchedMovies',
        schema: 'public',
        timestamps: true,
        indexes: [
          {
            name: "UsersWatchedMovies_pkey",
            unique: true,
            fields: [
              { name: "userId" },
              { name: "movieId" },
            ]
          },
        ]
     });

     UsersWatchedMovies.associate = models => {
         UsersWatchedMovies.belongsTo(models.Movies, { as: "movie", foreignKey: "movieId"});
         UsersWatchedMovies.belongsTo(models.Users, { as: "user", foreignKey: "userId"});
     };

    return UsersWatchedMovies;
};

export default usersWatchedMovies;
