//import {removeImage} from './fileHandler.js';
import {hash, checkHashedValue} from '../src/shared/crypto.js';
import {regenerateSession, removeAllSessions} from '../src/shared/sessions.js';
//import {getSanitizedOutput} from '../src/ErrorHandlers/SequelizeErrorHandler.js';
import { removeCurrentSession } from '../src/shared/sessions.js';
const validateStringParameter = require('./globals.js').validateStringParameter;
const validateEmailParameter = require('./globals.js').validateEmailParameter;
const validateUsernameParameter = require('./globals.js').validateUsernameParameter;
const validateIntegerParameter = require('./globals.js').validateIntegerParameter;
const clearCookie = require('./globals.js').clearCookie;
const models = require('../src/shared/sequelize.js').getClient().models;
const Logger = require("../src/shared/logger.js").getLogger();
const appendCallerStack = require("../src/shared/ErrorFunctions.js").appendCallerStack;



// function to get the reviews associated with a users profile
const profileHandler = (req, res, next) => {
    let requester;
    if(req.session === undefined || req.session.passwordResetSession === undefined)
    {
        requester = (req.session === undefined || req.session.user === undefined) ? "" : req.session.user;
    }
    else
    {
        if(req.method === "POST" && req.params.type === "reset_password")
        {
            requester = req.session.user;
        }
        else
        {
            requester = (req.session === undefined || req.session.user === undefined || req.session.passwordResetSession !== undefined) ? "" : req.session.user;
        }
    }
    // set which file the request is for
    res.locals.file = "profile";
    /* DO NOT DELETE - FUNCTIONS TO USE IF ALLOWING USERS TO UPLOAD PICTURES
    // if calling another function after already authenticated before
    if(res.locals.skipAuthentication !== undefined && res.locals.skipAuthentication)
    {
        if(res.locals.type === "updateImage")
        {
            updateImage(requester, req, res);
        }
        else
        {
            let message = "Some unexpected error occurred on the server.  Error code: 1000"
            // should never happen but just in case
            res.status(500).sendResponse({
                message: message,
                requester: requester
            });
            Logger.error("Some unexpected error occurred on the server",
                {errorCode: 1000, function: "profileHandler", file: "profile.js", requestId: req.id});
        }
        return;
    }
    */
    // pass that cookie was not valid
    selectPath(requester, req, res, next);
};

