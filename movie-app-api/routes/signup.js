
import {emailHandler} from './emailHandler.js';
import {checkHashedValue} from '../src/shared/crypto.js';
import {createSession} from '../src/shared/sessions.js';
const validateStringParameter = require('./globals.js').validateStringParameter;
const validateEmailParameter = require('./globals.js').validateEmailParameter;
const validateUsernameParameter = require('./globals.js').validateUsernameParameter;
const validateIntegerParameter = require('./globals.js').validateIntegerParameter;
const models = require('../src/shared/sequelize.js').getClient().models;
const Logger = require("../src/shared/logger.js").getLogger();
const appendCallerStack = require("../src/shared/ErrorFunctions.js").appendCallerStack;

// function to create an account
const signUp = (req, res, next) => {
    let requester = (req.session === undefined || req.session.user === undefined || req.session.passwordResetSession !== undefined) ? "" : req.session.user;
    // set which file the request is for
    res.locals.file = "signup";
    if(requester !== "")
    {
        res.status(401).sendResponse({
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
        if(req.params.type === "register")
        {
            routeFound = true;
            createTempUser(requester, req, res)
            .catch((err) => {
                let callerStack = new Error().stack;
                appendCallerStack(callerStack, err, next, undefined);
            });
        }
        else if(req.params.type === "verify_account")
        {
            routeFound = true;
            verifyAccount(requester, req, res)
            .catch((err) => {
                let callerStack = new Error().stack;
                appendCallerStack(callerStack, err, next, undefined);
            });
        }
        else if(req.params.type === "resend_verification_code")
        {
            routeFound = true;
            resendVerificationCode(requester, req, res)
            .catch((err) => {
                let callerStack = new Error().stack;
                appendCallerStack(callerStack, err, next, undefined);
            });
        }
    }
    // if the route did not match any of the above
    if(!routeFound)
    {
        res.status(404).sendResponse({
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
    let outputMessages = {1: "Username must be between 6-20 characters", 2: "Username can only contain letters, numbers, or the following characters: _-$"};
    let valid = validateUsernameParameter(res, username, "", outputMessages);
    if(!valid) return;
    valid = validateEmailParameter(res, email, "", "The email provided is not a valid email address");
    if(!valid) return;
    valid = validateStringParameter(res, password, 6, 15, "", "Password must be betweeen 6-15 characters", true);
    if(!valid) return;
    valid = validateStringParameter(res, firstName, 1, 20, "", "First name must be between 1-20 characters", true);
    if(!valid) return;
    valid = validateStringParameter(res, lastName, 1, 20, "", "Last name must be between 1-20 characters", true);
    if(!valid) return;

    let creationResult = await models.Users.findOrCreateTempUser(email, username, firstName, lastName)
    .catch(error=>{
        let callerStack = new Error().stack;
        appendCallerStack(callerStack, error, undefined, true);
    });
    let tempUser = creationResult[0];
    let successful = creationResult[1];
    // if the user already existed
    if(!successful)
    {
        if(tempUser === null)
        {
            Logger.error("Some unexpected error occurred trying to create a user with the email of: " + email,
            {errorCode: 1313, function: res.locals.function, file: res.locals.file, requestId: req.id});
            res.status(500).sendResponse({
                message: "Some unexpected error occurred on the server.  Error code: 1313",
                requester: ""
            });
            return;
        }
        // if the account expired and has not been deleted yet
        else if(tempUser !== null && tempUser.verified === false && tempUser.deleteAt < new Date())
        {
            await models.Users.removeExpiredUser(req, res, tempUser, true, 1314).catch(error=>{
                let callerStack = new Error().stack;
                appendCallerStack(callerStack, error, undefined, true);
            });
            // try to create the user again as they should no longer exist
            tempUser = await models.Users.createTempUser(email, username, firstName, lastName).catch(error=>{
                let callerStack = new Error().stack;
                appendCallerStack(callerStack, error, undefined, true);
            });
        }
        // account either already exists and is verified or not yet verified but not expired
        else
        {
            let message = "";
            if(tempUser.username === username)
            {
                message = "Username is already in use"
            }
            else if(tempUser.email === email)
            {
                message = "Email already associated with a user"
            }
            res.status(409).sendResponse({
                message: message,
                requester: ""
            });
            return;
        }
    }

    // generate user credential record
    let errorCodes = {saltError: 1305, unexpectedError: 1306};
    let userCreds = await models.UserCredentials.createOrUpdatePassword(req, res, tempUser, password, true, errorCodes, true).catch(error=>{
        let callerStack = new Error().stack;
        appendCallerStack(callerStack, error, undefined, true);
    });

    // generate user authentication attempts record
    let userAuth = await models.UserAuthenticationAttempts.createNewUserRecord(req, res, tempUser, true, 1307).catch(error=>{
        let callerStack = new Error().stack;
        appendCallerStack(callerStack, error, undefined, true);
    });

    // generate verification code
    errorCodes = {saltError: 1302, unexpectedError: 1303};
    let result = await models.TempVerificationCodes.generateTempVerificationCode(req, res, tempUser, errorCodes, true, 10, 1).catch(error=>{
        let callerStack = new Error().stack;
        appendCallerStack(callerStack, error, undefined, true);
    });
    let tempVerificationCode = result.tempVerificationCode;
    let code = result.code;

    let emailResult = await sendVerificationEmail(code, email, res).catch(error=>{
        let callerStack = new Error().stack;
        appendCallerStack(callerStack, error, undefined, true);
    });
    Logger.debug("Code: " + code);
    Logger.debug("Adding 2 second delay");
    setTimeout(() =>{
        if(emailResult)
        {
            res.status(201).sendResponse({
                message: "Verification email sent",
                requester: ""
            });
        }
        else
        {
            let message = "Verification email not sent.  Error code: 1300";
            Logger.error("Verifcation email not sent",
                {function: "createTempUser", file: "signup.js", errorCode: 1300, requestId: req.id});
            res.status(500).sendResponse({
                message: message,
                requester: ""
            });
        }
    }, 2000);
}

// function to create a temp user before their email is verified
const resendVerificationCode = async (requester, req, res) =>
{
    res.locals.function = "resendVerificationCode";
    let email = req.body.email;
    let valid = validateEmailParameter(res, email, "", "The email provided is not a valid email address");
    if(!valid) return;
    
    let excludedAttributes = ["firstName","lastName","profileDescription","picture","admin"];
    let tempUser = await models.Users.findUnverifiedUser(email, excludedAttributes, undefined).catch(error=>{
        let callerStack = new Error().stack;
        appendCallerStack(callerStack, error, undefined, true);
    });
    let authRecord = (tempUser === null) ? null : tempUser.authenticationAttempts;

    let status;
    let message;
    let exit = false;
    if(tempUser === null)
    {
        status = 404;
        message = "Could not find a user with the provided email";
        exit = true;
    }
    // if the account expired and has not been deleted yet
    else if(tempUser !== null && tempUser.deleteAt < new Date())
    {
        await models.Users.removeExpiredUser(req, res, tempUser, false, 1312).catch(error=>{
            let callerStack = new Error().stack;
            appendCallerStack(callerStack, error, undefined, true);
        });
        status = 404;
        message = "Could not find a user with the provided email";
        exit = true;
    }
    // auth record should never be null if a tempUser exists
    else if(authRecord === null)
    {
        Logger.error("A unverified user exists without a verification attempts record. User ID: " + tempUser.id + " Email: " + email,
         {function: res.locals.function, file: res.locals.file, errorCode: 1308, requestId: req.id});
         // try to remove the user as they shouldn't even exist
        await models.Users.removeUnverifiedUser(req, res, tempUser, false, 1315).catch(error=>{
            let callerStack = new Error().stack;
            appendCallerStack(callerStack, error, undefined, true);
        });
        status = 500;
        message = "Some unexpected error occurred on the server.  Error code: 1308";
        exit = true;
    }
    if(exit)
    {
        res.status(status).sendResponse({
            message: message,
            requester: ""
        });
        return;
    }

    // at this point, a user can have a code resent
    // delete any existing verification records for the user
    await models.TempVerificationCodes.destroy({where: {userId: tempUser.id}}).catch(error=>{
        let callerStack = new Error().stack;
        appendCallerStack(callerStack, error, undefined, true);
    });

    // generate verification code
    let result = await models.TempVerificationCodes.generateTempVerificationCode(req, res, tempUser, undefined, false, 10, 1).catch(error=>{
        let callerStack = new Error().stack;
        appendCallerStack(callerStack, error, undefined, true);
    });
    let tempVerificationCode = result.tempVerificationCode;
    let code = result.code;

    let emailResult = await sendVerificationEmail(code, email, res).catch(error=>{
        let callerStack = new Error().stack;
        appendCallerStack(callerStack, error, undefined, true);
    });
    Logger.debug("Code: " + code);
    Logger.debug("Adding 2 second delay");
    if(emailResult)
    {
        // increment user password reset attempts, db handles logic around it to lock or not
        await models.UserAuthenticationAttempts.increment(
            "verificationAttempts",{where: {userId: tempUser.id}}).catch(error=>{
		        let callerStack = new Error().stack;
		        error = appendCallerStack(callerStack, error, undefined, false);
		        let message = "Some unexpected error occurred when trying increment a temp users codes resent";
		        caughtErrorHandler(error, req, res, 1304, message);
            });
    }
    setTimeout(() =>{
        if(emailResult)
        {
            res.status(201).sendResponse({
                message: "Verification email sent.",
                requester: ""
            });
        }
        else
        {
            let message = "Verification email not sent.  Error code: 1301";
            Logger.error("Verifcation email not sent",
                {function: "resendVerificationCode", file: "signup.js", errorCode: 1301, requestId: req.id});
            res.status(500).sendResponse({
                message: message,
                requester: ""
            });
        }
    }, 2000);
}

// function to create a user once their email is verified
const verifyAccount = async (requester, req, res) =>
{
    res.locals.function = "verifyAccount";
    let email = req.body.email;
    let verificationCode = req.body.verificationCode;
    let valid = validateEmailParameter(res, email, "", "The email provided is not a valid email address");
    if(!valid) return;
    valid = validateStringParameter(res, verificationCode, 6, 6, "", "Verification code invalid");
    if(!valid) return;
    // validate the value passed does not contain any characters, only numbers
    valid = validateIntegerParameter(res, verificationCode, "", "Verification code invalid", undefined, undefined);
    if(!valid) return;

    let tempUser = await models.Users.findUnverifiedUserWithVerificationRecord(email, undefined, undefined, undefined).catch(error=>{
        let callerStack = new Error().stack;
        appendCallerStack(callerStack, error, undefined, true);
    });

    let status = 404;
    let message;
    let exit = false;
    if(tempUser === null)
    {
        message = "Could not find a user with the provided email";
        exit = true;
    }
    // if the user exists but should have been deleted already
    else if(tempUser !== null && tempUser.deleteAt < new Date())
    {
        await models.Users.removeExpiredUser(req, res, tempUser, false, 1310).catch(error=>{
            let callerStack = new Error().stack;
            appendCallerStack(callerStack, error, undefined, true);
        });
        message = "Could not find a user with the provided email";
        exit = true;
    }
    // auth record should never be null if a tempUser exists
    else if(tempUser.authenticationAttempts === null)
    {
        Logger.error("A unverified user exists without a verification attempts record. Email: " + email + " User ID: " + tempUser.id,
        {function: res.locals.function, file: res.locals.file, errorCode: 1309, requestId: req.id});
        // try to remove the user as they shouldn't even exist
        await models.Users.removeUnverifiedUser(req, res, tempUser, false, 1311).catch(error=>{
            let callerStack = new Error().stack;
            appendCallerStack(callerStack, error, undefined, true);
        });
        message = "Some unexpected error occurred on the server.  Error code: 1309";
        status = 500;
        exit = true;
    }
    else if(tempUser.TempVerificationCode === null)
    {
        message = "The user does not have a active verification code";
        exit = true;
    }
    else if(tempUser.TempVerificationCode !== null && (tempUser.TempVerificationCode.verificationAttempts >= 3
        || tempUser.TempVerificationCode.expiresAt < new Date()))
    {
        message = "The user does not have a active verification code";
        exit = true;
    }
    if(exit)
    {
        res.status(status).sendResponse({
            message: message,
            requester: ""
        });
        return;
    }

    let tempVerificationCode = tempUser.TempVerificationCode;
    // convert to epoch time
    let secret = verificationCode + Date.parse(tempVerificationCode.createdAt);
    let result = checkHashedValue(secret, "verificationCode", tempVerificationCode.salt);
    // if passcode incorrect
    if(tempVerificationCode.code !== result.value)
    {
        // update the verification attempts as account not locked out
        tempVerificationCode = await tempVerificationCode.increment("verificationAttempts").catch(error=>{
            let callerStack = new Error().stack;
            appendCallerStack(callerStack, error, undefined, true);
        });
        let status = 401;
        let message;
        if(tempVerificationCode.verificationAttempts >= 3)
        {
            message = "Verification code is invalid.  The maximum of 3 verification attempts met for the current code";
        }
        else
        {
            message = "Verification code is invalid";
        }
        // increment count number of verification attempts
        res.status(status).sendResponse({
            message: message,
            requester: ""
        });
        return;
    }
    
    await models.TempVerificationCodes.destroy({where: {userId: tempUser.id}}).catch(error=>{
        let callerStack = new Error().stack;
        appendCallerStack(callerStack, error, undefined, true);
    });

    await tempUser.update({
        verified: true,
        deleteAt: null
    }).catch(error=>{
        let callerStack = new Error().stack;
        appendCallerStack(callerStack, error, undefined, true);
    });

    await models.UserAuthenticationAttempts.update({
        verificationAttempts: 0,
        lastLogin: new Date()
    },
    {
        where: {userId: tempUser.id}
    }).catch(error=>{
        let callerStack = new Error().stack;
        appendCallerStack(callerStack, error, undefined, true);
    });

    await createSession(tempUser, req, res, true, false).catch(error=>{
        let callerStack = new Error().stack;
        appendCallerStack(callerStack, error, undefined, true);
    });
    Logger.debug("Adding 5 second delay");
    setTimeout(() =>{
        res.status(201).sendResponse({
            message: "User has been created",
            requester: tempUser.username
        });
    }, 5000);
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
    let result = await emailHandler(email, subject, title, undefined, body, undefined).catch(error=>{
        let callerStack = new Error().stack;
        appendCallerStack(callerStack, error, undefined, true);
    });
    return result;
}

export {signUp};
