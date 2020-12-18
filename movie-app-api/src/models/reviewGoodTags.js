const reviewGoodTags = (sequelize, DataTypes) => {
    const ReviewGoodTags= sequelize.define('ReviewGoodTags', {},);

    ReviewGoodTags.associate = models => {
        ReviewGoodTags.belongsTo(models.User);
    };

    return ReviewGoodTags;
};


export default reviewGoodTags;
