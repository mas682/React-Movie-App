const validateStringParameter = require('./globals.js').validateStringParameter;
const validateIntegerParameter = require('./globals.js').validateIntegerParameter;
const models = require('../src/shared/sequelize.js').getClient().models;
const Op = require('sequelize').Op;
const Logger = require("../src/shared/logger.js").getLogger();
const appendCallerStack = require("./errorHandler.js").appendCallerStack;



// function to get movies and return them to the client
const searchHandler = (req, res, next) => {
	let requester = (req.session === undefined || req.session.user === undefined || req.session.passwordResetSession !== undefined) ? "" : req.session.user;
	// set which file the request is for
	res.locals.file = "search";
	selectPath(requester, req, res, next);
};

const selectPath = (requester, req, res, next) =>
{
    res.locals.function = "selectPath";
	let routeFound = false;
	if(req.method === "GET")
	{
		if(req.params.type === "query_all")
		{
			routeFound = true;
			getAllRelatedItems(requester, req, res)
			.catch((err) => {
				let callerStack = new Error().stack;
				appendCallerStack(callerStack, err, next, undefined);
			});
		}
		else if(req.params.type === "movies")
		{
			routeFound = true;
			getMovies(requester, req, res)
			.catch((err) => {
				let callerStack = new Error().stack;
				appendCallerStack(callerStack, err, next, undefined);
			});
		}
		else if(req.params.type === "users")
		{
			routeFound = true;
			getUsers(requester, req, res)
			.catch((err) => {
				let callerStack = new Error().stack;
				appendCallerStack(callerStack, err, next, undefined);
			});
		}
		else if(req.params.type === "movies_title")
		{
			routeFound = true;
			queryMoviesByTitle(requester, req, res)
			.catch((err) => {
				let callerStack = new Error().stack;
				appendCallerStack(callerStack, err, next, undefined);
			});
		}
	}

	if(!routeFound)
	{
		res.status(404).sendResponse({
			message: "The search path sent to the server does not exist",
			requester: requester
		});
	}
};

// this function will return the movie titles, users, genres, etc.
// that the user will select from based off of their input
// limits the number returned to 5 per type
const getAllRelatedItems = async (requester, req, res) =>
{
	res.locals.function = "getAllRelatedItems";
	let defaultMax = 25;
	let value = req.query.value;
	let count = (req.query.max === undefined) ? defaultMax : req.query.max;
	let valid = validateStringParameter(res, value, 0, 250, requester, "The value to search for is invalid");
	if(!valid) return;
	valid = validateIntegerParameter(res, count, requester, "The maximum number of records to return per type is invalid", 0, undefined);
	if(!valid) return;
	count = (count > defaultMax) ? defaultMax : count;
	// find the movies containing the value
	let movies = await models.Movies.findByTitle(value, count, 0).catch(error=>{
        let callerStack = new Error().stack;
        appendCallerStack(callerStack, error, undefined, true);
    });
    let users = await models.Users.findUsers(value, count, 0).catch(error=>{
        let callerStack = new Error().stack;
        appendCallerStack(callerStack, error, undefined, true);
    });
	res.status(200).sendResponse({
		requester: requester,
		message: "Search results successfully found",
		Movies: (movies === undefined) ? [] : movies,
		Users: (users === undefined) ? [] : users
	});
};

// function to query movies off title only
// doing this as a seperate function as it will be faster than the function
// with various parameters
const queryMoviesByTitle = async (requester, req, res) =>
{
	res.locals.function = "queryMoviesByTitle";
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
	let movies = await models.Movies.findByTitle(title, count, offset).catch(error=>{
        let callerStack = new Error().stack;
        appendCallerStack(callerStack, error, undefined, true);
    });
	res.status(200).sendResponse({
		requester: requester,
		message: "Search results successfully found",
		Movies:(movies === undefined) ? [] : movies
	});
}

const getMovies = async (requester, req, res) =>
{
	res.locals.function = "getMovies";
	// consider limiting number of query keys or query length...
	let username = requester;
	let max = (req.query.max === undefined) ? 50 : req.query.max;
	let offset = (req.query.offset === undefined) ? 0 : req.query.offset;
	let valid = validateIntegerParameter(res, max, username, "The maximum number of movies to return is invalid");
	if(!valid) return;
	valid = validateIntegerParameter(res, offset, username, "The offset for the movies to return is invalid", 0, undefined);
	if(!valid) return;
	max = (max > 50) ? 50 : max;
	// returns true, movies on success, false on failure
	let movies = await models.Movies.queryMovies(models, req.query, username, max, offset).catch(error=>{
        let callerStack = new Error().stack;
        appendCallerStack(callerStack, error, undefined, true);
    });
	if(!movies[0])
	{
		// send the error message
		res.status(404).sendResponse({
			message: movies[1],
			requester: username
		});
	}
	else
	{
		res.status(200).sendResponse({
			message: "Movies successfully found",
			requester: username,
			movies: movies[1]
		});
	}
};


const getUsers = async (requester, req, res) =>
{
	res.locals.function = "getUsers";
	let defaultMax = 25;
	let defaultOffset = 0;
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
	let users = await models.Users.findUsers(userToFind, count, offset).catch(error=>{
        let callerStack = new Error().stack;
        appendCallerStack(callerStack, error, undefined, true);
    });
	res.status(200).sendResponse({
		message: "Search results successfully found",
		requester: requester,
		Users: (users === undefined) ? [] : users
	});
}


export {searchHandler};
