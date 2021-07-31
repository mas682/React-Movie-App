// handles routes that do not exist
const Logger = require("../src/shared/logger.js").getLogger();


const badPageHandler = (req, res, next) => {
    let requester = (req.session.user === undefined) ? "" : req.session.user;
    // if there is a signed cookie in the request
    let status = 404;
    let message = "The path sent to the server does not exist";

    res.status(status).sendResponse({
        message: message,
        requester: requester
    });
}


export {badPageHandler};
