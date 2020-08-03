import {verifyLogin} from './globals.js';
import models, { sequelize } from '../src/models';
const Op = require('Sequelize').Op;


// function to get movies and return them to the client
const getMovies = (req, res, next) => {
	let url = 'https://api.themoviedb.org/3/movie/111?api_key=9687aa5fa5dc35e0d5aa0c2a3c663fcc';
	//let response = await fetch(url);
	//let data = await response.json();
	//alert(data.overview);
};


export {getMovies};
