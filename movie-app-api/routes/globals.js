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

export {router, verifyLogin};
