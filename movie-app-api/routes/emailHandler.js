import {verifyLogin} from './globals.js';
import models, { sequelize } from '../src/models';
var nodemailer = require('nodemailer');


// function to get information associated with the user who has the cookie
const emailHandler = (req, res, next) => {
    const transporter = nodemailer.createTransport({
    port: 465,               // true for 465, false for other ports
    host: "smtp.outlook.com",
       auth: {
            user: 'test@gmail.com',
            pass: 'password',
         },
    secure: true,
    });
    // verify connection configuration
    transporter.verify(function(error, success) {
      if (error) {
        console.log(error);
      } else {
        console.log("Server is ready to take our messages");
      }
    });
    const message = {
      from: 'test@gmail.com',  // sender address
      to: 'myfriend@gmail.com',   // list of receivers
      subject: 'Sending Email using Node.js',
      text: 'That was easy!'
      html: '<b>Hey there! </b>
             <br> This is our first message sent with Nodemailer<br/>',
    };
    transporter.sendMail(message, function (err, info) {
        if(err)
            console.log(err)
        else
            console.log(info);
    });
    res.status(200).send("Email sent");
};

export {emailHandler};
