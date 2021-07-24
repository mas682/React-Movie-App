import {validateUsernameParameter, validateIntegerParameter,
    validateStringParameter, validateEmailParameter, updateUserLoginAttempts} from './globals.js';
import {removeImage} from './fileHandler.js';
import {hash, checkHashedValue} from '../src/shared/crypto.js';
import {regenerateSession, removeAllSessions} from '../src/shared/sessions.js';
const models = require('../src/shared/sequelize.js').getClient().models;



// function to get the reviews associated with a users profile
const profileHandler = (req, res, next) => {
    let requester = (req.session.user === undefined) ? "" : req.session.user;
    // set which file the request is for
    res.locals.file = "profile";
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
            res.status(500).send({
                message: message,
                requester: requester
            });
            let logMessage = "(Error code: 1000) Some unexpected error occurred on the server";
            console.log(logMessage);
        }
        return;
    }
    // pass that cookie was not valid
    selectPath(requester, req, res, next);
};

const selectPath = (requester, req, res, next) =>
{
    let cookieValid = (requester === "") ? false : true;
    res.locals.function = "selectPath";
    let routeFound = false;
    let foundNoCookie = false;
    if(req.method === "GET")
    {
        // if here, the path is profile/username
        if(req.params.type === "reviews")
        {
            routeFound = true;
            getReviews(requester, req, res, cookieValid)
            .catch((err) => {next(err)});
        }
        else if(req.params.type === "user_info")
        {
            routeFound = true;
            getUserHeaderInfo(requester, req, res, cookieValid)
            .catch((err) => {next(err)});
        }
        else if(req.params.type === "feed")
        {
            routeFound = true;
            if(cookieValid)
            {
                getFeed(requester, req, res)
                .catch((err) => {next(err)});
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
                .catch((err) => {next(err)});
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
                .catch((err) => {next(err)});
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
                .catch((err) => {next(err)});
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
                .catch((err) => {next(err)});
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
                .catch((err) => {next(err)});
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
                .catch((err) => {next(err)});
            }
            else
            {
                foundNoCookie = true;
            }
        }
        else if(req.params.type === "delete_user")
        {
            routeFound = true;
            if(cookieValid)
            {
                removeUser(requester, req, res, next)
                .catch((err) => {next(err)});
            }
            else
            {
                foundNoCookie = true;
            }
        }
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
    }
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
    // if the route did not match any of the above
    if(!routeFound)
    {
        res.status(404).send({
            message:"The profile path sent to the server does not exist",
            requester: requester
        });
    }
    // if the route was found but cookie not found or invalid
    else if(foundNoCookie)
    {
        res.status(401).send({
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
    let followers = await models.Users.getFollowers(username, req.session.userId, models);
    if(followers === null)
    {
        res.status(404).send({
            message: "The user could not be found",
            requester: requester
        });
    }
    else
    {
        res.status(200).send({
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
    let following = await models.Users.getFollowing(username, req.session.userId, models);
    if(following === null)
    {
        res.status(404).send({
            message: "The user could not be found",
            requester: requester
        });
    }
    else
    {
        res.status(200).send({
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
    let user = await models.Users.findByLogin(username);
    // if the user was not found
    if(user === null)
    {
        res.status(404).send({
            message:"Unable to find the requested user",
            requester: loggedInUser
        });
        return;
    }
    // boolean to indicate if the requester if following the user
    let followed = false;
    // get the number of followers the user has
    let followerCount = (await user.getFollowers()).length;
    // get the number of following users the user has
    let followingCount = (await user.getFollowing()).length;
    let postCount = (await user.getUserReviews()).length;

    // if the current user is looking at their own page
    if(cookieValid)
    {
        // current user looking at another page
        if(loggedInUser !== user.username)
        {
            // see if the user they are looking at has them as a follower
            let following = await user.getFollowers( {where: {id: req.session.userId} } );
            // if not undefined, found requester as a follower
            if(following[0] !== undefined)
            {
                followed = true;
            }
        }
    }
    res.status(200).send({
        message: "User information successfully found",
        following: followed,
        followerCount: followerCount,
        followingCount: followingCount,
        requester: loggedInUser,
        postCount: postCount,
        picture: (user.picture === null) ? "default-pic.png" : user.picture
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
    let user = await models.Users.findByLogin(username);
    if(user === null)
    {
        res.status(404).send({
            message: "Unable to find the requested user",
            requester: requester
        });
        return;
    }
    if(cookieValid)
    {
        let reviews = await models.Reviews.findByIds(models, [user.id], req.session.userId, max, offset);
        // send the reveiws associated with the user and their id
        res.status(200).send({
            message: "Reviews sucessfully found for the user",
            requester: requester,
            reviews: reviews
        });
    }
    else
    {
        let reviews = await models.Reviews.findByIds(models, [user.id], undefined)
        // send the reveiws associated with the user and their id
        res.status(200).send({
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
        res.status(401).send({
            message: "You cannot access the feed of another user",
            requester: requester
        });
        return;
    }

    // this will always return an array, even if the user does not exist
    // if the user does not exist, it will just be a empty array
    // if verified the user is logged in, should not really be an issue
    let reviews = await models.Reviews.getUserReviewFeed(models, req.session.userId, max, offset);

    res.status(200).send({
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
    let userToFollow = await models.Users.findWithFollowing(followUname, req.session.userId);
    if(userToFollow === null)
    {
        res.status(404).send({
            message: "Unable to find user to follow",
            requester: requestingUser
        });
    }
    // if the user is not already following the user
    else if(userToFollow.dataValues.Followers.length < 1)
    {
        if(userToFollow.id === req.session.userId)
        {
            res.status(400).send({
                message: "User cannot follow themself",
                requester: requestingUser
            });
        }
        else
        {
            // add the user to the requesters following users
            let result = await userToFollow.addFollower(req.session.userId);
            if(result === undefined)
            {
                let message = "Some error occured trying to follow the user.  Error code: 1001"
                res.status(500).send({
                    message: message,
                    requester: requestingUser
                });
            }
            else
            {
                res.status(200).send({
                    message: "User successfully followed",
                    requester: requestingUser
                });
            }
        }
    }
    else
    {
        res.status(400).send({
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
    let userToUnfollow = await models.Users.findWithFollowing(unfollowUname, req.session.userId);
    if(userToUnfollow === null)
    {
        res.status(404).send({
            message: "Unable to find user to unfollow",
            requester: requestingUser
        });
    }
    else if(userToUnfollow.dataValues.Followers.length > 0)
    {
        if(userToUnfollow.id === req.session.userId)
        {
            res.status(400).send({
                message: "User cannot unfollow themself",
                requester: requestingUser
            });
        }
        else
        {
            let result = await userToUnfollow.removeFollower(req.session.userId);
            if(result === undefined)
            {
                let message = "Some error occured trying to unfollow the user.  Error code: 1002"
                res.status(500).send({
                    message: message,
                    requester: requestingUser
                });
            }
            else
            {
                res.status(200).send({
                    message: "User successfully unfollowed",
                    requester: requestingUser
                });
            }
        }
    }
    else
    {
        res.status(400).send({
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
    let valid = validateUsernameParameter(res, req.params.username, requester, "Username must be between 6-20 characters");
    if(!valid) return;
    valid = validateStringParameter(res, req.body.oldPassword, 6, 15, requester, "Password must be betweeen 6-15 characters", true);
    if(!valid) return;
    valid = validateStringParameter(res, req.body.newPass, 6, 15, requester, "New password must be betweeen 6-15 characters", true);
    if(!valid) return;

    if(req.params.username !== requester)
    {
        res.status(401).send({
            message: "The user passed in the url does not match the cookie",
            requester: requester
        });
    }
    else if(req.body.oldPassword === req.body.newPass)
    {
        res.status(400).send({
            message: "New password is identical to the previous one sent by the user",
            requester: requester
        });
    }
    else
    {
        let user = await models.Users.findByLogin(requester);
        if(user === null)
        {
            res.status(404).send({
                message: "Could not find the user to update",
                requester: requester
            });
            return;
        }
        let result = checkHashedValue(req.body.oldPassword, "password", user.salt);
        if(user.password === result.value)
        {
            let password = req.body.newPass;
            let result = hash(password, "password");
            user.salt = result.salt;
            user.password = result.value;
            user.lastLogin = new Date();
            user.passwordUpdatedAt = new Date();
            // remove all existing sessions except for this one
            await removeAllSessions(req, res, user.id, [req.session.id]);
            await user.save();
            // update the session
            req.session.userId = user.id;
            req.session.user = user.username;
            req.session.admin = user.admin;
            await regenerateSession(req, res);

            res.status(200).send({
                message: "Password updated",
                requester: requester
            });
        }
        else
        {
            let attempts = await updateUserLoginAttempts(user, username);
            let message = "Password incorrect";
            if(attempts >= 5)
            {
                message = message + ". User account is currently locked due to too many failed password attempts";
                requester = "";
            }
            res.status(401).send({
                message: message,
                requester: requester
            });
        }

    }
}

// function to handle updating a users information such as their
// first name, last name, email, or username
const updateInfo = async (requester, req, res, next) =>
{
    // set the function
    res.locals.function = "updateInfo";
    let username = req.params.username;
    let valid = validateUsernameParameter(res, req.body.username, requester, "Username must be between 6-20 characters");
    if(!valid) return;
    /* to be implemented later
    valid = validateEmailParameter(res, req.body.email, requester, "The email provided is not a valid email address");
    if(!valid) return;
    */
    valid = validateStringParameter(res, req.body.firstName, 1, 20, requester, "First name must be between 1-20 characters", true);
    if(!valid) return;
    valid = validateStringParameter(res, req.body.lastName, 1, 20, requester, "Last name must be between 1-20 characters", true);
    if(!valid) return;
    valid = validateUsernameParameter(res, req.body.password, requester, "Password must be between 6-15 characters", true);
    if(!valid) return;
    if(requester !== username)
    {
        res.status(401).send({
            message: "You cannot update another users information",
            requester: requester
        });
        return;
    }
    // find the user by their login
    let user = await models.Users.findByLogin(requester);
    if(user === null)
    {
        // sending 401 as if null user does not exist
        res.status(401).send({
            message: "Could not find the user to update",
            requester: ""
        });
        return;
    }
    let result = checkHashedValue(req.body.password, "password", user.salt);
    if(user.password === result.value)
    {
        // remove all existing sessions except for this one
        await removeAllSessions(req, res, user.id, [req.session.id]);
        // update the user
        let result = await user.update({
            username: req.body.username,
            //email: req.body.email,
            firstName: req.body.firstName,
            lastName: req.body.lastName
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
        await regenerateSession(req, res);

        let updatedUser = {
            username: result.username,
            email: result.email,
            firstName: result.firstName,
            lastName: result.lastName
        };
        res.status(200).send({
            message: "User info successfully updated",
            requester: updatedUser.username,
            user: updatedUser
        });
    }
    else
    {
        let attempts = await updateUserLoginAttempts(user, username);
        let message = "Password incorrect";
        if(attempts >= 5)
        {
            message = message + ". User account is currently locked due to too many failed password attempts";
            requester = "";
        }
        res.status(401).send({
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
        res.status(401).send({
            message: "Password incorrect",
            requester: requester
        });
        return;
    }
    // get the requester
    let user = await models.Users.findByLogin(requester);
    let userToRemove = user;
    let currentUser = (userNameToRemove === requester);
    // if the password is not provided, automatically deny
    if(!currentUser)
    {
        if(!user.admin)
        {
            res.status(401).send({
                message: "You cannot remove another user",
                requester: requester
            });
            return;
        }
        else
        {
            // update the user to remove to the correct user if the requester
            // is an admin
            userToRemove = await models.Users.findByLogin(userNameToRemove);
        }
    }
    if(userToRemove === null)
    {
        res.status(404).send({
            message: "Could not find the user to remove",
            requester: requester
        });
        return;
    }
    // hash the users password that was passed in
    let result = checkHashedValue(password, "password", user.salt);
    password = result.value;
    // check the users password against the requesters password
    let passwordValid = (currentUser) ? (userToRemove.password === password) : (user.password === password);
    if(passwordValid)
    {
        // remove all existing sessions for the user
        await removeAllSessions(req, res, userToRemove.id, []);
        // remove the user
        let result = await userToRemove.destroy();
        if(result === undefined)
        {
            let logMessage = "(Error code: 1006) Error in database occurred removing a user";
            console.log(logMessage);
            let message = "Server failed to remove user for some unkown reason.  Error code: 1006";
            res.status(500).send({
                message: message,
                requester: requester
            });
        }
        else
        {
            // if the user just deleted themself, return a empty cookie
            if(currentUser)
            {
                requester = "";
            }
            res.status(200).send({
                message: "User successfully removed",
                requester: requester
            });
        }
    }
    else
    {
        res.status(401).send({
            message: "Password incorrect",
            requester: requester
        });
    }

}

// function to handle validating a user can update their profile pic
const setImage = async (requester, req, res, next) =>
{
    res.locals.function = "setImage";
    let valid = validateUsernameParameter(res, req.params.username, requester, "Invalid username found in the url");
    if(!valid) return;
    if(req.params.username !== requester)
    {
        res.status(401).send({
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
        res.status(401).send({
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
                let logMessage = "(Error code: 1009).  Some unexpected error occurred on the server when removing a users profile picture";
                console.log(logMessage);
            }
        }
    }
    setTimeout(() => {
        res.status(status).send({
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
        res.status(400).send({
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
                    console.log("(Error code: 1010) User picture name conflicts with an existing image name: " + newPicture);
                    status = 500;
                    message = "Some unexpected error occurred on the server. Error code: 1010"
                }
                else
                {
                    console.log("(Error code: 1011) Some unexpected constraint error occurred");
                    console.log(errorObject);
                    status = 500;
                    message = "Some unexpected error occurred on the server.  Error code: 1011";
                    removeImage(newPicture);
                }
            }
            else
            {
                console.log("(Error code: 1012) Some unexpected error occurred");
                console.log(err);
                status = 500;
                message = "Some unexpected error occurred on the server.  Error code: 1012";
                removeImage(newPicture);
            }
        }
    }
    setTimeout(() => {
        res.status(status).send({
            message: message,
            requester: requester
        });
    }, 5000);
}

export {profileHandler};
