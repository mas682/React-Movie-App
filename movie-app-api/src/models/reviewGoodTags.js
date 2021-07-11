const reviewGoodTags = (sequelize, DataTypes) => {
    const ReviewGoodTags= sequelize.define('ReviewGoodTags', {
        userId: {
          type: DataTypes.INTEGER,
          allowNull: false,
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
        },
        movieTagId: {
          type: DataTypes.INTEGER,
          allowNull: false,
          primaryKey: true,
          references: {
            model: 'movieTags',
            key: 'id'
          }
        }
      }, {
        sequelize,
        tableName: 'ReviewGoodTags',
        schema: 'public',
        timestamps: true,
        indexes: [
          {
            name: "ReviewGoodTags_pkey",
            unique: true,
            fields: [
              { name: "reviewId" },
              { name: "movieTagId" },
            ]
          },
        ]
    });

    ReviewGoodTags.associate = models => {
        ReviewGoodTags.belongsTo(models.Users, {onDelete: 'CASCADE', foreignKey: "userId"});
        ReviewGoodTags.belongsTo(models.Reviews, {foreignKey: "reviewId"});
    };

    return ReviewGoodTags;
};


export default reviewGoodTags;
