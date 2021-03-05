const userWatchList = (sequelize, DataTypes) => {
    const UserWatchList = sequelize.define('userWatchList', {
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
        tableName: 'userWatchLists',
        schema: 'public',
        timestamps: true,
        indexes: [
          {
            name: "userWatchLists_pkey",
            unique: true,
            fields: [
              { name: "userId" },
              { name: "movieId" },
            ]
          },
        ]
    });

    UserWatchList.associate = models => {
        UserWatchList.belongsTo(models.User, { as: "user", foreignKey: "userId"});
        UserWatchList.belongsTo(models.Movies, { as: "movie", foreignKey: "movieId"});
    }

    return UserWatchList;
};

export default userWatchList;
