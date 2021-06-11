import models, { sequelize } from '../src/models';
import {customAlphabet} from 'nanoid';
const Op = require('Sequelize').Op;
import {validateStringParameter, validateEmailParameter, validateUsernameParameter,
        validateIntegerParameter, updateUserLoginAttempts} from './globals.js';
import {emailHandler} from './EmailHandler.js';
const nanoid = customAlphabet('1234567890', 6);
const moment = require('moment');
import {checkHashedValue, encrypt, decrypt} from '../src/crypto.js';
import {createSession} from '../src/sessions.js';


// function to see if a user can login and returns a cookie to use
const login = (req, res, next) => {
    let requester = (req.session.user === undefined) ? "" : req.session.user;
    // set which file the request is for
    res.locals.file = "login";
    selectPath(requester, req, res, next);
};


const selectPath = (requester, req, res, next) =>
{
    res.locals.function = "selectPath";
    let routeFound = false;
    let cookieValid = (requester === "") ? false : true;
    if(req.method === "POST")
    {
        if(req.params.type === "authenticate")
        {
            routeFound = true;
            if(cookieValid)
            {
                res.status(200).send({
                    message: "User authenticated",
                    requester: requester,
                });
            }
            else
            {
                checkLogin(req, res)
                .catch((err) => {next(err)});
            }
        }
        else if(req.params.type === "forgot_password")
        {
            routeFound = true;
            if(cookieValid)
            {
                res.status(401).send({
                    message: "User already logged in",
                    requester: requester,
                });
            }
            else
            {
                forgotPassword(req, res)
                .catch((err) => {next(err)});
            }
        }
        else if(req.params.type === "validate_passcode")
        {
            routeFound = true;
            if(cookieValid)
            {
                res.status(401).send({
                    message: "User already logged in",
                    requester: requester,
                });
            }
            else
            {
                validatePassCode(req, res)
                .catch((err) => {next(err)});
            }
        }
    }
    else if(req.method === "GET")
    {
        if(req.params.type === "authenticate")
        {
            routeFound = true;
            if(cookieValid)
            {
                res.status(200).send({
                    message: "User logged in",
                    requester: requester
                });
            }
            else
            {
                res.status(401).send({
                    message: "User not logged in",
                    requester: requester
                });
            }
        }
    }
    if(!routeFound)
    {
        res.status(404).send({
            message:"The login path sent to the server does not exist",
            requester: requester
        });
    }
}

const checkLogin = async (req, res) =>
{
    res.locals.function = "checkLogin";
    // check login and generate cookie if login allowed
    let password = req.body.password;
    let username = req.body.username;
    // set to 30 as if allowing email will have to be longer
    let valid = validateUsernameParameter(undefined, username, "", "");
    // if not a valid username, check to see if valid email
    if(!valid)
    {
        valid = validateEmailParameter(undefined, username, res, "Username or email address is invalid");
        if(!valid) return;
    }
    valid = validateStringParameter(res, password, 6, 15, "", "Password must be between 6-15 characters");
    if(!valid) return;
    // find a user by their login
    let user = await models.User.findByLogin(req.body.username);
    let user2 = await models.User.findOne({
        where: { username: req.body.username },
        include: {
            model: models.UserSessions,
            as: "sessions",
            // include the user
            required: false
        },
    });
    console.log(user2);
    // make sure the user is not null, not locked out of account
    let userValid = await validateUser(res, username, user, true);
    if(!userValid) return;
    let result = checkHashedValue(password, "password", user.salt);
    // if the password is correct
    if(result.value === user.password)
    {
        try
        {
            let result = await user.update({
                lastLogin: new Date(),
                passwordAttempts: 0,
                verificationAttempts: 0,
                verificationLocked: null
            });
        }
        catch (err)
        {
            let errorObject = JSON.parse(JSON.stringify(err));
            console.log("(Error code: 1603) Some unknown error occurred updaing the users(" + username + ") account on login: " + errorObject.name);
            console.log(errorObject);
        }
        // create session for user
        createSession(user, req);

        setTimeout(() =>{
            res.status(200).send({
                message: "User authenticated",
                requester: user.username,
            });
        }, 3000);
    }
    else
    {
        let attempts = await updateUserLoginAttempts(user, username);
        let message = "Incorrect password"
        if(attempts >= 5)
        {
            message = message + ".  User account is currently locked due to too many login attempts"
        }
        res.status(401).send({
            message: message,
            requester: ""
        });
    }
};

