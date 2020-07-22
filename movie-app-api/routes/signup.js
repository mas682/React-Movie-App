import models, { sequelize } from '../src/models';
import {verifyLogin} from './globals.js';
const Op = require('Sequelize').Op;


// function to create an account
const signUp = (req, res, next) => {
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
                res.status(403).send('You are already logged in.')
            }
            // cookie not valid
            else
            {
                createUser(req, res);
            }
        });
    }
    // if no cookie was found
    else
    {
        createUser(req, res);
    }
};

// function to create a user
const createUser =(req, res) =>
{
    // find the a user with the username or password sent
    models.User.findOrCreate({where: {[Op.or]: [{username: req.body.username}, {email: req.body.email}]},
        defaults: {
            username: req.body.username,
            email: req.body.email,
            password: req.body.password,
            firstName: req.body.firstName,
            lastName: req.body.lastName,
        }}
    ).then(([user, created]) => {
        // if the user did not already exist and was successfully created
        if(created)
        {
            let value = JSON.stringify({name: user.username, email: user.email, id: user.id});
            res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000');
            res.cookie('MovieAppCookie', value, {domain: 'localhost', path: '/', maxAge: 86400000, signed: true, httpOnly: true});
            res.status(201).send("User has been created");
        }
        // the user existed
        else
        {
            if(user.username == req.body.username)
            {
                res.status(409).send("username already in use");
            }
            else if(user.email == req.body.email)
            {
                res.status(409).send("email already in use");
            }
            else
            {
                res.status(500).send("something went wrong creating the user");
            }
        }
    });

};

export {signUp};
