
const Op = require('Sequelize').Op;

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
        return user;
    };

    User.getAllFollowers = async (uname) => {
        let followers = await User.findOne({
            where: {username: uname},
        }).then((user) => {
            return user.getFollowing().then((users) => {
                return users;
            });
        });
        return followers;
    }

    // method to find a user along with a specific user that they follow
    // takes in the users username and the the user that they follows id number
    // returns null if the user does not follow the user
    User.findWithFollower = async (login, followedId) => {
        let user = await User.findOne({
            where: { username: login },
            include: {
                // include the user that is followed
                model: User,
                as: "Following",
                where: {id: followedId}
            },
        });
        // returns null if follower not found
        return user;
    };

    // function to return all followers from a friends list of followers that
    // the requesting user also follows
    // friendName is the username of the user whose friends list you are checking
    // userId is the user id of the requesting user
    User.getMutualFollowers = async (friendName, userId) => {
        let user = await User.findByLogin(friendName);
        if(user === null)
        {
            return null;
        }
        let mutualFollowers = await user.getFollowers({
            include:[
                {
                    model: User,
                    as: "Followers",
                    where: {id: userId}
                }
            ]
        });
        return mutualFollowers;
    };

    // function to return all followers from a friends list of followers that
    // the requesting user does not follow
    // friendName is the username of the user whose friends list you are checking
    // userId is the user id of the requesting user
    // ids is an array of user ids that the requester already follows
    User.getNotFollowedFollowers = async (friendName, userId, ids) => {
        let user = await User.findByLogin(friendName);
        if(user === null)
        {
            return null;
        }
        let notMutualFollowers = await user.getFollowers({
                where: {id:{[Op.notIn]:ids}},
                include:[
                    {
                        model: User,
                        as: "Followers",
                    }
                ]
        });
        return notMutualFollowers;
    };

    // function to return all of the users that a user follows that the
    // requesting user also follows
    // friendName is the username fo the user whose friends list you are checking
    // userId is the user id of the requesting user
    User.getMutualFollowing = async (friendName, userId) => {
        let user = await User.findByLogin(friendName);
        if(user === null)
        {
            return null;
        }
        let mutualFollowing = await user.getFollowing({
            include:[
                {
                    model: User,
                    as: "Followers",
                    where: {id: userId}
                }
            ]
        });
        return mutualFollowing;
    }

    // funciton to return all of the users that a user follows that the
    // requesting user does not follow
    // friendName is the username of the user whose friends list you are checking
    // userId is the user id of the requesting user
    // ids is an array of user ids that the requester already follows
    User.getNotFollowedFollowing = async (friendName, userId, ids) => {
        let user = await User.findByLogin(friendName);
        if(user === null)
        {
            return null;
        }
        let notMutualFollowing = await user.getFollowing({
                // this where is saying ignore the Following user that is the requester
                where: {id:{[Op.notIn]:ids}},
                include:[
                    {
                        model: User,
                        as: "Followers",
                    }
                ]
        });
        return notMutualFollowing;
    };

    return User;
};

export default user;
