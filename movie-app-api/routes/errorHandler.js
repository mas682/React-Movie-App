import {getErrorHandler} from '../src/ErrorHandlers/errorReceiver.js';
import {destroySession} from '../src/shared/sessions.js';
import Logger from "../src/shared/logger.js";

const errorHandler = async(err, req, res, next) => {
    let result = getErrorHandler(err, res.locals.file, res.locals.function);
    // if the error occurred while regenerating a session, destroy the session
    if(res.locals.regeneratingSession !== undefined && res.locals.regeneratingSession)
    {
        console.log("Destorying users session");
        await destroySession(req);
    }
    if(result.log)
    {
        let errorObj = JSON.parse(JSON.stringify(err));
        if(Object.keys(errorObj).length < 1)
        {
            // be careful with what you are logging...
            Logger.error(err.stack, {function: res.locals.function, file: res.locals.file, errorCode: result.errorCode, errorMessage: result.logMessage, requestId: req.id});
        }
        else
        {
            // be careful with what you are logging...
            Logger.error(errorObj, {function: res.locals.function, file: res.locals.file, errorCode: result.errorCode, errorMessage: result.logMessage, requestId: req.id});
            //console.log(err);
        }
    }

    let requester = (req.session === undefined || req.session.user === undefined) ? "" : req.session.user;
    let status = result.status;
    let message = result.message;

    res.status(status).sendResponse({
        message: message,
        requester: requester
    });
}


module.exports.errorHandler = errorHandler;
