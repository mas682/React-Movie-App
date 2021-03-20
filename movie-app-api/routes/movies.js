import {verifyLogin, validateIntegerParameter, validateUsernameParameter, validateStringParameter} from './globals.js';
import models, { sequelize } from '../src/models';
const Op = require('Sequelize').Op;


// function to get movies and return them to the client
const movieHandler = (req, res, next) => {
		// get the signed cookies in the request if there are any
		let cookie = req.signedCookies.MovieAppCookie;
		cookie = (cookie === false) ? undefined : cookie;
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
	let routeFound = false;
	let foundNoCookie = false;
	if(req.method === "GET")
	{
		if(req.params.type === "get_movie_titles")
		{
			getMovieTitles(cookie, req, res, cookieValid);
			routeFound = true;
		}
		else if(req.params.type === "get_movie_tags")
		{
			getMovieTagSuggestions(cookie, req, res, cookieValid);
			routeFound = true;
		}
		else if(req.params.id !== undefined)
		{
			getMovieInfo(cookie, req, res, cookieValid);
			routeFound = true;
		}
		else if(req.params.type === "my_watch_list")
		{
			routeFound = true;
			if(cookieValid)
			{
				getWatchList(cookie, req, res);
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
				getWatchedList(cookie, req, res);
			}
			else
			{
				foundNoCookie = true;
			}
		}
		else if(req.params.type === "featured")
		{
			routeFound = true;
			getFeaturedMovies(cookie, req, res, cookieValid);
		}
	}
	else if(req.method === "POST")
	{
		if(req.params.type === "add_to_watchlist")
		{
			routeFound = true;
			if(cookieValid)
			{
				addToWatchList(cookie, req, res);
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
				removeFromWatchList(cookie, req, res);
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
				addToWatched(cookie, req, res);
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
				removeFromWatched(cookie, req, res);
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
		let requester = cookieValid ? cookie.name : "";
		res.status(404).send({
			message:"The movie path sent to the server does not exist",
			requester: requester
		});
	}
	// if the route was found but cookie not found or invalid
	else if(foundNoCookie)
	{
		let requester = cookieValid ? cookie.name : "";
		res.status(401).send({
			message:"You are not logged in",
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
	let requester = (cookieValid) ? cookie.name : "";
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
			console.log(movies);
			res.status(200).send({
				message: "Movies successfully found",
				requester: requester,
				movies: movies
			});
		}
	}
};

// this function will return a list of tag suggestions based off the value passed in
const getMovieTagSuggestions = async (cookie, req, res, cookieValid) =>
{
	let value = req.query.tag;
	let requester = (cookieValid) ? cookie.name : "";
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
		console.log(tags);
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
			res.status(200).send({
				message: "Tags successfully found",
				requester: requester,
				tags: tags
			});
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
	let max = (req.query.max === undefined) ? 50 : req.query.max;
	let offset = (req.query.offset === undefined) ? 0 : req.query.offset;
	let valid = validateIntegerParameter(res, max, username, "The maximum number of movies to return is invalid");
	if(!valid) return;
	valid = validateIntegerParameter(res, offset, username, "The offset for the movies to return is invalid", 0, undefined);
	if(!valid) return;
	max = (max > 50) ? 50 : max;
	// returns an empty array if no movies found that are associted with the user even if the userId doesn't exist
	let movies = await models.User.getWatchList(cookie.id, models, max, offset);
	res.status(200).send({
		message: "Users watch list successfully found",
		requester: username,
		movies: movies
	});
};

const getWatchedList = async(cookie, req, res) =>
{
	let username = cookie.name;
	let max = (req.query.max === undefined) ? 50 : req.query.max;
	let offset = (req.query.offset === undefined) ? 0 : req.query.offset;
	let valid = validateIntegerParameter(res, max, username, "The maximum number of movies to return is invalid");
	if(!valid) return;
	valid = validateIntegerParameter(res, offset, username, "The offset for the movies to return is invalid", 0, undefined);
	if(!valid) return;
	max = (max > 50) ? 50 : max;
	let movies = await models.User.getWatchedList(cookie.id, models, max, offset);
	// returns an empty array if no movies found that are associated with the user even if the userid doesn't exist
	res.status(200).send({
		message: "Users watched list successfully found",
		requester: username,
		movies: movies
	});
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

const getFeaturedMovies = async(cookie, req, res, cookieValid) =>
{
	let username = (cookieValid) ? cookie.name : "";
	let movies = await models.FeaturedMovies.getMovies(models);
	// returns an empty array if no movies found that are associated with the user even if the userid doesn't exist
	res.status(200).send({
		message: "Featured movies successfully found",
		requester: username,
		movies: movies
	});
};


export {movieHandler};
