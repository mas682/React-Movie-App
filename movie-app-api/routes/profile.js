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
            if(cookieValid)
            {
                // get the reviews and pass the cookie
                selectPath(JSON.parse(cookie), req, res);
            }
            // cookie not valid
            else
            {
                res.send("No cookie");
            }
        });
    }
    // if no cookie was found
    else
    {
        // may want to change this...
        //selectPath(null, req, res);
        res.status(401).send("reroute as not logged in");
        // reroute to login page
        // should redirect to home page at this point if login worked
        // or let client side handle the reroute?
    }
};

const selectPath = (cookie, req, res) =>
{
    // if here, the path is profile/username
    if(Object.keys(req.params).length == 1)
    {
        getReviews(cookie, req, res);
    }
    // if the path is profile/username/follow
    else if(Object.keys(req.params).length == 2 && req.params[0] === "follow")
    {
        followUser(cookie, req, res);
    }
    // if the path is profile/username/follow
    else if(Object.keys(req.params).length == 2 && req.params[0] === "unfollow")
    {
        unfollowUser(cookie, req, res);
    }
    else if(Object.keys(req.params).length == 2 && req.params[0] === "feed")
    {
        getFeed(cookie, req, res);
    }
    // some unknow path given
    else
    {
        res.status(404).send();
    }
};

// function to get reviews for a specific user
const getReviews = (cookie, req, res) =>
{
    //let username = cookie.name;
    let username = req.params.userId;
    // find a user by their login
    models.User.findByLogin(username)
    .then((user)=>{
        let currentUser = false;
        // if the current user is looking at their own page
        if(cookie.name === user.username)
        {
            currentUser = true;
            models.Review.findById(models, user.id)
            .then((reviews)=>
            {
                // send the reveiws associated with the user and their id
                res.status(200).send([user.id, currentUser, false, reviews]);
            });
        }
        // current user looking at another page
        else
        {
            // see if the user they are looking at has them as a follower
            user.getFollowers({
                where: {id: cookie.id}
            })
            .then((follower) => {
                let followed = false;
                if(follower[0] !== undefined)
                {
                    if(follower[0].username === cookie.name)
                    {
                        followed = true;
                    }
                }
                models.Review.findById(models, user.id)
                .then((reviews)=>
                {
                    // send the reveiws associated with the user and their id
                    res.status(200).send([user.id, currentUser, followed, reviews]);
                });
            })
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
        models.Review.findFriendsReviews(models, userIds)
        .then((reviews) =>{
            console.log("Reviews found: ");
            console.log(reviews);
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

export {profileHandler};
