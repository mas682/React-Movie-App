import {verifyLogin} from './globals.js';
import models, { sequelize } from '../src/models';

// function to get information associated with the user who has the cookie
const getUserInfo = (req, res, next) => {
    // get the signed cookies in the request if there are any
    let cookie = req.signedCookies.MovieAppCookie;
    cookie = (cookie === false) ? undefined : cookie;
    // if there is a signed cookie in the request
    if(cookie != undefined)
    {
        // see if the cookie has a valid user
        verifyLogin(cookie).then((cookieValid) =>
        {
            if(cookieValid)
            {
                if(req.method === "GET")
                {
                    // get the reviews and pass the cookie
                    getUser(JSON.parse(cookie), res);
                }
                else
                {
                    let requester = cookieValid ? cookie.name : "";
                    res.status(404).send({
                        message:"The getUserInfo path sent to the server does not exist",
                        requester: requester
                    });
                }
            }
            // cookie not valid
            else
            {
                res.status(401).send({
                    message: "You are not logged in",
                    requester: ""
                });
            }
        });
    }
    // if no cookie was found
    else
    {
        res.status(401).send({
            message: "You are not logged in",
            requester: ""
        });
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
            res.status(401).send({
                requester: "",
                message: "Unable to find user associated with cookie",
            });
        }
        // if the user was found
        else
        {
            let userObj = {
                firstName: user.firstName,
                lastName: user.lastName,
                username: user.username,
                email: user.email
            };
            res.status(200).send({
                requester: username,
                message: "User info successfully found",
                user: userObj
            });
        }
    });
};

export {getUserInfo};
