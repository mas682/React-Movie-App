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
        else if(req.params.type === "forgot_password")
        {
            routeFound = true;
            if(cookieValid)
            {
                res.status(200).send({
                    message: "User already logged in",
                    requester: cookie.name,
                });
            }
            else
            {
                forgotPassword(req, res);
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
    let valid = validateUsernameParameter(undefined, username, "", "");
    // if not a valid username, check to see if valid email
    if(!valid)
    {
        valid = validateEmailParameter(undefined, username, res, "Username or email address is invalid");
        if(!valid) return;
    }
    valid = validateStringParameter(res, password, 6, 15, "", "Password must be between 6-15 characters");
    if(!valid) return;
    // find a user by their login
    models.User.findByLogin(req.body.username)
    .then(async (user)=>{
        // make sure the user is not null, not locked out of account
        let userValid = await validateUser(res, username, user, true);
        console.log("User valid: " + userValid);
        if(!userValid) return;
        // if the password is correct
        if(user.password === password)
        {
            //console.log(new Date(user.createdAt.toString()).toString());
            try
            {
                let result = await user.update({
                    lastLogin: new Date(),
                    passwordAttempts: 0,
                    verificationAttempts: 0,
                    verificationLocked: null
                });
            }
            catch (err)
            {
                let errorObject = JSON.parse(JSON.stringify(err));
                console.log("Some unknown error occurred updaing the users(" + username + ") account on login: " + errorObject.name);
                console.log(err);
            }
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
            await updateUserLoginAttempts(user, username);
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
    let valid = validateUsernameParameter(undefined, username, "", "");
    // if not a valid username, check to see if valid email
    if(!valid)
    {
        valid = validateEmailParameter(undefined, username, res, "Username or email address is invalid");
        if(!valid) return;
    }
    // find a user by their login
    let user = await models.User.findByLogin(req.body.username);
    let validationResult = await validateUserForVerification(user, res);
    let result = validationResult.result;
    if(!result) return;
    // verification code record exists for the user?
    let codeExists = validationResult.codeExists;
    let tempVerificationCode = validationResult.tempVerificationCode;
    if(codeExists)
    {
        try
        {
            result = await tempVerificationCode.update({
                code: nanoid(),
                codesResent: tempVerificationCode.codesResent + 1,
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
            console.log(err);
            return;
        }
    }
    else
    {
        try
        {
            result = await models.TempVerificationCodes.create({
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
            console.log(err);
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

// res is the response object
// username - user being validated
// user is the user object to valdiate
// updateAttempts is a boolean to update user password attempts on failure
const validateUser = async (res, username, user, updateAttempts) =>
{
    // false on failure
    let result = true;
    let message = "";
    let status = 0;
    // true depending on error found
    let updateUser = false;
    if(user === null)
    {
        message = "The username/email provided does not exist";
        status = 404;
        result = false;
    }
    else if(user.passwordAttempts >= 5)
    {
        message = "User account is currently locked due to too many login attempts";
        status = 401;
        updateUser = true;
        result = false;
    }
    else if(user.verificationLocked !== null)
    {
        if(new Date(user.verificationLocked) > new Date())
        {
            message = "User account tempoarily locked due to too many verification attempts";
            status = 401;
            updateUser = true;
            result = false;
        }
    }

    if(!result)
    {
        if(updateAttempts && updateUser)
        {
            await updateUserLoginAttempts(user, username);
        }
        res.status(status).send({
            message: message,
            requester: ""
        });
    }
    return result;
}


const updateUserLoginAttempts = async (user, username) => {
    try
    {
        await user.update({
            passwordAttempts: user.passwordAttempts + 1
        });
    }
    catch (err)
    {
        let errorObject = JSON.parse(JSON.stringify(err));
        console.log("Some unknown error occurred updaing the users(" + username + ") account on login failure: " + errorObject.name);
        console.log(err);
    }
}

const validateUserForVerification = async (user, res) => {
    // false on failure
    let result = true;
    let message = "";
    let status = 0;

    if(user === null)
    {
        message = "The username/email provided does not exist";
        status = 404;
        result = false;
    }
    else if(user.verificationLocked !== null)
    {
        if(new Date(user.verificationLocked) > new Date())
        {
            message = "User account tempoarily locked due to too many verification attempts";
            status = 401;
            result = false;
        }
    }
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
        if(tempVerificationCode.codesResent >= 2 && tempVerificationCode.verificationAttempts < 3)
        {
            status = 404;
            message = "Could not send another verification code as the maximum number "
                     + "of codes to send out (3) has been met.  Another code can be sent "
                     + "within 10 minutes.";
            result = false;
        }
        codeExists = true;
    }
    if(!result)
    {
        res.status(status).send({
            message: message,
            requester: ""
        });
    }
    return {
        result: result,
        codeExists: codeExists,
        tempVerificationCode: (codeExists) ? tempVerificationCode : null
    };
}


export {login};
