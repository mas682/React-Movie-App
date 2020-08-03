import React from 'react';
import { Link } from 'react-router-dom';
import SignUpPopup from './SignUp.js';
import './css/moviereview.css';
import MovieInfo from './MovieInfo.js'


const Movie = () => {
    return (
		<div className="mainBodyContainer">
			<div className="mainBodyHeader">
				<h2>Movie Page</h2>
			</div>
			<div>
				<p> This will show reviews for a specific movie</p>
				<Link to="/"><button className ="testButton">Home Page</button></Link>
				<SignUpPopup />
				<MovieInfo/>
			</div>
		</div>
    );
};

export default Movie;
