const review = (sequelize, DataTypes) => {
    const Review = sequelize.define('review', {
        text: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            notEmpty: true,
        },
        }
    });

    Review.associate = models => {
        Review.belongsTo(models.User);
    };

    return Review;
};

export default review;
