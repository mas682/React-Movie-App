
const Op = require('Sequelize').Op;

const user = (sequelize, DataTypes) => {
    const User = sequelize.define('Users', {
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
          type: DataTypes.STRING(50),
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
          type: DataTypes.STRING(30),
          allowNull: false
        },
        lastName: {
          type: DataTypes.STRING(30),
          allowNull: false
        },
        profileDescription: {
          type: DataTypes.STRING(500),
          allowNull: true
        },
        picture: {
          type: DataTypes.INTEGER,
          allowNull: true,
          defaultValue: 0
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
        tableName: 'Users',
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
          {
            name: "users_salt_key",
            unique: true,
            fields: [
              { name: "salt" },
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
        //User.hasMany(models.Reviews, {as: "userId", onDelete: 'CASCADE' });
        User.hasMany(models.Comments,{ onDelete: 'CASCADE' });
        User.hasMany(models.ReviewGoodTags, { foreignKey: { allowNull: false}, foreignKey: "userId"});
        User.hasMany(models.ReviewBadTags, { foreignKey: { allowNull: false}, foreignKey: "userId"});
        User.belongsToMany(models.Reviews, { as: "LikedPosts", through: models.Likes, onDelete: 'CASCADE' });
        User.belongsToMany(models.Movies, {as: "WatchList", through: models.UserWatchLists, onDelete: 'CASCADE', foreignKey: "userId", otherKey: "movieId" });
        User.belongsToMany(models.Movies, {as: "WatchedList", through: models.UsersWatchedMovies, onDelete: 'CASCADE', foreignKey: "userId", otherKey: "movieId" });
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
        // https://stackoverflow.com/questions/63657141/sequelize-joined-table-column-names-for-belongstomany-association
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
        // https://stackoverflow.com/questions/63657141/sequelize-joined-table-column-names-for-belongstomany-association
        User.belongsToMany(models.Reviews,
             { as: "user",
              through: models.Likes,
              foreignKey: "userId",
              otherKey: "reviewId",
              onDelete: 'CASCADE'
          }
        );
        //User.hasMany(UserVerificationQuestions, { as: "UserVerificationQuestions", foreignKey: "userId"});
        User.hasMany(models.UsersFriends, { as: "UsersFriends", foreignKey: "followedId"});
        User.hasMany(models.UsersFriends, { as: "follower_UsersFriends", foreignKey: "followerId"});
        User.hasMany(models.Comments, { as: "userComments", foreignKey: "userId"});
        User.hasMany(models.Likes, { as: "likes", foreignKey: "userId"});
        User.hasMany(models.Reviews, { as: "userReviews", foreignKey: "userId"});
        User.hasMany(models.UserWatchLists, { as: "UserWatchList", foreignKey: "userId"});
        User.hasMany(models.UsersWatchedMovies, { as: "UserWatchedList", foreignKey: "userId"});
        User.hasMany(models.UserSessions, {as: "sessions", onDelete: 'CASCADE', foreignKey: "userId"});
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
            attributes: ["username", [sequelize.fn('concat',"https://movie-fanatics-bucket1.s3.amazonaws.com/UserPictures/default-pic-",
             sequelize.col("Users.picture"), '.jpg'), "picture"]],
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
            attributes: ["username", [sequelize.fn('concat',"https://movie-fanatics-bucket1.s3.amazonaws.com/UserPictures/default-pic-",
             sequelize.col("Users.picture"), '.jpg'), "picture"]],
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
                    model: models.Users,
                    as: "WatchList",
                    required: true,
                    where: {id: userId},
                    attributes: ["username"],
                    through: {
                        attributes: []
                    }
                },
                {
                    model: models.Users,
                    as: "WatchedList",
                    required: false,
                    where: {id: userId},
                    attributes: ["username"],
                    through: {
                        attributes: []
                    }
                },
                {
                    model: models.Genres,
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
                    model: models.Users,
                    as: "WatchList",
                    required: false,
                    where: {id: userId},
                    attributes: ["username"],
                    through: {
                        attributes: []
                    }
                },
                {
                    model: models.Users,
                    as: "WatchedList",
                    required: true,
                    where: {id: userId},
                    attributes: ["username"],
                    through: {
                        attributes: []
                    }
                },
                {
                    model: models.Genres,
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
                    WHEN upper("Users"."username") = upper('${username}') then 0
                    ELSE 1
                    END ASC`),
                ['username', 'ASC']
            ],
            attributes: ["username", "firstName", "lastName", [sequelize.fn('concat',"https://movie-fanatics-bucket1.s3.amazonaws.com/UserPictures/default-pic-",
             sequelize.col("Users.picture"), '.jpg'), "picture"]]
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
