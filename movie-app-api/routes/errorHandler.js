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

    // will have to change this to setting requester to res.loals.requester
    // but if res.locals.requester is undefined, set to ""

    let cookie = req.signedCookies.MovieAppCookie;
    cookie = (cookie === false) ? undefined : cookie;
    // if there is a signed cookie in the request
    let status = result.status;
    let message = result.message;
    let requester = "";
    if(cookie != undefined)
    {
        // see if the cookie has a valid user
        verifyLogin(cookie).then((cookieValid) =>
        {
            if(cookieValid)
            {
                requester = JSON.parse(cookie).name;
            }
        });
    }

    // for testing
    //requester = "_theonenonly";
    res.status(status).send({
        message: message,
        requester: requester
    });
}


export {errorHandler};
