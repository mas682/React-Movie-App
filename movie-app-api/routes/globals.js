// not sure if this is the best way to do this but this file
// holds variables that are needed specifically for the routing files
const config = require('../Config.json');
var validator = require('validator');
import {regenerateSession, removeCurrentSession, saveSession} from '../src/shared/sessions.js';


// function to validate that a parameter is a actual boolean value
const validateBooleanParameter = (res, value, requester, message) => {
    if(value === false || value === true)
    {
        return true;
    }
    else
    {
        res.status(400).sendResponse({
            message: message,
            requester: requester
        });
        return false;
    }
}

// function to validate that a parameter is actually a integer
// res is the response to use
// value is the parameter value
// username is the logged in user
// message is the message to return
const validateIntegerParameter = (res, value, requester, message, minValue, maxValue) => {
    if(value === undefined)
    {
        res.status(400).sendResponse({
            message: message,
            requester: requester
        });
        return false;
    }
    else if(isNaN(value) || value.toString().length > 15)
    {
        res.status(400).sendResponse({
            message: message,
            requester: requester
        });
        return false;
    }
    if(minValue !== undefined)
    {
        if(value < minValue)
        {
            res.status(400).sendResponse({
                message: message,
                requester: requester
            });
            return false;
        }
    }
    if(maxValue !== undefined)
    {
        if(value > maxValue)
        {
            res.status(400).sendResponse({
                message: message,
                requester: requester
            });
            return false;
        }
    }
    return true;
};

// going to update this to allow two types of messages...
// messages is either a string or a dict
// if a string, that string will always be used as the message
// messages is a dict with two keys: 1 and 2
// 1 is the error message for length being too short
// 2 is the error message for invalid characters being found
const validateUsernameParameter = (res, username, requester, message) => {
    let valid = true;
    let outputMessage;
    if(username === undefined || typeof(username) !== "string" || username.length > 20 || username.length < 6)
    {
        valid = false;
        outputMessage = (typeof(message) === "string") ? message : message[1];
    }
    else if(!validator.isAlphanumeric(username, 'en-US',{"ignore": "_-$"}))
    {
        valid = false;
        outputMessage = (typeof(message) === "string") ? message : message[2];
    }
    if(!valid)
    {
        if(res !== undefined)
        {
            res.status(400).sendResponse({
                message: outputMessage,
                requester: requester
            });
        }
        return false;
    }

    return true;
};

const validateEmailParameter = (res, email, requester, message) => {
    if(email === undefined || typeof(email) !== "string" || email.length > 30
        || email.length < 7 || !validator.isEmail(email, {allow_utf8_local_part: false}))
    {
        if(res !== undefined)
        {
            res.status(400).sendResponse({
                message: message,
                requester: requester
            });
        }
        return false;
    }
    return true;
}

// function to validate that a variable is in fact a string and is not empty
// if maxLength is undefined it will be skipped
const validateStringParameter = (res, param, minLength, maxLength, requester, message, ascii = false) => {
    if(param === undefined || typeof(param) !== "string")
    {
        if(res !== undefined)
        {
            res.status(400).sendResponse({
                message: message,
                requester: requester
            });
        }
        return false;
    }
    if(minLength === undefined)
    {
        minLength = 0;
    }
    let paramLength = param.length;
    let valid = true;
    if(paramLength < minLength)
    {
        valid = false;
    }
    else if((maxLength !== undefined) && (paramLength > maxLength))
    {
        valid = false;
    }
    else if(ascii && !validator.isAscii(param))
    {
        valid = false;
    }

    if(!valid)
    {
        if(res !== undefined)
        {
            res.status(400).sendResponse({
                message: message,
                requester: requester
            });
        }
        return false;
    }

    return true;
};


// function called on all requests except for ones where creating a session
// used to tell client to remove cookie if there is no valid session associated
// with the cookie
// even if this is called when creating a session, the session is created after
// so this should not cause any issues
const clearCookie = (req, res, next) => {
    res.locals.function = "clearCookie";
    res.locals.file = "globals";
    // if there is no session associated with the cookie and a cookie is provided
    if((req.session === undefined || req.session.user === undefined) && req.headers.cookie !== undefined)
    {
        let options = {};
        res.clearCookie(config.app.cookieName, options);
    }
    if(next !== undefined)
    {
        next();
    }
}

// function called on all requests
// checks to see if there is a cookie provided and if the cookie provided is specifically for
// changing a users password
// if so, can only be used on one route, otherwise invalidate the cookie
const checkForPasswordResetCookie = async(req, res, next) => {
    try{
        res.locals.function = "checkForPasswordResetCookie";
        res.locals.file = "globals";
        if(req.session.user !== undefined && req.session.passwordResetSession === true)
        {
            let url = "/profile/" + req.session.user + "/reset_password"
            // if not used resetting password
            if(req.method === "POST" && req.url === url)
            {
                // if the session is currently in use
                if(req.session.active === false)
                {
                    // send back 401 here as already know route is correct...
                    // but DO NOT WANT TO REMOVE SESSION YET as currently in use
                    req.session = undefined;
                    // tell frontend to remove cookie
                    clearCookie(req, res, undefined);
                    res.status(401).sendResponse({
                        message: "You do not have permission to update a users password as the cookie is invalid",
                        requester: ""
                    });
                    return;
                }
                else
                {
                    // mark session as in use any other incoming cookies with the same session are not used
                    req.session.active = false;
                    await saveSession(req, res).catch(error=>{
                        let callerStack = new Error().stack;
                        appendCallerStack(callerStack, error, undefined, true);
                    });
                }
            }
            else
            {
                // if no cookie found, send not logged in
                // if cookie found but url invalid just send unauthorized
                // variable only used if method is post to /profile/reset_passowrd and user is incorrect
                res.locals.invalidURL = true;
                if(req.method === "POST" && req.url === "/login/authenticate")
                {
                    // mark the session as to be removed if empty in error handler
                    res.locals.cleanSession = true;
                    await regenerateSession(req, res, false, false).catch(error=>{
                        let callerStack = new Error().stack;
                        appendCallerStack(callerStack, error, undefined, true);
                    });
                }
                else
                {
                    await removeCurrentSession(req, res).catch(error=>{
                        let callerStack = new Error().stack;
                        appendCallerStack(callerStack, error, undefined, true);
                    });
                    // tell frontend to remove cookie
                    clearCookie(req, res, undefined);
                }
            }
        }
        next();
    } catch (err)
    {
        return next(err);
    }
};

    
module.exports.validateIntegerParameter = validateIntegerParameter;
module.exports.validateUsernameParameter = validateUsernameParameter;
module.exports.validateStringParameter = validateStringParameter;
module.exports.validateEmailParameter = validateEmailParameter;
module.exports.clearCookie = clearCookie;
module.exports.validateBooleanParameter = validateBooleanParameter;
module.exports.checkForPasswordResetCookie = checkForPasswordResetCookie;
