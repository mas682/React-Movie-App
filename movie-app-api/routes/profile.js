import {verifyLogin, validateUsernameParameter} from './globals.js';
import models, { sequelize } from '../src/models';

// function to get the reviews associated with a users profile
const profileHandler = (req, res, next) => {
    // get the signed cookies in the request if there are any
    let cookie = req.signedCookies.MovieAppCookie;
    // variable to indicate if user logged in
    let valid = false;
    // if there is a signed cookie in the request
    if(cookie != undefined)
    {
        // see if the cookie has a valid user
        verifyLogin(cookie).then((cookieValid) =>
        {
            // get the reviews and pass the cookie
            selectPath(JSON.parse(cookie), req, res, cookieValid);
        });
    }
    // if no cookie was found
    else
    {
        // pass that cookie was not valid
        selectPath(undefined, req, res, false);
    }
};

const selectPath = (cookie, req, res, cookieValid) =>
{
    console.log(req.params.userId);
    // if here, the path is profile/username
    if(Object.keys(req.params).length == 1 && Object.keys(req.query).length === 0)
    {
        getReviews(cookie, req, res, cookieValid);
    }
    else if(req.params.userId === "query")
    {
        getProfiles(cookie, req, res, cookieValid);
    }
    else if(Object.keys(req.params).length == 2 && req.params[0] === "user_info")
    {
        getUserHeaderInfo(cookie, req, res, cookieValid);
    }
    // if the path is profile/username/follow
    else if(Object.keys(req.params).length == 2 && req.params[0] === "follow" && cookieValid)
    {
        followUser(cookie, req, res);
    }
    // if the path is profile/username/follow
    else if(Object.keys(req.params).length == 2 && req.params[0] === "unfollow" && cookieValid)
    {
        unfollowUser(cookie, req, res);
    }
    else if(Object.keys(req.params).length == 2 && req.params[0] === "feed" && cookieValid)
    {
        getFeed(cookie, req, res);
    }
    else if(Object.keys(req.params).length == 2 && req.params[0] === "update" && cookieValid)
    {
        updateInfo(cookie, req, res);
    }
    else if(Object.keys(req.params).length == 2 && req.params[0] === "update_password" && cookieValid)
    {
        updatePassword(cookie, req, res);
    }
    else if(Object.keys(req.params).length == 2 && req.params[0] === "getfollowers" && cookieValid)
    {
        getFollowers(cookie, req, res);
    }
    else if(Object.keys(req.params).length == 2 && req.params[0] === "getfollowing" && cookieValid)
    {
        getFollowing(cookie, req, res);
    }
    else if(!cookieValid)
    {
        res.status(401).send({
            message: "No cookie or cookie invalid",
            requester: ""
        });
    }
    // some unknow path given
    else
    {
        res.status(404).send({message: "Request failed"});
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
            requester: loggedInUser
        })
    });
}

// function to get reviews for a specific user
const getReviews = async (cookie, req, res, cookieValid) =>
{
    //let username = cookie.name;
    let username = req.params.userId;
    let requester = (cookieValid) ? cookie.name : "";
    let valid = validateUsernameParameter(res, username, requester, "Username is invalid");
    if(!valid) return;
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
            models.Review.findByIds(models, [user.id], cookie.id)
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
const getFeed = (cookie, req, res) =>
{
    let username = req.params.userId;
    if(username !== cookie.name)
    {
        // unathorized
        res.status(401).send("You cannot access the feed of another user");
        return;
    }
    models.User.getAllFollowers(username)
    .then((followers) =>{
        let userIds = [];
        followers.forEach((user) => {
            userIds.push(user.id);
        });
        userIds.push(cookie.id);
        models.Review.findByIds(models, userIds, cookie.id)
        .then((reviews) =>{
            console.log(reviews[0].review.movie);
            res.status(200).send(reviews);
        });
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
            let result = await user.save();
            // send a updated cookie
            let value = JSON.stringify({name: user.username, email: user.email, id: user.id});
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
                let value = JSON.stringify({name: user.username, email: user.email, id: user.id});
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

export {profileHandler};
