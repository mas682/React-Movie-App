import {verifyLogin, validateStringParameter} from './globals.js';
import models, { sequelize } from '../src/models';
const Op = require('Sequelize').Op;


// function to get movies and return them to the client
const searchHandler = (req, res, next) => {
		// get the signed cookies in the request if there are any
		let cookie = req.signedCookies.MovieAppCookie;
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
	let value = req.query.value;
	console.log("Value: " + value);
	// find the movies containing the value
	let movies = await models.Movies.findByTitle(models, value, 5);
    let users = await models.User.findUsers(value, 5);
	console.log("movies");
	console.log(movies);
	if(movies === undefined && users === undefined)
	{
		res.status(404).send("Unable to find any users or movies matching the search");
	}
	else
	{
		if(movies !== undefined && users !== undefined)
		{
			if(movies.length < 1 && users.length < 1)
			{
				res.status(404).send("Unable to find any users or movies matching the search");
			}
			else
			{
				res.status(200).send({
					requester: (cookieValid) ? cookie.name : "",
					message: "Search results successfully found",
					Movies:movies,
					Users:users
				});
			}
		}
	}
};

const getMovies = async (cookie, req, res, cookieValid) =>
{
	console.log(req.query);
	// consider limiting number of query keys or query length...
	let username = cookieValid ? cookie.name : "";
	// returns true, movies on success, false on failure
	let movies = await models.Movies.queryMovies(models, req.query, username);
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
	let requester = cookieValid ? cookie.name : "";
	let userToFind = req.query.value;
	// using this instead of validate username as the username does not have to be exact here
	let valid = validateStringParameter(res, userToFind, 0, 20, requester, "Username invalid");
	if(!valid) return;
	let users = await models.User.findUsers(userToFind, 20);
	if(users === undefined)
	{
		res.status(404).send({
			message: "",
			requester: requester
		});
	}
	else
	{
		res.status(200).send({
			message: "Users successfully found",
			requester: requester,
			users: users
		});
	}
}


export {searchHandler};