const selectPath = (requester, req, res, next) =>
{
    let cookieValid = (requester === "") ? false : true;
    res.locals.function = "selectPath";
    let routeFound = false;
    let foundNoCookie = false;
    // only used for password reset
    let invalidUserURL = false;
    if(req.method === "GET")
    {
        // if here, the path is profile/username
        if(req.params.type === "reviews")
        {
            routeFound = true;
            getReviews(requester, req, res, cookieValid)
            .catch((err) => {
                let callerStack = new Error().stack;
                appendCallerStack(callerStack, err, next, undefined);
            });
        }
        else if(req.params.type === "user_info")
        {
            routeFound = true;
            getUserHeaderInfo(requester, req, res, cookieValid)
            .catch((err) => {
                let callerStack = new Error().stack;
                appendCallerStack(callerStack, err, next, undefined);
            });
        }
        else if(req.params.type === "feed")
        {
            routeFound = true;
            if(cookieValid)
            {
                getFeed(requester, req, res)
                .catch((err) => {
                    let callerStack = new Error().stack;
                    appendCallerStack(callerStack, err, next, undefined);
                });
            }
            else
            {
                foundNoCookie = true;
            }
        }
        else if(req.params.type === "getfollowers")
        {
            routeFound = true;
            if(cookieValid)
            {
                getFollowers(requester, req, res)
                .catch((err) => {
                    let callerStack = new Error().stack;
                    appendCallerStack(callerStack, err, next, undefined);
                });
            }
            else
            {
                foundNoCookie = true;
            }
        }
        else if(req.params.type === "getfollowing")
        {
            routeFound = true;
            if(cookieValid)
            {
                getFollowing(requester, req, res)
                .catch((err) => {
                    let callerStack = new Error().stack;
                    appendCallerStack(callerStack, err, next, undefined);
                });
            }
            else
            {
                foundNoCookie = true;
            }
        }
        else if(req.params.type === "get_profile_pictures")
        {
            routeFound = true;
            if(cookieValid)
            {
                getDefaultProfilePictures(requester, req, res)
                .catch((err) => {
                    let callerStack = new Error().stack;
                    appendCallerStack(callerStack, err, next, undefined);
                });
            }
            else
            {
                foundNoCookie = true;
            }
        }
    }
    else if(req.method === "POST")
    {
        // if the path is profile/username/follow
        if(req.params.type === "follow")
        {
            routeFound = true;
            if(cookieValid)
            {
                followUser(requester, req, res)
                .catch((err) => {
                    let callerStack = new Error().stack;
                    appendCallerStack(callerStack, err, next, undefined);
                });
            }
            else
            {
                foundNoCookie = true;
            }
        }
        // if the path is profile/username/follow
        else if(req.params.type === "unfollow")
        {
            routeFound = true;
            if(cookieValid)
            {
                unfollowUser(requester, req, res)
                .catch((err) => {
                    let callerStack = new Error().stack;
                    appendCallerStack(callerStack, err, next, undefined);
                });
            }
            else
            {
                foundNoCookie = true;
            }
        }
        // profile/username/update
        else if(req.params.type === "update")
        {
            routeFound = true;
            if(cookieValid)
            {
                updateInfo(requester, req, res, next)
                .catch((err) => {
                    let callerStack = new Error().stack;
                    appendCallerStack(callerStack, err, next, undefined);
                });
            }
            else
            {
                foundNoCookie = true;
            }
        }
        else if(req.params.type === "update_password")
        {
            routeFound = true;
            if(cookieValid)
            {
                updatePassword(requester, req, res)
                .catch((err) => {
                    let callerStack = new Error().stack;
                    appendCallerStack(callerStack, err, next, undefined);
                });
            }
            else
            {
                foundNoCookie = true;
            }
        }
        else if(req.params.type === "reset_password" && Object.keys(req.query).length === 0)
        {
            routeFound = true;
            if(cookieValid)
            {
                resetPassword(requester, req, res)
                .catch((err) => {
                    let callerStack = new Error().stack;
                    appendCallerStack(callerStack, err, next, undefined);
                });
            }
            else
            {
                if(res.locals.invalidURL !== undefined && res.locals.invalidURL)
                {
                    invalidUserURL = true;
                }
                foundNoCookie = true;
            }
        }
        else if(req.params.type === "delete_user")
        {
            routeFound = true;
            if(cookieValid)
            {
                removeUser(requester, req, res, next)
                .catch((err) => {
                    let callerStack = new Error().stack;
                    appendCallerStack(callerStack, err, next, undefined);
                });
            }
            else
            {
                foundNoCookie = true;
            }
        }
        else if(req.params.type === "set_picture")
        {
            routeFound = true;
            if(cookieValid)
            {
                setProfilePicture(requester, req, res, next)
                .catch((err) => {
                    let callerStack = new Error().stack;
                    appendCallerStack(callerStack, err, next, undefined);
                });
            }
            else
            {
                foundNoCookie = true;
            }
        }
        /*
        // used to allow users to upload their profile picture
        else
        {
            if(req.params.type === undefined)
            {
                let urlSplit = req.url.split('/');
                let type = urlSplit[3];
                if(type !== undefined && type === "set_picture")
                {
                    routeFound = true;
                    if(cookieValid)
                    {
                        setImage(requester, req, res, next)
                        .catch((err) => {next(err)});
                    }
                    else
                    {
                        foundNoCookie = true;
                    }
                }
            }
        }
        */
    }
    /* DO NOT DELETE - FUNCTIONS TO USE IF ALLOWING USERS TO UPLOAD PICTURES
    else if(req.method === "DELETE")
    {
        // if the path is profile/username/follow
        if(req.params.type === "remove_picture")
        {
            routeFound = true;
            if(cookieValid)
            {
                removeProfilePicture(requester, req, res)
                .catch((err) => {next(err)});
            }
            else
            {
                foundNoCookie = true;
            }
        }
    }
    */
    // if the route did not match any of the above
    if(!routeFound)
    {
        res.status(404).sendResponse({
            message:"The profile path sent to the server does not exist",
            requester: requester
        }); 
    }
    // if going to password reset but user in url is not correct
    else if(invalidUserURL)
    {
        res.status(401).sendResponse({
            message: "The user passed in the url does not match the cookie",
            requester: requester
        });
    }
    // if the route was found but cookie not found or invalid
    else if(foundNoCookie)
    {
        res.status(401).sendResponse({
            message:"You are not logged in",
            requester: requester
        });
    }
};

// this function will return a users follwers for their page
const getFollowers = async (requester, req, res) =>
{
    res.locals.function = "getFollowers";
    let username = req.params.username;
    let valid = validateUsernameParameter(res, username, requester, "Username is invalid");
    if(!valid) return;
    // returns a empty array if no followers
    // null if invalid user
    let followers = await models.Users.getFollowers(username, req.session.userId, models).catch(error=>{
        let callerStack = new Error().stack;
        appendCallerStack(callerStack, error, undefined, true);
    });
    if(followers === null)
    {
        res.status(404).sendResponse({
            message: "The user could not be found",
            requester: requester
        });
    }
    else
    {
        res.status(200).sendResponse({
            message: "Users followers found",
            requester: requester,
            users: followers
        });
    }
}

