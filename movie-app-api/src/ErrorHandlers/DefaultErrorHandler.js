
const ERRORS = {
    ReferenceError:{
        default:{
            defaultMessage: "Some unexpected error occurred on the server",
            defaultLogMessage: "Some unexpected ReferenceError occurred on the server",
            defaultStatus: 500,
            defaultLog: true,
            defaultErrorCode: 19100,
            functions: {
                // for testing...
                login: {
                    forgotPassword: {
                        errorCode: 10000,
                        "900":{
                            errorCode: 900
                        }
                    }
                }
            }
        }
    },
    default: {
        defaultMessage:"Some unexpected error occurred on the server",
        defaultLogMessage: undefined,
        defaultStatus: 500,
        defaultLog: true,
        defaultErrorCode: 20000,
        functions: {
            fileHandler: {
                imageHandler: {}
            }
        }
    }
};



function defaultErrorHandler(error, file, functionName, secondaryCode) {
    // the high level type of error, ex. ForeignKey, UniqueConstraint, undefined
    let errorType = "default";
    // only something different if there are different versions of the same error
    let errorKey = "default";
    if(error.name === undefined)
    {
        errorType = "default";
    }
    // for testing
    else if(error.name === "ReferenceError")
    {
        errorType = "ReferenceError";
    }

    let errorClass = ERRORS[errorType];
    let errorObj;
    if(errorType === "default")
    {
        errorObj = errorClass;
    }
    else
    {
        errorObj = errorClass[errorKey];
        if(errorObj === undefined)
        {
            errorObj = errorClass["default"];
        }
    }


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

    // if there is no definition for the specific function, use defaults
    if(functionObj === undefined || Object.keys(functionObj).length < 1)
    {
        return getOutput(errorObj, undefined, error, secondaryCode);
    }
    else
    {
        return getOutput(errorObj, functionObj, error, secondaryCode);
    }

}


function getOutput(errorObj, functionObj, error, secondaryCode)
{
    let output = {
        message: "",
        status: undefined,
        log: undefined,
        logMessage: "",
        errorCode: undefined,
        error: error,
        secondaryCode: undefined
    };

    let secondaryCodeObj;
    // if there is a object for a specific part of a function
    if(functionObj !== undefined)
    {
        secondaryCodeObj = functionObj[secondaryCode];
    }

    let message = errorObj.defaultMessage;
    let log = errorObj.defaultLog;
    let logMessage = errorObj.defaultLogMessage;
    let errorCode = errorObj.defaultErrorCode;
    let status = errorObj.defaultStatus;
    let msgErrorCode = errorObj.defaultErrorCode;
    // if there is a object for the specific function, check the values
    if(functionObj !== undefined)
    {
        message = (functionObj.message === undefined) ? message : functionObj.message;
        log = (functionObj.log === undefined) ? log : functionObj.log;
        logMessage = (functionObj.logMessage === undefined) ? logMessage : functionObj.logMessage;
        errorCode = (functionObj.errorCode === undefined) ? errorCode : functionObj.errorCode;
        msgErrorCode = (functionObj.errorCode === undefined) ? errorCode : functionObj.errorCode;
        status = (functionObj.status === undefined) ? status : functionObj.status;

        if(secondaryCodeObj !== undefined)
        {
            message = (secondaryCodeObj.message === undefined) ? message : secondaryCodeObj.message;
            log = (secondaryCodeObj.log === undefined) ? log : secondaryCodeObj.log;
            logMessage = (secondaryCodeObj.logMessage === undefined) ? logMessage : secondaryCodeObj.logMessage;
            status = (secondaryCodeObj.status === undefined) ? status : secondaryCodeObj.status;
        }
    }
    if(secondaryCode !== undefined)
    {
        msgErrorCode = (secondaryCode === undefined ) ? msgErrorCode : msgErrorCode + "." + secondaryCode;
    }

    // if there is a error code, append it to the message
    if(msgErrorCode !== undefined)
    {
        message = message + ".  Error code: " + msgErrorCode;
    }

    output.status = status;
    output.log = log;
    output.logMessage = logMessage;
    output.message = message;
    output.errorCode = errorCode;
    output.error = error;
    output.secondaryCode = secondaryCode;

    return output;
}

export {defaultErrorHandler};
