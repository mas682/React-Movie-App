
// these functions are reusable functions that deal with various user requests
// such as liking posts, adding a movie to a watch/ed list, etc.

const addMovieToWatchListResultsHandler = (status, message, requester) =>
{
    let movieNotFound = false;
    let showLoginPopUp = false;
    let state;
    if(status === 200)
    {
        state = {
            watchList: true
        };
    }
    else
    {
        alert(message);
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
            state = {};
        }
        else if(status === 404)
        {
            // movie not found
            movieNotFound = true;
            state = {};
        }
        else
        {
            // some unknown/unexpected error occurred
            state = {};
        }
    }
    return {
        state: state,
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
    if(status === 200)
    {
        state = {
            watchList: false
        };
        removeFromDisplay = (type === "My Watch List") ? true : false;
    }
    else
    {
        alert(message);
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
            state = {};
        }
        else if(status === 404)
        {
            // movie not found
            movieNotFound = true;
            state = {};
        }
        else
        {
            // some unknown/unexpected error occurred
            state = {};
        }
    }
    return {
        state: state,
        movieNotFound: movieNotFound,
        showLoginPopUp: showLoginPopUp,
        removeFromDiplay: removeFromDisplay
    };
}

const addMovieToWatchedListResultsHandler = (status, message, requester) =>
{
    let movieNotFound = false;
    let showLoginPopUp = false;
    let state;
    if(status === 200)
    {
        state = {
            watched: true,
            currentUser: requester
        };
    }
    else
    {
        alert(message);
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
            state = {};
        }
        else if(status === 404)
        {
            // movie not found
            movieNotFound = true;
            state = {};
        }
        else
        {
            // some unknown/unexpected error occurred
            state = {};
        }
    }
    return {
        state: state,
        movieNotFound: movieNotFound,
        showLoginPopUp: showLoginPopUp
    };
}

const removeWatchedListMovieResultsHandler = (status, message, requester, type) =>
{
    let movieNotFound = false;
    let showLoginPopUp = false;
    let removeFromDisplay = false;
    let state;
    if(status === 200)
    {
        state = {
            watched: false
        };
        removeFromDisplay = (type === "My Watched Movies") ? true : false;
    }
    else
    {
        alert(message);
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
            state = {};
        }
        else if(status === 404)
        {
            // movie not found
            movieNotFound = true;
            state = {};
        }
        else
        {
            // some unknown/unexpected error occurred
            state = {};
        }
    }
    return {
        state: state,
        movieNotFound: movieNotFound,
        showLoginPopUp: showLoginPopUp,
        removeFromDiplay: removeFromDisplay
    };
}

export {addMovieToWatchListResultsHandler, removeWatchListMovieResultsHandler, addMovieToWatchedListResultsHandler, removeWatchedListMovieResultsHandler};
