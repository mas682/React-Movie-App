import {verifyLogin} from './globals.js';


// handles routes that do not exist


const badPageHandler = (req, res, next) => {
    let requester = res.locals.requester;
    // if there is a signed cookie in the request
    let status = 404;
    let message = "The path sent to the server does not exist";

    res.status(status).send({
        message: message,
        requester: requester
    });
}


export {badPageHandler};
