import React from 'react';
import { Link } from 'react-router-dom';
import SignUpPopup from './SignUp.js';
import './css/moviereview.css';
import MovieInfo from './MovieInfo.js'
import MoviePage from './MoviePage.js'


const MovieInfoPage = () => {
    return (
		<div className="mainBodyContainer">
			<div className="mainBodyHeader">
			</div>
			<div>
				<MoviePage/>
			</div>
		</div>
    );
};

export default MovieInfoPage;