// this function will return a users following for their page
const getFollowing = async (requester, req, res) =>
{
    res.locals.function = "getFollowing";
    let username = req.params.username;
    let valid = validateUsernameParameter(res, username, requester, "Username is invalid");
    if(!valid) return;
    let following = await models.Users.getFollowing(username, req.session.userId, models).catch(error=>{
        let callerStack = new Error().stack;
        appendCallerStack(callerStack, error, undefined, true);
    });
    if(following === null)
    {
        res.status(404).sendResponse({
            message: "The user could not be found",
            requester: requester
        });
    }
    else
    {
        res.status(200).sendResponse({
            message: "Users following users found",
            requester: requester,
            users: following
        });
    }
}

// function to get data for the users profile header
// returns user Id, if the page is for the current user, if the user is following the
// user, the number of following/followers users
const getUserHeaderInfo = async (requester, req, res, cookieValid) =>
{
    res.locals.function = "getUserHeaderInfo";
    let username = req.params.username;
    let loggedInUser = requester;
    let valid = validateUsernameParameter(res, username, loggedInUser, "Username is invalid");
    if(!valid) return;
    // find a user by their login
    let user = await models.Users.findByLoginWithPicture(username, 0).catch(error=>{
        let callerStack = new Error().stack;
        appendCallerStack(callerStack, error, undefined, true);
    });
    // if the user was not found
    if(user === null)
    {
        res.status(404).sendResponse({
            message:"Unable to find the requested user",
            requester: loggedInUser
        });
        return;
    }
    // boolean to indicate if the requester if following the user
    let followed = false;
    // get the number of followers the user has
    let followers = await user.getFollowers().catch(error=>{
        let callerStack = new Error().stack;
        appendCallerStack(callerStack, error, undefined, true);
    });
    let followerCount = followers.length;
    // get the number of following users the user has
    let followingUsers = await user.getFollowing().catch(error=>{
        let callerStack = new Error().stack;
        appendCallerStack(callerStack, error, undefined, true);
    });
    let followingCount = followingUsers.length;
    let posts = await user.getUserReviews().catch(error=>{
        let callerStack = new Error().stack;
        appendCallerStack(callerStack, error, undefined, true);
    });
    let postCount = posts.length;

    // if the current user is looking at their own page
    if(cookieValid)
    {
        // current user looking at another page
        if(loggedInUser !== user.username)
        {
            // see if the user they are looking at has them as a follower
            let following = await user.getFollowers( {where: {id: req.session.userId} } ).catch(error=>{
                let callerStack = new Error().stack;
                appendCallerStack(callerStack, error, undefined, true);
            });
            // if not undefined, found requester as a follower
            if(following[0] !== undefined)
            {
                followed = true;
            }
        }
    }

    res.status(200).sendResponse({
        message: "User information successfully found",
        following: followed,
        followerCount: followerCount,
        followingCount: followingCount,
        requester: loggedInUser,
        postCount: postCount,
        picture: user.profilePicture.dataValues.url
    });
}

// function to get reviews for a specific user
const getReviews = async (requester, req, res, cookieValid) =>
{
    res.locals.function = "getReviews";
    let username = req.params.username;
    let max = (req.query.max === undefined) ? 50 : req.query.max;
    let offset = (req.query.offset === undefined) ? 0 : req.query.offset;
    let valid = validateUsernameParameter(res, username, requester, "Username is invalid");
    if(!valid) return;
    valid = validateIntegerParameter(res, max, username, "The maximum number of reviews to return is invalid");
    if(!valid) return;
    valid = validateIntegerParameter(res, offset, username, "The offset for the reviews to return is invalid", 0, undefined);
    if(!valid) return;
    max = (max > 50) ? 50 : max;
    // find the user by their login
    let user = await models.Users.findByLogin(username, 0).catch(error=>{
        let callerStack = new Error().stack;
        appendCallerStack(callerStack, error, undefined, true);
    });
    if(user === null)
    {
        res.status(404).sendResponse({
            message: "Unable to find the requested user",
            requester: requester
        });
        return;
    }
    if(cookieValid)
    {
        let reviews = await models.Reviews.findByIds(models, [user.id], req.session.userId, max, offset).catch(error=>{
            let callerStack = new Error().stack;
            appendCallerStack(callerStack, error, undefined, true);
        });
        // send the reveiws associated with the user and their id
        res.status(200).sendResponse({
            message: "Reviews sucessfully found for the user",
            requester: requester,
            reviews: reviews
        });
    }
    else
    {
        let reviews = await models.Reviews.findByIds(models, [user.id], undefined).catch(error=>{
            let callerStack = new Error().stack;
            appendCallerStack(callerStack, error, undefined, true);
        });
        // send the reveiws associated with the user and their id
        res.status(200).sendResponse({
            message: "Reviews successfully found for the user",
            requester: requester,
            reviews: reviews
        });
    }
};

