// handles routes that do not exist
const Logger = require("../src/shared/logger.js").getLogger();
const checkRemoveSession = require('./errorHandler.js').checkRemoveSession;


const badPageHandler = async (req, res, next) => {
    try
    {
        res.locals.function = "badPageHandler";
        res.locals.file= "badPageHandler";
        await checkRemoveSession(req, res);
        let requester = (req.session === undefined || req.session.user === undefined || req.session.passwordResetSession !== undefined) ? "" : req.session.user;    // if there is a signed cookie in the request
        let status = 404;
        let message = "The path sent to the server does not exist";

        res.status(status).sendResponse({
            message: message,
            requester: requester
        });
    }
    catch(err)
    {
        return next(err);
    }
}


module.exports.badPageHandler = badPageHandler;
