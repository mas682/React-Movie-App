import {verifyLogin, validateUsernameParameter, validateIntegerParameter, validateStringParameter} from './globals.js';
import models, { sequelize } from '../src/models';
import {imageHandler} from './fileHandler.js';
const fs = require('fs');
const AWS = require('aws-sdk');
const config = require('../Config.json');



// function to get the reviews associated with a users profile
const profileHandler = (req, res, next) => {
    // get the signed cookies in the request if there are any
    let cookie = req.signedCookies.MovieAppCookie;
    cookie = (cookie === false) ? undefined : cookie;
    // variable to indicate if user logged in
    let valid = false;
    // if there is a signed cookie in the request
    if(cookie != undefined)
    {
        // see if the cookie has a valid user
        verifyLogin(cookie).then((cookieValid) =>
        {
            // get the reviews and pass the cookie
            selectPath(JSON.parse(cookie), req, res, cookieValid, next);
        });
    }
    // if no cookie was found
    else
    {
        // pass that cookie was not valid
        selectPath(undefined, req, res, false, next);
    }
};

const selectPath = (cookie, req, res, cookieValid, next) =>
{
    let routeFound = false;
    let foundNoCookie = false;
    if(req.method === "GET")
    {
        // if here, the path is profile/username
        if(req.params.type === "reviews")
        {
            routeFound = true;
            getReviews(cookie, req, res, cookieValid);
        }
        else if(req.params.userId === "query")
        {
            routeFound = true;
            // get profile names
            // Not sure if this is ever actually used? could be in future though for
            // search pages..
            getProfiles(cookie, req, res, cookieValid);
        }
        else if(req.params.type === "user_info")
        {
            routeFound = true;
            getUserHeaderInfo(cookie, req, res, cookieValid);
        }
        else if(req.params.type === "feed")
        {
            routeFound = true;
            if(cookieValid)
            {
                getFeed(cookie, req, res);
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
                getFollowers(cookie, req, res);
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
                getFollowing(cookie, req, res);
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
                followUser(cookie, req, res);
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
                unfollowUser(cookie, req, res);
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
                updateInfo(cookie, req, res);
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
                updatePassword(cookie, req, res);
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
                removeUser(cookie, req, res);
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
                        setImage(cookie, req, res, next);
                    }
                    else
                    {
                        foundNoCookie = true;
                    }
                }
            }
        }
    }
    // if the route did not match any of the above
    if(!routeFound)
    {
        let requester = cookieValid ? cookie.name : "";
        res.status(404).send({
            message:"The profile path sent to the server does not exist",
            requester: requester
        });
    }
    // if the route was found but cookie not found or invalid
    else if(foundNoCookie)
    {
        let requester = cookieValid ? cookie.name : "";
        res.status(401).send({
            message:"You are not logged in",
            requester: requester
        });
    }
};


// this function will return a list of users whose username start with the passed in string
const getProfiles = async (cookie, req, res, cookieValid) =>
{
    let username = req.query.user;
    let users = await models.User.findUsers(username, 5);
    if(users === undefined)
    {
        res.status(404).send("Unable to find any users matching that value");
    }
    else
    {
        res.status(200).send(users);
    }
  };

// this function will return a users follwers for their page
const getFollowers = async (cookie, req, res, cookieValid) =>
{
    let username = req.params.userId;
    let valid = validateUsernameParameter(res, username, cookie.name, "Username is invalid");
    if(!valid) return;
    // returns a empty array if no followers
    // null if invalid user
    let followers = await models.User.getFollowers(username, cookie.id);
    if(followers === null)
    {
        res.status(404).send({
            message: "The user could not be found",
            requester: cookie.name
        });
    }
    else
    {
        res.status(200).send({
            message: "Users followers found",
            requester: cookie.name,
            users: followers
        });
    }
}

// this function will return a users following for their page
const getFollowing = async (cookie, req, res) =>
{
    let username = req.params.userId;
    let valid = validateUsernameParameter(res, username, cookie.name, "Username is invalid");
    if(!valid) return;
    let following = await models.User.getFollowing(username, cookie.id);
    if(following === null)
    {
        res.status(404).send({
            message: "The user could not be found",
            requester: cookie.name
        });
    }
    else
    {
        res.status(200).send({
            message: "Users following users found",
            requester: cookie.name,
            users: following
        });
    }
}

