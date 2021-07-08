// not sure if this is the best way to do this but this file
// holds variables that are needed specifically for the routing files


var express = require('express');
import models, { sequelize } from '../src/models';
var router = express.Router();
const moment = require('moment');
const config = require('../Config.json');


// used to sign the cookie
//router.use(cookieParser('somesecrettosigncookie'));

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
        console.log("Some unknown error occurred updaing the users(" + username + ") account on login failure: " + errorObject.name);
        console.log(err);
    }
    return user.passwordAttempts;
}


// function to validate that a parameter is actually a integer
// res is the response to use
// value is the parameter value
// username is the logged in user
// message is the message to return
const validateIntegerParameter = (res, value, requester, message, minValue, maxValue) => {
    if(value === undefined)
    {
        res.status(400).send({
            message: message,
            requester: requester
        });
        return false;
    }
    else if(isNaN(value) || value.toString().length > 15)
    {
        res.status(400).send({
            message: message,
            requester: requester
        });
        return false;
    }
    if(minValue !== undefined)
    {
        if(value < minValue)
        {
            res.status(400).send({
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
            res.status(400).send({
                message: message,
                requester: requester
            });
            return false;
        }
    }
    return true;
};

const validateUsernameParameter = (res, username, requester, message) => {
    if(username === undefined)
    {
        if(res !== undefined)
        {
            res.status(400).send({
                message: message,
                requester: requester
            });
        }
        return false;
    }
    let userLength = username.length;
    // limit usernames to 1-20 characters
    if(userLength > 20 || userLength < 6)
    {
        if(res !== undefined)
        {
            res.status(400).send({
                message: message,
                requester: requester
            });
        }
        return false;
    }
    return true;
};

const validateEmailParameter = (res, email, requester, message) => {
    if(email === undefined)
    {
        if(res !== undefined)
        {
            res.status(400).send({
                message: message,
                requester: requester
            });
        }
        return false;
    }
    let emailLength = email.length;
    // limit usernames to 1-20 characters
    if(emailLength > 30 || emailLength < 7)
    {
        if(res !== undefined)
        {
            res.status(400).send({
                message: message,
                requester: requester
            });
        }
        return false;
    }
    else if(email.includes("@"))
    {
        // checks to see if email in format string@string.string
        let validEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
        if(!validEmail)
        {
            if(res !== undefined)
            {
                res.status(400).send({
                    message: message,
                    requester: requester
                });
            }
            return false;
        }
        return true;
    }
    else
    {
        if(res !== undefined)
        {
            // does not have a @ in it
            res.status(400).send({
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
const validateStringParameter = (res, param, minLength, maxLength, requester, message) => {
    if(param === undefined)
    {
        if(res !== undefined)
        {
            res.status(400).send({
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
    if(paramLength < minLength)
    {
        if(res !== undefined)
        {
            res.status(400).send({
                message: message,
                requester: requester
            });
        }
        return false;
    }
    else if((maxLength !== undefined) && (paramLength > maxLength))
    {
        if(res !== undefined)
        {
            res.status(400).send({
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

export {router, validateIntegerParameter, validateUsernameParameter,
     validateStringParameter, validateEmailParameter, updateUserLoginAttempts
    , clearCookie};
