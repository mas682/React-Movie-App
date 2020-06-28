const review = (sequelize, DataTypes) => {
    const Review = sequelize.define('review', {
        title: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                notEmpty: true,
            },
        },
        rating: {
            type: DataTypes.DECIMAL(10,2),
            allowNull: false,
            validate: {
                notEmpty: true,
            },
        },
        review: {
            type: DataTypes.STRING,
            allowNull: true,
        },
    });

    Review.associate = models => {
        Review.belongsTo(models.User);
        Review.belongsToMany(models.GoodTag, {through: models.ReviewGoodTags});
        Review.belongsToMany(models.BadTag, {through: models.ReviewBadTags});
    };

    return Review;
};

export default review;
