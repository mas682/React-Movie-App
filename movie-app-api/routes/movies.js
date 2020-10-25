import {verifyLogin} from './globals.js';
import models, { sequelize } from '../src/models';
const Op = require('Sequelize').Op;


// function to get movies and return them to the client
const movieHandler = (req, res, next) => {
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
    if(req.params.type === "get_movie_titles" && cookieValid)
    {
        getMovieTitles(cookie, req, res, cookieValid);
    }
		else if(req.params.id !== undefined)
		{
				getMovieInfo(cookie, req, res, cookieValid);
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
		// prevent the id being sent in from being too long
		if(req.params.id.length > 10)
		{
				res.status(404).send("Movie ID formatted incorrectly");
		}
		let id = req.params.id;
		// strings length
		let idLength = id.length;
		// convert the string to a integer
		let idInt = parseInt(id);
		// if the value is a string or begins with a string
		// such as a123
		if(isNaN(idInt))
		{
				console.log("Did not find a movie ID");
				res.status(404).send("Did nto find a movie ID in the request");
				return;
		}
		let convertedLength = idInt.toString().length;
		// if the value can be converted to a number but ends with a string
		// such as 123a
		if(idLength !== convertedLength)
		{
				console.log("Movie ID formatted incorrectly");
				res.status(404).send("Movie ID formatted incorrectly");
				return;
		}
		let movie = await models.Movies.getMovieInfo(id, models);
		console.log("MOVIE");
		console.log(movie);
		if(movie === undefined)
		{
				res.status(404).send("Unable to find the information for the requested movie");
		}
		else
		{
				res.status(200).send(movie);
		}

};


export {movieHandler};
