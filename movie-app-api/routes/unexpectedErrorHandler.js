import {verifyLogin} from './globals.js';
import {getErrorHandler} from '../src/ErrorHandlers/errorReceiver.js';


// handles routes that do not exist


const unexpectedErrorHandler = (err, req, res, next) => {
    let result = getErrorHandler(err, res.locals.file, res.locals.function);
    if(result.log)
    {
        console.log(result.logMessage + "\nFile: " + res.locals.file + " Function: " + res.locals.function);
        console.log(JSON.parse(JSON.stringify(err)));
    }

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
    requester = "_theonenonly";
    res.status(status).send({
        message: message,
        requester: requester
    });
}


export {unexpectedErrorHandler};
