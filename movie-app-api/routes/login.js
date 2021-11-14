const models = require('../src/shared/sequelize.js').getClient().models;
import {customAlphabet} from 'nanoid';
const Op = require('sequelize').Op;
import {validateStringParameter, validateEmailParameter, validateUsernameParameter,
        validateIntegerParameter, validateBooleanParameter} from './globals.js';
import {emailHandler} from './emailHandler.js';
const nanoid = customAlphabet('1234567890', 6);
const moment = require('moment');
import {checkHashedValue, hash} from '../src/shared/crypto.js';
import {createSession, destroySession} from '../src/shared/sessions.js';
import { loggers } from 'winston';
const config = require('../Config.json');
const Logger = require("../src/shared/logger.js").getLogger();

// function to see if a user can login and returns a cookie to use
const login = (req, res, next) => {
    // be careful with this here as you may need to go to this route to reset password
    let requester = (req.session === undefined || req.session.user === undefined || req.session.passwordResetSession !== undefined) ? "" : req.session.user;
    // set which file the request is for
    res.locals.file = "login";
    selectPath(requester, req, res, next);
};


const selectPath = (requester, req, res, next) =>
{
    res.locals.function = "selectPath";
    let routeFound = false;
    let cookieValid = (requester === "") ? false : true;
    if(req.method === "POST")
    {
        if(req.params.type === "authenticate" && Object.keys(req.query).length === 0)
        {
            routeFound = true;
            if(cookieValid)
            {
                res.status(200).sendResponse({
                    message: "User authenticated",
                    requester: requester,
                });
            }
            else
            {
                checkLogin(req, res)
                .catch((err) => {next(err)});
            }
        }
        else if(req.params.type === "forgot_password")
        {
            routeFound = true;
            if(cookieValid)
            {
                res.status(401).sendResponse({
                    message: "User already logged in",
                    requester: requester,
                });
            }
            else
            {
                forgotPassword(req, res)
                .catch((err) => {next(err)});
            }
        }
        else if(req.params.type === "validate_passcode")
        {
            routeFound = true;
            if(cookieValid)
            {
                res.status(401).sendResponse({
                    message: "User already logged in",
                    requester: requester,
                });
            }
            else
            {
                validatePassCode(req, res)
                .catch((err) => {next(err)});
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
                res.status(200).sendResponse({
                    message: "User logged in",
                    requester: requester
                });
            }
            else
            {
                res.status(401).sendResponse({
                    message: "User not logged in",
                    requester: requester
                });

            }
        }
        else if(req.params.type === "logout")
        {
            routeFound = true;
            if(cookieValid)
            {
                logout(req, res)
                .catch((err) => {next(err)});
            }
            else
            {
                res.status(401).sendResponse({
                    message: "User not logged in",
                    requester: requester
                });
            }
        }
    }
    if(!routeFound)
    {
        res.status(404).sendResponse({
            message:"The login path sent to the server does not exist",
            requester: requester
        });
    }
}

// function to remove a users session on logout
const logout = async(req, res) =>
{
    res.locals.function = "logout"
    let sessionId = req.session.id;
    let userId = req.session.userId;
    // remove the session from redis
    await destroySession(req);
    // remove the session from the database
    await models.UserSessions.destroy({
        where: {
            session: sessionId,
            userId: userId
        }
    });

    // set the cookie options so the browser may remove the cookie
    // needs to match cookie for sessions
    let options = {
        httpOnly: true,
        // should be true
        secure: true,
        sameSite: 'lax',
        path: '/'
    }
    // mark the cookie as expired
    res.clearCookie(config.app.cookieName, options);

    res.status(200).sendResponse({
        message: "User successfully logged out",
        requester: ""
    });
} 

