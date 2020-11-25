// not sure if this is the best way to do this but this file
// holds variables that are needed specifically for the routing files


var express = require('express');
import models, { sequelize } from '../src/models';
var cookieParser = require('cookie-parser');
var router = express.Router();
// used to sign the cookie
router.use(cookieParser('somesecrettosigncookie'));


// function to be used to verify that the cookie is valid
// currently just checks to see if the user exists
// may also want to add time to cookie value? but may be unneccessary
const verifyLogin= async (cookie)=>
{
    let valid = false;
    cookie = JSON.parse(cookie);
    if(cookie != undefined)
    {
        // should be in try catch
        // get the values from the cookie
        // see if the user is valid
        console.log("Authenticating: " + cookie.name);
        await models.User.findByLogin(cookie.name)
        .then((user)=>{
            if(user != null)
            {
                valid = true;
                console.log("Cookie valid");
            }
            else
            {
                console.log("Cookie invalid");
            }
        });
    }
    return valid;
};


// function to validate that a parameter is actually a integer
// res is the response to use
// value is the parameter value
// username is the logged in user
// message is the message to return
const validateIntegerParameter = (res, value, requester, message) => {
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
    return true;
};

const validateUsernameParameter = (res, username, requester, message) => {
    if(username === undefined)
    {
        res.status(400).send({
            message: message,
            requester: requester
        });
        return false;
    }
    let userLength = username.length;
    // limit usernames to 1-20 characters
    if(userLength > 20 || userLength < 1)
    {
        res.status(400).send({
            message: message,
            requester: requester
        });
        return false;
    }
    return true;
};

export {router, verifyLogin, validateIntegerParameter, validateUsernameParameter};