// function to get the feed for a specific user
const getFeed = async (requester, req, res) =>
{
    res.locals.function = "getFeed";
    let username = req.params.username;
    let max = (req.query.max === undefined) ? 50 : req.query.max;
    let offset = (req.query.offset === undefined) ? 0 : req.query.offset;
    // may want to just do /feed...?, no username?
    let valid = validateUsernameParameter(res, username, requester, "Username for the users feed is invalid");
    if(!valid) return;
    valid = validateIntegerParameter(res, max, username, "The maximum number of reviews to return is invalid");
    if(!valid) return;
    valid = validateIntegerParameter(res, offset, username, "The offset for the reviews to return is invalid", 0, undefined);
    if(!valid) return;
    max = (max > 50) ? 50 : max;
    if(username !== requester)
    {
        // unathorized
        res.status(401).sendResponse({
            message: "You cannot access the feed of another user",
            requester: requester
        });
        return;
    }

    // this will always return an array, even if the user does not exist
    // if the user does not exist, it will just be a empty array
    // if verified the user is logged in, should not really be an issue
    let reviews = await models.Reviews.getUserReviewFeed(models, req.session.userId, max, offset).catch(error=>{
        let callerStack = new Error().stack;
        appendCallerStack(callerStack, error, undefined, true);
    });

    res.status(200).sendResponse({
        message: "Users feed successfully found",
        requester: requester,
        reviews: reviews
    });

};


// may want to change this to first get the user and everyone they follow
// then check if the requested user is in their following users
const followUser = async (requester, req, res) =>
{
    res.locals.function = "followUser";
    // requesting users username
    let requestingUser = requester;
    // user to follows username
    let followUname = req.params.username;
    let valid = validateUsernameParameter(res, followUname, requestingUser, "Username to follow is invalid");
    if(!valid) return;
    // get the user and see if the requester follows them
    let userToFollow = await models.Users.findWithFollowing(followUname, req.session.userId).catch(error=>{
        let callerStack = new Error().stack;
        appendCallerStack(callerStack, error, undefined, true);
    });
    if(userToFollow === null)
    {
        res.status(404).sendResponse({
            message: "Unable to find user to follow",
            requester: requestingUser
        });
    }
    // if the user is not already following the user
    else if(userToFollow.dataValues.Followers.length < 1)
    {
        if(userToFollow.id === req.session.userId)
        {
            res.status(400).sendResponse({
                message: "User cannot follow themself",
                requester: requestingUser
            });
        }
        else
        {
            // add the user to the requesters following users
            let result = await userToFollow.addFollower(req.session.userId).catch(error=>{
                let callerStack = new Error().stack;
                appendCallerStack(callerStack, error, undefined, true);
            });
            if(result === undefined)
            {
                let message = "Some error occured trying to follow the user.  Error code: 1001"
                res.status(500).sendResponse({
                    message: message,
                    requester: requestingUser
                });
            }
            else
            {
                res.status(200).sendResponse({
                    message: "User successfully followed",
                    requester: requestingUser
                });
            }
        }
    }
    else
    {
        res.status(400).sendResponse({
            message: "You already follow the user",
            requester: requestingUser
        });
    }
}

const unfollowUser = async (requester, req, res) =>
{
    res.locals.function = "unfollowUser";
    let requestingUser = requester;
    let unfollowUname = req.params.username;
    let valid = validateUsernameParameter(res, unfollowUname, requestingUser, "Username to unfollow is invalid");
    if(!valid) return;
    // get the user and see if the requester follows them
    let userToUnfollow = await models.Users.findWithFollowing(unfollowUname, req.session.userId).catch(error=>{
        let callerStack = new Error().stack;
        appendCallerStack(callerStack, error, undefined, true);
    });
    if(userToUnfollow === null)
    {
        res.status(404).sendResponse({
            message: "Unable to find user to unfollow",
            requester: requestingUser
        });
    }
    else if(userToUnfollow.dataValues.Followers.length > 0)
    {
        if(userToUnfollow.id === req.session.userId)
        {
            res.status(400).sendResponse({
                message: "User cannot unfollow themself",
                requester: requestingUser
            });
        }
        else
        {
            let result = await userToUnfollow.removeFollower(req.session.userId).catch(error=>{
                let callerStack = new Error().stack;
                appendCallerStack(callerStack, error, undefined, true);
            });
            if(result === undefined)
            {
                let message = "Some error occured trying to unfollow the user.  Error code: 1002"
                res.status(500).sendResponse({
                    message: message,
                    requester: requestingUser
                });
            }
            else
            {
                res.status(200).sendResponse({
                    message: "User successfully unfollowed",
                    requester: requestingUser
                });
            }
        }
    }
    else
    {
        res.status(400).sendResponse({
            message: "You already do not follow the user",
            requester: requestingUser
        });
    }
}