const forgotPassword = async (req, res) =>
{
    res.locals.function = "forgotPassword";
    let username = req.body.username;
    let valid = validateUsernameParameter(undefined, username, "", "");
    // if not a valid username, check to see if valid email
    if(!valid)
    {
        valid = validateEmailParameter(res, username, "", "Username or email address is invalid");
        if(!valid) return;
    }
    // find a user by their login
    let user = await models.User.findByLogin(req.body.username);
    let validationResult = await validateUserForVerification(user, res, true);
    let result = validationResult.result;
    if(!result) return;
    // verification code record exists for the user?
    let codeExists = validationResult.codeExists;
    let tempVerificationCode = validationResult.tempVerificationCode;
    if(codeExists)
    {
        result = await tempVerificationCode.update({
            code: nanoid(),
            codesResent: tempVerificationCode.codesResent + 1,
            verificationAttempts: 0
        });
    }
    else
    {
        result = await models.TempVerificationCodes.create({
            userId: user.id,
            code: nanoid()
        });
    }

    if(result === undefined || result === null)
    {
        // if undefined, record cannot be found
        res.status(500).send({
            message: "User verification code could not be generated",
            requester: requester
        });
        return;
    }

    let emailResult = await sendVerificationEmail(result.code, user.email);
    console.log("Code: " + result.code);
    console.log("Adding 5 second delay");
    setTimeout(() =>{
        if(emailResult)
        {
            let message = "Verification email sent";
            res.status(201).send({
                message: "Verification email sent.",
                requester: ""
            });
        }
        else
        {
            res.status(500).send({
                message: "Verification email not sent.  Error code: 1602",
                requester: ""
            });
        }
    }, 2000);
};


const validatePassCode = async (req, res) =>
{
    res.locals.function = "validatePassCode";
    let username = req.body.username;
    let verificationCode = req.body.verificationCode;
    let valid = validateUsernameParameter(undefined, username, "", "");
    // if not a valid username, check to see if valid email
    if(!valid)
    {
        valid = validateEmailParameter(res, username, "", "Username or email address is invalid");
        if(!valid) return;
    }
    valid = validateStringParameter(res, verificationCode, 6, 6, "", "Verification code invalid");
    if(!valid) return;
    // validate the value passed does not contain any characters, only numbers
    valid = validateIntegerParameter(res, verificationCode, "", "Verification code invalid", undefined, undefined);
    if(!valid) return;
    // find a user by their login
    let user = await models.User.findByLogin(req.body.username);
    let validationResult = await validateUserForVerification(user, res, false);
    let result = validationResult.result;
    // if a valid validation record does not exist, return
    if(!result) return;
    let tempVerificationCode = validationResult.tempVerificationCode;
    if(tempVerificationCode.code !== verificationCode)
    {
        try {
            // increment verification attempts for the current code
            await tempVerificationCode.update({
                verificationAttempts: tempVerificationCode.verificationAttempts + 1
            });
            // increment the users total verification attempts since last verified
            let obj = {verificationAttempts: user.verificationAttempts + 1};
            if(user.verificationLocked !== null && user.verificationAttempts >= 9)
            {
                // if past verificationLocked and verificationAttempts still 9 or bigger,
                // reset to 1 and null verification locked
                if(new Date(user.verificationLocked) < new Date())
                {
                    obj["verificationAttempts"] = 1;
                    obj["verificationLocked"] = null;
                }
            }
            // if at max verification attempts, lock account from verification attempts for 1 hour
            else if((user.verificationAttempts + 1) >= 9)
            {
                obj["verificationLocked"] = moment(new Date()).add(60, 'm').toDate();
            }
            await user.update(obj);
        }
        catch (err)
        {
            let errorObject = JSON.parse(JSON.stringify(err));
            console.log("(Error code: 1604) Error updating a users verification attempts");
            console.log(errorObject);
        }
        let message = "Verification code is invalid";
        if(user.verificationAttempts >= 9)
        {
            message = "Verification code is invalid.  User account temporarily locked due to too many verification attempts";
        }
        else if((tempVerificationCode.codesResent >= 2 && tempVerificationCode.verificationAttempts >= 3))
        {
            message = "Verification code is invalid.  Verification code is no longer valid.  User may try to " +
                      "get a new verification code in 10 minutes as the limit of (3) codes have been sent out recently";
        }
        else if(tempVerificationCode.verificationAttempts >= 3)
        {
            message = "Verification code is invalid.  Verification code is no longer valid so user must "
                      + "request that a new verification code is sent out.";
        }
        res.status(401).send({
            message: message,
            requester: ""
        });
    }
    else
    {
        try {
            await tempVerificationCode.destroy();
            let obj = {
                verificationAttempts: 0,
                verificationLocked: null,
                passwordAttempts: 0,
                lastLogin: new Date()
            };
            await user.update(obj);
        }
        catch (err)
        {
            let errorObject = JSON.parse(JSON.stringify(err));
            console.log("(Error code: 1605) Error updating a users verification attempts");
            console.log(errorObject);
        }
        //res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000');
        req.session.userId = user.id;
        req.session.user = user.username;
        req.session.created = new Date();
        req.session.admin = user.admin;
        console.log("Adding 2 second delay");
        setTimeout(() =>{
            res.status(200).send({
                message: "User authenticated",
                requester: username
            });
        }, 2000);
    }
}

