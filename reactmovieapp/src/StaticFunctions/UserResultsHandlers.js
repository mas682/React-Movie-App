
// these functions are reusable functions that deal with various user requests
// such as liking posts, adding a movie to a watch/ed list, etc.

const addMovieToWatchListResultsHandler = (status, message, requester) =>
{
    let movieNotFound = false;
    let showLoginPopUp = false;
    let state = {};
    let messageState;
    if(status === 200)
    {
        state = {
            watchList: true
        };
        messageState = {
            messages: [{message: message, type: "success"}],
            clearMessages: false
        };
    }
    else
    {
        if(status === 401)
        {
            // not logged in
            showLoginPopUp = true;
            state = {
                watchList: false,
            };
        }
        else if(status === 400)
        {
            // request not understood as movie id in incorrect format
            messageState = {
                messages: [{message: message, type: "failure"}],
                clearMessages: false
            };
        }
        else if(status === 404)
        {
            // movie not found
            movieNotFound = true;
            messageState = {
                messages: [{message: message, type: "failure"}],
                clearMessages: false
            };
        }
        else
        {
            // some unknown/unexpected error occurred
            messageState = {
                messages: [{message: message, type: "failure"}],
                clearMessages: false
            };
        }
    }
    return {
        state: state,
        messageState: messageState,
        movieNotFound: movieNotFound,
        showLoginPopUp: showLoginPopUp
    };
}

const removeWatchListMovieResultsHandler = (status, message, requester, type) =>
{
    let movieNotFound = false;
    let showLoginPopUp = false;
    let removeFromDisplay = false;
    let state;
    let messageState;
    if(status === 200)
    {
        state = {
            watchList: false
        };
        removeFromDisplay = (type === "My Watch List") ? true : false;
        messageState = {
            messages: [{message: message, type: "success"}],
            clearMessages: false
        }
    }
    else
    {
        if(status === 401)
        {
            // not logged in
            showLoginPopUp = true;
            state = {
                watchList: false
            };
        }
        else if(status === 400)
        {
            // request not understood as movie id in incorrect format
            messageState = {
                messages: [{message: message, type: "failure"}],
                clearMessages: false
            };
        }
        else if(status === 404)
        {
            // movie not found
            movieNotFound = true;
            messageState = {
                messages: [{message: message, type: "failure"}],
                clearMessages: false
            };
        }
        else
        {
            // some unknown/unexpected error occurred
            messageState = {
                messages: [{message: message, type: "failure"}],
                clearMessages: false
            };
        }
    }
    return {
        state: state,
        messageState: messageState,
        movieNotFound: movieNotFound,
        showLoginPopUp: showLoginPopUp,
        removeFromDiplay: removeFromDisplay
    };
}

const addMovieToWatchedListResultsHandler = (status, message, requester) =>
{
    let movieNotFound = false;
    let showLoginPopUp = false;
    let state = {};
    let messageState;
    if(status === 200)
    {
        state = {
            watched: true,
            currentUser: requester
        };
        messageState = {
            messages: [{message: message, type: "success"}],
            clearMessages: false
        };
    }
    else
    {
        if(status === 401)
        {
            // not logged in
            showLoginPopUp = true;
            state = {
                watched: false
            };
        }
        else if(status === 400)
        {
            // request not understood as movie id in incorrect format
            messageState = {
                messages: [{message: message, type: "failure"}],
                clearMessages: false
            };
        }
        else if(status === 404)
        {
            // movie not found
            movieNotFound = true;
            messageState = {
                messages: [{message: message, type: "failure"}],
                clearMessages: false
            };
        }
        else
        {
            // some unknown/unexpected error occurred
            messageState = {
                messages: [{message: message, type: "failure"}],
                clearMessages: false
            };
        }
    }
    return {
        state: state,
        messageState: messageState,
        movieNotFound: movieNotFound,
        showLoginPopUp: showLoginPopUp
    };
}

const removeWatchedListMovieResultsHandler = (status, message, requester, type) =>
{
    let movieNotFound = false;
    let showLoginPopUp = false;
    let removeFromDisplay = false;
    let state = {};
    let messageState;
    if(status === 200)
    {
        state = {
            watched: false
        };
        removeFromDisplay = (type === "My Watched Movies") ? true : false;
        messageState = {
            messages: [{message: message, type: "success"}],
            clearMessages: false
        };
    }
    else
    {
        if(status === 401)
        {
            // not logged in
            showLoginPopUp = true;
            state = {
                watched: false
            };
        }
        else if(status === 400)
        {
            // request not understood as movie id in incorrect format
            messageState = {
                messages: [{message: message, type: "failure"}],
                clearMessages: false
            };
        }
        else if(status === 404)
        {
            // movie not found
            movieNotFound = true;
            messageState = {
                messages: [{message: message, type: "failure"}],
                clearMessages: false
            };
        }
        else
        {
            // some unknown/unexpected error occurred
            messageState = {
                messages: [{message: message, type: "failure"}],
                clearMessages: false
            };
        }
    }
    return {
        state: state,
        messageState: messageState,
        movieNotFound: movieNotFound,
        showLoginPopUp: showLoginPopUp,
        removeFromDiplay: removeFromDisplay
    };
}

export {addMovieToWatchListResultsHandler, removeWatchListMovieResultsHandler, addMovieToWatchedListResultsHandler, removeWatchedListMovieResultsHandler};