const checkLogin = async (req, res) =>
{
    res.locals.function = "checkLogin";
    // check login and generate cookie if login allowed
    let password = req.body.password;
    let username = req.body.username;
    let stayLoggedIn = req.body.stayLoggedIn;
    // set to 30 as if allowing email will have to be longer
    let valid = validateUsernameParameter(undefined, username, "", "");
    // if not a valid username, check to see if valid email
    if(!valid)
    {
        valid = validateEmailParameter(res, username, "", "Username or email address is invalid");
        if(!valid) return;
    }
    valid = validateStringParameter(res, password, 6, 15, "", "Password must be between 6-15 characters");
    if(!valid) return;
    valid = validateBooleanParameter(res, stayLoggedIn, "", "Stay logged in must be either true or false");
    if(!valid) return;
    // find a user by their login
    //let user = await models.Users.findByLogin(req.body.username);
    let user = await models.Users.findByLoginForAuth(username);
    // make sure the user is not null, not locked out of account
    let userValid = await validateUser(res, username, user, true);
    if(!userValid) return;
    let result = checkHashedValue(password, "password", user.credentials.salt);
    // if the password is correct
    if(result.value === user.credentials.password)
    {
        try
        {
            await models.UserAuthenticationAttempts.update({
                lastLogin: new Date(),
                passwordAttempts: 0,
                verificationAttempts: 0,
                verificationLocked: null
            },
            {
                where: { userId: user.id }
            });
        }
        catch (err)
        {
            let errorObject = JSON.parse(JSON.stringify(err));
            Logger.error("Some unknown error occurred updaing the users(" + username + ") account on login: " + errorObject.name,
                {errorCode: 1603, function: "checkLogin", file: "login.js", requestId: req.id, error: errorObject});
        }
        // create session for user
        await createSession(user, req, res, !stayLoggedIn, false);

        setTimeout(() =>{
            res.status(200).sendResponse({
                message: "User authenticated",
                requester: user.username,
            });
        }, 0);
    }
    else
    {
        let attempts = await models.UserAuthenticationAttempts.updateUserLoginAttempts(req, res, user.id, username, 1614);
        let message = "Incorrect password"
        if(attempts >= 5)
        {
            message = message + ".  User account is currently locked due to too many login attempts"
        }
        res.status(401).sendResponse({
            message: message,
            requester: ""
        });
    }
};

const forgotPassword = async (req, res) =>
{
    res.locals.function = "forgotPassword";
    let username = req.body.username;
    let valid = validateUsernameParameter(undefined, username, "", "");
    // if not a valid username, check to see if valid email
    if(!valid)
    {
        valid = validateEmailParameter(res, username, "", "Username or email address is invalid");
        if(!valid) return;
    }
    // find a user by their login
    let user = await models.Users.findByLoginForVerification(req.body.username);
    // make sure user exists and see if a verification record already exists
    let message;
    let status = 0;
    if(user === null)
    {
        message = "The username or email provided does not exist";
        status = 404;
    }
    else if(user.authenticationAttempts.verificationLocked !== null && new Date(user.verificationLocked) > new Date())
    {
        message = "User account temporarily locked due to too many verification attempts";
        status = 401;
    }
    if(status !== 0)
    {
        res.status(status).sendResponse({
            message: message,
            requester: ""
        });
        return;
    }
    // increment user password reset attempts, db handles logic around it to lock or not
    let result = await models.UserAuthenticationAttempts.increment(
        "verificationAttempts",{where: {userId: user.id}}); 
    // if user not found
    if(result[0][0].length < 1)
    {
        res.status(404).sendResponse({
            message: "The username or email provided does not exist",
            requester: ""
        });
        return;
    }
    // update failed for some reason
    else if(result[0][1] != 1)
    {
        Logger.error("An error occurred when a user with id of(" + user.id + ") tried to request a verification code",
         {errorCode: 1609, function: "forgotPassword", file: "login.js", requestId: req.id});

        res.status(500).sendResponse({
            message: "User verification code could not be generated.  Error code: 1609",
            requester: ""
        });
        return;
    }
    let resetAttempts = result[0][0][0].verificationAttempts;
    let lockedTime = result[0][0][0].verificationLocked;
    // if the user can have another code sent
    if(resetAttempts <= 3)
    {
        // delete any existing verification records for the user
        await models.TempVerificationCodes.destroy({where: {userId: user.id}});

        let code;
        let date;
        let createdDate;
        let secret;
        let result;
        let expirationDate;
        let counter = 0;
        while(counter < 5)
        {
            code = nanoid();
            date = new Date();
            createdDate = date.toISOString();
            secret = code + Date.parse(date);
            result = hash(secret, "verificationCode");
            expirationDate = new Date();
            expirationDate.setMinutes(expirationDate.getMinutes() + 10);
            try 
            {
                result = await models.TempVerificationCodes.create({
                    userId: user.id,
                    salt: result.salt,
                    code: result.value,
                    createdAt: createdDate,
                    expiresAt: expirationDate.toISOString()
                });
                // break out of loop
                counter = 10;
            }
            catch (err)
            {
                let errorObject = JSON.parse(JSON.stringify(err));
                let errorType = errorObject.name;
                if(errorType !== undefined && errorType.includes("Sequelize"))
                {
                    if(!(err.name.includes("UniqueConstraint") &&
                     errorObject.original.constraint === "TempVerificationCodes_salt_key"))
                     {
                        throw err;
                     }
                }
                else
                {
                    throw err;
                }
                if(counter >= 4)
                {
                    Logger.error("Error generating a unique salt for a users temporary verification code",
                    {errorCode: 1611, function: "forgotPassword", file: "login.js", requestId: req.id, error: errorObject});
                    res.status(500).sendResponse({
                        message: "User verification code could not be generated, please try again.  Error code: 1611",
                        requester: ""
                    });
                    return;
                }
            }
            counter = counter + 1;
        }

        if(result === undefined || result === null)
        {
            Logger.error("An error occurred when a user with id of(" + user.id + ") tried to request a verification code",
                {errorCode: 1610, function: "forgotPassword", file: "login.js", requestId: req.id});
            // if undefined, record cannot be found
            res.status(500).sendResponse({
                message: "User verification code could not be generated.  Error code: 1610",
                requester: ""
            });
            return;
        }
    
        let emailResult = await sendVerificationEmail(res, code, user.email);
        Logger.debug("Code: " + code);
        Logger.debug("Adding 2 second delay");
        setTimeout(() =>{
            if(emailResult)
            {
                let message = "Verification email sent.";
                if(resetAttempts > 2)
                {
                    message = message + "  The maximum of 3 unverified verification codes have been sent out.  You can request another 24 hours from now"
                }
                console.log(message);
                res.status(201).sendResponse({
                    message: message,
                    requester: ""
                });
            }
            else
            {
                res.status(500).sendResponse({
                    message: "Verification email not sent.  Error code: 1602",
                    requester: ""
                });
            }
        }, 2000);
    }
    else
    {
        let errorCode;
        let status = 500;
        let message;
        // can not send another request
        if(resetAttempts > 3 && lockedTime !== null)
        {
            status = 404;
            message = "Could not send another verification code as the maximum number of codes " +
            " to send out (3) has been met.  Another code can be sent 24 hours from now or contact an adminstrator."
        }
        else if(resetAttempts < 3 && lockedTime !== null)
        {
            errorCode = 1606;
            // need to set appropriate error code
            Logger.error("An error occurred when a user with id of(" + user.id + ") tried to request a verification code",
            {errorCode: errorCode, function: "forgotPassword", file: "login.js", requestId: req.id});
        }
        else if(resetAttempts >= 3 && lockedTime === null)
        {
            errorCode = 1607;
            Logger.error("An error occurred when a user with id of(" + user.id + ") tried to request a verification code",
            {errorCode: errorCode, function: "forgotPassword", file: "login.js", requestId: req.id});
        }
        else
        {
            errorCode = 1608;
            // need to set appropriate error code
            Logger.error("An error occurred when a user with id of(" + user.id + ") tried to request a verification code",
             {errorCode: errorCode, function: "forgotPassword", file: "login.js", requestId: req.id});
        }
        message = (message === 500) ? "User verification code could not be generated.  Error code: " + errorCode : message;
        // need to send error code with this
        res.status(status).sendResponse({
            message: message,
            requester: ""
        });
    }
};


