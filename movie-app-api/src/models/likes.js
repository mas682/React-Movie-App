
const like = (sequelize, DataTypes) => {
    const Likes = sequelize.define('like', {
        userId: {
          type: DataTypes.INTEGER,
          allowNull: false,
          primaryKey: true,
          references: {
            model: 'users',
            key: 'id'
          }
        },
        reviewId: {
          type: DataTypes.INTEGER,
          allowNull: false,
          primaryKey: true,
          references: {
            model: 'reviews',
            key: 'id'
          }
        }
        }, {
        sequelize,
        tableName: 'likes',
        schema: 'public',
        timestamps: true,
        indexes: [
          {
            name: "likes_pkey",
            unique: true,
            fields: [
              { name: "userId" },
              { name: "reviewId" },
            ]
          },
        ]
        });

        Likes.associate = models => {
            Likes.belongsTo(models.Review, { as: "review", foreignKey: "reviewId"});
        };

    return Likes;
};

export default like;
