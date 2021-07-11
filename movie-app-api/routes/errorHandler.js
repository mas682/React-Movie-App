import {verifyLogin} from './globals.js';
import {getErrorHandler} from '../src/ErrorHandlers/errorReceiver.js';
import {destroySession} from '../src/sessions.js';

const errorHandler = async(err, req, res, next) => {
    let result = getErrorHandler(err, res.locals.file, res.locals.function);
    // if the error occurred while regenerating a session, destroy the session
    if(res.locals.regeneratingSession !== undefined && res.locals.regeneratingSession)
    {
        console.log("Destorying users session");
        await req.session.destroy();
    }
    if(result.log)
    {
        console.log(result.logMessage + "\nFile: " + res.locals.file + " Function: " + res.locals.function);
        let errorObj = JSON.parse(JSON.stringify(err));
        if(Object.keys(errorObj).length < 1)
        {
            console.log(err);
        }
        else
        {
            console.log(errorObj);
            console.log(err);
        }
    }

    let requester = (req.session === undefined || req.session.user === undefined) ? "" : req.session.user;
    let status = result.status;
    let message = result.message;

    res.status(status).send({
        message: message,
        requester: requester
    });
}


export {errorHandler};
