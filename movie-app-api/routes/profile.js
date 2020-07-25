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
        selectPath(null, req, res);
        //res.send("reroute as not logged in");
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
    // some unknow path given
    else
    {
        res.status(404).send();
    }
};

const getReviews = (cookie, req, res) =>
{
    //let username = cookie.name;
    let username = req.params.userId;
    // find a user by their login
    models.User.findByLogin(username)
    .then((user)=>{
        models.Review.findById(models, user.id)
        .then((reviews)=>
        {
            console.log(reviews);
            // send the reveiws associated with the user
            res.status(200).send(reviews);
        });
    });
};

const followUser = (cookie, req, res) =>
{
    /*

        may want to change this to see if user already following user

    */
    let requestingUser = cookie.name;
    let userToFollow = req.params.userId;
    console.log("adding user");
    // find requesting user by their id
    models.User.findByLogin(requestingUser)
    .then((requester)=>{
        // if user not found
        console.log(requester);
        if(requester === null)
        {
            res.status(401).send("Unable to verify requester");
        }
        else
        {
            // find user to follow
            models.User.findByLogin(userToFollow)
            .then((requestedUser) => {
                // if user not found
                if(requestedUser === null)
                {
                    res.status(404).send("Unable to find user to follow");
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
                            res.status(406).send("You already follow the user");
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

export {profileHandler};