// function to get data for the users profile header
// returns user Id, if the page is for the current user, if the user is following the
// user, the number of following/followers users
const getUserHeaderInfo = async (cookie, req, res, cookieValid) =>
{
    //let username = cookie.name;
    let username = req.params.userId;
    let loggedInUser = (cookieValid) ? cookie.name : "";
    let valid = validateUsernameParameter(res, username, loggedInUser, "Username is invalid");
    if(!valid) return;
    // find a user by their login
    models.User.findByLogin(username)
    .then(async (user)=>{
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
        let postCount = (await user.getReviews()).length;

        // if the current user is looking at their own page
        if(cookieValid)
        {
            // current user looking at another page
            if(loggedInUser !== user.username)
            {
                // see if the user they are looking at has them as a follower
                let following = await user.getFollowers( {where: {id: cookie.id} } );
                // if not undefined, found requester as a follower
                if(following[0] !== undefined)
                {
                    followed = true;
                }
            }
        }
        res.status(200).send({
            message: "User information successfully found",
            userID: user.id,
            following: followed,
            followerCount: followerCount,
            followingCount: followingCount,
            requester: loggedInUser,
            postCount: postCount
        })
    });
}

// function to get reviews for a specific user
const getReviews = async (cookie, req, res, cookieValid) =>
{
    //let username = cookie.name;
    let username = req.params.userId;
    let requester = (cookieValid) ? cookie.name : "";
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
    models.User.findByLogin(username)
    .then(async (user)=>{
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
            models.Review.findByIds(models, [user.id], cookie.id, max, offset)
            .then((reviews)=>
            {
                // send the reveiws associated with the user and their id
                res.status(200).send({
                    message: "Reviews sucessfully found for the user",
                    requester: requester,
                    reviews: reviews
                });
            });
        }
        else
        {
            models.Review.findByIds(models, [user.id], undefined)
            .then((reviews)=>
            {
                // send the reveiws associated with the user and their id
                res.status(200).send({
                    message: "Reviews successfully found for the user",
                    requester: requester,
                    reviews: reviews
                });
            });
        }
    });
};

// function to get the feed for a specific user
const getFeed = async (cookie, req, res) =>
{
    let username = req.params.userId;
    let requester = cookie.name;
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
    if(username !== cookie.name)
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
    let reviews = await models.Review.getUserReviewFeed(models, cookie.id, max, offset);

    res.status(200).send({
        message: "Users feed successfully found",
        requester: requester,
        reviews: reviews
    });

};


