const like = (sequelize, DataTypes) => {
    const Likes = sequelize.define('Likes', {
        userId: {
          type: DataTypes.INTEGER,
          allowNull: false,
          // this throws off sequelize
          //primaryKey: true,
          references: {
            model: 'Users',
            key: 'id'
          }
        },
        reviewId: {
          type: DataTypes.INTEGER,
          allowNull: false,
          // this throws off sequelize
          //primaryKey: true,
          references: {
            model: 'Reviews',
            key: 'id'
          }
        }
        }, {
        sequelize,
        tableName: 'Likes',
        schema: 'public',
        timestamps: true,
        indexes: [
          {
            name: "likes_pkey",
            fields: [
              { name: "userId" },
              { name: "reviewId" },
            ]
          },
        ]
        });

        Likes.associate = models => {
            //Likes.belongsTo(models.Reviews, { as: "review", foreignKey: "reviewId"});
            //Likes.belongsTo(models.Users, {as: "likes", foreignKey: "userId"})
        };

    return Likes;
};

export default like;
