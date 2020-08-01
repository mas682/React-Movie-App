import React from 'react';
import MainPage from './MainPage.js';


class MovieInfo extends React.Component {
	constructor(props) {
		super(props)
		this.state = {
			movies: []
		}
	}
	
	async componentDidMount() {
		const url = 'https://api.themoviedb.org/3/movie/111?api_key=9687aa5fa5dc35e0d5aa0c2a3c663fcc';
		const response = await fetch(url);
		const data = await response.json();
		console.log(data.overview);
	}
	
	render() {
		const { movies } = this.state;
		
		console.error(movies)
		
		return (
			<div>Test</div>
		);
	}
}


export default MovieInfo;
