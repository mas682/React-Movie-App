import {validateIntegerParameter, validateUsernameParameter, validateStringParameter} from './globals.js';
import models, { sequelize } from '../src/models';
const Op = require('Sequelize').Op;

// function to get movies and return them to the client
const movieHandler = (req, res, next) => {
	let requester = (req.session.user === undefined) ? "" : req.session.user;
	// set which file the request is for
	res.locals.file = "movies";
	selectPath(requester, req, res, next);
};

const selectPath = (requester, req, res, next) =>
{
	res.locals.function = "selectPath";
	let routeFound = false;
	let foundNoCookie = false;
	let cookieValid = (requester === "") ? false : true;
	if(req.method === "GET")
	{
		if(req.params.type === "get_movie_titles")
		{
			getMovieTitles(requester, req, res)
			.catch((err) => {next(err)});
			routeFound = true;
		}
		else if(req.params.type === "get_movie_tags")
		{
			getMovieTagSuggestions(requester, req, res)
			.catch((err) => {next(err)});
			routeFound = true;
		}
		else if(req.params.id !== undefined)
		{
			getMovieInfo(requester, req, res)
			.catch((err) => {next(err)});
			routeFound = true;
		}
		else if(req.params.type === "my_watch_list")
		{
			routeFound = true;
			if(cookieValid)
			{
				getWatchList(requester, req, res)
				.catch((err) => {next(err)});
			}
			else
			{
				foundNoCookie = true;
			}
		}
		else if(req.params.type === "my_watched_list")
		{
			routeFound = true;
			if(cookieValid)
			{
				getWatchedList(requester, req, res)
				.catch((err) => {next(err)});
			}
			else
			{
				foundNoCookie = true;
			}
		}
		else if(req.params.type === "featured")
		{
			routeFound = true;
			getFeaturedMovies(requester, req, res)
			.catch((err) => {next(err)});
		}
	}
	else if(req.method === "POST")
	{
		if(req.params.type === "add_to_watchlist")
		{
			routeFound = true;
			if(cookieValid)
			{
				addToWatchList(requester, req, res)
				.catch((err) => {next(err)});
			}
			else
			{
				foundNoCookie = true;
			}
		}
		else if(req.params.type === "remove_from_watchlist")
		{
			routeFound = true;
			if(cookieValid)
			{
				removeFromWatchList(requester, req, res)
				.catch((err) => {next(err)});
			}
			else
			{
				foundNoCookie = true;
			}
		}
		else if(req.params.type === "add_to_watched")
		{
			routeFound = true;
			if(cookieValid)
			{
				addToWatched(requester, req, res)
				.catch((err) => {next(err)});
			}
			else
			{
				foundNoCookie = true;
			}
		}
		else if(req.params.type === "remove_from_watched")
		{
			routeFound = true;
			if(cookieValid)
			{
				removeFromWatched(requester, req, res)
				.catch((err) => {next(err)});
			}
			else
			{
				foundNoCookie = true;
			}
		}
	}
	// if the route did not match any of the above
	if(!routeFound)
	{
		res.status(404).send({
			message:"The movie path sent to the server does not exist",
			requester: requester
		});
	}
	// if the route was found but cookie not found or invalid
	else if(foundNoCookie)
	{
		res.status(401).send({
			message:"You are not logged in",
			requester: requester
		});
	}
};

// this function will return the movie titles for the review form
// that the user will select from based off of their input
// limits the number returned to 10
const getMovieTitles = async (requester, req, res) =>
{
	res.locals.function = "getMovieTitles";
	let value = req.query.title;
	// find the movies containing the value
	let movies = await models.Movies.findByTitle(value, 10);
	if(movies === undefined)
	{
		res.status(404).send({
			message: "Unable to find any movies matching that value",
			requester: requester
		});
	}
	else
	{
		if(movies.length < 1)
		{
			res.status(404).send({
				message: "Unable to find any movies matching that value",
				requester: requester
			});
		}
		else
		{
			res.status(200).send({
				message: "Movies successfully found",
				requester: requester,
				movies: movies
			});
		}
	}
};

