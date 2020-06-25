


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

    // associate users with reviews
    // one to many relationship
    // each user can have many reviews
    GoodTag.associate = models => {
        // the CASCADE says if the user is deleted, delete all
        // messages associated with the user
        // onDelete: 'CASCADE',
        GoodTag.belongsToMany(models.Review, {through: models.ReviewGoodTags});
        console.log("HERE!!!!!!!!!!!!!!!!!!!!!");
    };

    return GoodTag;
};

export default goodTag;