const validatePassCode = async (req, res) =>
{
    res.locals.function = "validatePassCode";
    let username = req.body.username;
    let verificationCode = req.body.verificationCode;
    let valid = validateUsernameParameter(undefined, username, "", "");
    // if not a valid username, check to see if valid email
    if(!valid)
    {
        valid = validateEmailParameter(res, username, "", "Username or email address is invalid");
        if(!valid) return;
    }
    valid = validateStringParameter(res, verificationCode, 6, 6, "", "Verification code invalid");
    if(!valid) return;
    // validate the value passed does not contain any characters, only numbers
    valid = validateIntegerParameter(res, verificationCode, "", "Verification code invalid", undefined, undefined);
    if(!valid) return;
    // find a user by their login
    let user = await models.Users.findByLoginForVerification(req.body.username);
    let validationResult = await validateUserForVerification(user, res, false);
    let result = validationResult.result;
    // if a valid validation record does not exist, return
    if(!result) return;
    let tempVerificationCode = validationResult.tempVerificationCode;
    let date = tempVerificationCode.createdAt.toISOString();
    // convert to epoch time
    let secret = verificationCode + Date.parse(date);
    result = checkHashedValue(secret, "verificationCode", tempVerificationCode.salt);
    // if passcode incorrect
    if(tempVerificationCode.code !== result.value)
    {
        try {
            // db will remove record on third attempt
            tempVerificationCode = await tempVerificationCode.increment("verificationAttempts");
        }
        catch (err)
        {
            let errorObject = JSON.parse(JSON.stringify(err));
            Logger.error("Error updating a users verification attempts",
                {errorCode: 1604, function: "validatePassCode", file: "login.js", requestId: req.id, error: errorObject});
        }
        let message = "Verification code is invalid";
        if((user.authenticationAttempts.verificationLocked !== null && user.authenticationAttempts.verificationLocked > new Date()
         && tempVerificationCode.verificationAttempts >= 3))
        {
            message = "Verification code is invalid.  Verification code is no longer valid.  User may try to " +
                      "get a new verification code in 10 minutes as the limit of (3) codes have been sent out recently";
        }
        else if(tempVerificationCode.verificationAttempts >= 3)
        {
            message = "Verification code is invalid.  Verification code is no longer valid so user must "
                      + "request that a new verification code is sent out.";
        }
        res.status(401).sendResponse({
            message: message,
            requester: ""
        });
    }
    else
    {
        try {
            await tempVerificationCode.destroy();
            await models.UserAuthenticationAttempts.update({
                verificationAttempts: 0,
                verificationLocked: null,
                lastLogin: new Date()
            }, {where: {userId: user.id}});
        }
        catch (err)
        {
            let errorObject = JSON.parse(JSON.stringify(err));
            Logger.error("Error occurred updating a users verification attempts",
                {errorCode: 1605, function: "validatePassCode", file: "login.js", requestId: req.id, error: errorObject});
            res.status(500).sendResponse({
                message: "Some unexpected error occurred on the server.  Error code: 1605",
                requester: ""
            });
            return;
        }

        // create a temporary session for the user
        await createSession(user, req, res, true, true);

        Logger.debug("Adding 2 second delay");
        setTimeout(() =>{
            res.status(200).sendResponse({
                message: "User authenticated",
                requester: username
            });
        }, 2000);
    }
}

