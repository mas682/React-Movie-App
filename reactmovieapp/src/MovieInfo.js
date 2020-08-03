import React from 'react';
import MainPage from './MainPage.js';
import Movie from './MovieReview.js';


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
			//console.log(data.results[x].title)
			//console.log(data.results[x].poster_path)
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
