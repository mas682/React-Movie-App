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
    footer = (footer === undefined) ? `Visit us at <a href="https://www.movie-fanatics.com">movie-fanatics.com</a><br>Please
                                       contact us if you have any questions at
                                       <a href="mailto:help@movie-fanatics.com">help@movie-fanatics.com</a>` : footer;

    let html = `
        <html>
            <meta name="color-scheme" content="light dark">
            <meta name="supported-color-schemes" content="light dark">
            <head>
            <style type="text/css">
                :root {
                    Color-scheme: light;
                    supported-color-schemes:light;
                }
                @media screen and (max-width: 599px) {
                    bodyContainer {
                        background-color: #990000;
                        padding: 5%;
                    }
                }
                @media screen and (min-width: 600px) {
                    bodyContainer {
                        background-color: #990000;
                        padding: 50px;
                    }
                }
                bodyContainer {
                    background-color: #990000;
                    padding: 5%;
                }
                .outterContainer
                {
                    background-color: #333;
                    min-height: 700px;
                }
                .outterHeader {
                    color: white;
                    font-size: 1.75em;
                    font-weight: bold;
                    margin: auto;
                }
                .outterHeaderContainer {
                    display:grid;
                    text-align:center;
                    height: 70px;
                }
                .innerContainer {
                    color: gray;
                    margin-left: 5%;
                    margin-right: 5%;
                    padding: 10px;
                    text-align: left;
                    background-color: #f9f9f9;
                }
                .mainText {
                    min-height: 440px;
                }
                .innerFooter
                {
                    text-align: center;
                    color: black;
                    padding-top: 10px;
                }
                .outterFooter {
                    height: 70px;
                }
            </style>
            <title>`+ title + `</title>
            </head>
            <body style="background-color: #990000; padding: 3%;">
                <div class="outterContainer">
                    <div class="outterHeaderContainer">
                        <div class="outterHeader">
                            ` + header +`
                        </div>
                    </div>
                    <div class="innerContainer">
                        <div class="mainText">
                        `+ body +`
                        </div>
                        <div class="innerFooter">
                            ` + footer + `
                        </div>
                    </div>
                        <div class="outterFooter"
                    </div>
                </div>
            </body>
        </html>
    `;

    let msg = {
        to: config.email.username,
        from: config.emailSender.helpEmail,
        subject: subject,
        text: "null",
        html: html
    };
    let result = await sgMail.send(msg).then(() =>{
        console.log('Email sent');
        return true;
    })
    .catch((error) => {
        console.log("(Error code: 2000)  Email not sent");
        console.log(error);
        return false;
    });
    return true;

    return result;
};



export {emailHandler};
