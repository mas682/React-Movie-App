import React from 'react';
import MainPage from './MainPage.js';


const api = 'https://api.themoviedb.org/3/movie/';
const movieNum = '111';
const apiKey = '?api_key=9687aa5fa5dc35e0d5aa0c2a3c663fcc';


class MovieInfo extends React.Component {
	constructor(props) {
		super(props)
		this.state = {
			movies: []
		}
	}
	
	componentDidMount() {
		return fetch(api + movieNum + apiKey)
			.then(response => response.json())
			.then(data => this.setState({ movies: data.movies }))
			.catch(error => {console.error(error)})
	}
	
	render() {
		const { movies } = this.state;
		
		console.error(movies)
		
		return (
			<ul>
				{movies.map(movie => 
					<li key={movie.original_title}>
						<a href={movie.overview}>{movie.title}</a>
					</li>
				)}
			</ul>
		);
	}
}


export default MovieInfo;
