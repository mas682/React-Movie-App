import {customAlphabet} from 'nanoid';
const Op = require('Sequelize').Op;
const nanoid = customAlphabet('1234567890', 6);
const moment = require('moment');
import {validateStringParameter, validateUsernameParameter, validateEmailParameter,
        validateIntegerParameter} from './globals.js';
import {emailHandler} from './EmailHandler.js';
import {hash} from '../src/crypto.js';
import {createSession} from '../src/sessions.js';
const models = require('../src/sequelize.js').getClient().models;

// function to create an account
const signUp = (req, res, next) => {
    let requester = (req.session.user === undefined) ? "" : req.session.user;
    // set which file the request is for
    res.locals.file = "signup";
    if(requester !== "")
    {
        res.status(401).send({
            message: "You are already logged in so you must have an account",
            requester: requester
        });
    }
    else
    {
        selectPath(requester, req, res, next);
    }
};

const selectPath = (requester, req, res, next) =>
{
    res.locals.function = "selectPath";
    let routeFound = false;
    if(req.method === "POST")
    {
        // if the path is profile/username/follow
        if(req.params.type === "register")
        {
            routeFound = true;
            createTempUser(requester, req, res)
            .catch((err) => {next(err)});
        }
        // if the path is profile/username/follow
        else if(req.params.type === "create_account")
        {
            routeFound = true;
            createUser(requester, req, res)
            .catch((err) => {next(err)});
        }
        else if(req.params.type === "resend_verification_code")
        {
            routeFound = true;
            resendVerificationCode(requester, req, res)
            .catch((err) => {next(err)});
        }
        else if(req.params.type === "cancel_registration")
        {
            routeFound = true;
            removeTempUser(requester, req, res)
            .catch((err) => {next(err)});
        }
    }
    // if the route did not match any of the above
    if(!routeFound)
    {
        res.status(404).send({
            message:"The signup path sent to the server does not exist",
            requester: requester
        });
    }
};


// function to create a temp user before their email is verified
const createTempUser = async (requester, req, res) =>
{
    res.locals.function = "createTempUser";
    let username = req.body.username;
    let email = req.body.email;
    let password = req.body.password;
    let firstName = req.body.firstName;
    let lastName = req.body.lastName;
    let valid = validateUsernameParameter(res, username, "", "Username must be between 6-20 characters");
    if(!valid) return;
    valid = validateEmailParameter(res, email, "", "The email provided is not a valid email address");
    if(!valid) return;
    valid = validateStringParameter(res, password, 6, 15, "", "Password must be betweeen 6-15 characters");
    if(!valid) return;
    valid = validateStringParameter(res, firstName, 1, 20, "", "First name must be between 1-20 characters");
    if(!valid) return;
    valid = validateStringParameter(res, lastName, 1, 20, "", "Last name must be between 1-20 characters");
    if(!valid) return;

    let hashResult = hash(password, "password");
    console.log(hashResult.salt);

    let result = await models.UserVerificationCodes.create({
        userEmail: email,
        username: username,
        code: nanoid(),
        password: hashResult.value,
        salt: hashResult.salt,
        firstName: firstName,
        lastName: lastName
    });

    // may want to verify result not null? or undefined?
    // then send email to user
    let emailResult = await sendVerificationEmail(result.code, result.userEmail, res);
    console.log("Code: " + result.code);
    console.log("Adding 5 second delay");
    setTimeout(() =>{
        if(emailResult)
        {
            res.status(201).send({
                message: "Verification email sent",
                requester: ""
            });
        }
        else
        {
            let message = "Verification email not sent.  Error code: 1302";
            let logMessage = "(Error code: 1302) Verifcation email not sent";
            console.log(logMessage);
            res.status(500).send({
                message: message,
                requester: ""
            });
        }
    }, 5000);
}

// function to create a temp user before their email is verified
const resendVerificationCode = async (requester, req, res) =>
{
    res.locals.function = "resendVerificationCode";
    let username = req.body.username;
    let email = req.body.email;
    let valid = validateUsernameParameter(res, username, "", "Username must be between 6-20 characters");
    if(!valid) return;
    valid = validateEmailParameter(res, email, "", "The email provided is not a valid email address");
    if(!valid) return;
    let tempUser = await models.UserVerificationCodes.findOne({
        where: {
            userEmail: email,
            username: username,
            expiresAt: {[Op.gte]: moment()},
            [Op.or]: [
                {[Op.and]: [{codesResent: 2},{verificationAttempts: {[Op.lt]: 3}}]},
                {[Op.and]: [{codesResent: {[Op.lt]: 2}}]}
            ]
        }
    });
    if(tempUser === null)
    {
        res.status(404).send({
            message: "Could not find a user with the given email and username that has a valid active verification code",
            requester: ""
        });
        return;
    }
    else if(tempUser.codesResent >= 2 && tempUser.verificationAttempts < 3)
    {
        res.status(404).send({
            message: "Could not send another verification code as the maximum number of codes to send out (3) has been met",
            requester: ""
        });
        return;
    }

    let result = await tempUser.update({
        code: nanoid(),
        codesResent: tempUser.codesResent + 1,
        verificationAttempts: 0
    });
    if(result === undefined || result === null)
    {
        // if undefined, tempUser cannot be found
        res.status(404).send({
            message: "User could not be found",
            requester: requester
        });
    }

    let emailResult = await sendVerificationEmail(result.code, result.userEmail, res);
    console.log("Code: " + result.code);
    console.log("Adding 5 second delay");
    setTimeout(() =>{
        if(emailResult)
        {
            res.status(201).send({
                message: "Verification email sent.",
                requester: ""
            });
        }
        else
        {
            let message = "Verification email not sent.  Error code: 1304";
            let logMessage = "(Error code: 1304) Verifcation email not sent"
            console.log(logMessage);
            res.status(500).send({
                message: message,
                requester: ""
            });
        }
    }, 5000);
}


