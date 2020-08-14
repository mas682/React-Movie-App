
const like = (sequelize, DataTypes) => {
    const Like = sequelize.define('like', {
        // could easily make this have different reactions such as
        // like, dislike, etc.
    });

    // associate bad tags with reviews
    // each tag can belong to many reviews
    /*
    Like.associate = models => {
        Like.belongsTo(models.Review);
        Like.belongsTo(models.User);
    };
    */
    return Like;
};

export default like;