// function to handle updating a users password
const updatePassword = async (requester, req, res) =>
{
    res.locals.function = "updatePassword";
    let username = requester;
    // if the password is not provided, automatically deny
    let outputMessages = {1: "Username must be between 6-20 characters", 2: "Username can only contain letters, numbers, or the following characters: _-$"};
    let valid = validateUsernameParameter(res, req.params.username, requester, outputMessages);
    if(!valid) return;
    valid = validateStringParameter(res, req.body.oldPassword, 6, 15, requester, "Password must be betweeen 6-15 characters", true);
    if(!valid) return;
    valid = validateStringParameter(res, req.body.newPass, 6, 15, requester, "New password must be betweeen 6-15 characters", true);
    if(!valid) return;

    if(req.params.username !== requester)
    {
        res.status(401).sendResponse({
            message: "The user passed in the url does not match the cookie",
            requester: requester
        });
    }
    else if(req.body.oldPassword === req.body.newPass)
    {
        res.status(400).sendResponse({
            message: "New password is identical to the previous one sent by the user",
            requester: requester
        });
    }
    else
    {
        let user = await models.Users.findByLoginForAuth(req.session.userId, 2).catch(error=>{
            let callerStack = new Error().stack;
            appendCallerStack(callerStack, error, undefined, true);
        });
        if(user === null)
        {
            res.status(404).sendResponse({
                message: "Could not find the user to update",
                requester: requester
            });
            return;
        }
        let result = checkHashedValue(req.body.oldPassword, "password", user.credentials.salt);
        if(user.credentials.password === result.value)
        {
            let password = req.body.newPass;
            // remove all existing sessions except for this one
            await removeAllSessions(req, res, user.id, [req.session.id]).catch(error=>{
                let callerStack = new Error().stack;
                appendCallerStack(callerStack, error, undefined, true);
            });

            // update user credential record
            await models.UserCredentials.createOrUpdatePassword(req, res, user, password, false, undefined, false).catch(error=>{
                let callerStack = new Error().stack;
                appendCallerStack(callerStack, error, undefined, true);
            });

            // update the session
            req.session.userId = user.id;
            req.session.user = user.username;
            req.session.admin = user.admin;
            await regenerateSession(req, res, true, false).catch(error=>{
                let callerStack = new Error().stack;
                appendCallerStack(callerStack, error, undefined, true);
            });

            res.status(200).sendResponse({
                message: "Password updated",
                requester: requester
            });
        }
        else
        {
            let attempts = await updateUserLoginAttempts(user, username).catch(error=>{
                let callerStack = new Error().stack;
                appendCallerStack(callerStack, error, undefined, true);
            });
            let message = "Password incorrect";
            if(attempts >= 5)
            {
                message = message + ". User account is currently locked due to too many failed password attempts";
                requester = "";
            }
            res.status(401).sendResponse({
                message: message,
                requester: requester
            });
        }

    }
}

