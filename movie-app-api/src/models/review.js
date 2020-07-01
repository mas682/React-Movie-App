

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

    Review.findById = async (models,id) => {
        let reviews = await Review.findAll({
            where: {
                userId: id
            }, include:
                [{model: models.GoodTag}, {model: models.BadTag}]
        });
        return reviews;
    }

    return Review;
};

export default review;
