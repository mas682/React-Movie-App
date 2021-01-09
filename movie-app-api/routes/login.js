import models, { sequelize } from '../src/models';
import {verifyLogin} from './globals.js';
const Op = require('Sequelize').Op;
import {validateStringParameter} from './globals.js';


// function to see if a user can login and returns a cookie to use
const login = (req, res, next) => {
    // get the signed cookies in the request if there are any
    let cookie = req.signedCookies.MovieAppCookie;
    // if there is a signed cookie in the request
    if(cookie !== undefined)
    {
        // see if the cookie has a valid user
        verifyLogin(cookie).then((cookieValid) =>
        {
            if(req.params.type === "authenticate")
            {
                if(cookieValid)
                {
                    res.status(200).send({
                        message: "User logged in",
                        requester: JSON.parse(cookie).name
                    });
                }
                else
                {
                    res.status(200).send({
                        message: "User not logged in",
                        requester: ""
                    });
                }
            }
            else if(cookieValid)
            {
                res.status(200).send({
                    message: "User authenticated",
                    requester: user.username,
                });
            }
            // cookie not valid
            else
            {
                checkLogin(req, res);
            }
        });
    }
    // if no cookie was found
    else
    {
        if(req.params.type === "authenticate")
        {
            res.status(200).send({
                message: "User not logged in",
                requester: ""
            });
            return;
        }
        else
        {
            checkLogin(req, res);
        }
        // should redirect to home page at this point if login worked
        // or let client side handle the reroute?
    }
};

const checkLogin = (req, res) =>
{
    // check login and generate cookie if login allowed
    let password = req.body.password;
    let username = req.body.username;
    // set to 30 as if allowing email will have to be longer
    let valid = validateStringParameter(res, username, 8, 30, "", "Username or email must be between 6-30 characters");
    if(!valid) return;
    valid = validateStringParameter(res, password, 6, 15, "", "Password must be between 6-15 characters");
    if(!valid) return;
    // find a user by their login
    models.User.findByLogin(req.body.username)
    .then((user)=>{
        if(user === null)
        {
            // sending not found but may want to just say failed for security reasons?
            res.status(404).send({
                message: "The username/email provided does not exist",
                requester: ""
            });
            return;
        }
        // if the password is correct
        // may want to do something like salting, not really secure
        else if(user.password === password)
        {
            // create the valie to put into the cookie
            let value = JSON.stringify({name: user.username, email: user.email, id: user.id});
            // create the cookie with expiration in 1 day
            res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000');
            res.cookie('MovieAppCookie', value, {domain: 'localhost', path: '/', maxAge: 86400000, signed: true});
            let userJson = "{\"user\":\"" + user.username + "\"}";
            res.status(200).send({
                message: "User authenticated",
                requester: user.username,
            });
        }
        else
        {
            // may want to just say login denied
            // also may want to keep track of failed login attemts and slow server
            // down or lock account if too many failed attempts
            res.status(401).send({
                message: "Incorrect password",
                requester: ""
            });
        }
    });
};

export {login};
