import {getErrorHandler} from '../src/ErrorHandlers/ErrorReceiver.js';
import {removeCurrentSession} from '../src/shared/sessions.js';
const Logger = require("../src/shared/logger.js").getLogger();

const errorHandler = async(err, req, res, next) => {
    let result = undefined;
    let errorResult = undefined;
    try 
    {
        // function to determine what to do 
        result = getErrorHandler(err, res.locals.file, res.locals.function, res.locals.secondaryCode);
        errorResult = (result.error === undefined) ? err : result.error;
        await checkRemoveSession(req, res).catch(error=>{
            let callerStack = new Error().stack;
            appendCallerStack(callerStack, error, undefined, true);
        });
        if(result.log)
        {
            // be careful with what you are logging...
            Logger.error({name: errorResult.name, message: errorResult.message, stack: errorResult.stack},
                {
                    function: res.locals.function,
                    file: res.locals.file,
                    errorCode: result.errorCode, 
                    secondaryCode: result.secondaryCode,
                    errorMessage: result.logMessage,
                    secondaryMessage: res.locals.secondaryMessage,
                    requestId: req.id
                }
            );
        }

        let requester = (req.session === undefined || req.session.user === undefined || req.session.passwordResetSession !== undefined) ? "" : req.session.user;
        let status = result.status;
        let message = result.message;

        res.status(status).sendResponse({
            message: message,
            requester: requester
        });
    }
    catch(error)
    {
        // if error occurred after getErrorHandler ran
        if(result !== undefined && errorResult !== undefined)
        {
            res.locals.originalError = {
                error: {name: errorResult.name, message: errorResult.message, stack: errorResult.stack},
                function: res.locals.function,
                file: res.locals.file,
                errorCode: result.errorCode, 
                secondaryCode: result.secondaryCode,
                errorMessage: result.logMessage,
                secondaryMessage: res.locals.secondaryMessage
            };
        }
        else
        {
            let errorObject = JSON.parse(JSON.stringify(err));
            errorObject = (Object.keys(errorObject).length < 1) ? ({name: err.name, message: err.message, stack: err.stack}) : 
                ({name: err.name, message: errorObject, stack: err.stack});
            res.locals.originalError = {
                error: errorObject,
                function: res.locals.function,
                file: res.locals.file,
                errorCode: undefined, 
                secondaryCode: undefined,
                errorMessage: undefined,
                secondaryMessage: res.locals.secondaryMessage
            };
        }
        res.locals.function = "errorHandler";
        res.locals.file = "errorHandler";
        throw error;
    }
}

// error handler called if some error occurs in the main error handler
const finalErrorHandler = (err, req, res, next) => {
    let errorObject = JSON.parse(JSON.stringify(err));
    errorObject = (Object.keys(errorObject).length < 1) ? ({name: err.name, message: err.message, stack: err.stack}) : 
        ({name: err.name, message: errorObject, stack: err.stack});
    let requester = (req.session === undefined || req.session.user === undefined || req.session.passwordResetSession !== undefined) ? "" : req.session.user;
    Logger.error(errorObject, {originalError: res.locals.originalError,function: res.locals.function, file: res.locals.file, errorCode: 2200, errorMessage: "An error occurred in the main error handler", requestId: req.id});
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
         await removeCurrentSession(req, res).catch(error=>{
            let callerStack = new Error().stack;
            appendCallerStack(callerStack, error, undefined, true);
        });
         clearCookie(req, res, undefined);
     }
     // if the session was regenerated due to using a session just for resetting a password
     // delete the session if it is empty
     else if(res.locals.cleanSession === true && req.session !== undefined && req.session.userId === undefined)
     {
         Logger.info("Destorying users session", {requestId: req.id});
         await removeCurrentSession(req, res).catch(error=>{
            let callerStack = new Error().stack;
            appendCallerStack(callerStack, error, undefined, true);
        });
         clearCookie(req, res, undefined);
     }
     // if the session should be removed because some update to the session failed
     // used when removing session for bad request to reset_password
     else if(res.locals.removeSession !== undefined && res.locals.removeSession && req.session !== undefined)
     {
         Logger.info("Destorying users session", {requestId: req.id});
         await removeCurrentSession(req, res).catch(error=>{
            let callerStack = new Error().stack;
            appendCallerStack(callerStack, error, undefined, true);
        });
         clearCookie(req, res, undefined);
     }
     // if a uncaught error occurred when in function resetPassword, delete the session
     else if(req.session !== undefined && req.session.active !== undefined && !req.session.active)
     {
         Logger.info("Destorying users session", {requestId: req.id});
         await removeCurrentSession(req, res).catch(error=>{
            let callerStack = new Error().stack;
            appendCallerStack(callerStack, error, undefined, true);
        });
         clearCookie(req, res, undefined);
     }
}

// middleware function used to handle bad json passed in request
const jsonHandler = (middleware, req, res, next) => {
    middleware(req, res, async (err) => {
        if (err) {
            try
            {
                await checkRemoveSession(req, res).catch(error=>{
                    let callerStack = new Error().stack;
                    appendCallerStack(callerStack, error, undefined, true);
                });
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

// function called inside the catch function on await functions
// used to append to the stack where the async fuction was actually called
const appendCallerStack = (callerStack, error, next, throwError) =>{
    if(callerStack.length > 30)
    {
        // 6 is the index of the new line first \n character in the error stack
        callerStack = callerStack.substring(6);
        // get index of second lines new line character, starting 25 characters in
        // string should be like:      at /movie-app-api/routes/login.js:223:31
        let endIndex = callerStack.indexOf("\n", 25);
        if(endIndex !== -1)
        {
            callerStack = callerStack.substring(0, endIndex);
        }
    }
    error.stack = error.stack + "\n" + callerStack

    if(next !== undefined)
    {
        next(error);
    }
    else
    {
        if(throwError)
        {
            throw error;
        }
        else
        {
            return error;
        }
    }
};

// function to handle logging for errors that are just caught but don't stop the function
const caughtErrorHandler = async(err, req, res, secondaryCode, secondaryMessage) => {
    let result = getErrorHandler(err, res.locals.file, res.locals.function, secondaryCode);
    if(result.log)
    {
        let error = (result.error === undefined) ? err : result.error;
        // be careful with what you are logging...
        Logger.error({name: error.name, message: error.message, stack: error.stack}, {function: res.locals.function, file: res.locals.file, errorCode: result.errorCode, secondaryCode: result.secondaryCode,  errorMessage: result.logMessage, secondaryMessage: secondaryMessage, requestId: req.id});
    }
};


// used to tell client to remove cookie if there is no valid session associated
// with the cookie
// this also exists in globals.js but put in here as well to avoid circular dependency
const clearCookie = (req, res, next) => {
    res.locals.function = "clearCookie";
    res.locals.file = "globals";
    // if there is no session associated with the cookie and a cookie is provided
    if((req.session === undefined || req.session.user === undefined) && req.headers.cookie !== undefined)
    {
        let options = {};
        res.clearCookie(config.app.cookieName, options);
    }
    if(next !== undefined)
    {
        next();
    }
}

module.exports.errorHandler = errorHandler;
module.exports.checkRemoveSession = checkRemoveSession;
module.exports.jsonHandler = jsonHandler;
module.exports.finalErrorHandler = finalErrorHandler;
module.exports.appendCallerStack = appendCallerStack;
module.exports.caughtErrorHandler = caughtErrorHandler;
