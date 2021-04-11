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
            <body style="background-color: #990000; padding: 50px;">
                <div style="background-color: #333; min-height: 70vh; height: 10vh;">
                    <div style="display:grid;text-align:center;height: 7vh;">
                        <div style="color: white; font-size: 2em; font-weight: bold; margin: auto;">
                            ` + header +`
                        </div>
                    </div>
                    <div style="min-height: calc(56vh - 20px); height: 10vh; color: gray; margin-left: 5%; margin-right: 5%; padding: 10px; text-align: left; background-color: #f9f9f9">
                        <div style="height: calc(100% - (20px + 40px));">
                        `+ body +`
                        </div>
                        <div style="height: 40px; text-align: center; color: black">
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
    //need to fix footer in main body
    //need to fix header

    console.log(html);
    let msg = {
        to: "mstropkey682@gmail.com",
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
    return true;

    return result;
};



export {emailHandler};
