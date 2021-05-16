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
                    log: true,
                    errorCodes: {
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
            logMessage: undefined,
            defaultStatus: 401,
            log: true,
            errorCodes: {
                reviewCreator: {
                    createReview: {

                    },
                    updateReview: {

                    }
                }
            }
        },
        "reviews_movieId_fkey":{
            defaultMessage:"Movie associated with the review does not exist",
            logMessage: undefined,
            defaultStatus: 404,
            log: true,
            errorCodes: {
                reviewCreator: {
                    createReview: {

                    },
                    updateReview: {

                    }
                }
            }
        },
        "comments_userId_fkey":{
            defaultMessage: "User could not be found",
            logMessage: undefined,
            defaultStatus: 401,
            log: false,
            errorCodes: {
                reviews: {
                    postComment: {
                        errorCode: undefined,
                        message: undefined,
                        logMessage: undefined,
                        log: undefined
                    }
                }
            }
        },
        "comments_reviewId_fkey":{
            defaultMessage: "The review could not be found",
            logMessage: undefined,
            defaultStatus: 404,
            log: false,
            errorCodes: {
                reviews: {
                    postComment: {
                        errorCode: undefined,
                        message: undefined,
                        logMessage: undefined,
                        log: undefined,
                        status: undefined
                    }
                }
            }
        },
        default: {
            defaultMessage: "Some unexpected error occurred on the server",
            logMessage: "Some unexpected foreign key constraint error occurred",
            defaultStatus: 500,
            log: true,
            errorCodes: {
                review: {
                    postComment: {
                        errorCode: 1203,
                        message: undefined,
                        logMessage: undefined,
                        log: true,
                        status: undefined
                    }
                },
                // the coes here will need fixed as they were groupded into 1 before
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
            logMessage: undefined,
            defaultStatus: 400,
            log: false,
            errorCodes: {
                reviewCreator: {
                    createReview: {},
                    updateReview: {}
                }
            }
        },
        "users_username_key": {
            defaultMessage: "Username is already in use",
            logMessage: undefined,
            defaultStatus: 409,
            log: false,
            errorCodes: {
                profile: {
                    updateInfo: {
                        errorCode: undefined,
                        message: undefined,
                        logMessage: undefined,
                        log: undefined
                    }
                }
            }
        },
        "users_email_key":{
            defaultMessage: "Email already associated with a user",
            logMessage: undefined,
            defaultStatus: 409,
            log: false,
            errorCodes: {
                profile: {
                    updateInfo: {
                        errorCode: undefined,
                        message: undefined,
                        logMessage: undefined,
                        log: undefined
                    }
                }
            }
        },
        "users_picture_key":{
            defaultMessage: "Some unexpected error occurred on the server",
            logMessage: undefined,
            defaultStatus: 500,
            log: true,
            errorCodes: {
                profile: {
                    updateImage: {
                        errorCode: 1010,
                        message: undefined,
                        logMessage: undefined,
                        log: true
                    }
                }
            }
        },
        "UserVerificationCodes_username_key": {
            defaultMessage: "Username already exists",
            logMessage: undefined,
            defaultStatus: 409,
            log: false,
            errorCodes: {
                signup: {
                    createTempUser: {
                        errorCode: undefined,
                        message: undefined,
                        logMessage: undefined,
                        log: undefined
                    }
                }
            }
        },
        "UserVerificationCodes_userEmail_key":{
            defaultMessage: "Email already associated with a user",
            logMessage: undefined,
            defaultStatus: 409,
            log: false,
            errorCodes: {
                signup: {
                    createTempUser: {
                        errorCode: undefined,
                        message: undefined,
                        logMessage: undefined,
                        log: undefined
                    }
                }
            }
        },
        default: {
            defaultMessage: "Some unexpected error occurred on the server",
            logMessage: "Some unexpected unique constraint error occurred",
            log: true,
            errorCodes: {
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
                        errorCode: 1004,
                        message: undefined,
                        logMessage: undefined,
                        log: true
                    },
                    removeProfilePicture: {
                        errorCode: 1007,
                        message: undefined,
                        logMessage: undefined,
                        log: true
                    },
                    updateImage: {
                        errorCode: 1011,
                        message: undefined,
                        logMessage: undefined,
                        log: true
                    }
                },
                signup: {
                    createTempUser: {
                        errorCode: 1300,
                        message: undefined,
                        logMessage: undefined,
                        log: true
                    }
                }
            }
        }
    },
    undefined: {
        defaultMessage: "Some unexpected constraint error occurred",
        defaultStatus: 500,
        log: true,
        errorCodes: {
            profile: {
                updateInfo: {
                    errorCode: 1600,
                    message: "",
                    output: false
                }
            },
            profile: {
                updateInfo: {
                    errorCode: 1600,
                    message: "",
                    output: true
                }
            },
            reviewCreator: {
                function: {

                }
            }
        }
    }
}


class SequelizeErrorHandler {
    constructor(error, file, location) {
        this.error = error;
        let code;
        if(error.name.contains("ConstraintError"))
        {
            code = error.original.constraint;
        }
        else
        {
            code = "undefined";
        }
        this.code = code;
    }
}
