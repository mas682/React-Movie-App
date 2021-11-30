import {emailHandler} from './emailHandler.js';
import {checkHashedValue} from '../src/shared/crypto.js';
import {createSession, destroySession} from '../src/shared/sessions.js';
import { allColors } from 'winston/lib/winston/config';
const models = require('../src/shared/sequelize.js').getClient().models;
const Op = require('sequelize').Op;
const validateStringParameter = require('./globals.js').validateStringParameter;
const validateEmailParameter = require('./globals.js').validateEmailParameter;
const validateUsernameParameter = require('./globals.js').validateUsernameParameter;
const validateIntegerParameter = require('./globals.js').validateIntegerParameter;
const validateBooleanParameter = require('./globals.js').validateBooleanParameter;
const config = require('../Config.json');
const Logger = require("../src/shared/logger.js").getLogger();
const appendCallerStack = require("../src/shared/ErrorFunctions.js").appendCallerStack;
const caughtErrorHandler = require("../src/shared/ErrorFunctions.js").caughtErrorHandler;

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
                .catch((err) => {
                    let callerStack = new Error().stack;
                    appendCallerStack(callerStack, err, next, undefined);
                });
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
                .catch((err) => {
                    let callerStack = new Error().stack;
                    appendCallerStack(callerStack, err, next, undefined);
                });
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
                .catch((err) => {
                    let callerStack = new Error().stack;
                    appendCallerStack(callerStack, err, next, undefined);
                });
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
                .catch((err) => {
                    let callerStack = new Error().stack;
                    appendCallerStack(callerStack, err, next, undefined);
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
    await destroySession(req).catch(error=>{
        let callerStack = new Error().stack;
        appendCallerStack(callerStack, error, undefined, true);
    });
    // remove the session from the database
    await models.UserSessions.destroy({
        where: {
            session: sessionId,
            userId: userId
        }
    }).catch(error=>{
        let callerStack = new Error().stack;
        appendCallerStack(callerStack, error, undefined, true);
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
    let loginType = 0;

    let valid = validateUsernameParameter(undefined, username, "", "");
    // if not a valid username, check to see if valid email
    if(!valid)
    {
        loginType = 1;
        valid = validateEmailParameter(res, username, "", "Username or email address is invalid");
        if(!valid) return;
    }
    valid = validateStringParameter(res, password, 6, 15, "", "Password must be between 6-15 characters");
    if(!valid) return;
    valid = validateBooleanParameter(res, stayLoggedIn, "", "Stay logged in must be either true or false");
    if(!valid) return;
    // find a user by their login
    let user = await models.Users.findByLoginForAuth(username, loginType).catch(error=>{
        let callerStack = new Error().stack;
        appendCallerStack(callerStack, error, undefined, true);
    });
    // make sure the user is not null, not locked out of account
    let userValid = await validateUser(res, username, user, true).catch(error=>{
        let callerStack = new Error().stack;
        appendCallerStack(callerStack, error, undefined, true);
    });
    if(!userValid) return;
    let result = checkHashedValue(password, "password", user.credentials.salt);
    // if the password is correct
    if(result.value === user.credentials.password)
    {
        await models.UserAuthenticationAttempts.update({
            lastLogin: new Date(),
            passwordAttempts: 0,
            verificationAttempts: 0,
            verificationLocked: null
        },
        {
            where: { userId: user.id }
        }).catch(error=>{
            let callerStack = new Error().stack;
            error = appendCallerStack(callerStack, error, undefined, false);
            let message = "Some unknown error occurred updaing the users(" + username + ") account on login";
            caughtErrorHandler(error, req, res, 1602, message);
        });

        // create session for user
        await createSession(user, req, res, !stayLoggedIn, false).catch(error=>{
            let callerStack = new Error().stack;
            appendCallerStack(callerStack, error, undefined, true);
        });

        setTimeout(() =>{
            res.status(200).sendResponse({
                message: "User authenticated",
                requester: user.username,
            });
        }, 0);
    }
    else
    {
        let attempts = await models.UserAuthenticationAttempts.updateUserLoginAttempts(req, res, user.id, username, 1607).catch(error=>{
            let callerStack = new Error().stack;
            appendCallerStack(callerStack, error, undefined, true);
        });
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
    let loginType = 0;
    if(!valid)
    {
        loginType = 1;
        valid = validateEmailParameter(res, username, "", "Username or email address is invalid");
        if(!valid) return;
    }
    // find a user by their login
    let user = await models.Users.findByLoginForVerification(username, loginType).catch(error=>{
        let callerStack = new Error().stack;
        appendCallerStack(callerStack, error, undefined, true);
    });
    // make sure user exists and see if a verification record already exists
    let message;
    let status = 0;
    let lockedTime = user.authenticationAttempts.verificationLocked;
    let resetAttempts = user.verificationAttempts;
    if(user === null)
    {
        message = "The username or email provided does not exist";
        status = 404;
    }
    else if(lockedTime !== null && new Date(lockedTime) > new Date())
    {
        let result = await models.UserAuthenticationAttempts.updateVerificationAttempts(user.id).catch(error=>{
            let callerStack = new Error().stack;
            appendCallerStack(callerStack, error, undefined, true);
        });
        if(result.record === undefined)
        {
            status = 404;
            message = "The username or email provided does not exist";
        }
        // update failed for some reason
        else if(!result.updated)
        {
            Logger.error("An error occurred when a user with id of(" + user.id + ") tried to request a verification code",
            {function: "forgotPassword", file: "login.js", errorCode: 1606, requestId: req.id});

            status = 500;
            message = "Some unexpected error occurred on the server.  Error code: 1606"
        }
        else
        {
            message = message = "Could not send another verification code as the maximum number of codes " +
            " to send out (3) has been met.  Another code can be sent 24 hours from now or contact an adminstrator."
            status = 401;
        }
    }
    if(status !== 0)
    {
        res.status(status).sendResponse({
            message: message,
            requester: ""
        });
        return;
    }

    // generate verification code
    let result = await models.TempVerificationCodes.generateTempVerificationCode(req, res, user, undefined, false, 10, 2).catch(error=>{
        let callerStack = new Error().stack;
        appendCallerStack(callerStack, error, undefined, true);
    });
    let code = result.code;
    let emailResult = await sendVerificationEmail(res, code, user.email).catch(error=>{
        let callerStack = new Error().stack;
        appendCallerStack(callerStack, error, undefined, true);
    });
    Logger.debug("Code: " + code);
    Logger.debug("Adding 2 second delay");
    if(emailResult)
    {
        let successful = true;
        result = await models.UserAuthenticationAttempts.updateVerificationAttempts(user.id).catch(error=>{
            let callerStack = new Error().stack;
            error = appendCallerStack(callerStack, error, undefined, false);
            caughtErrorHandler(error, req, res, 1605, undefined);
            // set to 0 as not sure what the actual count is at this point
            resetAttempts = 0;
            successful = false;
        });

        if(successful && (result === undefined || result.record === undefined))
        {
            res.status(404).sendResponse({
                message: "The username or email provided does not exist",
                requester: ""
            });
            return;
        }
        // update failed for some reason
        else if(successful && !result.updated)
        {
            Logger.error("An error occurred when a user with id of(" + user.id + ") tried to request a verification code",
            {function: "forgotPassword", file: "login.js", errorCode: 1606, requestId: req.id});
            // set to 0 as not sure what the actual count at this point
            resetAttempts = 0;
        }
        else if(successful)
        {
            resetAttempts = result.record.verificationAttempts;
        }
    }
    setTimeout(() =>{
        if(emailResult)
        {
            let message = "Verification email sent.";
            if(resetAttempts > 2)
            {
                message = message + "  The maximum of 3 unverified verification codes have been sent out.  You can request another 24 hours from now"
            }
            res.status(201).sendResponse({
                message: message,
                requester: ""
            });
            }
        else
        {
            res.status(500).sendResponse({
                message: "Verification email not sent.  Error code: 1601",
                requester: ""
            });
        }
    }, 2000);
};


const validatePassCode = async (req, res) =>
{
    res.locals.function = "validatePassCode";
    let username = req.body.username;
    let verificationCode = req.body.verificationCode;
    let valid = validateUsernameParameter(undefined, username, "", "Username is invalid");
    if(!valid) return;
    valid = validateStringParameter(res, verificationCode, 6, 6, "", "Verification code invalid");
    if(!valid) return;
    // validate the value passed does not contain any characters, only numbers
    valid = validateIntegerParameter(res, verificationCode, "", "Verification code invalid", undefined, undefined);
    if(!valid) return;
    // find a user by their login
    let user = await models.Users.findByLoginForVerification(req.body.username, 0).catch(error=>{
        let callerStack = new Error().stack;
        appendCallerStack(callerStack, error, undefined, true);
    });
    let validationResult = await validateUserForVerification(user, res, false).catch(error=>{
        let callerStack = new Error().stack;
        appendCallerStack(callerStack, error, undefined, true);
    });
    let result = validationResult.result;
    // if a valid validation record does not exist, return
    if(!result) return;
    let tempVerificationCode = validationResult.tempVerificationCode;
    let secret = verificationCode + Date.parse(tempVerificationCode.createdAt);
    result = checkHashedValue(secret, "verificationCode", tempVerificationCode.salt);
    // if passcode incorrect
    if(tempVerificationCode.code !== result.value)
    {
        tempVerificationCode = await tempVerificationCode.increment("verificationAttempts").catch(error=>{
            let callerStack = new Error().stack;
            error = appendCallerStack(callerStack, error, undefined, false);
            caughtErrorHandler(error, req, res, 1603, undefined);
        });
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
        // delete verification record as verified
        await tempVerificationCode.destroy().catch(error=>{
            let callerStack = new Error().stack;
            res.locals.secondaryCode = 1609;
            appendCallerStack(callerStack, error, undefined, true);
        });
        // reset user authentication attempts
        await models.UserAuthenticationAttempts.update({
            verificationAttempts: 0,
            verificationLocked: null,
            lastLogin: new Date()
        }, {where: {userId: user.id}}).catch(error=>{
            let callerStack = new Error().stack;
            res.locals.secondaryCode = 1604;
            appendCallerStack(callerStack, error, undefined, true);
        });

        // create a temporary session for the user
        await createSession(user, req, res, true, true).catch(error=>{
            let callerStack = new Error().stack;
            appendCallerStack(callerStack, error, undefined, true);
        });

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
    //res.locals.function = "sendVerificationEmail";
    let subject = "Movie-Fanatics Temporary Verification Code";
    let title = subject;
    let body = `<h2 style="color: #333; font-size: 1.25em;">Movie-Fanatics Verificaiton Code</h2>
                Your temporary verificaiton code is: ` + verificationCode + `<br><br>If you did not
                request this verification code, make sure your account has not been compromised`;
    let result = await emailHandler(email, subject, title, undefined, body, undefined).catch(error=>{
        let callerStack = new Error().stack;
        appendCallerStack(callerStack, error, undefined, true);
    });
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
            await models.UserAuthenticationAttempts.updateUserLoginAttempts(req, res, user.id, username, 1608).catch(error=>{
                let callerStack = new Error().stack;
                appendCallerStack(callerStack, error, undefined, true);
            });
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
        }).catch(error=>{
            let callerStack = new Error().stack;
            appendCallerStack(callerStack, error, undefined, true);
        });
        if(tempVerificationCode !== null && tempVerificationCode.verificationAttempts >= 3)
        {
            // if the code is no longer valid
            status = 404;
            message = "Could not find a user with the given email and username that has a valid active verification code";
            result = false;
            codeExists = true;
            // delete the record as it is not valid
            await tempVerificationCode.destroy().catch(error=>{
                let callerStack = new Error().stack;
                error = appendCallerStack(callerStack, error, undefined, false);
                let message = "An error occurred deleting tempVerificationCode record with the id of: " + tempVerificationCode.id;
                caughtErrorHandler(error, req, res, 1600, message);
            });
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