const sendVerificationEmail = async (res, verificationCode, email) =>
{
    res.locals.function = "sendVerificationEmail";
    let subject = "Movie-Fanatics Temporary Verification Code";
    let title = subject;
    let body = `<h2 style="color: #333; font-size: 1.25em;">Movie-Fanatics Verificaiton Code</h2>
                Your temporary verificaiton code is: ` + verificationCode + `<br><br>If you did not
                request this verification code, make sure your account has not been compromised`;
    let result = await emailHandler(email, subject, title, undefined, body, undefined);
    return result;
}

// res is the response object
// username - user being validated
// user is the user object to valdiate
// updateAttempts is a boolean to update user password attempts on failure
const validateUser = async (res, username, user, updateAttempts) =>
{
    res.locals.function = "validateUser";
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
    else if(user.authenticationAttempts.passwordAttempts >= 5)
    {
        message = "User account is currently locked due to too many login attempts";
        status = 401;
        updateUser = true;
        result = false;
    }

    if(!result)
    {
        if(updateAttempts && updateUser)
        {
            await models.UserAuthenticationAttempts.updateUserLoginAttempts(req, res, user.id, username, 1615);
        }
        res.status(status).sendResponse({
            message: message,
            requester: ""
        });
    }
    return result;
}

const validateUserForVerification = async (user, res) => {
    res.locals.function = "validateUserForVerification";
    // false on failure
    let result = true;
    let message = "";
    let status = 0;
    let codeExists = false;
    let tempVerificationCode = null;

    if(user === null)
    {
        message = "The username or email provided does not exist";
        status = 404;
        result = false;
    }
    else if(user.authenticationAttempts.verificationLocked !== null)
    {
        if(new Date(user.verificationLocked) > new Date())
        {
            message = "User account temporarily locked due to too many verification attempts";
            status = 401;
            result = false;
        }
    }

    // if result not set to false yet
    if(result)
    {
        // see if the user already has a temp verification code out there
        tempVerificationCode = await models.TempVerificationCodes.findOne({
            where: {
                userId: user.id,
                expiresAt: {[Op.gte]: new Date()},
            }
        });
        if(tempVerificationCode !== null && tempVerificationCode.verificationAttempts >= 3)
        {
            // if the code is no longer valid
            status = 404;
            message = "Could not find a user with the given email and username that has a valid active verification code";
            result = false;
            codeExists = true;
            // delete the record as it is not valid
            try {
                await tempVerificationCode.destroy();
            } 
            catch (err) {
                let errorObject = JSON.parse(JSON.stringify(err));
                Logger.error("An error occurred deleting tempVerificationCode record with the id of: " + tempVerificationCode.id,
                {errorCode: 1600, function: "validateUserForVerification", file: "login.js", requestId: req.id, error: errorObject});
            }
        }
        else if(tempVerificationCode === null)
        {
            status = 404;
            message = "Could not find a user with the given email and username that has a valid active verification code";
            result = false;
        }
        else
        {
            codeExists = true;
        }
    }
    if(!result)
    {
        res.status(status).sendResponse({
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
