import {verifyLogin} from './globals.js';
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
    else if(Object.keys(req.params).length == 2 && req.params[0] === "getfollowers")
    {
        getFollowers(cookie, req, res);
    }
    else if(Object.keys(req.params).length == 2 && req.params[0] === "getfollowing")
    {
        getFollowing(cookie, req, res);
    }
    else if(Object.keys(req.params).length == 2 && req.params[0] === "add_to_watchlist" && cookieValid)
    {
        addToWatchList(cookie, req, res);
    }
    else if(Object.keys(req.params).length == 2 && req.params[0] === "remove_from_watchlist" && cookieValid)
    {
        removeFromWatchList(cookie, req, res);
    }
    else if(Object.keys(req.params).length == 2 && req.params[0] === "add_to_watched" && cookieValid)
    {
        addToWatched(cookie, req, res);
    }
    else if(Object.keys(req.params).length == 2 && req.params[0] === "remove_from_watched" && cookieValid)
    {
        removeFromWatched(cookie, req, res);
    }
    else if(!cookieValid)
    {
        res.status(401).send("No cookie or cookie invalid");
    }
    // some unknow path given
    else
    {
        console.log(req.params[0]);
        res.status(404).send();
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
    let mutualFollowerIds = [];
    // may want to do this somewhere else as the feed is also doing this..
    let mutualFollowers = await models.User.getMutualFollowers(username, cookie.id);
    // this could be very slow....
    mutualFollowers.forEach((follower)=> {
        mutualFollowerIds.push(follower.id);
    });
    let notMutualFollowers = await models.User.getNotFollowedFollowers(username, cookie.id, mutualFollowerIds);
    res.status(200).send([mutualFollowers, notMutualFollowers, cookie.name]);
}

// this function will return a users following for their page
const getFollowing = async (cookie, req, res) =>
{
    let username = req.params.userId;
    let mutualFollowingIds = [];
    let mutualFollowing = await models.User.getMutualFollowing(username, cookie.id);
    // this could be very slow...
    mutualFollowing.forEach((follower)=> {
        mutualFollowingIds.push(follower.id);
    });
    let notMutualFollowing = await models.User.getNotFollowedFollowing(username, cookie.id, mutualFollowingIds);
    res.status(200).send([mutualFollowing, notMutualFollowing, cookie.name]);

}

