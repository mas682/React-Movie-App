


const badTag = (sequelize, DataTypes) => {
    const BadTag = sequelize.define('badTag', {
        // create a username field
        value: {
            // set the data type to string
            type: DataTypes.STRING,
            // make the value be unique
            unique: true,
            // do not allow this to be empty
            allowNull: true,
            // validate that it is not empty
            validate: {
                notEmpty: true,
            }
        },
    });

    // associate bad tags with reviews
    // each tag can belong to many reviews
    BadTag.associate = models => {
        BadTag.belongsToMany(models.Review, { through: models.ReviewBadTags});
    };

    return BadTag;
};

export default badTag;
