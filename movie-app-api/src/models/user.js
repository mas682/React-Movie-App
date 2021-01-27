
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
        User.hasMany(models.ReviewGoodTags, { foreignKey: { allowNull: false}});
        User.hasMany(models.ReviewBadTags, { foreignKey: { allowNull: false}});
        User.belongsToMany(models.Review, { as: "LikedPosts", through: models.Like, onDelete: 'CASCADE' });
        User.belongsToMany(models.Movies, {as: "WatchList", through: models.UserWatchList, onDelete: 'CASCADE'});
        User.belongsToMany(models.Movies, {as: "WatchedMovie", through: models.UsersWhoWatched, onDelete: 'CASCADE'});
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

    User.getAllFollowers = async (userId) => {
        console.log(userId);
        let user = await User.findOne({
            where: {id: userId},
            attributes: ["id", "username"],
            include: {
                model: User,
                as: "Following",
                attributes: ["id"],
                through: {attributes: []}
            }
        });
        let followers = await User.findOne({
            where: {id: userId},
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
                where: {id: followedId},
                // include the user
                required: false
            },
        });
        // returns null if follower not found
        return user;
    };

    // function to get a user and a user who follows them
    User.findWithFollowing = async (username, follower) =>
    {
        let user = await User.findOne({
            where: { username: username },
            include: {
                // include the user that is followed
                model: User,
                as: "Followers",
                where: {id: follower},
                // include the user
                required: false
            },
        });
        // returns null if follower not found
        return user;
    };

    // function to return all followers from a friends list of followers that
    // the requesting user also follows
    // friendName is the username of the user whose friends list you are checking
    // userId is the user id of the requesting user
    User.getFollowers = async (friendName, userId) => {
        let user = await User.findByLogin(friendName);
        if(user === null)
        {
            return null;
        }
        let followers = await user.getFollowers({
            attributes: ["username"],
            include:[
                {
                    model: User,
                    as: "Followers",
                    attributes:["username"],
                    where: {id: userId},
                    required: false
                }
            ]
        });
        return followers;
    };

    // function to return all of the users that a user follows that the
    // requesting user also follows
    // friendName is the username fo the user whose friends list you are checking
    // userId is the user id of the requesting user
    User.getFollowing = async (friendName, userId) => {
        let user = await User.findByLogin(friendName);
        if(user === null)
        {
            return null;
        }
        let following = await user.getFollowing({
            attributes: ["username"],
            include:[
                {
                    model: User,
                    as: "Followers",
                    attributes: ["username"],
                    where: {id: userId},
                    required: false
                }
            ]
        });
        return following;
    }

    // function to return all of the movies on a users watch list
    User.getWatchList = async (userId, models) => {
        let user = await models.User.findOne({
            attributes: ["username"],
            where: {id: userId},
            include: {
                model: models.Movies,
                as: "WatchList",
                include: [
                    {
                        model: models.User,
                        as: "UserWatchLists",
                        required: false
                    },
                    {
                        model: models.User,
                        as: "UsersWhoWatched",
                        required: false
                    },
                    {
                        model: models.Genre,
                        as: "Genres",
                        attributes: ["id", "value"],
                        through: {attributes: []}
                    }
                ]
            }
        });
        if(user === null)
        {
            return null;
        }
        else
        {
            return user.WatchList;
        }
    }

    // function to return all of the movies on a users watched list
    User.getWatchedList = async (userId, models) => {
        let user = await models.User.findOne({
            where: {id: userId},
            include: {
                model: models.Movies,
                as: "WatchedMovie",
                include: [
                    {
                        model: models.User,
                        as: "UsersWhoWatched",
                        required: false
                    },
                    {
                        model: models.Genre,
                        as: "Genres",
                        attributes: ["id", "value"],
                        through: {attributes: []}
                    },
                    {
                        model: models.User,
                        as: "UserWatchLists",
                        required: false
                    }
                ]
            }
        });
        if(user === null)
        {
            return null;
        }
        else
        {
            return user.WatchedMovie;
        }
    }

    // function to get a list of users who match the value passed in
    // username is the username to look for
    // count is the maximum number of users to return
    User.findUsers = async (username, count, offset) => {
        //let endsWith = "%" + username;
        let contains = "%" + username + "%";
        let startsWith = username + "%";
        let users = await User.findAll({
            limit: count,
            offset: offset,
            where: {
                username: {
                    [Op.or]: [username, {[Op.iLike]: startsWith}, {[Op.iLike]: contains}]
                }
            },
            order: [
                sequelize.literal(`CASE
                    WHEN upper("user"."username") = upper('${username}') then 0
                    ELSE 1
                    END ASC`),
                ['username', 'ASC']
            ],
            attributes: ["id", "username", "firstName", "lastName"]
        });
        return users;
    };



    return User;
};

export default user;
