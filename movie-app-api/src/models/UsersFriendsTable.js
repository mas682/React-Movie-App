const usersFriends = (sequelize, DataTypes) => {
    const UsersFriends= sequelize.define('UsersFriends', {
        followedId: {
          type: DataTypes.INTEGER,
          allowNull: false,
          primaryKey: true,
          references: {
            model: 'users',
            key: 'id'
          }
        },
        followerId: {
          type: DataTypes.INTEGER,
          allowNull: false,
          primaryKey: true,
          references: {
            model: 'users',
            key: 'id'
          }
        }
      }, {
        sequelize,
        tableName: 'UsersFriends',
        schema: 'public',
        timestamps: true,
        indexes: [
          {
            name: "UsersFriends_pkey",
            unique: true,
            fields: [
              { name: "followedId" },
              { name: "followerId" },
            ]
          },
        ]
    });

    UsersFriends.associate = models => {
        UsersFriends.belongsTo(models.Users, { as: "followedFriend", foreignKey: "followedId"});
        UsersFriends.belongsTo(models.Users, { as: "followerFriend", foreignKey: "followerId"});
    };


    return UsersFriends;
};

export default usersFriends;
