import {getErrorHandler} from '../ErrorHandlers/ErrorReceiver.js';

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

module.exports.appendCallerStack = appendCallerStack;
module.exports.caughtErrorHandler = caughtErrorHandler;