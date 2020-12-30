
const like = (sequelize, DataTypes) => {
    const Like = sequelize.define('like', {
        // could easily make this have different reactions such as
        // like, dislike, etc.
    });

    return Like;
};

export default like;
