import models, { sequelize } from '../src/models';
import {verifyLogin} from './globals.js';


// function to see if a user can login and returns a cookie to use
const login = (req, res, next) => {
    // get the signed cookies in the request if there are any
    let cookie = req.signedCookies.values;
    // if there is a signed cookie in the request
    if(cookie != undefined)
    {
        // see if the cookie has a valid user
        verifyLogin(req.signedCookies).then((cookieValid) =>
        {
            if(cookieValid)
            {
                res.send("You are already logged in");
            }
            // cookie not valid
            else
            {
                checkLogin(req, res);
            }
        });
    }
    // if no cookie was found
    else
    {
        checkLogin(req, res);
        // should redirect to home page at this point if login worked
        // or let client side handle the reroute?
    }
};

const checkLogin = (req, res) =>
{
    // check login and generate cookie if login allowed
    // for testing
    let pass = "password";
    // find a user by their login
    // admin will be replaced with req.body.user
    models.User.findByLogin('admin')
    .then((user)=>{
        // if the password is correct
        // may want to do something like salting, not really secure
        if(user.password == pass)
        {
            // create the valie to put into the cookie
            let value = JSON.stringify({name: user.username, email: user.email, id: user.id});
            // create the cookie with expiration in 1 day
            res.cookie('values', value, {maxAge: 86400000, signed: true, httpOnly: true});
            res.send('created cookie');
        }
        else
        {
            // may want to just say login denied
            // also may want to keep track of failed login attemts and slow server
            // down or lock account if too many failed attempts
            res.send('incorrect password');
        }
    });
};

export {login};