
import {awsErrorHandler} from './awsErrorHandler.js';
import {fileUploadErrorHandler} from './fileUploadErrorHandler.js';
import {multerErrorHandler} from './multerErrorHandler.js';
import {sequelizeErrorHandler} from './sequelizeErrorHandler.js';

function getErrorHandler(error, file, functionName)
{
    let errorObject = JSON.parse(JSON.stringify(error));
    let errorType = errorObject.name;
    let errorKey = "";
    if(errorObject === undefined && errorType === undefined)
    {
        // default
        return;
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
        errorKey = "default";
        return;
    }
}

export {getErrorHandler}
