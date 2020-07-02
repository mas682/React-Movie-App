import {verifyLogin} from './globals.js';
import models, { sequelize } from '../src/models';

// function to get the reviews associated with a users profile
const getProfile = (req, res, next) => {
    // get the signed cookies in the request if there are any
    let cookie = req.signedCookies.values;
    // variable to indicate if user logged in
    let valid = false;
    // if there is a signed cookie in the request
    if(cookie != undefined)
    {
        // see if the cookie has a valid user
        verifyLogin(req.signedCookies).then((cookieValid) =>
        {
            if(cookieValid)
            {
                // get the reviews and pass the cookie
                getReviews(JSON.parse(req.signedCookies.values), res);
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
        res.send("reroute as not logged in");
        // reroute to login page
        // should redirect to home page at this point if login worked
        // or let client side handle the reroute?
    }
};

const getReviews = (cookie, res) =>
{
    let username = cookie.name;
    // find a user by their login
    models.User.findByLogin(username)
    .then((user)=>{
        models.Review.findById(models, user.id)
        .then((reviews)=>
        {
            // send the reveiws associated with the user
            res.send(reviews);
        });
    });
};

export {getProfile};
