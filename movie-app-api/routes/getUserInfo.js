import {verifyLogin} from './globals.js';
import models, { sequelize } from '../src/models';

// function to get information associated with the user who has the cookie
const getUserInfo = (req, res, next) => {
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
                // get the reviews and pass the cookie
                getUser(JSON.parse(cookie), res);
            }
            // cookie not valid
            else
            {
                res.status(401).send("Invalid cookie");
            }
        });
    }
    // if no cookie was found
    else
    {
        res.status(401).send("No cookie found in request");
    }
};

const getUser = (cookie, res) =>
{
    let username = cookie.name;
    // find a user by their login
    models.User.findByLogin(username)
    .then((user)=>{
        // if the user was not found
        if(user === null)
        {
            res.status(404).send("Unable to find user associated with cookie");
        }
        // if the user was found
        else
        {
            res.status(200).send([user.firstName, user.lastName, user.username, user.email]);
        }
    });
};

export {getUserInfo};
