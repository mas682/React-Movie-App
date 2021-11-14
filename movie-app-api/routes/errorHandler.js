import {getErrorHandler} from '../src/ErrorHandlers/ErrorReceiver.js';
import {removeCurrentSession} from '../src/shared/sessions.js';
import { clearCookie } from './globals.js';
const Logger = require("../src/shared/logger.js").getLogger();


const errorHandler = async(err, req, res, next) => {
    let result = getErrorHandler(err, res.locals.file, res.locals.function);
    // function to determine what to do 
    await checkRemoveSession(req, res);
    console.log(err);
    if(result.log)
    {
        let error = (result.error === undefined) ? err : result.error;
        let errorObj = JSON.parse(JSON.stringify(error));
        if(Object.keys(errorObj).length < 1)
        {
            // be careful with what you are logging...
            Logger.error(error.stack, {function: res.locals.function, file: res.locals.file, errorCode: result.errorCode, errorMessage: result.logMessage, requestId: req.id});
        }
        else
        {
            // be careful with what you are logging...
            Logger.error(errorObj, {function: res.locals.function, file: res.locals.file, errorCode: result.errorCode, errorMessage: result.logMessage, requestId: req.id});
        }
    }

    let requester = (req.session === undefined || req.session.user === undefined || req.session.passwordResetSession !== undefined) ? "" : req.session.user;
    let status = result.status;
    let message = result.message;

    res.status(status).sendResponse({
        message: message,
        requester: requester
    });
}

// error handler called if some error occurs in the main error handler
const finalErrorHandler = (err, req, res, next) => {
    let requester = (req.session === undefined || req.session.user === undefined || req.session.passwordResetSession !== undefined) ? "" : req.session.user;
    Logger.error(err, {function: res.locals.function, file: res.locals.file, errorCode: 2200, errorMessage: "An error occurred in the main error handler", requestId: req.id});
    res.status(500).sendResponse({
        message: "Some unexpected error occurred on the server.  Error code: 2200",
        requester: requester
    });
}

// function to determine if session should be removed on error
// called by json error handler and error handler
const checkRemoveSession = async(req, res) => {
     // if the error occurred while regenerating a session, destroy the session
     if(res.locals.regeneratingSession !== undefined && res.locals.regeneratingSession)
     {
         Logger.info("Destorying users session", {requestId: req.id});
         await removeCurrentSession(req, res);
         clearCookie(req, res, undefined);
     }
     // if the session was regenerated due to using a session just for resetting a password
     // delete the session if it is empty
     else if(res.locals.cleanSession === true && req.session !== undefined && req.session.userId === undefined)
     {
         Logger.info("Destorying users session", {requestId: req.id});
         await removeCurrentSession(req, res);
         clearCookie(req, res, undefined);
     }
     // if the session should be removed because some update to the session failed
     // used when removing session for bad request to reset_password
     else if(res.locals.removeSession !== undefined && res.locals.removeSession && req.session !== undefined)
     {
         Logger.info("Destorying users session", {requestId: req.id});
         await removeCurrentSession(req, res);
         clearCookie(req, res, undefined);
     }
     // if a uncaught error occurred when in function resetPassword, delete the session
     else if(req.session !== undefined && req.session.active !== undefined && !req.session.active)
     {
         Logger.info("Destorying users session", {requestId: req.id});
         await removeCurrentSession(req, res);
         clearCookie(req, res, undefined);
     }
}

// middleware function used to handle bad json passed in request
const jsonHandler = (middleware, req, res, next) => {
    middleware(req, res, async (err) => {
        if (err) {
            try
            {
                await checkRemoveSession(req, res);
                let requester = (req.session === undefined || req.session.user === undefined || req.session.passwordResetSession !== undefined) ? "" : req.session.user;
                return res.status(400).sendResponse({
                    message: "Invalid json found in request",
                    requester: requester
                });
            }catch(err)
            {
                return next(err);
            }
        }
        next();
      });
};

module.exports.errorHandler = errorHandler;
module.exports.checkRemoveSession = checkRemoveSession;
module.exports.jsonHandler = jsonHandler;
module.exports.finalErrorHandler = finalErrorHandler;
