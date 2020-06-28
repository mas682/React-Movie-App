const reviewBadTags = (sequelize, DataTypes) => {
    const ReviewBadTags= sequelize.define('ReviewBadTags', {
    userID: DataTypes.INTEGER
    },
    { timestamps: false });

    return ReviewBadTags;
};

export default reviewBadTags;
