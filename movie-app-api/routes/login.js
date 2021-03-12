import models, { sequelize } from '../src/models';
import {verifyLogin} from './globals.js';
import {customAlphabet} from 'nanoid';
const Op = require('Sequelize').Op;
import {validateStringParameter, validateEmailParameter, validateUsernameParameter} from './globals.js';
import {emailHandler} from './EmailHandler.js';
const nanoid = customAlphabet('1234567890', 6);
const moment = require('moment');


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
            console.log("Type: " + req.params.type);
            selectPath(JSON.parse(cookie), req, res, cookieValid);
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
    let routeFound = false;
    if(req.method === "POST")
    {
        if(req.params.type === undefined)
        {
            routeFound = true;
            if(cookieValid)
            {
                res.status(200).send({
                    message: "User authenticated",
                    requester: cookie.name,
                });
            }
            else
            {
                checkLogin(req, res);
            }
        }
    }
    else if(req.method === "GET")
    {
        if(req.params.type === "authenticate")
        {
            routeFound = true;
            if(cookieValid)
            {
                res.status(200).send({
                    message: "User logged in",
                    requester: cookie.name
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
    }
    if(!routeFound)
    {
        let requester = cookieValid ? cookie.name : "";
        res.status(404).send({
            message:"The login path sent to the server does not exist",
            requester: requester
        });
    }
}

const checkLogin = (req, res) =>
{
    // check login and generate cookie if login allowed
    let password = req.body.password;
    let username = req.body.username;
    // set to 30 as if allowing email will have to be longer
    // checks if this could be a username
    let valid = validateUsernameParameter(undefined, username, "", "");
    // if not a valid username, check to see if valid email
    if(!valid)
    {
        valid = validateEmailParameter(undefined, username, "", "");
        // if the email is also not valid
        if(!valid)
        {
            res.status(400).send({
                message: "Username or email address is invalid",
                requester: ""
            });
            return;
        }
    }
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


const forgotPassword = async (req, res) =>
{
    let username = req.body.username;
    // set to 30 as if allowing email will have to be longer
    // checks if this could be a username
    let valid = validateUsernameParameter(undefined, username, "", "");
    // if not a valid username, check to see if valid email
    if(!valid)
    {
        valid = validateEmailParameter(undefined, username, "", "");
        // if the email is also not valid
        if(!valid)
        {
            res.status(400).send({
                message: "Username or email address is invalid",
                requester: ""
            });
            return;
        }
    }
    // find a user by their login
    let user = await models.User.findByLogin(req.body.username);
    if(user === null)
    {
        // sending not found but may want to just say failed for security reasons?
        res.status(404).send({
            message: "The username/email provided does not exist",
            requester: ""
        });
        return;
    }

    // left off here...
    // need to think this through more...
    // what happens if a user tries say 7 times...let's the old code expire,
    // and then code resets and they get 7 more tries...
    // thus they can keep doing this over and over
    // how can I keep track of this so that this does not happen?
    // also need to lock account after so many failures
    // keep track on server side of failed login attempts in a row..

    // see if the user already has a temp verification code out there
    let tempVerificationCode = await models.TempVerificationCodes.findOne({
        where: {
            userId: user.id,
            expiresAt: {[Op.gte]: moment()},
            [Op.or]: [
                {[Op.and]: [{codesResent: 2},{verificationAttempts: {[Op.lt]: 3}}]},
                {[Op.and]: [{codesResent: {[Op.lt]: 2}}]}
            ]
        }
    });

    let codeExists = false;
    if(tempVerificationCode !== null)
    {
        if(tempUser.codesResent >= 2 && tempUser.verificationAttempts < 3)
        {
            res.status(404).send({
                message: "Could not send another verification code as the maximum number of codes to send out (3) has been met",
                requester: ""
            });
            return;
        }
        codeExists = true;
    }

    let result;
    if(codeExists)
    {
        try
        {
            result = await tempVerificationCode.update({
                code: nanoid(),
                codesResent: tempUser.codesResent + 1,
                verificationAttempts: 0
            });
        }
        catch (err)
        {
            let errorObject = JSON.parse(JSON.stringify(err));
            res.status(500).send({
                    message: "A unknown error occurred trying to update the users verification code",
                    requester: ""
                });
            console.log("Some unknown error occurred: " + errorObject.name);
            return;
        }
    }
    else
    {
        try
        {
            result = await tempVerificationCode.create({
                userId: user.id,
                code: nanoid()
            });
        }
        catch (err)
        {
            let errorObject = JSON.parse(JSON.stringify(err));
            res.status(500).send({
                    message: "A unknown error occurred trying to create the users verification code",
                    requester: ""
                });
            console.log("Some unknown error occurred: " + errorObject.name);
            return;
        }
    }

    if(result === undefined || result === null)
    {
        // if undefined, record cannot be found
        res.status(500).send({
            message: "User verification code could not be generated",
            requester: requester
        });
    }

    let emailResult = await sendVerificationEmail(result.code, user.email);
    console.log("Code: " + result.code);
    console.log("Adding 5 second delay");
    setTimeout(() =>{
        if(emailResult)
        {
            res.status(201).send({
                message: "Verification email sent.",
                requester: ""
            });
        }
        else
        {
            res.status(500).send({
                message: "Verification email not sent",
                requester: ""
            });
        }
    }, 5000);


};

const sendVerificationEmail = async (verificationCode, email) =>
{
    let html = "<b>Movie Fantatics!</b>" +
               "<br> Your temporary verification code is: " + verificationCode;
    let text = "If you did not request this verification code, make sure your account"
                + " has not been hacked";
    let header = "Movie Fanatics Temporary Verification Code";
    let result = await emailHandler(email, header, text, html);
    return result;
}

export {login};
