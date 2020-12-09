import {verifyLogin, validateIntegerParameter, validateUsernameParameter} from './globals.js';
import models, { sequelize } from '../src/models';
const Op = require('Sequelize').Op;


// function to get movies and return them to the client
const movieHandler = (req, res, next) => {
		// get the signed cookies in the request if there are any
		let cookie = req.signedCookies.MovieAppCookie;
		// variable to indicate if user logged in
		let valid = false;
		// if there is a signed cookie in the request
		if(cookie !== undefined)
		{
				// see if the cookie has a valid user
				verifyLogin(cookie).then((cookieValid) =>
				{
						// get the reviews and pass the cookie
						selectPath(JSON.parse(cookie), req, res, cookieValid);
				});
		}
		// if no cookie was found
		else
		{
				// pass that cookie was not valid
				selectPath(undefined, req, res, false);
		}
};

const selectPath = (cookie, req, res, cookieValid) =>
{
    if(req.params.type === "get_movie_titles" && cookieValid)
    {
        getMovieTitles(cookie, req, res, cookieValid);
    }
	else if(req.params.id !== undefined)
	{
		getMovieInfo(cookie, req, res, cookieValid);
	}
	else if(req.params.type === "my_watch_list" && cookieValid)
	{
		getWatchList(cookie, req, res);
	}
	else if(req.params.type === "my_watched_list" && cookieValid)
	{
		getWatchedList(cookie, req, res);
	}
	else if(req.params.type === "add_to_watchlist")
	{
		if(cookieValid)
		{
			console.log(cookieValid);
			addToWatchList(cookie, req, res);
		}
		else
		{
			res.status(401).send({
				message: "No cookie or cookie invalid",
				requester: ""
			});
		}
	}
	else if(req.params.type === "remove_from_watchlist")
	{
		if(cookieValid)
		{
			removeFromWatchList(cookie, req, res);
		}
		else
		{
			res.status(401).send({
				message: "No cookie or cookie invalid",
				requester: ""
			});
		}
	}
	else if(req.params.type === "add_to_watched")
	{
		if(cookieValid)
		{
			addToWatched(cookie, req, res);
		}
		else
		{
			res.status(401).send({
				message: "No cookie or cookie invalid",
				requester: ""
			});
		}
	}
	else if(req.params.type === "remove_from_watched")
	{
		if(cookieValid)
		{
			removeFromWatched(cookie, req, res);
		}
		else
		{
			res.status(401).send({
				message: "No cookie or cookie invalid",
				requester: ""
			});
		}
	}
	else if((req.params.type === "my_watched_list" || req.params.type === "my_watch_list") && !cookieValid)
	{
		res.status(401).send({
			message: "No cookie or cookie invalid",
			requester: ""
		});
	}
    // some unknow path given
    else
    {
        console.log(req.params);
		let requester = cookieValid ? cookie.name : "";
        res.status(404).send({
			message: "Request not understood",
			requester: requester
		});
    }
};

// this function will return the movie titles for the review form
// that the user will select from based off of their input
// limits the number returned to 10
const getMovieTitles = async (cookie, req, res, cookieValid) =>
{
		let value = req.query.title;
		console.log("Value: " + value);
		// find the movies containing the value
		let movies = await models.Movies.findByTitle(models, value, 10);
		if(movies === undefined)
		{
				res.status(404).send("Unable to find any movies matching that value");
		}
		else
		{
				if(movies.length < 1)
				{
						res.status(404).send("Unable to find any movies matching that value");
				}
				else
				{
					console.log(movies);
					res.status(200).send({Movies: movies});
				}
		}
};

const getMovieInfo = async(cookie, req, res, cookieValid) =>
{
		let username = (cookieValid) ? cookie.name : "";
		let movieId = req.params.id;
		let valid = validateIntegerParameter(res, movieId, username, "The movie ID is invalid");
		if(!valid) return;
		let movie;
		if(cookieValid)
		{
			movie = await models.Movies.getMovieInfo(movieId, models, cookie.name);
		}
		else
		{
			movie = await models.Movies.getMovieInfo(movieId, models, undefined);
		}
		if(movie === null)
		{
			res.status(404).send({
				message: "Unable to find the information for the requested movie",
				requester:  username
			});
		}
		else
		{
			res.status(200).send({
				message: "Movie info successfully found",
				requester: username,
				movie: movie
			});
		}

};

const getWatchList = async(cookie, req, res) =>
{
	let username = cookie.name;
	// may need an await here..
	let movies = await models.User.getWatchList(cookie.id, models);
	console.log(movies);
	if(movies === null)
	{
		res.status(404).send({
			message: "The user could not be found",
			requester: username});
	}
	else
	{
		res.status(200).send({
			message: "Users watch list successfully found",
			requester: username,
			movies: movies
		});
	}
};