// function to create a user once their email is verified
const createUser = async (requester, req, res) =>
{
    res.locals.function = "createUser";
    let username = req.body.username;
    let email = req.body.email;
    let verificationCode = req.body.verificationCode;
    let valid = validateUsernameParameter(res, username, "", "Username must be between 6-20 characters");
    if(!valid) return;
    valid = validateEmailParameter(res, email, "", "The email provided is not a valid email address");
    if(!valid) return;
    valid = validateStringParameter(res, verificationCode, 6, 6, "", "Verification code invalid");
    if(!valid) return;
    // validate the value passed does not contain any characters, only numbers
    valid = validateIntegerParameter(res, verificationCode, "", "Verification code invalid", undefined, undefined);
    if(!valid) return;

    let tempUser = await models.UserVerificationCodes.findOne({
        where: {
            userEmail: email,
            username: username,
            expiresAt: {[Op.gte]: moment()},
            [Op.or]: [
                {[Op.and]: [{codesResent: 2},{verificationAttempts: {[Op.lt]: 3}}]},
                {[Op.and]: [{codesResent: {[Op.lt]: 2}}]}
            ]
        }
    });
    if(tempUser === null)
    {
        res.status(404).send({
            message: "Could not find a user with the given email and username that has a valid active verification code",
            requester: ""
        });
        return;
    }
    else if(tempUser.verificationAttempts >= 3 && tempUser.codesResent < 2)
    {
        res.status(404).send({
            message: "Could not verify user as a maximum of 3 attempts have been attempted for the verification code.",
            requester: ""
        });
        return;
    }

    if(tempUser.code !== verificationCode)
    {
        // if the account will become locked, remove it
        if(tempUser.codesResent >= 2 && (tempUser.verificationAttempts + 1) >= 3)
        {
            // delete the user out of the UserVerificationCodes table
            tempUser.destroy();
            res.status(401).send({
                message: "Verification code is invalid.  Maximum verification attempts met",
                requester: ""
            });
            return;
        }
        else
        {
            // update the verification attempts as account not locked out
            await tempUser.update({
                verificationAttempts: tempUser.verificationAttempts + 1
            });
            if(tempUser.verificationAttempts >= 3)
            {
                // increment count number of verification attempts
                res.status(401).send({
                    message: "Verification code is invalid.  The maximum of 3 verification attempts met for " +
                    "the current code",
                    requester: ""
                });
                return;
            }
            // increment count number of verification attempts
            res.status(401).send({
                message: "Verification code is invalid",
                requester: ""
            });
            return;
        }
    }

    // delete the user out of the UserVerificationCodes table
    // could have a race condition issue here if user not totally out of database before doing the
    // create
    await tempUser.destroy();

    // find the a user with the username or email sent
    const [user, created] = await models.Users.findOrCreate({where: {[Op.or]: [{username: username}, {email: email}]},
        defaults: {
            username: username,
            email: email,
            password: tempUser.password,
            firstName: tempUser.firstName,
            lastName: tempUser.lastName,
            salt: tempUser.salt,
            verified: true
        }}
    );
    // if the user did not already exist and was successfully created
    if(created)
    {
        await createSession(user, req, res, true);
        console.log("Adding 5 second delay");
        setTimeout(() =>{
            res.status(201).send({
                message: "User has been created",
                requester: username
            });
        }, 5000);
    }
    // the user existed
    else
    {
        if(user.username == req.body.username)
        {
            res.status(409).send({
                message: "Username already exists",
                requester: ""
            });
        }
        else if(user.email == req.body.email)
        {
            res.status(409).send({
                message: "Email already associated with a user",
                requester: ""
            });
        }
        else
        {
            let message = "Someting went wrong on the server when creating the user.  Error code: 1305"
            res.status(500).send({
                message: message,
                requester: ""
            });
        }
    }
};


// function to remove a temp user
const removeTempUser = async (requester, req, res) =>
{
    res.locals.function = "removeTempUser";
    let username = req.body.username;
    let email = req.body.email;
    let valid = validateUsernameParameter(res, username, "", "Username must be between 6-20 characters");
    if(!valid) return;
    valid = validateEmailParameter(res, email, "", "The email provided is not a valid email address");
    if(!valid) return;

    let tempUser = await models.UserVerificationCodes.findOne({
        where: {
            userEmail: email,
            username: username,
            expiresAt: {[Op.gte]: moment()},
            [Op.or]: [
                {[Op.and]: [{codesResent: 2},{verificationAttempts: {[Op.lt]: 3}}]},
                {[Op.and]: [{codesResent: {[Op.lt]: 2}}]}
            ]
        }
    });
    if(tempUser === null)
    {
        res.status(404).send({
            message: "Could not find a user with the given email and username that has a valid active verification code",
            requester: ""
        });
        return;
    }

    // delete the user out of the UserVerificationCodes table
    tempUser.destroy();

    res.status(200).send({
        message: "Temporary user has been removed",
        requester: ""
    });
};


const sendVerificationEmail = async (verificationCode, email, res) =>
{
    res.locals.function = "sendVerificationEmail";
    let header = "Movie Fanatics Verification Code";
    let subject = "Movie-Fanatics Email Verification";
    let title = subject;
    let body = `<h2 style="color: #333; font-size: 1.25em;">Welcome to Movie-Fanatics!</h2>
                Your verification code is: ` + verificationCode + `<br><br>If you did not
                request to sign up for <a href="https://www.movie-fanatics.com">movie-fanatics.com</a>, please disregard this email.`;
    let result = await emailHandler(email, subject, title, undefined, body, undefined);
    return result;
}

export {signUp};
