import {verifyLogin} from './globals.js';
import {getErrorHandler} from '../src/ErrorHandlers/errorReceiver.js';

const errorHandler = (err, req, res, next) => {
    let result = getErrorHandler(err, res.locals.file, res.locals.function);
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
        }
    }

    let requester = (req.session.user === undefined) ? "" : req.session.user;
    let status = result.status;
    let message = result.message;

    res.status(status).send({
        message: message,
        requester: requester
    });
}


export {errorHandler};
