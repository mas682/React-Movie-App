// useState is used to store returned API data in state so components can use it
import React, { Component } from 'react';
//import axios from 'axios';
import MainPage from './MainPage.js';
import Movie from './MovieReview.js';
import PhotoContainer from "./PhotoContainer";


class MovieInfo extends React.Component {
	constructor() {
		super();
		this.state = {
			movies: []
		};
	}

	componentDidMount() {
		fetch("https://api.themoviedb.org/3/movie/upcoming?api_key=9687aa5fa5dc35e0d5aa0c2a3c663fcc&language=en-US&page=1")
			.then(res => {
				console.log('response', res);
				if(!res.ok) {
					throw Error("Error fetching the movies");
				}
				return res.json()
			.then(allData => {
				console.log(allData.results)
				this.setState({ movies: allData.results });
			})
			.catch(err => {
				throw Error(err.message);
				});
			}
		);
	}

	render() {
		return (
			<section className="app">
				<h1>Upcoming Movies</h1>
				<PhotoContainer movies={this.state.movies} />
			</section>
		);
	}
}


export default MovieInfo;
