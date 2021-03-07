import {verifyLogin} from './globals.js';
import models, { sequelize } from '../src/models';
var nodemailer = require('nodemailer');
const config = require('../EmailConfig.json');




// function to get information associated with the user who has the cookie
const emailHandler = async (recipient, subject, text, html) => {
    console.log(config);

    const transporter = nodemailer.createTransport({
        //port: 465,
        host: "smtp-mail.outlook.com",
        secureConnection: true,
        // this only allows you to send one email at a time
        // when in real scenario, need to set this to 465
        port: 587,
        auth: {
            user: config.email.username,
            pass: config.email.password
        },
        tls: {
            ciphers: 'SSLv3'
        }
    });

    // to test connection:
    // block out usually
    let connected;
    try {
        connected = await transporter.verify().then(function(success){
            return success
        });
    }
    catch (err)
    {
        connected = false;
    }
    console.log("Connected: " + connected);
    let result = connected;
    //

    /* temporarily blocked out as met quoata for emails
    // change the TO value to the recipient eventually
    const message = {
        from: config.email.username,  // sender address
        to: config.email.username,   // list of receivers
        subject: subject + "test",
        text: text,
        html: html,
    };
    let result;
    try {
        result = await transporter.sendMail(message).then(function(info){
            console.log("Email sent:");
            console.log(info);
            return true;
        });
    }
    catch (err)
    {
        console.log("ERROR CAUGHT");
        let errorObject = JSON.parse(JSON.stringify(err));
        console.log(errorObject);
        result = false;
        // not authenticated..
        // if errorObject.code = "EAUTH"
    }
    */

    return result;
};

export {emailHandler};
