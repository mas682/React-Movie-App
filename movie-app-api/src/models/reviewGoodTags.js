const reviewGoodTags = (sequelize, DataTypes) => {
    const ReviewGoodTags= sequelize.define('ReviewGoodTags', {
    userID: DataTypes.INTEGER
    },
    { timestamps: false });

    return ReviewGoodTags;
};

export default reviewGoodTags;
