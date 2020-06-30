import models, { sequelize } from '../src/models';
import {router} from './globals.js';
const Op = require('Sequelize').Op;

router.get("/", function(req, res, next){
    // if the username or email are not found, create the user
    // otherwise, do not create the user
    console.log("COOKIE: " + req.signedCookies.test);
    // get the signed cookies in the request
    let cookie = req.signedCookies.test;
    // if cookie is defined, for testing
    if(cookie != undefined)
    {
        let undone = JSON.parse(req.signedCookies.test);
        console.log("JSON: " + undone.name);
    }
    // for testing
    let pass = "password";
    // find a user by their login
    models.User.findByLogin('admin')
    .then((user)=>{
        if(user.password == pass)
        {
            let value = JSON.stringify({name: user.username, email: user.email});
            // create the cookie
            res.cookie('test', value, {maxAge: 90000, signed: true});
            res.send('created cookie');
        }
        else
        {
            res.send('incorrect password');
        }
    });
});

module.exports=router;
