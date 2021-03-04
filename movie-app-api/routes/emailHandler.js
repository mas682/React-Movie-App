import {verifyLogin} from './globals.js';
import models, { sequelize } from '../src/models';
import {customAlphabet} from 'nanoid';
var nodemailer = require('nodemailer');
const config = require('../EmailConfig.json');
const nanoid = customAlphabet('1234567890', 6);



// function to get information associated with the user who has the cookie
const emailHandler = (req, res, next) => {
    console.log(config);
    console.log(nanoid());
    /*
    const transporter = nodemailer.createTransport({
        //port: 465,               // true for 465, false for other ports
        host: "smtp-mail.outlook.com",
        secureConnection: true,
        port: 587,
        auth: {
            user: config.email.username,
            pass: config.email.password,
        },
        tls: {
            ciphers: 'SSLv3'
        }
    });
    // verify connection configuration
    transporter.verify(function(error, success) {
      if (error) {
        console.log("Error with connection");
        console.log(error);
      } else {
        console.log("Server is ready to take our messages");
      }
    });

    const message = {
      from: config.email.username,  // sender address
      to: config.email.username,   // list of receivers
      subject: 'Sending Email using Node.js',
      text: 'That was easy!',
      html: "<b>Hey there! </b>" +
             "<br> This is our first message sent with Nodemailer<br/>",
    };
    transporter.sendMail(message, function (err, info) {
        if(err)
            console.log(err)
        else
            console.log(info);
    });
    */
    res.status(200).send("Email sent");
};

export {emailHandler};
