import {verifyLogin} from './globals.js';
import models, { sequelize } from '../src/models';
var nodemailer = require('nodemailer');
const config = require('../Config.json');
const sgMail = require('@sendgrid/mail');

// function to get information associated with the user who has the cookie
const emailHandler = async (recipient, subject, text, html) => {
    sgMail.setApiKey(config.emailSender.key);
    let msg = {
        to: config.email.username,
        from: config.emailSender.helpEmail,
        subject: subject,
        text: text,
        html: html + "Go to http://wwww.movie-fanatics.com to unsubscribe"
    };
    let result = await sgMail.send(msg).then(() =>{
        console.log('Email sent');
        return true;
    })
    .catch((error) => {
        console.log("Email not sent");
        console.log(error);
        return false;
    });

    return result;
};



export {emailHandler};
