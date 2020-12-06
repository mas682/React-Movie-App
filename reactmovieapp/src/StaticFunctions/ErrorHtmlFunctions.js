import React from 'react';
import errorStyle from '../css/ErrorPage/errorpage.module.css';

// function to generate the html for a error message
const getErrorDisplay = (message) =>
{
    return(
         <div className={errorStyle.mainBodyContainer}>
            <div className={errorStyle.header}>
                Oops! Bad request!
            </div>
            <div className={errorStyle.errorMessage}>
                {message}
            </div>
        </div>
    );
};

export {getErrorDisplay};
