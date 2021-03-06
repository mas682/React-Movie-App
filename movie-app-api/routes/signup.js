import models, { sequelize } from '../src/models';
import {verifyLogin} from './globals.js';
import {customAlphabet} from 'nanoid';
const Op = require('Sequelize').Op;
const nanoid = customAlphabet('1234567890', 6);
const moment = require('moment');
import {validateStringParameter, validateUsernameParameter, validateEmailParameter,
        validateIntegerParameter} from './globals.js';
import {emailHandler} from './EmailHandler.js';


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
    let routeFound = false;
    if(req.method === "POST")
    {
        // if the path is profile/username/follow
        if(req.params.type === "register")
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
        else if(req.params.type === "resend_verification_code")
        {
            routeFound = true;
            resendVerificationCode(cookie, req, res);
        }
        else if(req.params.type === "cancel_registration")
        {
            routeFound = true;
            removeTempUser(cookie, req, res);
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
    let password = req.body.password;
    let firstName = req.body.firstName;
    let lastName = req.body.lastName;
    let valid = validateUsernameParameter(res, username, "", "Username must be between 6-20 characters");
    if(!valid) return;
    valid = validateEmailParameter(res, email, "", "The email provided is not a valid email address");
    if(!valid) return;
    valid = validateStringParameter(res, password, 6, 15, "", "Password must be betweeen 6-15 characters");
    if(!valid) return;
    valid = validateStringParameter(res, firstName, 1, 20, "", "First name must be between 1-20 characters");
    if(!valid) return;
    valid = validateStringParameter(res, lastName, 1, 20, "", "Last name must be between 1-20 characters");
    if(!valid) return;
    let result;
    try
    {
        result = await models.UserVerificationCodes.create({
            userEmail: email,
            username: username,
            code: nanoid(),
            password: password,
            firstName: firstName,
            lastName: lastName
        });
    }
    catch (err)
    {
        let errorObject = JSON.parse(JSON.stringify(err));
        console.log(errorObject);
        if(errorObject.name === "SequelizeUniqueConstraintError")
        {
            if(errorObject.original.constraint === "UserVerificationCodes_username_key")
            {
                res.status(409).send({
                    message: "Username already exists",
                    requester: ""
                });
            }
            else if(errorObject.original.constraint === "UserVerificationCodes_userEmail_key")
            {
                res.status(409).send({
                    message: "Email already associated with a user",
                    requester: ""
                });
            }
            else
            {
                res.status(500).send({
                    message: "A unknown constraint error occurred trying to create the user",
                    requester: ""
                });
                console.log("Some unknown constraint error occurred: " + errorObject.original.constraint);
            }
        }
        else
        {
            res.status(500).send({
                message: "A unknown error occurred trying to create the user",
                requester: ""
            });
            console.log("Some unknown error occurred: " + errorObject.name);
        }
        return;
    }
    // may want to verify result not null? or undefined?
    // then send email to user
    let emailResult = await sendVerificationEmail(result.code, result.userEmail);
    console.log("Code: " + result.code);
    console.log("Adding 5 second delay");
    setTimeout(() =>{
        if(emailResult)
        {
            res.status(201).send({
                message: "Verification email sent",
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
}

// function to create a temp user before their email is verified
const resendVerificationCode = async (cookie, req, res) =>
{
    let username = req.body.username;
    let email = req.body.email;
    let valid = validateUsernameParameter(res, username, "", "Username must be between 6-20 characters");
    if(!valid) return;
    valid = validateEmailParameter(res, email, "", "The email provided is not a valid email address");
    if(!valid) return;
    let result;
    let tempUser = await models.UserVerificationCodes.findOne({
        where: {
            userEmail: email,
            username: username,
            expiresAt: {[Op.gte]: moment()},
            [Op.or]: [
                {[Op.and]: [{codesResent: 2},{verificationAttempts: {[Op.lt]: 3}}]},
                {[Op.and]: [{codesResent: {[Op.lt]: 2}}]}
            ]
        }
    });
    if(tempUser === null)
    {
        res.status(404).send({
            message: "Could not find a user with the given email and username that has a valid active verification code",
            requester: ""
        });
        return;
    }
    else if(tempUser.codesResent >= 2 && tempUser.verificationAttempts < 3)
    {
        res.status(404).send({
            message: "Could not send another verification code as the maximum number of codes to send out (3) has been met",
            requester: ""
        });
        return;
    }

    try
    {
        result = await tempUser.update({
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
    if(result === undefined || result === null)
    {
        // if undefined, tempUser cannot be found
        res.status(404).send({
            message: "User could not be found",
            requester: requester
        });
    }

    let emailResult = await sendVerificationEmail(result.code, result.userEmail);
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
}


// function to create a user once their email is verified
const createUser = async (cookie, req, res) =>
{
    let username = req.body.username;
    let email = req.body.email;
    let verificationCode = req.body.verificationCode;
    let valid = validateUsernameParameter(res, username, "", "Username must be between 6-20 characters");
    if(!valid) return;
    valid = validateEmailParameter(res, email, "", "The email provided is not a valid email address");
    if(!valid) return;
    valid = validateStringParameter(res, verificationCode, 6, 6, "", "Verification code invalid");
    if(!valid) return;
    // validate the value passed does not contain any characters, only numbers
    valid = validateIntegerParameter(res, verificationCode, "", "Verification code invalid", undefined, undefined);
    if(!valid) return;

    let tempUser = await models.UserVerificationCodes.findOne({
        where: {
            userEmail: email,
            username: username,
            expiresAt: {[Op.gte]: moment()},
            [Op.or]: [
                {[Op.and]: [{codesResent: 2},{verificationAttempts: {[Op.lt]: 3}}]},
                {[Op.and]: [{codesResent: {[Op.lt]: 2}}]}
            ]
        }
    });
    if(tempUser === null)
    {
        res.status(404).send({
            message: "Could not find a user with the given email and username that has a valid active verification code",
            requester: ""
        });
        return;
    }
    else if(tempUser.verificationAttempts >= 3 && tempUser.codesResent < 2)
    {
        res.status(404).send({
            message: "Could not verify user as a maximum of 3 attempts have been attempted for the verification code.",
            requester: ""
        });
        return;
    }

    if(tempUser.code !== verificationCode)
    {
        // if the account will become locked, remove it
        if(tempUser.codesResent >= 2 && (tempUser.verificationAttempts + 1) >= 3)
        {
            // delete the user out of the UserVerificationCodes table
            try {
                tempUser.destroy();
            }
            catch (err)
            {
                console.log("Some error occurred deleting a temp user: " + username);
                console.log(JSON.parse(JSON.stringify(err)));
            }
            res.status(401).send({
                message: "Verification code is invalid.  Maximum verification attempts met",
                requester: ""
            });
            return;
        }
        else
        {
            // update the verification attempts as account not locked out
            try
            {
                await tempUser.update({
                    verificationAttempts: tempUser.verificationAttempts + 1
                });
            }
            catch (err)
            {
                let errorObject = JSON.parse(JSON.stringify(err));
                console.log("Error updating a users verification attempts");
                console.log(errorObject);
            }
            if(tempUser.verificationAttempts >= 3)
            {
                // increment count number of verification attempts
                res.status(401).send({
                    message: "Verification code is invalid.  The maximum of 3 verification attempts met for " +
                    "the current code",
                    requester: ""
                });
                return;
            }
            // increment count number of verification attempts
            res.status(401).send({
                message: "Verification code is invalid",
                requester: ""
            });
            return;
        }
    }

    // find the a user with the username or email sent
    models.User.findOrCreate({where: {[Op.or]: [{username: username}, {email: email}]},
        defaults: {
            username: username,
            email: email,
            password: tempUser.password,
            firstName: tempUser.firstName,
            lastName: tempUser.lastName,
            verified: true
        }}
    ).then(([user, created]) => {
        // if the user did not already exist and was successfully created
        if(created)
        {
            // delete the user out of the UserVerificationCodes table
            try {
                tempUser.destroy();
            }
            catch (err)
            {
                console.log("Some error occurred deleting a temp user: " + username);
                console.log(JSON.parse(JSON.stringify(err)));
            }
            let value = JSON.stringify({name: user.username, email: user.email, id: user.id});
            res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000');
            res.cookie('MovieAppCookie', value, {domain: 'localhost', path: '/', maxAge: 86400000, signed: true});
            console.log("Adding 5 second delay");
            setTimeout(() =>{
                res.status(201).send({
                    message: "User has been created",
                    requester: username
                });
            }, 5000);
        }
        // the user existed
        else
        {
            // delete the user out of the UserVerificationCodes table
            try {
                tempUser.destroy();
            }
            catch (err)
            {
                console.log("Some error occurred deleting a temp user: " + username);
                console.log(JSON.parse(JSON.stringify(err)));
            }
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


// function to remove a temp user
const removeTempUser = async (cookie, req, res) =>
{
    let username = req.body.username;
    let email = req.body.email;
    let valid = validateUsernameParameter(res, username, "", "Username must be between 6-20 characters");
    if(!valid) return;
    valid = validateEmailParameter(res, email, "", "The email provided is not a valid email address");
    if(!valid) return;

    let tempUser = await models.UserVerificationCodes.findOne({
        where: {
            userEmail: email,
            username: username,
            expiresAt: {[Op.gte]: moment()},
            [Op.or]: [
                {[Op.and]: [{codesResent: 2},{verificationAttempts: {[Op.lt]: 3}}]},
                {[Op.and]: [{codesResent: {[Op.lt]: 2}}]}
            ]
        }
    });
    if(tempUser === null)
    {
        res.status(404).send({
            message: "Could not find a user with the given email and username that has a valid active verification code",
            requester: ""
        });
        return;
    }

    // delete the user out of the UserVerificationCodes table
    try {
        tempUser.destroy();
    }
    catch (err)
    {
        console.log("Some error occurred deleting a temp user: " + username);
        console.log(JSON.parse(JSON.stringify(err)));
        res.status(500).send({
            message: "Someting went wrong on the server when removing the temporary user",
            requester: ""
        });
        return;
    }

    res.status(200).send({
        message: "Temporary user has been removed",
        requester: ""
    });
};


const sendVerificationEmail = async (verificationCode, email) =>
{
    let html = "<b>Welcome to Movie Fantatics!</b>" +
               "<br> Your verification code is: " + verificationCode;
    let text = "If you did not sign up for Movie Fanatics, please disregard";
    let header = "Movie Fanatics Verification Code";
    let result = await emailHandler(email, header, text, html);
    return result;
}

export {signUp};
