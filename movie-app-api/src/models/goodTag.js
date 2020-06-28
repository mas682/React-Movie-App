


const goodTag = (sequelize, DataTypes) => {
    const GoodTag = sequelize.define('goodTag', {
        // create a username field
        value: {
            // set the data type to string
            type: DataTypes.STRING,
            // make the value be unique
            unique: true,
            // do not allow this to be empty
            allowNull: false,
            // validate that it is not empty
            validate: {
                notEmpty: true,
            }
        },
    });

    // associate bad tags with reviews
    // each tag can belong to many reviews
    GoodTag.associate = models => {
        GoodTag.belongsToMany(models.Review, {through: models.ReviewGoodTags});
    };

    return GoodTag;
};

export default goodTag;
