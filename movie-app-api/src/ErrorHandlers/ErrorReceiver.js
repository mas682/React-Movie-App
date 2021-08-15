
import {awsErrorHandler} from './AWSErrorHandler.js';
import {fileUploadErrorHandler} from './FileUploadErrorHandler.js';
import {multerErrorHandler} from './MulterErrorHandler.js';
import {sequelizeErrorHandler} from './SequelizeErrorHandler.js';
import {defaultErrorHandler} from './DefaultErrorHandler.js';

function getErrorHandler(error, file, functionName)
{
    let errorObject = JSON.parse(JSON.stringify(error));
    let errorType = errorObject.name;
    let errorKey = "";
    if(errorObject === undefined && errorType === undefined)
    {
        return defaultErrorHandler(errorObject, file, functionName);
    }
    else if(errorType !== undefined && errorType.includes("Sequelize"))
    {
        return sequelizeErrorHandler(errorObject, file, functionName);
    }
    else if(errorType !== undefined && errorType.includes("MulterError"))
    {
        return multerErrorHandler(errorObject, file, functionName);
    }
    else if(errorType !== undefined && errorType.includes("FileUploadError"))
    {
        return fileUploadErrorHandler(errorObject, file, functionName);
    }
    else if(errorType === undefined && file === "fileHandler" && functionName === "imageHandler")
    {
        // could be a AWS error in this case if no other error was found
        return awsErrorHandler(errorObject, file, functionName);
    }
    else
    {
        // default
        return defaultErrorHandler(errorObject, file, functionName);
    }
}

export {getErrorHandler}
