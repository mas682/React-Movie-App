
const Op = require('sequelize').Op;
const Logger = require("../shared/logger.js").getLogger();
const caughtErrorHandler = require("../shared/ErrorFunctions.js").caughtErrorHandler;
const appendCallerStack = require("../shared/ErrorFunctions.js").appendCallerStack;

const user = (sequelize, DataTypes) => {
    const User = sequelize.define('Users', {
        id: {
          autoIncrement: true,
          type: DataTypes.BIGINT,
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
          defaultValue: 0,
          references: {
            model: 'DefaultProfilePictures',
            key: 'id'
          }
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
        deleteAt: {
            type: DataTypes.DATE
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
          }
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
        User.belongsTo(models.DefaultProfilePictures, {foreignKey: "picture", as: "profilePicture"});
        User.hasOne(models.UserAuthenticationAttempts, {foreignKey: "userId", as: "authenticationAttempts"});
        User.hasOne(models.UserCredentials, {foreignKey: "userId", as: "credentials"});
        User.hasOne(models.TempVerificationCodes, {foreignKey: "userId"});
    };

    // method to find a user by username or email if email were in the
    // type is either 0, 1, or 2: 0 being a username, 1 being a email, 2 being a id
    // database yet
    User.findByLogin = async (login, type) => {
        let user = undefined;
        if(type === 0)
        {
            user = await User.findOne({
                where: { username: login, verified: true },
            }).catch(error=>{
                let callerStack = new Error().stack;
                appendCallerStack(callerStack, error, undefined, true);
            });
        }
        else if (type === 1) {
            user = await User.findOne({
                where: { email: login, verified: true },
            }).catch(error=>{
                let callerStack = new Error().stack;
                appendCallerStack(callerStack, error, undefined, true);
            });
        }
        else if(type === 2)
        {
            user = await User.findOne({
                where: { id: login, verified: true },
            }).catch(error=>{
                let callerStack = new Error().stack;
                appendCallerStack(callerStack, error, undefined, true);
            });
        }
        else
        {
            throw new Error("Type must be either 0, 1, or 2 type provided: " + type);
        }
        return user;
    };

    // get user, verification record, and credentials
    // type is either 0, 1, or 2: 0 being a username, 1 being a email, 2 being a id
    // username cannot have same format as email can
    User.findByLoginForAuth = async(id, type) => {
        let user = undefined;
        if(type === 0)
        {
            user = await User.findOne({
                where: { 
                    username: id,
                    verified: true
                },
                include: [
                    {
                        model: sequelize.models.UserCredentials,
                        as: "credentials"
                    },
                    {
                        model: sequelize.models.UserAuthenticationAttempts,
                        as: "authenticationAttempts"
                    }
                ]
            }).catch(error=>{
                let callerStack = new Error().stack;
                appendCallerStack(callerStack, error, undefined, true);
            });
        }
        else if(type === 1)
        {
            user = await User.findOne({
                where: { 
                    email: id,
                    verified: true
                },
                include: [
                    {
                        model: sequelize.models.UserCredentials,
                        as: "credentials"
                    },
                    {
                        model: sequelize.models.UserAuthenticationAttempts,
                        as: "authenticationAttempts"
                    }
                ]
            }).catch(error=>{
                let callerStack = new Error().stack;
                appendCallerStack(callerStack, error, undefined, true);
            }); 
        }
        else if(type === 2)
        {
            user = await User.findOne({
                where: { 
                    id: id,
                    verified: true
                },
                include: [
                    {
                        model: sequelize.models.UserCredentials,
                        as: "credentials"
                    },
                    {
                        model: sequelize.models.UserAuthenticationAttempts,
                        as: "authenticationAttempts"
                    }
                ]
            }).catch(error=>{
                let callerStack = new Error().stack;
                appendCallerStack(callerStack, error, undefined, true);
            }); 
        }
        else
        {
            throw new Error("Type must be either 0, 1, or 2 type provided: " + type);
        }

        return user;
    };

    // get user and their verification record
    // type is either 0, 1, or 2: 0 being a username, 1 being a email, 2 being a id
    User.findByLoginForVerification = async(id, type) => {
        let user = undefined;
        if(type === 0)
        {
            user = await User.findOne({
                where: { 
                    username: id,
                    verified: true
                },
                include: [
                    {
                        model: sequelize.models.UserAuthenticationAttempts,
                        as: "authenticationAttempts"
                    }
                ]
            }).catch(error=>{
                let callerStack = new Error().stack;
                appendCallerStack(callerStack, error, undefined, true);
            });
        }
        else if(type === 1) {
            user = await User.findOne({
                where: { 
                    email: id,
                    verified: true
                },
                include: [
                    {
                        model: sequelize.models.UserAuthenticationAttempts,
                        as: "authenticationAttempts"
                    }
                ]
            }).catch(error=>{
                let callerStack = new Error().stack;
                appendCallerStack(callerStack, error, undefined, true);
            }); 
        }
        else if(type === 2)
        {
            user = await User.findOne({
                where: { 
                    id: id,
                    verified: true
                },
                include: [
                    {
                        model: sequelize.models.UserAuthenticationAttempts,
                        as: "authenticationAttempts"
                    }
                ]
            }).catch(error=>{
                let callerStack = new Error().stack;
                appendCallerStack(callerStack, error, undefined, true);
            }); 
        }
        else
        {
            throw new Error("Type must be either 0, 1, or 2 type provided: " + type);
        }
        return user;
    }

    User.findUnverifiedUser = async(email, excludedAttributes, excludedAuthAttributes) => {
        excludedAttributes = (excludedAttributes === undefined) ? [] : excludedAttributes;
        excludedAuthAttributes = (excludedAuthAttributes === undefined) ? [] : excludedAuthAttributes;
        let user = await User.findOne({
            where: {
                email: email,
                verified: false
            },
            attributes: {exclude: excludedAttributes},
            include: [
                {
                    model: sequelize.models.UserAuthenticationAttempts,
                    as: "authenticationAttempts",
                    required: false
                }
            ]
        }).catch(error=>{
            let callerStack = new Error().stack;
            appendCallerStack(callerStack, error, undefined, true);
        });
        return user;
    }


    User.findUnverifiedUserWithVerificationRecord = async(email, excludedAttributes, excludedAuthAttributes, exlcludedVerificationAttributes) => {
        excludedAttributes = (excludedAttributes === undefined) ? [] : excludedAttributes;
        excludedAuthAttributes = (excludedAuthAttributes === undefined) ? [] : excludedAuthAttributes;
        exlcludedVerificationAttributes = (exlcludedVerificationAttributes === undefined) ? [] : exlcludedVerificationAttributes;
        let user = await User.findOne({
            where: {
                email: email,
                //deleteAt: {[Op.gte]: new Date().toISOString()},
                verified: false
            },
            attributes: {exclude: excludedAttributes},
            include: [
                {
                    model: sequelize.models.UserAuthenticationAttempts,
                    as: "authenticationAttempts",
                    required: false
                },
                {
                    model: sequelize.models.TempVerificationCodes,
                    required: false
                }
            ]
        }).catch(error=>{
            let callerStack = new Error().stack;
            appendCallerStack(callerStack, error, undefined, true);
        });
        return user;
    };

    User.findOrCreateTempUser = async (email, username, firstName, lastName) => {
        let deleteAtDate = new Date();
        deleteAtDate.setMinutes(deleteAtDate.getMinutes() + 10);
        let tempUser = await User.findOrCreate({
            where: {
                [Op.or]: {
                    username: username,
                    email: email
                }
            },
            defaults: {
                email: email,
                username: username,
                firstName: firstName,
                lastName: lastName,
                verified: false,
                deleteAt: deleteAtDate
            }
        }).catch(error=>{
            let callerStack = new Error().stack;
            appendCallerStack(callerStack, error, undefined, true);
        });
        return tempUser;
    }

    User.createTempUser = async (email, username, firstName, lastName) => {
        let deleteAtDate = new Date();
        deleteAtDate.setMinutes(deleteAtDate.getMinutes() + 10);
        let tempUser = await User.create({
            email: email,
            username: username,
            firstName: firstName,
            lastName: lastName,
            verified: false,
            deleteAt: deleteAtDate
        }).catch(error=>{
            let callerStack = new Error().stack;
            appendCallerStack(callerStack, error, undefined, true);
        });
        return tempUser;
    }

    // type is either 0, 1, or 2: 0 being a username, 1 being a email, 2 being a id
    User.findByLoginWithPicture = async (login, type) => {
        let user = undefined;
        if(type === 0)
        {
            user = await User.findOne({
                where: { username: login, verified: true },
                attributes: {exclude: ['picture']},
                include: {
                    model: sequelize.models.DefaultProfilePictures,
                    as: "profilePicture",
                    attributes: [[sequelize.fn('concat', sequelize.col("profilePicture.source"),
                                sequelize.col("profilePicture.filename")), "url"]]
                }
            }).catch(error=>{
                let callerStack = new Error().stack;
                appendCallerStack(callerStack, error, undefined, true);
            });
        }
        else if (type === 1) {
            user = await User.findOne({
            where: { email: login, verified: true },
            attributes: {exclude: ['picture']},
            include: {
                model: sequelize.models.DefaultProfilePictures,
                as: "profilePicture",
                attributes: [[sequelize.fn('concat', sequelize.col("profilePicture.source"),
                            sequelize.col("profilePicture.filename")), "url"]]
            }
            }).catch(error=>{
                let callerStack = new Error().stack;
                appendCallerStack(callerStack, error, undefined, true);
            });
        }
        else if (type === 2)
        {
            user = await User.findOne({
                where: { id: login, verified: true },
                attributes: {exclude: ['picture']},
                include: {
                    model: sequelize.models.DefaultProfilePictures,
                    as: "profilePicture",
                    attributes: [[sequelize.fn('concat', sequelize.col("profilePicture.source"),
                                sequelize.col("profilePicture.filename")), "url"]]
                }
                }).catch(error=>{
                    let callerStack = new Error().stack;
                    appendCallerStack(callerStack, error, undefined, true);
                });
        }
        else
        {
            throw new Error("Type must be either 0, 1, or 2 type provided: " + type);
        }
        return user;
    };

    // returns 1 on successful deletion
    // 0 if no deletions occurred
    User.removeExpiredUser = async(req, res, user, throwError, errorCode) => {
        let result = await User.destroy({
            where: {
                id: user.id,
                verified: false,
                deleteAt: {[Op.lte]: new Date()}
            }
        }).catch(error=>{
            let callerStack = new Error().stack;
            let message = "Some unknown error occurred updaing the users(" + username + ") account on login";
            if(throwError)
            {
                res.locals.secondaryCode = errorCode;
				res.locals.secondaryMessage = message;
                appendCallerStack(callerStack, error, undefined, true);
            }
            else
            {
                error = appendCallerStack(callerStack, error, undefined, false);
                caughtErrorHandler(error, req, res, errorCode, message);
            }
        });

        return result;
    };

    // returns 1 on successful deletion
    // 0 if no deletions occurred
    User.removeUnverifiedUser = async(req, res, user, throwError, errorCode) => {
        let result = await User.destroy({
            where: {
                id: user.id,
                verified: false
            }
        }).catch(error=>{
            let callerStack = new Error().stack;
            let message = "A unexpected error occurred trying to remove a user with the id of: " + user.id;
            if(throwError)
            {
                res.locals.secondaryCode = errorCode;
                res.locals.secondaryMessage = message;
                appendCallerStack(callerStack, error, undefined, true);
            }
            else
            {
                error = appendCallerStack(callerStack, error, undefined, false);
                caughtErrorHandler(error, req, res, errorCode, message);
            }
        });

        return result;
    };


    // returns 1 on successful deletion
    // 0 if no deletions occurred
    User.removeUnverifiedUserByEmail = async(req, res, email, throwError, errorCode) => {
        let result = await User.destroy({
            where: {
                email: email,
                verified: false
            }
        }).catch(error=>{
            let callerStack = new Error().stack;
            let message = "A unexpected error occurred trying to remove a user with the email of: " + email;
            if(throwError)
            {
                res.locals.secondaryCode = errorCode;
                res.locals.secondaryMessage = message;
                appendCallerStack(callerStack, error, undefined, true);
            }
            else
            {
                error = appendCallerStack(callerStack, error, undefined, false);
                caughtErrorHandler(error, req, res, errorCode, message);
            }
        });
        
        return result;
    };

    User.getAllFollowers = async (userId) => {
        let user = await User.findOne({
            where: {id: userId, verified: true},
            attributes: ["id", "username"],
            include: {
                model: User,
                as: "Following",
                attributes: ["id"],
                through: {attributes: []}
            }
        }).catch(error=>{
            let callerStack = new Error().stack;
            appendCallerStack(callerStack, error, undefined, true);
        });
        let followers = await User.findOne({
            where: {id: userId},
        }).then((user) => {
            return user.getFollowing().then((users) => {
                return users;
            });
        }).catch(error=>{
            let callerStack = new Error().stack;
            appendCallerStack(callerStack, error, undefined, true);
        });
        return followers;
    }

    // method to find a user along with a specific user that they follow
    // takes in the users username and the the user that they follows id number
    // returns null if the user does not follow the user
    User.findWithFollower = async (login, followedId) => {
        let user = await User.findOne({
            where: { username: login, verified: true },
            include: {
                // include the user that is followed
                model: User,
                as: "Following",
                where: {id: followedId, verified: true},
                // include the user
                required: false
            },
        }).catch(error=>{
            let callerStack = new Error().stack;
            appendCallerStack(callerStack, error, undefined, true);
        });
        // returns null if follower not found
        return user;
    };

    // function to get a user and a user who follows them
    User.findWithFollowing = async (username, follower) =>
    {
        let user = await User.findOne({
            where: { username: username, verified: true },
            include: {
                // include the user that is followed
                model: User,
                as: "Followers",
                where: {id: follower, verified: true},
                // include the user
                required: false
            },
        }).catch(error=>{
            let callerStack = new Error().stack;
            appendCallerStack(callerStack, error, undefined, true);
        });
        // returns null if follower not found
        return user;
    };

    // function to return all followers from a friends list of followers that
    // the requesting user also follows
    // friendName is the username of the user whose friends list you are checking
    // userId is the user id of the requesting user
    User.getFollowers = async (friendName, userId, models) => {
        let user = await User.findByLogin(friendName, 0).catch(error=>{
            let callerStack = new Error().stack;
            appendCallerStack(callerStack, error, undefined, true);
        });
        if(user === null)
        {
            return null;
        }
        let followers = await user.getFollowers({
            attributes: ["username", [sequelize.fn('concat', sequelize.col("profilePicture.source"),
                        sequelize.col("profilePicture.filename")), "picture"]],
            include:[
                {
                    model: User,
                    as: "Followers",
                    attributes:["username"],
                    where: {id: userId, verified: true},
                    required: false,
                    through: {attributes:[]}
                },
                {
                    model: models.UsersFriends,
                    as: "UsersFriends",
                    attributes: []
                },
                {
                    model: models.DefaultProfilePictures,
                    as: "profilePicture",
                    attributes: []
                }
            ]
        }).catch(error=>{
            let callerStack = new Error().stack;
            appendCallerStack(callerStack, error, undefined, true);
        });
        return followers;
    };

    // function to return all of the users that a user follows that the
    // requesting user also follows
    // friendName is the username fo the user whose friends list you are checking
    // userId is the user id of the requesting user
    User.getFollowing = async (friendName, userId, models) => {
        let user = await User.findByLogin(friendName, 0).catch(error=>{
            let callerStack = new Error().stack;
            appendCallerStack(callerStack, error, undefined, true);
        });
        if(user === null)
        {
            return null;
        }
        let following = await user.getFollowing({
            attributes: ["username", [sequelize.fn('concat', sequelize.col("profilePicture.source"),
                        sequelize.col("profilePicture.filename")), "picture"]],
            include:[
                {
                    model: User,
                    as: "Followers",
                    attributes: ["username"],
                    where: {id: userId, verified: true},
                    required: false,
                    through: {attributes: []}
                },
                {
                    model: models.UsersFriends,
                    as: "UsersFriends",
                    attributes: []
                },
                {
                    model: models.DefaultProfilePictures,
                    as: "profilePicture",
                    attributes: []
                }
            ]
        }).catch(error=>{
            let callerStack = new Error().stack;
            appendCallerStack(callerStack, error, undefined, true);
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
                    model: User,
                    as: "WatchList",
                    required: true,
                    where: {id: userId, verified: true},
                    attributes: ["username"],
                    through: {
                        attributes: []
                    }
                },
                {
                    model: User,
                    as: "WatchedList",
                    required: false,
                    where: {id: userId, verified: true},
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
        }).catch(error=>{
            let callerStack = new Error().stack;
            appendCallerStack(callerStack, error, undefined, true);
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
                    model: User,
                    as: "WatchList",
                    required: false,
                    where: {id: userId, verified: true},
                    attributes: ["username"],
                    through: {
                        attributes: []
                    }
                },
                {
                    model: User,
                    as: "WatchedList",
                    required: true,
                    where: {id: userId, verified: true},
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
        }).catch(error=>{
            let callerStack = new Error().stack;
            appendCallerStack(callerStack, error, undefined, true);
        });
        return movies;
    }

    // function to get a list of users who match the value passed in
    // username is the username to look for
    // count is the maximum number of users to return
    User.findUsers = async (username, count, offset) => {
        let contains = "%" + username + "%";
        let startsWith = username + "%";
        let users = await User.findAll({
            limit: count,
            offset: offset,
            where: {
                username: {
                    [Op.or]: [username, {[Op.iLike]: startsWith}, {[Op.iLike]: contains}]
                },
                verified: true
            },
            include: [
                {
                    model: sequelize.models.DefaultProfilePictures,
                    as: "profilePicture",
                    attributes: []
                }
            ],
            order: [
                sequelize.literal(`CASE
                    WHEN upper("Users"."username") = upper('${username}') then 0
                    ELSE 1
                    END ASC`),
                ['username', 'ASC']
            ],
            attributes: ["username", "firstName", "lastName", [sequelize.fn('concat', sequelize.col("profilePicture.source"),
                        sequelize.col("profilePicture.filename")), "picture"]]
        }).catch(error=>{
            let callerStack = new Error().stack;
            appendCallerStack(callerStack, error, undefined, true);
        });
        return users;
    };

    // function to see if a user has a picture name associated with them
    User.hasPictureFileName = async(file) => {
        let users = await User.findAll({
            where: {
                picture: file,
                verified: true
            }
        }).catch(error=>{
            let callerStack = new Error().stack;
            appendCallerStack(callerStack, error, undefined, true);
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
