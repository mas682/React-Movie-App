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
        "UserAuthenticationAttempts_userId_fkey":
        {
            defaultMessage: "Some unexpected error occurred on the server",
            defaultLogMessage: "Could not find a user id record with the given id value",
            defaultStatus: 500,
            defaultLog: true,
            defaultErrorCode: 11050,
            functions: {
                signup: {
                    createTempUser: {
                        errorCode: 11051,
                        logMessage: "Could not create a UserAuthenticationAttempsRecord due to the user id provided not existing"
                    }
                }
            }
        },
        default: {
            defaultMessage: "Some unexpected error occurred on the server",
            defaultLogMessage: "Some unexpected foreign key constraint error occurred",
            defaultStatus: 500,
            defaultLog: true,
            defaultErrorCode: 11000,
            functions: {
                review: {
                    postComment: {
                        errorCode: 11001
                    }
                },
                // the codes here will need fixed as they were groupded into 1 before
                reviewCreator: {
                    createReview: {
                        errorCode: 11002
                    },
                    updateReview: {
                        errorCode: 11003
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
                },
                signup: {
                    createTempUser: {}
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
                },
                signup: {
                    createTempUser: {}
                }
            }
        },
        "UserCredentials_salt_key":{
            defaultMessage: "Some unexpected error occurred on the server",
            defaultLogMessage: "The salt to encrypt a temp users password was already in use",
            defaultStatus: 500,
            defaultLog: true,
            defaultErrorCode: 10050,
            functions: {
                signup: {
                    createTempUser: {
                        errorCode: 10051,
                        logMessage: "Could not generate a unique salt to encrypt a temp users password"
                    }
                }
            }
        },
        "TempVerificationCodes_userId_key":{
            defaultMessage: "Some unexpected error occurred on the server",
            defaultLogMessage: "The temp user already has a temp verification code record",
            defaultStatus: 500,
            defaultLog: true,
            defaultErrorCode: 10100,
            functions: {
                signup: {
                    resendVerificationCode: {
                        errorCode: 10101
                    }
                }
            }
        },
        "TempVerificationCodes_salt_key":{
            defaultMessage: "Some unexpected error occurred on the server",
            defaultLogMessage: "The salt to encrypt a verification code was already in use",
            defaultStatus: 500,
            defaultLog: true,
            defaultErrorCode: 10150,
            functions: {
                signup: {
                    createTempUser: {
                        errorCode: 10151,
                        logMessage: "Could not generate a unique salt to encrypt a temp users verification code"
                    }, 
                    resendVerificationCode: {
                        errorCode: 10152,
                        logMessage: "Could not generate a unique salt to encrypt a temp users verification code"
                    }
                },
                login: {
                    forgotPassword: {
                        errorCode: 10153,
                        logMessage: "Could not generate a unique salt to encrypt a users verification code",
                        message: "User verification code could not be generated, please try again"
                    }
                }
            }
        },
        default: {
            defaultMessage: "Some unexpected error occurred on the server",
            defaultLogMessage: "Some unexpected unique constraint error occurred",
            defaultStatus: 500,
            defaultLog: true,
            defaultErrorCode: 10000,
            functions: {
                // these will need fixed as error code is the same for both...
                reviewCreator: {
                    createReview:{
                        errorCode: 10001
                    },
                    updateReview:{
                        errorCode: 10002
                    }
                },
                profile: {
                    updateInfo: {
                        errorCode: 10003
                    },
                    removeProfilePicture: {
                        errorCode: 10004
                    },
                    updateImage: {
                        errorCode: 10005
                    }
                },
                signup: {
                    createTempUser: {
                        errorCode: 10006
                    }
                }
            }
        }
    },
    default: {
        defaultMessage: "Some unexpected error occurred",
        defaultLogMessage: undefined,
        defaultStatus: 500,
        defaultLog: true,
        defaultErrorCode: 12000,
        functions: {
            login:{
                forgotPassword:{
                    errorCode: 12002,
                    "900":{
                        errorCode: 900
                    }
                }
            },
            profile: {
                updateInfo: {
                    errorCode: 12001
                },
                removeProfilePicture: {},
                updateImage: {}
            },
        }
    }
}


function sequelizeErrorHandler(error, file, functionName, secondaryCode) {
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
        errorType = "default";
    }

    // the high level type of error, ex. ForeignKey, UniqueConstraint, undefined
    let errorClass = ERRORS[errorType];
    let errorObj;
    if(errorType === "default")
    {
        errorObj = errorClass;
    }
    else
    {
        // the exact error, ex. users_email_key
        errorObj = errorClass[errorKey];
        if(errorObj === undefined)
        {
            errorObj = errorClass["default"]
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
    if(functionObj === undefined || Object.keys(functionObj).length < 0)
    {
        return getOutput(errorObj, undefined, errorType, error, secondaryCode);
    }
    else
    {
        return getOutput(errorObj, functionObj, errorType, error, secondaryCode);
    }

}

// used for unique constraints and foreignkey constraints to reduce data being logged
function getSanitizedOutput(error)
{
    let errors = [];
    if(error.errors !== undefined)
    {
        for(let e of error.errors)
        {
            let errObj = {
                message: e.message
            }
            errors.push(errObj);
        }
    }
    return {
        name: error.message.name,
        message: {
            errors: errors,
            fields: error.fields,
            code: error.original.code,
            column: error.original.column,
            constraint: error.original.constraint,
            detail: error.original.detail,
            schema: error.original.schema,
            table: error.original.table
        },
        stack: error.stack
    };
}

// if either the function the error occurred in is not defined or
// the function is defined but has no properties
function getOutput(errorObj, functionObj, errorType, error, secondaryCode)
{
    let output = {
        message: "",
        status: undefined,
        log: undefined,
        logMessage: "",
        errorCode: undefined,
        secondaryCode: undefined,
        error: undefined
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

    let errorOutput = undefined;
    if(log)
    {
        // if the object is a foreignkey or UniqueConstraint, sanitize the output
        if(errorType === "ForeignKey" || errorType === "UniqueConstraint")
        {
            errorOutput = getSanitizedOutput(error);
        }
        else if(error.message.original !== undefined)
        {
            errorOutput = {message: error.message.original, stack: error.stack, name:error.message.name};
        }
        else
        {
            errorOutput = error;
        }
    }

    output.status = status;
    output.log = log;
    output.logMessage = logMessage;
    output.message = message;
    output.errorCode = errorCode;
    output.error = errorOutput;
    output.secondaryCode = secondaryCode;

    return output;
}

export {sequelizeErrorHandler, getSanitizedOutput};
