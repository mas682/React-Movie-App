import React from 'react';
import { Redirect } from 'react-router-dom';
import style from './css/LandingPage/landingPage.module.css';
import {apiGetJsonRequest} from './StaticFunctions/ApiFunctions.js';
import CarouselDisplay from './CarouselDisplay.js';
import MovieDisplay from './MovieDisplay.js';
import {generateMovieBackground} from './StaticFunctions/MovieHtmlFunctions.js';


class Landing extends React.Component {
	constructor(props)
	{
		super(props);
		if(this.props.location.state !== undefined)
		{
			if(this.props.location.state.displayLogin)
			{
				this.props.showLoginPopUp(true);
			}
		}
		this.state = {
			loading: true,
			currentUser: this.props.currentUser,
			featuredMovies: []
		};
		this.getMovies = this.getMovies.bind(this);
		this.generateFeaturedMovies = this.generateFeaturedMovies.bind(this);
		this.generateMovieDisplays = this.generateMovieDisplays.bind(this);
	}

	componentDidMount() {
		// clear the messages on mount
		this.props.setMessages({
			messages: undefined,
			clearMessages: true
		});
		this.setState({
			loading: false
		});
		this.getMovies();
	}

	static getDerivedStateFromProps(nextProps, prevState)
	{
		if(prevState.currentUser !== nextProps.currentUser)
		{
			return {currentUser: nextProps.currentUser};
		}
		else
		{
			return null;
		}
	}

	/* for testing */
	async getMovies()
	{
		let url = "http://localhost:9000/search/movies";
		let result = await apiGetJsonRequest(url);
		console.log(result);
        let status = result.[0];
        let message = result[1].message;
        let requester = result[1].requester;
		this.setState({
			featuredMovies: result[1].movies
		});
		console.log(result[1].movies);
	}


	generateFeaturedMovies()
	{
		let movies = "";
		let movieDisplays = [];
		let outterCount = 0;
		while(outterCount < 2)
		{
			let counter = 0;
			while(counter < 20 && counter < this.state.featuredMovies.length)
			{
				let movie = this.state.featuredMovies[counter];
				if(movie.backgroundImage === null)
				{
					counter = counter + 1;
					continue;
				}
				let headerBackgroundCss = generateMovieBackground(style, movie.backgroundImage, movie.poster, false);
				let html = (
					<div className={style.featuredMovieContainer} style={headerBackgroundCss}>
						<div className={style.infoContainer}>
							<div className={style.moviePosterContainer}>
								<img src={"https://image.tmdb.org/t/p/original/" + movie.poster}/>
							</div>
							<div className={style.playTrailerButton}>
								<i class="fas fa-play-circle"></i>
							</div>
							<div className={style.movieDetails}>
								{movie.title}
							</div>
						</div>
					</div>
				);
				movieDisplays.push(html);
				counter = counter + 1;
			}
			outterCount = outterCount + 1;
		}
		movies = (
				<div className={style.featuredMovieDisplayContainer} id="featuredMovieDisplayContainer">
					<CarouselDisplay
						items={movieDisplays}
						id={"featuredMovieCarousel"}
						itemContainerClass={style.featuredMovieContainer}
						// used to make windowResizeEventHandler more efficint
						maxVisibleItems={1}
					/>
				</div>
		);
		return movies;
	}

	generateMovieDisplays()
	{
		let movies;
		let movieDisplays = [];
		let counter = 0;
		for(let movie of this.state.featuredMovies)
		{
			let html = (
				<div className={style.movieContainer}>
					<MovieDisplay
						movie={movie}
						type={""}
						index={counter}
						removeMovieDisplay={undefined}
						setMessages={this.props.setMessages}
						updateLoggedIn={this.props.updateLoggedIn}
						showLoginPopUp={this.props.showLoginPopUp}
						currentUser={this.state.currentUser}
						key={counter}
						showMovieInfo={false}
						moviePosterStyle={{"min-height":"0px", "border-radius":"5px"}}
						posterClickHandler={this.movieClickHandler}
					/>
				</div>
			);
			movieDisplays.push(html);
			counter = counter + 1;
		}
		movies = (
			<div className={style.resultsContainer}>
				<div className={style.resultsHeader}>
					<div className={style.resultType}>
						New Releases
					</div>
					<div className={style.resultsShowAllButtonContainer} onClick={()=> {this.typeHandler("movies")}}>
						<button className={style.resultsShowAllButton}>
						<div>
							See More
						</div>
						<i className={`fas fa-angle-right ${style.showMoreIcon}`}/>
						</button>
					</div>
				</div>
				<div className={style.movieDisplayContainer} id="movieDisplayContainer">
					<CarouselDisplay
						items={movieDisplays}
						id={"newReleasesCarousel"}
						itemContainerClass={style.movieContainer}
						// used to make windowResizeEventHandler more efficint
						maxVisibleItems={6}
					/>
				</div>
			</div>
		);
		return movies;
	}


	render() {
		if(this.state.loading)
		{
			return null;
		}
		else
		{
			let movies = this.generateFeaturedMovies();
			let newReleses = this.generateMovieDisplays();
			return (
				<div className={style.landingPage}>
					<div className={style.mainBodyContainer}>
						{movies}
						{newReleses}
						{newReleses}
						This product uses the TMDb API but is not endorsed or certified by TMDb.
					</div>
				</div>
			);
		}
	}
}


export default Landing;