// may want to change this to first get the user and everyone they follow
// then check if the requested user is in their following users
const followUser = (cookie, req, res) =>
{
    // requesting users username
    let requestingUser = cookie.name;
    // user to follows username
    let followUname = req.params.userId;
    let valid = validateUsernameParameter(res, followUname, requestingUser, "Username to follow is invalid");
    if(!valid) return;
    // get the user and see if the requester follows them
    models.User.findWithFollowing(followUname, cookie.id)
    .then((userToFollow) => {
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
            if(userToFollow.id === cookie.id)
            {
                res.status(400).send({
                    message: "User cannot follow themself",
                    requester: requestingUser
                });
            }
            else
            {
                // add the user to the requesters following users
                userToFollow.addFollower(cookie.id).then((result) => {
                    if(result === undefined)
                    {
                        res.status(500).send({
                            message: "Some error occured trying to follow the user",
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
                });
            }
        }
        else
        {
            res.status(400).send({
                message: "You already follow the user",
                requester: requestingUser
            });
        }

    });
}

const unfollowUser = (cookie, req, res) =>
{
    let requestingUser = cookie.name;
    let unfollowUname = req.params.userId;
    let valid = validateUsernameParameter(res, unfollowUname, requestingUser, "Username to unfollow is invalid");
    if(!valid) return;
    // get the user and see if the requester follows them
    models.User.findWithFollowing(unfollowUname, cookie.id)
    .then((userToUnfollow) => {

        if(userToUnfollow === null)
        {
            res.status(404).send({
                message: "Unable to find user to unfollow",
                requester: requestingUser
            });
        }
        else if(userToUnfollow.dataValues.Followers.length > 0)
        {
            if(userToUnfollow.id === cookie.id)
            {
                res.status(400).send({
                    message: "User cannot unfollow themself",
                    requester: requestingUser
                });
            }
            else
            {
                userToUnfollow.removeFollower(cookie.id).then((result) => {
                    if(result === undefined)
                    {
                        res.status(500).send({
                            message: "Some error occured trying to unfollow the user",
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
                });
            }
        }
        else
        {
            res.status(400).send({
                message: "You already do not follow the user",
                requester: requestingUser
            });
        }
    });
}

// function to handle updating a users password
const updatePassword = async (cookie, req, res) =>
{
    let username = cookie.name;
    // if the password is not provided, automatically deny
    if(!req.body.oldPassword)
    {
        res.status(401).send("Your password is incorrect");
    }
    else if(req.params.userId !== cookie.name)
    {
        res.status(401).send("The user passed in the url does not match the cookie");
    }
    else if(!req.body.newPass)
    {
        res.status(400).send("New password not provided");
    }
    else if(req.body.newPass.length < 8)
    {
        res.status(400).send("Password must be at least 8 characters")
    }
    else if(req.body.oldPassword === req.body.newPass)
    {
        res.status(400).send("New password is identical to the previous one");
    }
    else
    {
        let user = await models.User.findByLogin(cookie.name);
        if(user === null)
        {
            res.status(404).send("Could not find the user to update");
            return;
        }
        if(user.password === req.body.oldPassword)
        {
            user.password = req.body.newPass;
            user.lastLogin = new Date();
            user.passwordUpdatedAt = new Date();
            let result = await user.save();
            // send a updated cookie
            let value = JSON.stringify({
                name: user.username,
                email: user.email,
                id: user.id,
                created: new Date()
            });
            res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000');
            res.cookie('MovieAppCookie', value, {domain: 'localhost', path: '/', maxAge: 86400000, signed: true});
            res.status(200).send("Password updated");
        }
        else
        {
            res.status(401).send("Password incorrect");
        }

    }
}

// function to handle updating a users information such as their
// first name, last name, email, or username
const updateInfo = (cookie, req, res) =>
{
    //let username = cookie.name;
    let username = req.params.userId;
    // find a user by their login
    models.User.findByLogin(username)
    .then(async (user)=>{
        if(user === null)
        {
            res.status(404).send(["Could not find the user to update"]);
            return;
        }
        let currentUser = false;
        // if this is the current user
        if(cookie.name === user.username)
        {
            // if the username is being updated, make sure not in use
            if(user.username !== req.body.username)
            {
                let tempUser = await models.User.findByLogin(req.body.username);
                if(tempUser !== null)
                {
                    res.status(409).send(["username already in use"]);
                    return;
                }
            }
            // if the email is being updated, make sure not in use
            if(user.email !== req.body.email)
            {
                let tempUser = await models.User.findByLogin(req.body.email);
                if(tempUser !== null)
                {
                    res.status(409).send(["email already in use"]);
                    return;
                }
            }

            user.username = req.body.username;
            user.email = req.body.email;
            user.firstName = req.body.firstName;
            user.lastName = req.body.lastName;
            user.save().then((result) =>{
                // below is used to update the cookie as the values have changed
                let value = JSON.stringify({
                    name: user.username,
                    email: user.email,
                    id: user.id,
                    created: new Date()
                  });
                res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000');
                res.cookie('MovieAppCookie', value, {domain: 'localhost', path: '/', maxAge: 86400000, signed: true});
                res.status(200).send([user.username, user.email, user.firstName, user.lastName]);
            });
        }
        else
        {
            res.send(401).send(["Cannot update the profile of another user"]);
        }
    });
}


// function to handle updating a users password
const removeUser = async (cookie, req, res) =>
{
    let requester = cookie.name;
    let password = req.body.password;
    let userNameToRemove = req.params.userId;
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
    let user = await models.User.findByLogin(cookie.name);
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
            userToRemove = await models.User.findByLogin(userNameToRemove);
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
    // check the users password against the requesters password
    let passwordValid = (currentUser) ? (userToRemove.password === password) :
        (user.password === password);
    if(passwordValid)
    {
        let result = await userToRemove.destroy();
        if(result === undefined)
        {
            res.status(500).send({
                message: "Server failed to remove user for some unkown reason",
                requester: requester
            });
        }
        else
        {
            // if the user just deleted themself, return a empty cookie
            if(currentUser)
            {
                res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000');
                res.cookie('MovieAppCookie', null, {domain: 'localhost', path: '/', maxAge: 0, signed: true});
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

// function to handle updating a users profile pic
const setImage = async (cookie, req, res, next) =>
{
    let username = cookie.name;
    if(req.params.userId !== cookie.name)
    {
        res.status(401).send({message: "The user passed in the url does not match the cookie", requester: username});
    }
    else
    {
        console.log("Inside set image!");
        next();
    }
}

export {profileHandler};
