
const Op = require('Sequelize').Op;

const user = (sequelize, DataTypes) => {
    const User = sequelize.define('user', {
        id: {
          autoIncrement: true,
          type: DataTypes.INTEGER,
          allowNull: false,
          primaryKey: true
        },
        username: {
          type: DataTypes.STRING(20),
          allowNull: false,
          unique: "users_username_key"
        },
        email: {
          type: DataTypes.STRING(100),
          allowNull: false,
          unique: "users_email_key"
        },
        password: {
          type: DataTypes.STRING(44),
          allowNull: false
        },
        salt: {
            type: DataTypes.STRING(44),
            allowNull: false
        },
        firstName: {
          type: DataTypes.STRING(20),
          allowNull: false
        },
        lastName: {
          type: DataTypes.STRING(20),
          allowNull: false
        },
        profileDescription: {
          type: DataTypes.STRING(500),
          allowNull: true
        },
        picture: {
          type: DataTypes.STRING(50),
          allowNull: true
        },
        admin: {
          type: DataTypes.BOOLEAN,
          allowNull: false,
          defaultValue: false
        },
        verified: {
          type: DataTypes.BOOLEAN,
          allowNull: false,
          defaultValue: false
        },
        verificationLocked: {
            type: DataTypes.DATE
        },
        verificationAttempts: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0
        },
        passwordAttempts: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0
        },
        lastLogin: {
          type: DataTypes.DATE,
          allowNull: false,
          defaultValue: sequelize.literal('CURRENT_TIMESTAMP')
        },
        passwordUpdatedAt: {
          type: DataTypes.DATE,
          allowNull: false,
          defaultValue: sequelize.literal('CURRENT_TIMESTAMP')
        }
      }, {
        sequelize,
        tableName: 'users',
        schema: 'public',
        timestamps: true,
        indexes: [
          {
            name: "users_email_key",
            unique: true,
            fields: [
              { name: "email" },
            ]
          },
          {
            name: "users_pkey",
            unique: true,
            fields: [
              { name: "id" },
            ]
          },
          {
            name: "users_username_key",
            unique: true,
            fields: [
              { name: "username" },
            ]
          },
        ]
      });

    // associate users with reviews
    // one to many relationship
    // each user can have many reviews
    User.associate = models => {
        // the CASCADE says if the user is deleted, delete all
        // messages associated with the user
        User.hasMany(models.Review, { onDelete: 'CASCADE' });
        User.hasMany(models.Comment,{ onDelete: 'CASCADE' });
        User.hasMany(models.ReviewGoodTags, { foreignKey: { allowNull: false}, foreignKey: "userId"});
        User.hasMany(models.ReviewBadTags, { foreignKey: { allowNull: false}, foreignKey: "userId"});
        User.belongsToMany(models.Review, { as: "LikedPosts", through: models.Like, onDelete: 'CASCADE' });
        User.belongsToMany(models.Movies, {as: "WatchList", through: models.UserWatchList, onDelete: 'CASCADE', foreignKey: "userId", otherKey: "movieId" });
        User.belongsToMany(models.Movies, {as: "WatchedMovie", through: models.UsersWhoWatched, onDelete: 'CASCADE', foreignKey: "userId", otherKey: "movieId" });
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
            otherKey: "followerId"
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
            otherKey: "followedId"
        });
        User.belongsToMany(models.Review, { as: 'user', through: models.Like, foreignKey: "userId", otherKey: "reviewId" });
        //User.hasMany(UserVerificationQuestions, { as: "UserVerificationQuestions", foreignKey: "userId"});
        User.hasMany(models.UsersFriends, { as: "UsersFriends", foreignKey: "followedId"});
        User.hasMany(models.UsersFriends, { as: "follower_UsersFriends", foreignKey: "followerId"});
        User.hasMany(models.Comment, { as: "userComments", foreignKey: "userId"});
        User.hasMany(models.Like, { as: "userLikes", foreignKey: "userId"});
        User.hasMany(models.Review, { as: "userReviews", foreignKey: "userId"});
        User.hasMany(models.UserWatchList, { as: "userWatchLists", foreignKey: "userId"});
        User.hasMany(models.UsersWhoWatched, { as: "usersWhoWatcheds", foreignKey: "userId"});
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
    User.getFollowers = async (friendName, userId, models) => {
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
                    required: false,
                    through: {attributes:[]}
                },
                {
                    model: models.UsersFriends,
                    as: "UsersFriends",
                    attributes: []
                }
            ]
        });
        return followers;
    };

    // function to return all of the users that a user follows that the
    // requesting user also follows
    // friendName is the username fo the user whose friends list you are checking
    // userId is the user id of the requesting user
    User.getFollowing = async (friendName, userId, models) => {
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
                    required: false,
                    through: {attributes: []}
                },
                {
                    model: models.UsersFriends,
                    as: "UsersFriends",
                    attributes: []
                }
            ]
        });
        return following;
    }

    // function to return all of the movies on a users watch list
    User.getWatchList = async (userId, models, max, offset) => {
        let movies = await models.Movies.findAll({
            limit: max,
            offset: offset,
            include: [
                {
                    model: models.User,
                    as: "UserWatchLists",
                    required: true,
                    where: {id: userId},
                    attributes: ["username"],
                    through: {
                        attributes: []
                    }
                },
                {
                    model: models.User,
                    as: "UsersWhoWatched",
                    required: false,
                    where: {id: userId},
                    attributes: ["username"],
                    through: {
                        attributes: []
                    }
                },
                {
                    model: models.Genre,
                    as: "Genres",
                    attributes: ["id", "value"],
                    through: {attributes: []}
                }
            ]
        });
        return movies;
    }

    // function to return all of the movies on a users watched list
    User.getWatchedList = async (userId, models, max, offset) => {
        let movies = await models.Movies.findAll({
            limit: max,
            offset: offset,
            include: [
                {
                    model: models.User,
                    as: "UserWatchLists",
                    required: false,
                    where: {id: userId},
                    attributes: ["username"],
                    through: {
                        attributes: []
                    }
                },
                {
                    model: models.User,
                    as: "UsersWhoWatched",
                    required: true,
                    where: {id: userId},
                    attributes: ["username"],
                    through: {
                        attributes: []
                    }
                },
                {
                    model: models.Genre,
                    as: "Genres",
                    attributes: ["id", "value"],
                    through: {attributes: []}
                }
            ]
        });
        return movies;
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
            attributes: ["username", "firstName", "lastName", "picture"]
        });
        return users;
    };

    // function to see if a user has a picture name associated with them
    User.hasPictureFileName = async(file) => {
        let users = await User.findAll({
            where: {
                picture: file
            }
        });
        if(users.length > 0)
        {
            return true;
        }
        return false;
    };



    return User;
};

export default user;
