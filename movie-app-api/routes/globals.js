// not sure if this is the best way to do this but this file
// holds variables that are needed specifically for the routing files

const models = require('../src/shared/sequelize.js').getClient().models;
const moment = require('moment');
const config = require('../Config.json');
const Logger = require("../src/shared/logger.js").getLogger();
var validator = require('validator');

// function to increment user login attempts
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
        Logger.error("Some unknown error occurred updaing the users(" + username + ") account on login failure: " + errorObject.name,
            {function: "updateUserLoginAttempts", file: "globals.js", error: errorObject, errorCode: 2200})
    }
    return user.passwordAttempts;
}


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

const validateUsernameParameter = (res, username, requester, message) => {
    if(username === undefined || typeof(username) !== "string" || username.length > 20 || username.length < 6
    || !validator.isAlphanumeric(username, 'en-US',{"ignore": "_-$"}))
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
    // if there is no session associated with the cookie and a cookie is provided
    if(req.session.user === undefined && req.headers.cookie !== undefined)
    {
        // set the cookie options so the browser may remove the cookie
        let options = {
            httpOnly: req.session.cookie.httpOnly,
            secure: req.session.cookie.secure,
            sameSite: req.session.cookie.sameSite,
            path: req.session.cookie.path
        }
        res.clearCookie(config.app.cookieName, options);
    }
    next();
}

export {validateIntegerParameter, validateUsernameParameter,
     validateStringParameter, validateEmailParameter, updateUserLoginAttempts
    , clearCookie, validateBooleanParameter};
