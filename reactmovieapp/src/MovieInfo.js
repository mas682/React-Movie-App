// useState is used to store returned API data in state so components can use it
import React, { useState } from 'react';
import axios from 'axios';
import MainPage from './MainPage.js';
import Movie from './MovieReview.js';


function MovieInfo() {
	const [movies, setMovies] = useState(null);
	
	const url = 'https://api.themoviedb.org/3/movie/upcoming?api_key=9687aa5fa5dc35e0d5aa0c2a3c663fcc&language=en-US&page=1';
	
	const fetchMovies = async () => {
		const response = await axios.get(url)
		setMovies(response.data.results)
	}
	
	return (
		<div className="MovieInfo">
			<h1>Upcoming Movies</h1>
			
			<div>
				<button className="fetch-button" onClick={fetchMovies}>
					Fetch Movies
				</button>
			</div>
			
			<div className="movies">
				{movies &&
					movies.map((movie, index) => {
						
						return(
							<div className="movie" key={index}>
								<h2>https://image.tmdb.org/t/p/original{movie.poster_path}</h2>
								<h2>{movie.title}</h2>
								<div className="details">
									<p>Rating: {movie.vote_average}</p>
								</div>
							</div>
						);
					})}
			</div>
		</div>
	);
}


export default MovieInfo;
/*
class MovieInfo extends React.Component {
	constructor(props) {
		super(props)
		this.state = {
			movies: []
		}
	}
	
	async componentDidMount() {
		const url = 'https://api.themoviedb.org/3/movie/upcoming?api_key=9687aa5fa5dc35e0d5aa0c2a3c663fcc&language=en-US&page=1';
		const response = await fetch(url);
		const data = await response.json();
		var x, y = '';

		for(x in data.results) {
			y += data.results[x].title + '<br>';
		}
		document.getElementById('result').innerHTML = y;
	}
	
	render() {
		const { movies } = this.state;
		
		console.error(movies)
		
		return (
			<p id='result'></p>
		);
	}
}


export default MovieInfo;
*/