// function to handle updating a users information such as theirF
// first name, last name, email, or username
const updateInfo = async (requester, req, res, next) =>
{
    // set the function
    res.locals.function = "updateInfo";
    let username = req.params.username;
    let outputMessages = {1: "Username must be between 6-20 characters", 2: "Username can only contain letters, numbers, or the following characters: _-$"};
    let valid = validateUsernameParameter(res, req.body.username, requester, outputMessages);
    if(!valid) return;
    /* to be implemented later
    valid = validateEmailParameter(res, req.body.email, requester, "The email provided is not a valid email address");
    if(!valid) return;
    */
    valid = validateStringParameter(res, req.body.firstName, 1, 20, requester, "First name must be between 1-20 characters", true);
    if(!valid) return;
    valid = validateStringParameter(res, req.body.lastName, 1, 20, requester, "Last name must be between 1-20 characters", true);
    if(!valid) return;
    valid = validateStringParameter(res, req.body.password, 6, 15, requester, "Password must be betweeen 6-15 characters", true);
    if(!valid) return;
    if(requester !== username)
    {
        res.status(401).sendResponse({
            message: "You cannot update another users information",
            requester: requester
        });
        return;
    }
    // find the user by their login
    let user = await models.Users.findByLoginForAuth(req.session.userId, 2).catch(error=>{
        let callerStack = new Error().stack;
        appendCallerStack(callerStack, error, undefined, true);
    });
    if(user === null)
    {
        // sending 401 as if null user does not exist
        res.status(401).sendResponse({
            message: "Could not find the user to update",
            requester: ""
        });
        return;
    }
    let result = checkHashedValue(req.body.password, "password", user.credentials.salt);
    if(user.credentials.password === result.value)
    {
        // remove all existing sessions except for this one
        await removeAllSessions(req, res, user.id, [req.session.id]).catch(error=>{
            let callerStack = new Error().stack;
            appendCallerStack(callerStack, error, undefined, true);
        });
        // update the user
        let result = await user.update({
            username: req.body.username,
            //email: req.body.email,
            firstName: req.body.firstName,
            lastName: req.body.lastName
        }).catch(error=>{
            let callerStack = new Error().stack;
            appendCallerStack(callerStack, error, undefined, true);
        });
        // update the session
        req.session.userId = user.id;
        // the user could change so use result
        req.session.user = result.username;
        req.session.admin = user.admin;

        // below is used to update the cookie as the values have changed
        let value = JSON.stringify({
            name: result.username,
            email: result.email,
            id: result.id,
            created: new Date()
        });
        // regenerate the session
        await regenerateSession(req, res, true, false).catch(error=>{
            let callerStack = new Error().stack;
            appendCallerStack(callerStack, error, undefined, true);
        });

        let updatedUser = {
            username: result.username,
            email: result.email,
            firstName: result.firstName,
            lastName: result.lastName
        };
        res.status(200).sendResponse({
            message: "User info successfully updated",
            requester: updatedUser.username,
            user: updatedUser
        });
    }
    else
    {
        let attempts = await updateUserLoginAttempts(user, username).catch(error=>{
            let callerStack = new Error().stack;
            appendCallerStack(callerStack, error, undefined, true);
        });
        let message = "Password incorrect";
        if(attempts >= 5)
        {
            message = message + ". User account is currently locked due to too many failed password attempts";
            requester = "";
        }
        res.status(401).sendResponse({
            message: message,
            requester: requester
        });
    }
}


// function to handle updating a users password
const removeUser = async (requester, req, res, next) =>
{
    res.locals.function = "removeUser";
    let password = req.body.password;
    let userNameToRemove = req.params.username;
    let valid = validateUsernameParameter(res, userNameToRemove, requester,
         "Username for the user to remove is invalid");
    if(!valid) return;
    if(password === undefined || password.length < 8)
    {
        res.status(401).sendResponse({
            message: "Password incorrect",
            requester: requester
        });
        return;
    }
    // get the requester
    let user = await models.Users.findByLoginForAuth(req.session.userId, 2).catch(error=>{
        let callerStack = new Error().stack;
        appendCallerStack(callerStack, error, undefined, true);
    });
    let userToRemove = user;
    let currentUser = (userNameToRemove === requester);
    // if the password is not provided, automatically deny
    if(!currentUser)
    {
        if(!user.admin)
        {
            res.status(401).sendResponse({
                message: "You cannot remove another user",
                requester: requester
            });
            return;
        }
        else
        {
            // update the user to remove to the correct user if the requester
            // is an admin
            userToRemove = await models.Users.findByLogin(userNameToRemove, 0).catch(error=>{
                let callerStack = new Error().stack;
                appendCallerStack(callerStack, error, undefined, true);
            });
        }
    }
    if(userToRemove === null)
    {
        res.status(404).sendResponse({
            message: "Could not find the user to remove",
            requester: requester
        });
        return;
    }
    // hash the users password that was passed in
    let result = checkHashedValue(password, "password", user.credentials.salt);
    password = result.value;
    // check the users password against the requesters password
    let passwordValid = (currentUser) ? (userToRemove.credentials.password === password) : (user.credentials.password === password);
    if(passwordValid)
    {
        // remove all existing sessions for the user
        await removeAllSessions(req, res, userToRemove.id, []).catch(error=>{
            let callerStack = new Error().stack;
            appendCallerStack(callerStack, error, undefined, true);
        });
        // remove the user
        let result = await userToRemove.destroy().catch(error=>{
            let callerStack = new Error().stack;
            appendCallerStack(callerStack, error, undefined, true);
        });
        
        // if the user just deleted themself, return a empty cookie
        if(currentUser)
        {
            requester = "";
        }
        res.status(200).sendResponse({
            message: "User successfully removed",
            requester: requester
        });
    }
    else
    {
        res.status(401).sendResponse({
            message: "Password incorrect",
            requester: requester
        });
    }

}

