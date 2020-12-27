const reviewGoodTags = (sequelize, DataTypes) => {
    const ReviewGoodTags= sequelize.define('ReviewGoodTags', {},);

    ReviewGoodTags.associate = models => {
        ReviewGoodTags.belongsTo(models.User, {onDelete: 'CASCADE'});
    };

    return ReviewGoodTags;
};


export default reviewGoodTags;
