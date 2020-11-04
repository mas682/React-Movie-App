import {verifyLogin} from './globals.js';
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
    // if here, the path is /movie/get_movie_titles
		// only allowed to use this if logged in
		//console.log(Object.keys(req.params).length);
		console.log("Request params:");
		console.log(req.params);
    if(req.params.type === "query_all" && cookieValid)
    {
        getAllRelatedItems(cookie, req, res, cookieValid);
    }
	else if(req.params.type === "movies")
	{
		getMovies(cookie, req, res, cookieValid);
	}
		/*
    else if(!cookieValid)
    {
        res.status(401).send("No cookie or cookie invalid");
    }
		*/
    // some unknow path given
    else
    {
        console.log(req.params[0]);
        res.status(404).send("Request not understood");
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
								res.status(200).send({"Movies":movies, "Users":users});
						}
				}
		}
};

const getMovies = async (cookie, req, res, cookieValid) =>
{
	console.log(req.query);
	let username = undefined;
	if(cookieValid)
	{
		username = cookie.name;
	}
	let movies = await models.Movies.queryMovies(models, req.query, username);
	let loggedInUser = "";
	// if the current user is looking at their own page
	if(cookieValid)
	{
		loggedInUser = cookie.name;
	}

	if(!movies[0])
	{
		// send the error message
		res.status(404).send([movies[1], loggedInUser]);
	}
	else
	{
		res.status(200).send([movies[1], loggedInUser]);
	}
};


export {searchHandler};