// this function will return a list of tag suggestions based off the value passed in
const getMovieTagSuggestions = async (requester, req, res) =>
{
	res.locals.function = "getMovieTagSuggestions";
	let value = req.query.tag;
	// limit tag length to 20 characters
	let valid = validateStringParameter(res, value, 1, 20, requester, "The tag to search for is invalid");
	if(!valid) return;
	// going to need a tag table
	// then add tags to good/bad table like the likes table
	let tags = await models.MovieTag.findByValue(models, value, 10);
	if(tags === undefined)
	{
		res.status(404).send({
			message: "Unable to find any tags matching that value",
			requester: requester
		});
	}
	else
	{
		// not sure if this will be needed?
		if(tags.length < 1)
		{
			res.status(404).send({
				message: "Unable to find any tags matching that value",
				requester: requester
			});
		}
		else
		{
			console.log(tags);
			res.status(200).send({
				message: "Tags successfully found",
				requester: requester,
				tags: tags
			});
		}
	}
};

const getMovieInfo = async(requester, req, res) =>
{
	res.locals.function = "getMovieInfo";
	let movieId = req.params.id;
	let valid = validateIntegerParameter(res, movieId, requester, "The movie ID is invalid");
	if(!valid) return;
	let movie;
	if(requester !== "")
	{
		movie = await models.Movies.getMovieInfo(movieId, models, requester);
	}
	else
	{
		movie = await models.Movies.getMovieInfo(movieId, models, undefined);
	}
	if(movie === null)
	{
		res.status(404).send({
			message: "Unable to find the information for the requested movie",
			requester:  requester
		});
	}
	else
	{
		res.status(200).send({
			message: "Movie info successfully found",
			requester: requester,
			movie: movie
		});
	}

};

const getWatchList = async(requester, req, res) =>
{
	res.locals.function = "getWatchList";
	let max = (req.query.max === undefined) ? 50 : req.query.max;
	let offset = (req.query.offset === undefined) ? 0 : req.query.offset;
	let valid = validateIntegerParameter(res, max, requester, "The maximum number of movies to return is invalid");
	if(!valid) return;
	valid = validateIntegerParameter(res, offset, requester, "The offset for the movies to return is invalid", 0, undefined);
	if(!valid) return;
	max = (max > 50) ? 50 : max;
	// returns an empty array if no movies found that are associted with the user even if the userId doesn't exist
	let movies = await models.User.getWatchList(req.session.userId, models, max, offset);
	res.status(200).send({
		message: "Users watch list successfully found",
		requester: requester,
		movies: movies
	});
};

const getWatchedList = async(requester, req, res) =>
{
	res.locals.function = "getWatchedList";
	let max = (req.query.max === undefined) ? 50 : req.query.max;
	let offset = (req.query.offset === undefined) ? 0 : req.query.offset;
	let valid = validateIntegerParameter(res, max, requester, "The maximum number of movies to return is invalid");
	if(!valid) return;
	valid = validateIntegerParameter(res, offset, requester, "The offset for the movies to return is invalid", 0, undefined);
	if(!valid) return;
	max = (max > 50) ? 50 : max;
	let movies = await models.User.getWatchedList(req.session.userId, models, max, offset);
	// returns an empty array if no movies found that are associated with the user even if the userid doesn't exist
	res.status(200).send({
		message: "Users watched list successfully found",
		requester: requester,
		movies: movies
	});
};

const addToWatchList = async (requester, req, res) =>
{
	res.locals.function = "addToWatchList";
    let movieId = req.body.movieId;
    let valid = validateIntegerParameter(res, movieId, requester, "The movie ID is invalid");
    if(!valid) return;
    // get the movie along with the user if they alraedy have it on their watch list
    let movie = await models.Movies.getMovieWithUserWatchList(movieId, req.session.userId, models);
    if(movie === null || movie === undefined)
    {
        res.status(404).send({
            message: "Could not find the movie to add to the users watch list",
            requester: requester
        });
        return;
    }
    if(movie.dataValues.UserWatchLists.length < 1)
    {
        //let result = await user.addWatchList(movie.id);
        let result = await movie.addUserWatchLists(req.session.userId);
        if(result === undefined)
        {
			let message = "A error occurred trying to add the movie to the users watch list.  Error code: 1500";
			let logMessage = "(Error code: 1500) A error occurred trying to add the movie to the users watch list."
			console.log(logMessage);
            // if undefined, usually means the association already exists..
            res.status(500).send({
                message: message,
                requester: requester
            });
        }
        else
        {
            res.status(200).send({
                message: "Movie added to watch list",
                requester: requester
            });
        }
    }
    else
    {
        res.status(400).send({
            message: "The movie is already on the users watch list",
            requester: requester
        });
    }
};