// function to get all the urls for the profile pictures
const getDefaultProfilePictures = async (requester, req, res) =>
{
    res.locals.function = "getDefaultProfilePictures";
    let username = req.params.username;
    let loggedInUser = requester;
    let valid = validateUsernameParameter(res, username, loggedInUser, "Username is invalid");
    if(!valid) return;

    if(username !== loggedInUser)
    {
        res.status(401).sendResponse({
            message:"The user passed in the url does not match the requester",
            requester: loggedInUser
        });
        return;
    }

    // get the images to send
    let images = await models.DefaultProfilePictures.findAll({
        attributes: ["filename", "source", "id"]
    }).catch(error=>{
        let callerStack = new Error().stack;
        appendCallerStack(callerStack, error, undefined, true);
    });

    res.status(200).sendResponse({
        message: "Default profile pictures successfully found",
        requester: loggedInUser,
        images: images
    });
}

const setProfilePicture = async(requester, req, res, next) =>
{
    res.locals.function = "setProfilePicture";
    let username = req.params.username;
    let profilePicture = req.body.picture;
    // max is the maxium number of profile picture options
    let max = 11;
    let valid = validateUsernameParameter(res, req.params.username, requester, "Invalid username found in the url");
    if(!valid) return;
    valid = validateIntegerParameter(res, profilePicture, requester, "The picture selected is invalid", 0, max);
    if(!valid) return;
    if(username !== requester)
    {
        res.status(401).sendResponse({
            message:"The user passed in the url does not match the requester",
            requester: requester
        });
        return;
    }
    // find the user
    let user = await models.Users.findByLogin(req.session.userId, 2).catch(error=>{
        let callerStack = new Error().stack;
        appendCallerStack(callerStack, error, undefined, true);
    });
    let status;
    let message;
    if(user === null)
    {
        status = 401;
        message = "You are not logged in";
        requester = "";
    }
    else
    {
        let result = await user.update({
            picture: profilePicture
        }).catch(error=>{
            let callerStack = new Error().stack;
            appendCallerStack(callerStack, error, undefined, true);
        });
        status = 200;
        message = "User picture successfully updated";
    }
    res.status(status).sendResponse({
        message: message,
        requester: requester
    });
}


// function to resetting a users password when they forgot their password
// a lot of validation for this is done in checkForPasswordResetCookie before a user even gets to here
const resetPassword = async (requester, req, res) =>
{
    res.locals.function = "resetPassword";
    // be careful in the function with what happens if an error occurs...

    let password = req.body.password;
    let valid = validateStringParameter(undefined, password, 6, 15, undefined, undefined, true);
    // regenerate session but keep time limited so the user has to reauthenticate after so long
    // do not want cookie being sent over internet a ton and keep being reused
    if(!valid) 
    {
        req.session.cookie.maxAge = req.session.cookie.maxAge;
        // set session back to active
        req.session.active = true;
        res.status(400).sendResponse({
            message: "New password must be betweeen 6-15 characters",
            requester: requester
        });
        return;
    }

    let user = await models.Users.findByLogin(req.session.userId, 2).catch(error=>{
        let callerStack = new Error().stack;
        appendCallerStack(callerStack, error, undefined, true);
    });
    if(user === null)
    {
        // need to destroy the session as the user could not be found
        await removeCurrentSession(req, res).catch(error=>{
            let callerStack = new Error().stack;
            appendCallerStack(callerStack, error, undefined, true);
        });
        clearCookie(req, res, undefined);
        res.status(404).sendResponse({
            message: "Could not find the user to update",
            requester: ""
        });
        return;
    }
    // remove all sessions except for this one as going to reset password
    // on failure of password update, users just logged out
    await removeAllSessions(req, res, user.id, [req.session.id]).catch(error=>{
        let callerStack = new Error().stack;
        appendCallerStack(callerStack, error, undefined, true);
    });

    // update user credential record
    await models.UserCredentials.createOrUpdatePassword(req, res, user, password, false, undefined, false).catch(error=>{
        let callerStack = new Error().stack;
        appendCallerStack(callerStack, error, undefined, true);
    });

    await models.UserAuthenticationAttempts.update({
        passwordAttempts: 0,
        passwordLocked: null
    },
    {
        where: {userId: user.id}
    }).catch(error=>{
        let callerStack = new Error().stack;
        appendCallerStack(callerStack, error, undefined, true);
    });

    // destroy session as user password successfully updated
    await removeCurrentSession(req, res).catch(error=>{
        let callerStack = new Error().stack;
        appendCallerStack(callerStack, error, undefined, true);
    });
    clearCookie(req, res, undefined);

    // send requester but handle differently on client side
    res.status(200).sendResponse({
        message: "Password successfully updated",
        requester: requester
    });
}

