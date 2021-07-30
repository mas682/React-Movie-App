const ERRORS = {
    "INVALID_FILE_NAME_LENGTH":{
        defaultMessage:"File name cannot be greater than 100 characters or less than 5 characters",
        defaultLogMessage: undefined,
        defaultStatus: 400,
        defaultLog: false,
        defaultErrorCode: undefined,
        functions: {
            fileHandler: {
                imageHandler: {}
            }
        }
    },
    "INVALID_FILE_TYPE":{
        defaultMessage:"Invalid file type",
        defaultLogMessage: undefined,
        defaultStatus: 400,
        defaultLog: false,
        defaultErrorCode: undefined,
        functions: {
            fileHandler: {
                imageHandler: {}
            }
        }
    },
    "SERVER_FILE_NAME_GENERATION_ERROR":{
        defaultMessage:"Only 1 image can be sent in the request",
        defaultLogMessage: "The server failed to find a unique file name after 5 tries",
        defaultStatus: 500,
        defaultLog: true,
        defaultErrorCode: undefined,
        functions: {
            fileHandler: {
                imageHandler: {
                    errorCode: 1706
                }
            }
        }
    },
    default: {
        defaultMessage:"Some unexpected error occurred on the server",
        defaultLogMessage: undefined,
        defaultStatus: 500,
        defaultLog: true,
        defaultErrorCode: undefined,
        functions: {
            fileHandler: {
                imageHandler: {
                    errorCode: 1701
                }
            }
        }
    }
};



function fileUploadErrorHandler(error, file, functionName) {
    // the high level type of error, ex. ForeignKey, UniqueConstraint, undefined
    let errorObj = ERRORS[error.code];
    if(errorObj === undefined)
    {
        errorObj = ERROS["default"]
    }
    let classObj = undefined;
    let functionObj = undefined;
    if(Object.keys(errorObj.functions).length > 1)
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

    output.status = status;
    output.log = log;
    output.logMessage = logMessage;
    output.message = message;
    output.errorCode = errorCode;

    return output;
}

export {fileUploadErrorHandler};
