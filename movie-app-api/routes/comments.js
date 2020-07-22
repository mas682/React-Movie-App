import models, { sequelize } from '../src/models';
import {verifyLogin} from './globals.js';


// function to see if a user can login and returns a cookie to use
const addComment = (req, res, next) => {
    // get the signed cookies in the request if there are any
    let cookie = req.signedCookies.MovieAppCookie;
    // if there is a signed cookie in the request
    if(cookie != undefined)
    {
        // see if the cookie has a valid user
        verifyLogin(cookie).then((cookieValid) =>
        {
            if(cookieValid)
            {
                postComment(req, res, cookie);
                // for testing
                //postComment(req, res);
            }
            // cookie not valid
            else
            {
                res.status(401).send("You are not logged in");
            }
        });
    }
    // if no cookie was found
    else
    {
        res.status(401).send("You are not logged in");
        // should redirect to home page at this point if login worked
        // or let client side handle the reroute?
    }
};

const postComment = (req, res) =>
{
    // may need to also add error checking to make sure review actually exists
    // or that the user can add a comment to this users post
    // may want to add a function in the comment.js database file
    let user = JSON.parse(cookie);
    models.Comment.create({
        value: req.body.comment,
        userId: user.id,
        // for testing
        //userId: 1,
        reviewId: req.body.reviewId,
    }).then(() => {
        res.status(201).send("Comment successfully posted");
    });
};

export {addComment};