/* DO NOT DELETE - FUNCTIONS TO USE IF ALLOWING USERS TO UPLOAD PICTURES

// function to handle validating a user can update their profile pic
const setImage = async (requester, req, res, next) =>
{
    res.locals.function = "setImage";
    let valid = validateUsernameParameter(res, req.params.username, requester, "Invalid username found in the url");
    if(!valid) return;
    if(req.params.username !== requester)
    {
        res.status(401).sendResponse({
            message: "The user passed in the url does not match the requester",
            requester: requester
        });
    }
    else
    {
        next();
    }
}


// function to remove a users profile picture
const removeProfilePicture = async(requester, req, res) =>
{
    res.locals.function = "removeProfilePicture";
    let valid = validateUsernameParameter(res, req.params.username, requester, "Invalid username found in the url");
    if(!valid) return;
    if(req.params.username !== requester)
    {
        res.status(401).sendResponse({
            message: "The user passed in the url does not match the requester",
            requester: requester
        });
        return;
    }
    let status;
    let message;
    // find the user
    let user = await models.Users.findByLogin(requester);
    if(user === null)
    {
        // need to remove the file as the user no longer exists
        status = 401;
        message = "User not found";
        requester = "";
    }
    else
    {
        if(user.picture === null)
        {
            status = 200;
            message = "User picture not found";
        }
        else
        {
            // remove the picture
            let result = await removeImage(user.picture);
            // if true, successfully removed or did not exist
            if(result)
            {
                let result = await user.update({
                    picture: null
                });
                status = 200;
                message = "User picture successfully removed";
            }
            else
            {
                status = 500;
                message = "Some unexpected error occurred on the server when removing the profile picture. Error code: 1009";
                Logger.error("Some unexpected error occurred on the server when removing a users profile picture",
                    {errorCode: 1009, function: "removeProfilePicture", file: "profile.js", requestId: req.id});
            }
        }
    }
    setTimeout(() => {
        res.status(status).sendResponse({
            message: message,
            requester: requester
        });
    }, 5000);
}


// function to handle updating database once image has been uploaded
const updateImage = async(requester, req, res) =>
{
    res.locals.function = "updateImage";
    // try to update the users picture
    // handle errors on updating database
    let status;
    let message;
    if(req.file === undefined)
    {
        // file could not be found in request as it was not defined as file: image
        res.status(400).sendResponse({
            message: "The new profile picture could not be found in the request",
            requester: requester
        });
        return;
    }
    // find the user
    let user = await models.Users.findByLogin(requester);
    let newPicture = req.locals.filename;
    if(user === null)
    {
        // need to remove the file as the user no longer exists
        status = 401;
        message = "You are not logged in";
        requester = "";
    }
    else
    {
        let oldPicture = user.picture;
        // this try/catch MUST stay as it is doing more than just catching the error
        try
        {
            let result = await user.update({
                picture: newPicture
            });
            status = 200;
            message = "User picture successfully updated";
            if(oldPicture !== null)
            {
                // remove the old image
                removeImage(oldPicture);
            }
        }
        catch(err)
        {

            let errorObject = JSON.parse(JSON.stringify(err));
            if(errorObject.name === 'SequelizeUniqueConstraintError')
            {
                if(errorObject.original.constraint === "users_picture_key")
                {
                    // this should just about never occur
                    // if here, a picture was overwritten...
                    Logger.error("User picture name conflicts with an existing image name: " + newPicture,
                        {errorCode: 1010, function: "updateImage", file: "profile.js", requestId: req.id});
                    status = 500;
                    message = "Some unexpected error occurred on the server. Error code: 1010"
                }
                else
                {
                    let error = getSanitizedOutput(errorObject)
                    Logger.error("Some unexpected constraint error occurred",
                        {errorCode: 1011, function: "updateImage", file: "profile.js", requestId: req.id, error: error});
                    status = 500;
                    message = "Some unexpected error occurred on the server.  Error code: 1011";
                    removeImage(newPicture);
                }
            }
            else
            {
                Logger.error("Some unexpected error occurred",
                    {errorCode: 1012, function: "updateImage", file: "profile.js", requestId: req.id, error: errorObject});
                status = 500;
                message = "Some unexpected error occurred on the server.  Error code: 1012";
                removeImage(newPicture);
            }
        }
    }
    setTimeout(() => {
        res.status(status).sendResponse({
            message: message,
            requester: requester
        });
    }, 5000);
}
*/

export {profileHandler};
