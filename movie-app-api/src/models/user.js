


const user = (sequelize, DataTypes) => {
    const User = sequelize.define('user', {
        // create a username field
        username: {
        // set the data type to string
        type: DataTypes.STRING,
        // make the value be unique
        unique: true,
        // do not allow this to be empty
        allowNull: false,
        // validate that it is not empty
        validate: {
            notEmpty: true,
        },
        },
    });

    // associate users with reviews
    // one to many relationship
    // each user can have many reviews
    User.associate = models => {
        // the CASCADE says if the user is deleted, delete all
        // messages associated with the user
        User.hasMany(models.Review, { onDelete: 'CASCADE' });
    };

    // method to find a user by username or email if email were in the
    // database yet
    User.findByLogin = async login => {
        let user = await User.findOne({
            where: { username: login },
        });

        if (!user) {
            user = await User.findOne({
            where: { email: login },
            });
        }

        return user;
    };

    return User;
};

export default user;
