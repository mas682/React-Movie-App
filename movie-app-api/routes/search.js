import {verifyLogin, validateStringParameter, validateIntegerParameter} from './globals.js';
import models, { sequelize } from '../src/models';
const Op = require('Sequelize').Op;


// function to get movies and return them to the client
const searchHandler = (req, res, next) => {
		// get the signed cookies in the request if there are any
		let cookie = req.signedCookies.MovieAppCookie;
		cookie = (cookie === false) ? undefined : cookie;
		// variable to indicate if user logged in
		let valid = false;
		// if there is a signed cookie in the request
		if(cookie != undefined)
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
	if(req.method === "GET")
	{
		if(req.params.type === "query_all")
		{
			getAllRelatedItems(cookie, req, res, cookieValid);
			routeFound = true;
		}
		else if(req.params.type === "movies")
		{
			getMovies(cookie, req, res, cookieValid);
			routeFound = true;
		}
		else if(req.params.type === "users")
		{
			getUsers(cookie, req, res, cookieValid);
			routeFound = true;
		}
		else if(req.params.type === "movies_title")
		{
			queryMoviesByTitle(cookie, req, res, cookieValid);
			routeFound = true;
		}
	}

	if(!routeFound)
	{
		let requester = cookieValid ? cookie.name : "";
		res.status(404).send({
			message: "The search path sent to the server does not exist",
			requester: requester
		});
	}
};

// this function will return the movie titles, users, genres, etc.
// that the user will select from based off of their input
// limits the number returned to 5 per type
const getAllRelatedItems = async (cookie, req, res, cookieValid) =>
{
	let defaultMax = 25;
	let requester = cookieValid ? cookie.name : "";
	let value = req.query.value;
	let count = (req.query.max === undefined) ? defaultMax : req.query.max;
	let valid = validateStringParameter(res, value, 0, 250, requester, "The value to search for is invalid");
	if(!valid) return;
	valid = validateIntegerParameter(res, count, requester, "The maximum number of records to return per type is invalid", 0, undefined);
	if(!valid) return;
	count = (count > defaultMax) ? defaultMax : count;
	// find the movies containing the value
	let movies = await models.Movies.findByTitle(value, count, 0);
    let users = await models.User.findUsers(value, count, 0);
	res.status(200).send({
		requester: requester,
		message: "Search results successfully found",
		Movies: (movies === undefined) ? [] : movies,
		Users: (users === undefined) ? [] : users
	});
};

// function to query movies off title only
// doing this as a seperate function as it will be faster than the function
// with various parameters
const queryMoviesByTitle = async (cookie, req, res, cookieValid) =>
{
	let requester = cookieValid ? cookie.name : "";
	let title = req.query.value;
	let count = (req.query.max === undefined) ? 50 : req.query.max;
	let offset = (req.query.offset === undefined) ? 0 : req.query.offset;
	let valid = validateStringParameter(res, title, 0, 250, requester, "The movie title is invalid.  Movie title must be between 0-250 characters");
	if(!valid) return;
	valid = validateIntegerParameter(res, count, requester, "The maximum number of movies to return is invalid",
			0, undefined);
	if(!valid) return;
	valid = validateIntegerParameter(res, offset, requester, "The offset for the movies to return is invalid", 0, undefined);
	if(!valid) return;
	// if the count is a integer, make sure it is not larger than the max value
	count = (count > 50) ? 50 : count;
	let movies = await models.Movies.findByTitle(title, count, offset);
	res.status(200).send({
		requester: requester,
		message: "Search results successfully found",
		Movies:(movies === undefined) ? [] : movies
	});
}

const getMovies = async (cookie, req, res, cookieValid) =>
{
	// consider limiting number of query keys or query length...
	let username = cookieValid ? cookie.name : "";
	let max = (req.query.max === undefined) ? 50 : req.query.max;
	let offset = (req.query.offset === undefined) ? 0 : req.query.offset;
	let valid = validateIntegerParameter(res, max, username, "The maximum number of movies to return is invalid");
	if(!valid) return;
	valid = validateIntegerParameter(res, offset, username, "The offset for the movies to return is invalid", 0, undefined);
	if(!valid) return;
	max = (max > 50) ? 50 : max;
	// returns true, movies on success, false on failure
	let movies = await models.Movies.queryMovies(models, req.query, username, max, offset);
	if(!movies[0])
	{
		// send the error message
		res.status(404).send({
			message: movies[1],
			requester: username
		});
	}
	else
	{
		res.status(200).send({
			message: "Movies successfully found",
			requester: username,
			movies: movies[1]
		});
	}
};


const getUsers = async (cookie, req, res, cookieValid) =>
{
	let defaultMax = 25;
	let defaultOffset = 0;
	let requester = cookieValid ? cookie.name : "";
	let userToFind = req.query.value;
	let offset = (req.query.offset === undefined) ? defaultOffset : req.query.offset;
	let count = (req.query.max === undefined) ? defaultMax : req.query.max;
	// using this instead of validate username as the username does not have to be exact here
	let valid = validateStringParameter(res, userToFind, 0, 20, requester, "Username invalid.  Username must be between 0-20 characters.");
	if(!valid) return;
	valid = validateIntegerParameter(res, count, requester, "The maximum number of users to return is invalid",
			0, undefined);
	if(!valid) return;
	valid = validateIntegerParameter(res, offset, requester, "The offset for the users to return is invalid", 0, undefined);
	if(!valid) return;
	// if the count is a integer, make sure it is not larger than the max value
	count = (count > defaultMax) ? defaultMax : count;
	let users = await models.User.findUsers(userToFind, count, offset);
	res.status(200).send({
		message: "Search results successfully found",
		requester: requester,
		Users: (users === undefined) ? [] : users
	});
}


export {searchHandler};
