const review_goodTags = (sequelize, DataTypes) => {
    const Review_GoodTags= sequelize.define('Review_GoodTags', {
    userID: DataTypes.INTEGER
    },
    { timestamps: false });

    return Review_GoodTags;
};

export default review_goodTags;
