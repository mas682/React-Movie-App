const usersWhoWatched = (sequelize, DataTypes) => {
    const UsersWhoWatched = sequelize.define('usersWhoWatched', {
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

     UsersWhoWatched.associate = models => {
         UsersWhoWatched.belongsTo(models.Movies, { as: "movie", foreignKey: "movieId"});
         UsersWhoWatched.belongsTo(models.User, { as: "user", foreignKey: "userId"});
     };

    return UsersWhoWatched;
};

export default usersWhoWatched;
