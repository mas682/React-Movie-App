const reviewBadTags = (sequelize, DataTypes) => {
    const ReviewBadTags= sequelize.define('ReviewBadTags', {},);

    ReviewBadTags.associate = models => {
        ReviewBadTags.belongsTo(models.User, {onDelete: 'CASCADE'});
    };

    return ReviewBadTags;
};

export default reviewBadTags;