const sendVerificationEmail = async (verificationCode, email) =>
{
    res.locals.function = "sendVerificationEmail";
    let subject = "Movie-Fanatics Temporary Verification Code";
    let title = subject;
    let body = `<h2 style="color: #333; font-size: 1.25em;">Movie-Fanatics Verificaiton Code</h2>
                Your temporary verificaiton code is: ` + verificationCode + `<br><br>If you did not
                request this verification code, make sure your account has not been compromised`;
    let result = await emailHandler(email, subject, title, undefined, body, undefined);
    return result;
}

// res is the response object
// username - user being validated
// user is the user object to valdiate
// updateAttempts is a boolean to update user password attempts on failure
const validateUser = async (res, username, user, updateAttempts) =>
{
    res.locals.function = "validateUser";
    // false on failure
    let result = true;
    let message = "";
    let status = 0;
    // true depending on error found
    let updateUser = false;
    if(user === null)
    {
        message = "The username/email provided does not exist";
        status = 404;
        result = false;
    }
    else if(user.passwordAttempts >= 5)
    {
        message = "User account is currently locked due to too many login attempts";
        status = 401;
        updateUser = true;
        result = false;
    }

    if(!result)
    {
        if(updateAttempts && updateUser)
        {
            await updateUserLoginAttempts(user, username);
        }
        res.status(status).send({
            message: message,
            requester: ""
        });
    }
    return result;
}

const validateUserForVerification = async (user, res, resendCode) => {
    res.locals.function = "validateUserForVerification";
    // false on failure
    let result = true;
    let message = "";
    let status = 0;
    let codeExists = false;
    let tempVerificationCode = null;

    if(user === null)
    {
        message = "The username or email provided does not exist";
        status = 404;
        result = false;
    }
    else if(user.verificationLocked !== null)
    {
        if(new Date(user.verificationLocked) > new Date())
        {
            message = "User account temporarily locked due to too many verification attempts";
            status = 401;
            result = false;
        }
    }

    // if result not set to false yet
    if(result)
    {
        // see if the user already has a temp verification code out there
        tempVerificationCode = await models.TempVerificationCodes.findOne({
            where: {
                userId: user.id,
                expiresAt: {[Op.gte]: new Date()},
            }
        });
        if(tempVerificationCode !== null)
        {
            // if attempting to resend the code
            if(resendCode && tempVerificationCode.codesResent >= 2)
            {
                status = 404;
                message = "Could not send another verification code as the maximum number "
                         + "of codes to send out (3) has been met.  Another code can be sent "
                         + "within 10 minutes.";
                result = false;
            }
            else if(!resendCode && tempVerificationCode.verificationAttempts >= 3)
            {
                // if the code is no longer valid
                status = 404;
                message = "Could not find a user with the given email and username that has a valid active verification code";
                result = false;
            }
            codeExists = true;
        }
        else if(tempVerificationCode === null && !resendCode)
        {
            status = 404;
            message = "Could not find a user with the given email and username that has a valid active verification code";
            result = false;
        }
    }
    if(!result)
    {
        res.status(status).send({
            message: message,
            requester: ""
        });
    }
    return {
        result: result,
        codeExists: codeExists,
        tempVerificationCode: (codeExists) ? tempVerificationCode : null
    };
}


export {login};
