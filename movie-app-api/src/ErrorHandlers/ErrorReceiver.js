
import {sequelizeErrorHandler} from './SequelizeErrorHandler.js';
import {defaultErrorHandler} from './DefaultErrorHandler.js';

function getErrorHandler(error, file, functionName, secondaryCode)
{
    let errorObject = JSON.parse(JSON.stringify(error));
    errorObject = (Object.keys(errorObject).length < 1) ? ({name: error.name, message: error.message, stack: error.stack}) : 
        ({name: error.name, message: errorObject, stack: error.stack});
    let errorType = errorObject.name;
    if(errorType !== undefined && errorType.includes("Sequelize"))
    {
        return sequelizeErrorHandler(errorObject, file, functionName, secondaryCode);
    }
    else
    {
        // default
        return defaultErrorHandler(errorObject, file, functionName, secondaryCode);
    }
}

export {getErrorHandler}
