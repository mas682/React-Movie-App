import {verifyLogin} from './globals.js';
import models, { sequelize } from '../src/models';
var nodemailer = require('nodemailer');
const config = require('../Config.json');
const sgMail = require('@sendgrid/mail');

// function to get information associated with the user who has the cookie
const emailHandler = async (recipient, subject, title, header, body, footer) => {
    sgMail.setApiKey(config.emailSender.key);
    // for testing
    header = (header === undefined) ? "Movie-Fanatics" : header;
    title = (title === undefined) ? "Movie-Fanatics" : title;
    body = (body === undefined) ? "" : body;
    footer = (footer === undefined) ? `Visit us at <a href="movie-fanatics.com">movie-fanatics.com</a><br>Please
                                       contact us if you have any questions at
                                       <a href="mailto:help@movie-fanatics.com">help@movie-fanatics.com</a>` : footer;
    // for testing:
    subject = "Movie-Fanatics Verification Test";
    header = "Movie-Fanatics";
    title = "Email Header";
    body = `<h2 style="color: #333">Welcome to Movie-Fanatics!</h2>This is a test paragraph for movie-fanatics.  This is a test paragraph for movie-fanatics.
    This is a test paragraph for movie-fanatics. This is a test paragraph for movie-fanatics. This is a test paragraph for movie-fanatics. This is a test paragraph for movie-fanatics.
    This is a test paragraph for movie-fanatics. This is a test paragraph for movie-fanatics. This is a test paragraph for movie-fanatics. This is a test paragraph for movie-fanatics.
    This is a test paragraph for movie-fanatics. This is a test paragraph for movie-fanatics.`
    footer =  `Visit us at <a href="movie-fanatics.com">movie-fanatics.com</a><br>Please contact us if you have any questions at <a href="mailto:help@movie-fanatics.com">help@movie-fanatics.com</a>`;
    // above is for testing

    let html = `
        <html>
            <head>
            <title>`+ title + `</title>
            </head>
            <body style="background-color: #990000; min-height: calc(100vh - 100px); margin: 50px;">
                <div style="background-color: #333; min-height: 100%;">
                    <div style="text-align: center; height: 10%; display: flex; justify-Content: center; align-items: center;">
                        <h1 style="color: white">` + header +`</h1>
                    </div>
                    <div style="min-height: calc(80% - 20px); color: gray; margin-left: 5%; margin-right: 5%; padding: 10px; text-align: left; background-color: #f9f9f9">
                        <div style="height: calc(95% - 20px - 20%);">
                        `+ body +`
                        </div>
                        <div style="height: 5%; text-align: center; color: black">
                            ` + footer + `
                        </div>
                    </div>
                    <div style="height: 10%">
                    </div>
                </div>
            </body>
        </html>
    `;

    // left off here
    work on email formatting through gmail, then fix here...
    issue with calc using % for some reason..
    use vh? for margin, padding, sizes?

    console.log(html);
    let msg = {
        to: config.email.username,
        from: config.emailSender.helpEmail,
        subject: subject,
        text: "test",
        html: html
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
