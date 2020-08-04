import React from 'react';
import { Link } from 'react-router-dom';
import SignUpPopup from './SignUp.js';
import './css/moviereview.css';
import MovieInfo from './MovieInfo.js'


const Movie = () => {
    return (
		<div className="mainBodyContainer">
			<div className="mainBodyHeader">
			</div>
			<div>
				<SignUpPopup />
				<MovieInfo/>
			</div>
		</div>
    );
};

export default Movie;
