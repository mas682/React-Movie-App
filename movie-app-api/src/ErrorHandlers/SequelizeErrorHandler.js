/*
    Plan:
    keep in mind you want to be able to adjust the model in the future.....
    may want to do monitoring based off these outputs...

    will have a object that has keys for the various error types such as
    SequelizeErrors, AWS Errors, Multer errors, etc.
    each key will point to a instance of a class for that error
    in each class:
        - ERRORS will hold some key to determine what the error is
        - ERROR_CODES will hold the output for the errors
            1 is the key to ERRORS
            default message is a default value to use
            output is a boolean of if it should be logged
            unique is a boolean of if errorCodes should be searched (may not need)
            errorCodes is a object that holds:
                the first key is the file name
                the second key is the function name
                the error code to use
                the message to use
                may want output as well?
                may let message be undefined, in which case use the default..
                same for errorCode?
            if a file or function returns undefined from errorcodes, use the default
            output
            have a function that you can call to get the value back
            may not even need a class but still debatable
            a undefined key in ERROR_CODES means the constraint could not be matched to
            any errors

            exammple:
            "ForeignKey": {
                "reviews_userId_fkey":{
                    defaultMessage:"User associated with the review does not exist",
                    logMessage: undefined,
                    defaultStatus: 401,
                    defaultErrorCode: ...
                    log: true,
                    functions: {
                        reviewCreator: {
                            createReview: {
                                errorCode: undefined,
                                message: undefined,
                                logMessage: undefined,
                                log: undefined,
                                status: undefined
                            }
                        }
                    }
                }
            }

            if values in errorCodes are undefined, use defaults...
            may want to add default error code?
            if default is undefined and one from errorCodes is undefined, ignore




*/


const ERRORS = {
    "ForeignKey": {
        "reviews_userId_fkey":{
            defaultMessage:"User associated with the review does not exist",
            defaultLogMessage: undefined,
            defaultStatus: 401,
            defaultLog: false,
            defaultErrorCode: undefined,
            functions: {
                reviewCreator: {
                    createReview: {},
                    updateReview: {}
                }
            }
        },
        "reviews_movieId_fkey":{
            defaultMessage:"Movie associated with the review does not exist",
            defaultLogMessage: undefined,
            defaultStatus: 404,
            defaultLog: false,
            defaultErrorCode: undefined,
            functions: {
                reviewCreator: {
                    createReview: {},
                    updateReview: {}
                }
            }
        },
        "comments_userId_fkey":{
            defaultMessage: "User could not be found",
            defaultLogMessage: undefined,
            defaultStatus: 401,
            defaultLog: false,
            defaultErrorCode: undefined,
            functions: {
                reviews: {
                    postComment: {}
                }
            }
        },
        "comments_reviewId_fkey":{
            defaultMessage: "The review could not be found",
            defaultLogMessage: undefined,
            defaultStatus: 404,
            defaultLog: false,
            defaultErrorCode: undefined,
            functions: {
                reviews: {
                    postComment: {}
                }
            }
        },
        default: {
            defaultMessage: "Some unexpected error occurred on the server",
            defaultLogMessage: "Some unexpected foreign key constraint error occurred",
            defaultStatus: 500,
            defaultLog: true,
            defaultErrorCode: undefined,
            functions: {
                review: {
                    postComment: {
                        errorCode: 1203
                    }
                },
                // the codes here will need fixed as they were groupded into 1 before
                reviewCreator: {
                    createReview: {
                        errorCode: 1101
                    },
                    updateReview: {
                        errorCode: 1101
                    }
                }
            }
        }

    },
    "UniqueConstraint":{
        "reviews_userId_movieId_key":{
            defaultMessage:"A review for this movie by the current user already exists.",
            defaultLogMessage: undefined,
            defaultStatus: 400,
            defaultLog: false,
            defaultErrorCode: undefined,
            functions: {
                reviewCreator: {
                    createReview: {},
                    updateReview: {}
                }
            }
        },
        "users_username_key": {
            defaultMessage: "Username is already in use",
            defaultLogMessage: undefined,
            defaultStatus: 409,
            defaultLog: false,
            defaultErrorCode: undefined,
            functions: {
                profile: {
                    updateInfo: {}
                }
            }
        },
        "users_email_key":{
            defaultMessage: "Email already associated with a user",
            defaultLogMessage: undefined,
            defaultStatus: 409,
            defaultLog: false,
            defaultErrorCode: undefined,
            functions: {
                profile: {
                    updateInfo: {}
                }
            }
        },
        "users_picture_key":{
            defaultMessage: "Some unexpected error occurred on the server",
            defaultLogMessage: undefined,
            defaultStatus: 500,
            defaultLog: true,
            defaultErrorCode: undefined,
            functions: {
                profile: {
                    updateImage: {
                        errorCode: 1010
                    }
                }
            }
        },
        "UserVerificationCodes_username_key": {
            defaultMessage: "Username already exists",
            defaultLogMessage: undefined,
            defaultStatus: 409,
            defaultLog: false,
            defaultErrorCode: undefined,
            functions: {
                signup: {
                    createTempUser: {}
                }
            }
        },
        "UserVerificationCodes_userEmail_key":{
            defaultMessage: "Email already associated with a user",
            defaultLogMessage: undefined,
            defaultStatus: 409,
            defaultLog: false,
            defaultErrorCode: undefined,
            functions: {
                signup: {
                    createTempUser: {}
                }
            }
        },
        default: {
            defaultMessage: "Some unexpected error occurred on the server",
            defaultLogMessage: "Some unexpected unique constraint error occurred",
            defaultStatus: 500,
            defaultLog: true,
            defaultErrorCode: undefined,
            functions: {
                // these will need fixed as error code is the same for both...
                reviewCreator: {
                    createReview:{
                        errorCode: 1102
                    },
                    updateReview:{
                        errorCode: 1102
                    }
                },
                profile: {
                    updateInfo: {
                        errorCode: 1004
                    },
                    removeProfilePicture: {
                        errorCode: 1007
                    },
                    updateImage: {
                        errorCode: 1011
                    }
                },
                signup: {
                    createTempUser: {
                        errorCode: 1300
                    }
                }
            }
        }
    },
    undefined: {
        defaultMessage: "Some unexpected error occurred",
        defaultLogMessage: undefined,
        defaultStatus: 500,
        defaultLog: true,
        defaultErrorCode: undefined,
        functions: {}
    }
}


function sequelizeErrorHandler(error, file, functionName) {
    let errorType;
    let errorKey;
    if(error.name.includes("ForeignKey"))
    {
        errorType = "ForeignKey";
        errorKey = error.original.constraint;
    }
    else if(error.name.includes("UniqueConstraint"))
    {
        errorType = "UniqueConstraint";
        errorKey = error.original.constraint;
    }
    else
    {
        errorType = "undefined";
    }

    // the high level type of error, ex. ForeignKey, UniqueConstraint, undefined
    let errorClass = ERRORS[errorType];
    let errorObj;
    if(errorType === "undefined")
    {
        errorObj = errorClass;
    }
    else
    {
        // the exact error, ex. users_email_key
        errorObj = errorClass[errorKey]
        if(errorObj === undefined)
        {
            errorObj = errorClass["undefined"]
        }
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

export {sequelizeErrorHandler};
