import models, { sequelize } from '../src/models';
import {verifyLogin} from './globals.js';
import {customAlphabet} from 'nanoid';
const Op = require('Sequelize').Op;
const nanoid = customAlphabet('1234567890', 6);
import {validateStringParameter, validateUsernameParameter, validateEmailParameter} from './globals.js';


// function to create an account
const signUp = (req, res, next) => {
    // get the signed cookies in the request if there are any
    let cookie = req.signedCookies.MovieAppCookie;
    // if there is a signed cookie in the request
    if(cookie !== undefined)
    {
        // see if the cookie has a valid user
        verifyLogin(cookie).then((cookieValid) =>
        {
            if(cookieValid)
            {
                res.status(401).send({
                    message: "You are already logged in so you must have an account",
                    requester: cookie.name
                });
            }
            // cookie not valid
            else
            {
                selectPath(undefined, req, res, cookieValid);
            }
        });
    }
    // if no cookie was found
    else
    {
        selectPath(undefined, req, res, false);
    }
};

const selectPath = (cookie, req, res, cookieValid) =>
{
    console.log("Select path sign up");
    let routeFound = false;
    if(req.method === "POST")
    {
        // if the path is profile/username/follow
        if(req.params.type === "authenticate")
        {
            routeFound = true;
            createTempUser(cookie, req, res);
        }
        // if the path is profile/username/follow
        else if(req.params.type === "create_account")
        {
            routeFound = true;
            createUser(cookie, req, res);
        }
    }
    // if the route did not match any of the above
    if(!routeFound)
    {
        let requester = cookieValid ? cookie.name : "";
        res.status(404).send({
            message:"The signup path sent to the server does not exist",
            requester: requester
        });
    }
};


// function to create a temp user before their email is verified
const createTempUser = async (cookie, req, res) =>
{
    let username = req.body.username;
    let email = req.body.email;
    let valid = validateUsernameParameter(res, username, "", "Username must be between 6-20 characters");
    if(!valid) return;
    valid = validateEmailParameter(res, email, "", "The email provided is not a valid email address");
    if(!valid) return;
    let result;
    try
    {
    result = await models.UserVerificationCodes.create({
        userEmail: email,
        username: username,
        code: nanoid()
    });
    }
    catch (err)
    {
        let errorObject = JSON.parse(JSON.stringify(err));
        console.log(errorObject);
    }
    console.log(result._);
    res.status(400).send({
        message: "Verification email sent",
        requester: ""
    });

}


// function to create a user once their email is verified
const createUser =(cookie, req, res) =>
{
    let username = req.body.username;
    let email = req.body.email;
    let password = req.body.password;
    let firstName = req.body.firstName;
    let lastName = req.body.lastName;
    let valid = validateUsernameParameter(res, username, "", "Username must be between 6-20 characters");
    if(!valid) return;
    valid = validateEmailParameter(res, email, "", "The email provided is not a valid email address");
    if(!valid) return;
    valid = validateStringParameter(res, password, 6, 15, "", "Password must be betweeen 6-15 characters");
    if(!valid) return;
    console.log(firstName);
    valid = validateStringParameter(res, firstName, 1, 20, "", "First name must be between 1-20 characters");
    if(!valid) return;
    valid = validateStringParameter(res, lastName, 1, 20, "", "Last name must be between 1-20 characters");
    if(!valid) return;


    // find the a user with the username or email sent
    models.User.findOrCreate({where: {[Op.or]: [{username: username}, {email: email}]},
        defaults: {
            username: username,
            email: email,
            password: password,
            firstName: firstName,
            lastName: lastName,
        }}
    ).then(([user, created]) => {
        // if the user did not already exist and was successfully created
        if(created)
        {
            let value = JSON.stringify({name: user.username, email: user.email, id: user.id});
            res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000');
            res.cookie('MovieAppCookie', value, {domain: 'localhost', path: '/', maxAge: 86400000, signed: true});
            res.status(201).send({
                message: "User has been created",
                requester: username
            });
        }
        // the user existed
        else
        {
            if(user.username == req.body.username)
            {
                res.status(409).send({
                    message: "Username already exists",
                    requester: ""
                });
            }
            else if(user.email == req.body.email)
            {
                res.status(409).send({
                    message: "Email already associated with a user",
                    requester: ""
                });
            }
            else
            {
                res.status(500).send({
                    message: "Someting went wrong on the server when creating the user",
                    requester: ""
                });
            }
        }
    });

};

export {signUp};
