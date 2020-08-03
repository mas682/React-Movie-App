import models, { sequelize } from '../src/models';
import {verifyLogin} from './globals.js';


// function to see if a user can login and returns a cookie to use
const homePage = (req, res, next) => {
    console.log(req.originalUrl);
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
                res.status(200).send(JSON.parse(cookie).name);
                // may want to rediirect here to another page??
            }
            // cookie not valid
            else
            {
                res.status(200).send("No user logged in");
            }
        });
    }
    // if no cookie was found, send status okay and that no user is logged in
    else
    {
        res.status(200).send("No user logged in");
    }
};

export {homePage};