// function to get data for the users profile header
// returns user Id, if the page is for the current user, if the user is following the
// user, the number of following/followers users
const getUserHeaderInfo = async (cookie, req, res, cookieValid) =>
{
    //let username = cookie.name;
    let username = req.params.userId;
    // find a user by their login
    models.User.findByLogin(username)
    .then(async (user)=>{
        // if the user was not found
        if(user === undefined)
        {
            res.status(404).send(["Unable to find the requested user"]);
            return;
        }
        // boolean to indicate if the requester and username are the same
        let currentUser = false;
        // boolean to indicate if the requester if following the user
        let followed = false;

        // get the number of followers the user has
        let followerCount = (await user.getFollowers()).length;
        // get the number of following users the user has
        let followingCount = (await user.getFollowing()).length;

        let loggedInUser = "";
        // if the current user is looking at their own page
        if(cookieValid)
        {
            loggedInUser = cookie.name;
            if(cookie.name === user.username)
            {
                currentUser = true;
            }
            // current user looking at another page
            else
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
        res.status(200).send([user.id, currentUser, followed, followerCount, followingCount, loggedInUser]);
    });
}

// could store index into array for each component
// then set index in parent to indicate you know follow or do not follow
// [user, following?]
// some user??

// function to get reviews for a specific user
const getReviews = async (cookie, req, res, cookieValid) =>
{
    //let username = cookie.name;
    let username = req.params.userId;
    console.log(username);
    // find a user by their login
    models.User.findByLogin(username)
    .then(async (user)=>{
        if(user === undefined)
        {
            res.status(404).send(["Unable to find the requested user"]);
            return;
        }
        if(cookieValid)
        {
            models.Review.findByIds(models, [user.id], cookie.id)
            .then((reviews)=>
            {
                console.log(reviews);
                // send the reveiws associated with the user and their id
                res.status(200).send([reviews, cookie.name]);
            });
        }
        else
        {
            models.Review.findByIds(models, [user.id], undefined)
            .then((reviews)=>
            {
                // send the reveiws associated with the user and their id
                res.status(200).send([reviews, ""]);
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
    // user to follows id number
    let userToFollowId = req.body.id;
    // user to follows username
    let followUname = req.params.userId;
    // see if the user already follows the user to follow
    models.User.findWithFollower(requestingUser, userToFollowId)
    .then((returnedUser) =>{
        // if the user is not following the user
        if(returnedUser === null)
        {
            // find the requesting user
            models.User.findByLogin(requestingUser)
            .then((requester)=>{
                if(requester === null)
                {
                    res.status(401).send("Unable to verify requester");
                }
                else
                {
                    // find user to follow to verify they exist
                    models.User.findByLogin(followUname)
                    .then((requestedUser) => {
                        // if user not found
                        if(requestedUser === null)
                        {
                            res.status(404).send("Unable to find user to follow");
                        }
                        else if(userToFollowId !== requestedUser.id)
                        {
                            res.status(404).send("The id passed in the request does not match the user");
                        }
                        else if(requestedUser.id === requester.id)
                        {
                            res.status(404).send("User cannot follow themself");
                        }
                        else
                        {
                            // add the user to the requesters following users
                            requester.addFollow(requestedUser.id).then((result) => {
                                if(result === undefined)
                                {
                                    res.status(406).send("Some error occured trying to follow the user");
                                }
                                else
                                {
                                    res.status(200).send("User successfully followed");
                                }
                            });
                        }
                    })
                }

            });
        }
        else
        {
            res.status(406).send("You already follow the user");
        }
    });
}

const unfollowUser = (cookie, req, res) =>
{
    let requestingUser = cookie.name;
    let userToUnFollowId = req.body.id;
    let unfollowUname = req.params.userId;
    // find requesting user by their id
    models.User.findWithFollower(requestingUser, userToUnFollowId)
    .then((returnedUser) =>{
        // if the user is not following the user
        if(returnedUser === null)
        {
            res.status(406).send("You already do not follow the user or the user does not exist");
        }
        else
        {
            if(returnedUser.Following[0].id !== userToUnFollowId)
            {
                res.status(404).send("The id passed in tthe request does not match the user");
                return;
            }
            returnedUser.removeFollow(returnedUser.Following[0].id).then((result)=> {
                // if the request succeeded
                if(result === 1)
                {
                    res.status(200).send("User successfully unfollowed");
                }
                else
                {
                    res.status(500).send("Something went wrong on the server");
                }
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

const addToWatchList = async (cookie, req, res) =>
{
    let username = cookie.name;
    // find a user by their login
    let user = await models.User.findByLogin(username);
    // if in this function, already validated cookie
    let loggedInUser = cookie.name;
    if(user === null || user === undefined)
    {
        res.status(404).send(["Could not find the user to add the movie to their watch list", loggedInUser]);
        return;
    }
    else
    {
        if(isNaN(req.body.movieId))
        {
            res.status(400).send(["The movie ID " + req.body.movieId + " is not a valid integer", loggedInUser]);
            return;
        }
        // at this point, see if the user already has the movie on the watchlist?
        let movie = await models.Movies.findOne({
            where: {id: req.body.movieId}
        });
        if(movie === null || movie === undefined)
        {
            res.status(404).send(["Could not find the movie to add to the user watch list", loggedInUser]);
        }
        else
        {
            let result = await user.addWatchList(movie.id);
            if(result === undefined)
            {
                res.status(200).send(["Movie already on watch list", loggedInUser]);
            }
            else
            {
                res.status(200).send(["Movie added to watch list", loggedInUser]);
            }
        }
    }
};

const removeFromWatchList = async (cookie, req, res) =>
{
    let username = cookie.name;
    // find a user by their login
    let user = await models.User.findByLogin(username);
    // if in this function, already validated cookie
    let loggedInUser = cookie.name;
    if(user === null || user === undefined)
    {
        res.status(404).send(["Could not find the user to remove the movie from their watch list", loggedInUser]);
        return;
    }
    else
    {
        if(isNaN(req.body.movieId))
        {
            res.status(400).send(["The movie ID " + req.body.movieId + " is not a valid integer", loggedInUser]);
            return;
        }
        // at this point, see if the user already has the movie on the watchlist?
        let movie = await models.Movies.findOne({
            where: {id: req.body.movieId}
        });
        if(movie === null || movie === undefined)
        {
            res.status(404).send(["Could not find the movie to remove from the users watch list", loggedInUser]);
        }
        else
        {
            let result = await user.removeWatchList(movie.id);
            if(result === undefined)
            {
                res.status(200).send(["Movie already not on watch list", loggedInUser]);
            }
            else
            {
                res.status(200).send(["Movie removed from watch list", loggedInUser]);
            }
        }
    }
};

const addToWatched = async (cookie, req, res) =>
{
    let username = cookie.name;
    // find a user by their login
    let user = await models.User.findByLogin(username);
    // if in this function, already validated cookie
    let loggedInUser = cookie.name;
    if(user === null || user === undefined)
    {
        res.status(404).send(["Could not find the user to add the movie to their watched movies list", loggedInUser]);
        return;
    }
    else
    {
        if(isNaN(req.body.movieId))
        {
            res.status(400).send(["The movie ID " + req.body.movieId + " is not a valid integer", loggedInUser]);
            return;
        }
        // at this point, see if the user already has the movie on the watchlist?
        let movie = await models.Movies.findOne({
            where: {id: req.body.movieId}
        });
        if(movie === null || movie === undefined)
        {
            res.status(404).send(["Could not find the movie to add to the user watch list", loggedInUser]);
        }
        else
        {
            let result = await user.addWatchedMovie(movie.id);
            if(result === undefined)
            {
                res.status(200).send(["Movie already on movies watched list", loggedInUser]);
            }
            else
            {
                res.status(200).send(["Movie added to movies watched list", loggedInUser]);
            }
        }
    }
};

const removeFromWatched = async (cookie, req, res) =>
{
    let username = cookie.name;
    // find a user by their login
    let user = await models.User.findByLogin(username);
    // if in this function, already validated cookie
    let loggedInUser = cookie.name;
    if(user === null || user === undefined)
    {
        res.status(404).send(["Could not find the user to remove the movie from their watched movies list", loggedInUser]);
        return;
    }
    else
    {
        if(isNaN(req.body.movieId))
        {
            res.status(400).send(["The movie ID " + req.body.movieId + " is not a valid integer", loggedInUser]);
            return;
        }
        // at this point, see if the user already has the movie on the watchlist?
        let movie = await models.Movies.findOne({
            where: {id: req.body.movieId}
        });
        if(movie === null || movie === undefined)
        {
            res.status(404).send(["Could not find the movie to remove from the users watch list", loggedInUser]);
        }
        else
        {
            let result = await user.removeWatchedMovie(movie.id);
            if(result === undefined)
            {
                res.status(200).send(["Movie already not on watched movies list", loggedInUser]);
            }
            else
            {
                res.status(200).send(["Movie removed from watched movies list", loggedInUser]);
            }
        }
    }
};


export {profileHandler};
