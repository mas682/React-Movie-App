


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
            }
        },
        email: {
            type: DataTypes.STRING,
            unique: true,
            allowNull: false,
            validate: {
                notEmpty: true,
            }
        },
        password: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                notEmpty: true,
            }
        },
        firstName: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                notEmpty: true,
            }
        },
        lastName: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                notEmpty: true,
            }
        },
    });

    // associate users with reviews
    // one to many relationship
    // each user can have many reviews
    User.associate = models => {
        // the CASCADE says if the user is deleted, delete all
        // messages associated with the user
        User.hasMany(models.Review, { onDelete: 'CASCADE' });
        User.hasMany(models.Comment,{ onDelete: 'CASCADE' });
        // Below is used to associate users together
        // this belongsToMany sets the followed users Id to the user being followed
        User.belongsToMany(User, {
            // table name
            through: models.UsersFriends,
            // how to reference the users who follow this user
            // ex. user.addFollower or user.getFollowers
            as: {
                singular: 'Follower',
                plural: 'Followers'
            },
            foreignKey: 'followedId',
        });
        // this belongsToMany sets the followerId to the currecnt user
        User.belongsToMany(User, {
            // table name
            through: models.UsersFriends,
            // how to reference the users who the user is following
            // ex. user.addFollow or user.getFollowing
            as: {
                singular: 'Follow',
                plural: 'Following'
            },
            foreignKey: 'followerId',
        });
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
        console.log(user);
        return user;
    };

    User.findWithFollower = async (login, followerId) => {
        let user = await User.findOne({
            where: { username: login },
            include: {
                model: User,
                as: "Following",
                where: {id: followerId}
            },
        });
        // returns null if follower not found
        return user;
    };

    return User;
};

export default user;