const removeFromWatchList = async (requester, req, res) =>
{
	res.locals.function = "removeFromWatchList";
    let movieId = req.body.movieId;
    let valid = validateIntegerParameter(res, movieId, requester, "The movie ID is invalid");
    if(!valid) return;
    // get the movie along with the user if they alraedy have it on their watch list
    let movie = await models.Movies.getMovieWithUserWatchList(movieId, req.session.userId, models);
    if(movie === null || movie === undefined)
    {
        res.status(404).send({
            message: "Could not find the movie to remove the movie from the users watch list",
            requester: requester
        });
        return;
    }
    if(movie.dataValues.UserWatchLists.length > 0)
    {
        //let result = await user.addWatchList(movie.id);
        let result = await movie.removeUserWatchLists(req.session.userId);
        if(result === undefined)
        {
			let message = "A error occurred trying to remove the movie from the users watch list.  Error code: 1501"
            // if undefined, usually means the association already exists..
            res.status(500).send({
                message: message,
                requester: requester
            });
        }
        else
        {
            res.status(200).send({
                message: "Movie removed from watch list",
                requester: requester
            });
        }
    }
    else
    {
        res.status(400).send({
            message: "The movie is already not on the users watch list",
            requester: requester
        });
    }
};


const addToWatched = async (requester, req, res) =>
{
	res.locals.function = "addToWatched";
    let movieId = req.body.movieId;
    let valid = validateIntegerParameter(res, movieId, requester, "The movie ID is invalid");
    if(!valid) return;
    // get the movie along with the user if they alraedy have it on their watch list
    let movie = await models.Movies.getMovieWtithUserWatched(movieId, req.session.userId, models);
    if(movie === null || movie === undefined)
    {
        res.status(404).send({
            message: "Could not find the movie to add to the users watched list",
            requester: requester
        });
        return;
    }
    if(movie.dataValues.UsersWhoWatched.length < 1)
    {
        //let result = await user.addWatchList(movie.id);
        let result = await movie.addUsersWhoWatched(req.session.userId);
        if(result === undefined)
        {
			let message = "A error occurred trying to add the movie to the users watched list.  Error code: 1502"
			let logMessage = "(Error code: 1502) A error occurred trying to add the movie to the users watched list."
			console.log(logMessage);
            // if undefined, usually means the association already exists..
            res.status(500).send({
                message: message,
                requester: requester
            });
        }
        else
        {
            res.status(200).send({
                message: "Movie added to watched list",
                requester: requester
            });
        }
    }
    else
    {
        res.status(400).send({
            message: "The movie is already on the users watched list",
            requester: requester
        });
    }
};

const removeFromWatched = async (requester, req, res) =>
{
	res.locals.function = "removeFromWatched";
    let movieId = req.body.movieId;
    let valid = validateIntegerParameter(res, movieId, requester, "The movie ID is invalid");
    if(!valid) return;
    // get the movie along with the user if they alraedy have it on their watch list
    let movie = await models.Movies.getMovieWtithUserWatched(movieId, req.session.userId, models);
    if(movie === null || movie === undefined)
    {
        res.status(404).send({
            message: "Could not find the movie to remove from the users watched list",
            requester: requester
        });
        return;
    }
    if(movie.dataValues.UsersWhoWatched.length > 0)
    {
        //let result = await user.addWatchList(movie.id);
        let result = await movie.removeUsersWhoWatched(req.session.userId);
        if(result === undefined)
        {
			let message = "A error occurred trying to remove the movie from the users watched list.  Error code: 1503"
			let logMessage = "(Error code: 1503) A error occurred trying to remove the movie from the users watched list."
			console.log(logMessage);
            // if undefined, usually means the association already exists..
            res.status(500).send({
                message: message,
                requester: requester
            });
        }
        else
        {
            res.status(200).send({
                message: "Movie removed from watched list",
                requester: requester
            });
        }
    }
    else
    {
        res.status(400).send({
            message: "The movie is already not on the users watched list",
            requester: requester
        });
    }
};

const getFeaturedMovies = async(requester, req, res) =>
{
	res.locals.function = "getFeaturedMovies";
	let movies = await models.FeaturedMovies.getMovies(models);
	// returns an empty array if no movies found that are associated with the user even if the userid doesn't exist
	res.status(200).send({
		message: "Featured movies successfully found",
		requester: requester,
		movies: movies
	});
};


export {movieHandler};
