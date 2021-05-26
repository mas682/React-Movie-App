
const ERRORS = {
    default: {
        defaultMessage:"Some unexpected error occurred on the server",
        defaultLogMessage: "Some unexpected error occurred",
        defaultStatus: 500,
        defaultLog: true,
        defaultErrorCode: 1900,
        functions: {
            fileHandler: {
                imageHandler: {}
            }
        }
    }
};



function defaultErrorHandler(error, file, functionName) {
    // the high level type of error, ex. ForeignKey, UniqueConstraint, undefined
    let errorObj = ERRORS["default"];
    let classObj = undefined;
    let functionObj = undefined;
    if(Object.keys(errorObj.functions).length > 0)
    {
        classObj = errorObj.functions[file];
        // find the specific class obj if there is one
        if(classObj !== undefined)
        {
            functionObj = classObj[functionName]
        }
    }

    let output = {
        message: "",
        status: undefined,
        log: undefined,
        logMessage: ""
    };
    // if there is no definition for the specific function, use defaults
    if(functionObj === undefined || Object.keys(functionObj).length < 1)
    {
        return getOutput(errorObj, undefined);
    }
    else
    {
        return getOutput(errorObj, functionObj);
    }

}

// if either the function the error occurred in is not defined or
// the function is defined but has no properties
function getOutput(errorObj, functionObj)
{
    let output = {
        message: "",
        status: undefined,
        log: undefined,
        logMessage: ""
    };
    let message = errorObj.defaultMessage;
    let log = errorObj.defaultLog;
    let logMessage = errorObj.defaultLogMessage;
    let errorCode = errorObj.defaultErrorCode;
    let status = errorObj.defaultStatus;
    // if there is a object for the specific function, check the values
    if(functionObj !== undefined)
    {
        message = (functionObj.message === undefined) ? message : functionObj.message;
        log = (functionObj.log === undefined) ? log : functionObj.log;
        logMessage = (functionObj.logMessage === undefined) ? logMessage : functionObj.logMessage;
        errorCode = (functionObj.errorCode === undefined) ? errorCode : functionObj.errorCode;
        status = (functionObj.status === undefined) ? status : functionObj.status;
    }


    // if there is a error code, append it to the message
    if(errorCode !== undefined)
    {
        message = message + " .  Error code: " + errorCode;
    }
    // if the error will be logged, get the log message
    if(log)
    {
        // if no log message, set it to message
        if(logMessage === undefined)
        {
            logMessage = "(Error code: " + errorCode + ") " + message;
        }
        else
        {
            logMessage = "(Error code: " + errorCode + ") " + logMessage;
        }
    }
    output.status = status;
    output.log = log;
    output.logMessage = logMessage;
    output.message = message;

    console.log(output);
    return output;
}

export {defaultErrorHandler};
