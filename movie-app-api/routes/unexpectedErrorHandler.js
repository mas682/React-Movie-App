import {verifyLogin} from './globals.js';


// handles routes that do not exist


const unexpectedErrorHandler = (err, req, res, next) => {
    let cookie = req.signedCookies.MovieAppCookie;
    cookie = (cookie === false) ? undefined : cookie;
    // if there is a signed cookie in the request
    let status = 500;
    let message = "Some unexpected error occurred on the server";
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

    res.status(status).send({
        message: message,
        requester: requester
    });
}


export {unexpectedErrorHandler};