const getWatchedList = async(cookie, req, res) =>
{
	let username = cookie.name;
	let movies = await models.User.getWatchedList(cookie.id, models);
	if(movies === null)
	{
		res.status(404).send({
			message: "The user could not be found",
			requester: username});
	}
	else
	{
		res.status(200).send({
			message: "Users watched list successfully found",
			requester: username,
			movies: movies
		});
	}
};

const addToWatchList = async (cookie, req, res) =>
{
    let username = cookie.name;
    let movieId = req.body.movieId;
    let valid = validateIntegerParameter(res, movieId, username, "The movie ID is invalid");
    if(!valid) return;
    // get the movie along with the user if they alraedy have it on their watch list
    let movie = await models.Movies.getMovieWithUserWatchList(movieId, cookie.id, models);
    if(movie === null || movie === undefined)
    {
        res.status(404).send({
            message: "Could not find the movie to add to the users watch list",
            requester: username
        });
        return;
    }
    if(movie.dataValues.UserWatchLists.length < 1)
    {
        //let result = await user.addWatchList(movie.id);
        let result = await movie.addUserWatchLists(cookie.id);
        if(result === undefined)
        {
            // if undefined, usually means the association already exists..
            res.status(500).send({
                message: "A error occurred trying to add the movie to the users watch list",
                requester: username
            });
        }
        else
        {
            res.status(200).send({
                message: "Movie added to watch list",
                requester: username
            });
        }
    }
    else
    {
        res.status(400).send({
            message: "The movie is already on the users watch list",
            requester: username
        });
    }
};

const removeFromWatchList = async (cookie, req, res) =>
{
    let username = cookie.name;
    let movieId = req.body.movieId;
    let valid = validateIntegerParameter(res, movieId, username, "The movie ID is invalid");
    if(!valid) return;
    // get the movie along with the user if they alraedy have it on their watch list
    let movie = await models.Movies.getMovieWithUserWatchList(movieId, cookie.id, models);
    if(movie === null || movie === undefined)
    {
        res.status(404).send({
            message: "Could not find the movie to remove the movie from the users watch list",
            requester: username
        });
        return;
    }
    if(movie.dataValues.UserWatchLists.length > 0)
    {
        //let result = await user.addWatchList(movie.id);
        let result = await movie.removeUserWatchLists(cookie.id);
        if(result === undefined)
        {
            // if undefined, usually means the association already exists..
            res.status(500).send({
                message: "A error occurred trying to remove the movie from the users watch list",
                requester: username
            });
        }
        else
        {
            res.status(200).send({
                message: "Movie removed from watch list",
                requester: username
            });
        }
    }
    else
    {
        res.status(400).send({
            message: "The movie is already not on the users watch list",
            requester: username
        });
    }
};


const addToWatched = async (cookie, req, res) =>
{
    let username = cookie.name;
    let movieId = req.body.movieId;
    let valid = validateIntegerParameter(res, movieId, username, "The movie ID is invalid");
    if(!valid) return;
    // get the movie along with the user if they alraedy have it on their watch list
    let movie = await models.Movies.getMovieWtithUserWatched(movieId, cookie.id, models);
    if(movie === null || movie === undefined)
    {
        res.status(404).send({
            message: "Could not find the movie to add to the users watched list",
            requester: username
        });
        return;
    }
    if(movie.dataValues.UsersWhoWatched.length < 1)
    {
        //let result = await user.addWatchList(movie.id);
        let result = await movie.addUsersWhoWatched(cookie.id);
        if(result === undefined)
        {
            // if undefined, usually means the association already exists..
            res.status(500).send({
                message: "A error occurred trying to add the movie to the users watched list",
                requester: username
            });
        }
        else
        {
            res.status(200).send({
                message: "Movie added to watched list",
                requester: username
            });
        }
    }
    else
    {
        res.status(400).send({
            message: "The movie is already on the users watched list",
            requester: username
        });
    }
};

const removeFromWatched = async (cookie, req, res) =>
{
    let username = cookie.name;
    let movieId = req.body.movieId;
    let valid = validateIntegerParameter(res, movieId, username, "The movie ID is invalid");
    if(!valid) return;
    // get the movie along with the user if they alraedy have it on their watch list
    let movie = await models.Movies.getMovieWtithUserWatched(movieId, cookie.id, models);
    if(movie === null || movie === undefined)
    {
        res.status(404).send({
            message: "Could not find the movie to remove from the users watched list",
            requester: username
        });
        return;
    }
    if(movie.dataValues.UsersWhoWatched.length > 0)
    {
        //let result = await user.addWatchList(movie.id);
        let result = await movie.removeUsersWhoWatched(cookie.id);
        if(result === undefined)
        {
            // if undefined, usually means the association already exists..
            res.status(500).send({
                message: "A error occurred trying to remove the movie to the users watched list",
                requester: username
            });
        }
        else
        {
            res.status(200).send({
                message: "Movie removed from watched list",
                requester: username
            });
        }
    }
    else
    {
        res.status(400).send({
            message: "The movie is already not on the users watched list",
            requester: username
        });
    }
};


export {movieHandler};
