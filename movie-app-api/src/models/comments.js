const comment = (sequelize, DataTypes) => {
    const Comment = sequelize.define('comment', {
        // create a username field
        value: {
            // set the data type to string
            type: DataTypes.TEXT,
            // do not allow this to be empty
            allowNull: true,
            // validate that it is not empty
            // will probably want to set limit on comment length
            validate: {
                notEmpty: true,
            }
        },
    });

    // associate bad tags with reviews
    // each tag can belong to many reviews
    Comment.associate = models => {
        Comment.belongsTo(models.Review);
        Comment.belongsTo(models.User);
    };

    return Comment;
};

export default comment;
