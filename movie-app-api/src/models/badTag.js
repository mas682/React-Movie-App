


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

    // associate users with reviews
    // one to many relationship
    // each user can have many reviews
    BadTag.associate = models => {
        // the CASCADE says if the user is deleted, delete all
        // messages associated with the user
        BadTag.belongsToMany(models.Review, { onDelete: 'CASCADE',
                                            through: 'Review_BadTags'
                                            }
        );
    };

    return BadTag;
};

export default badTag;
