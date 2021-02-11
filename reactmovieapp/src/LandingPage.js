import React from 'react';
import { Redirect, Link } from 'react-router-dom';
import style from './css/LandingPage/landingPage.module.css';
import {apiGetJsonRequest} from './StaticFunctions/ApiFunctions.js';
import CarouselDisplay from './CarouselDisplay.js';
import MovieDisplay from './MovieDisplay.js';
import MovieTrailerPopUp from './MovieTrailerPopUp.js';
import {generateMovieBackground} from './StaticFunctions/MovieHtmlFunctions.js';
const moment = require('moment');


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
			featuredMovies: [],
			newReleases: [],
			upcomingMovies: [],
			showTrailer: false,
			trailerIndex: undefined
		};
		this.getMovies = this.getMovies.bind(this);
		this.generateFeaturedMovies = this.generateFeaturedMovies.bind(this);
		this.generateMovieDisplays = this.generateMovieDisplays.bind(this);
		this.showTrailerHandler = this.showTrailerHandler.bind(this);
	}

	componentDidMount() {
		// clear the messages on mount
		this.props.setMessages({
			messages: undefined,
			clearMessages: true
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
			featuredMovies: result[1].movies,
		});
		let date = new Date();
		let month = date.getMonth();
		// go back 1 month, set to 3 for testing
		let newMonth = month - 5;
		date.setMonth(newMonth);
		let startDate = moment(date).format('YYYY-MM-DD');
		date = new Date();
		let endDate = moment(date).format('YYYY-MM-DD');
		url = "http://localhost:9000/search/movies?release_date_gte=" + startDate + "&release_date_lte=" + endDate + "&sort=release_date_desc&offset=0&max=24";
		result = await apiGetJsonRequest(url);
		status = result.[0];
		message = result[1].message;
		requester = result[1].requester;
		this.setState({
			newReleases: result[1].movies
		});
		date = new Date();
		// for testing just use start date
		url = "http://localhost:9000/search/movies?release_date_gte=" + startDate + "&sort=release_date_asc&offset=0&max=24";
		result = await apiGetJsonRequest(url);
		status = result.[0];
		message = result[1].message;
		requester = result[1].requester;
		this.setState({
			upcomingMovies: result[1].movies,
			loading: false
		});

	}


	generateFeaturedMovies()
	{
		let movies = "";
		let movieDisplays = [];
		let counter = 0;
		while(counter < 20 && counter < this.state.featuredMovies.length)
		{
			let movie = this.state.featuredMovies[counter];
			if(movie.backgroundImage === null)
			{
				counter = counter + 1;
				continue;
			}
			let index = counter;
			let headerBackgroundCss = generateMovieBackground(style, movie.backgroundImage, movie.poster, false);
			let playTrailerButton = (
				<div className={style.playTrailerButton}>
					<i class="fas fa-play-circle" onClick={()=>{this.showTrailerHandler(index)}}></i>
				</div>
			);
			let infoStyle = style.infoContainerTrailer;
			if(movie.trailer === null)
			{
				playTrailerButton = "";
				infoStyle = style.infoContainerNoTrailer;
			}
			let html = (
				<div className={style.featuredMovieContainer} style={headerBackgroundCss}>
					<div className={`${style.infoContainer} ${infoStyle}`}>
						<div className={style.moviePosterContainer}>
							<Link to={"/movie/" + movie.id}><img src={"https://image.tmdb.org/t/p/original/" + movie.poster}/></Link>
						</div>
						{playTrailerButton}
						<div className={style.movieDetails}>
							{movie.title}
						</div>
					</div>
				</div>
			);
			movieDisplays.push(html);
			counter = counter + 1;
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



	generateMovieDisplays(type)
	{
		let movies;
		let movieDisplays = [];
		let counter = 0;
		let movieArray = [];
		if(type === "Upcoming")
		{
			movieArray = this.state.upcomingMovies;
		}
		else
		{
			 movieArray = this.state.newReleases;
		}
		for(let movie of movieArray)
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
		let itemId = "";
		let displayId = "";
		let path = "";
		if(type === "Upcoming")
		{
			itemId = "upcomingCarousel";
			displayId = "upcomingDisplayContainer";
			// may want to pass dates you already generated?
			path = "/upcoming";
		}
		else
		{
			itemId = "newReleasesCarousel";
			displayId = "newReleasesDisplayContainer";
			// may want to pass dates you already generated?
			path = "/new_releases";
		}
		movies = (
			<div className={style.resultsContainer}>
				<div className={style.resultsHeader}>
					<div className={style.resultType}>
						{type}
					</div>
					<div className={style.resultsShowAllButtonContainer}>
						<Link className={style.resultsShowAllButton} to={path}>
							<div>
								See More
							</div>
							<i className={`fas fa-angle-right ${style.showMoreIcon}`}/>
						</Link>
					</div>
				</div>
				<div className={style.movieDisplayContainer} id={displayId}>
					<CarouselDisplay
						items={movieDisplays}
						id={itemId}
						itemContainerClass={style.movieContainer}
						// used to make windowResizeEventHandler more efficint
						maxVisibleItems={6}
					/>
				</div>
			</div>
		);
		return movies;
	}

	showTrailerHandler(index)
	{
		this.setState({
			showTrailer: !this.state.showTrailer,
			trailerIndex: index
		});
	}


	render() {
		if(this.state.loading)
		{
			return null;
		}
		else
		{
			let movies = this.generateFeaturedMovies();
			let newReleases = this.generateMovieDisplays("New Releases");
			let upcomingMovies = this.generateMovieDisplays("Upcoming");
			let trendingMovies = this.generateMovieDisplays("Trending");
			let popularMovies = this.generateMovieDisplays("Popular");
			let playingNearMe = this.generateMovieDisplays("Playing near you");
			let trailer = "";
			if(this.state.showTrailer)
			{
				trailer = <MovieTrailerPopUp
								trailerPath={this.state.featuredMovies[this.state.trailerIndex].trailer}
								removeFunction={this.showTrailerHandler}
							/>;
			}
			console.log(this.state.featuredMovies);
			return (
				<div className={style.landingPage}>
					<div className={style.mainBodyContainer}>
						{movies}
						{newReleases}
						{upcomingMovies}
						{trendingMovies}
						{popularMovies}
						{playingNearMe}
						{trailer}
						This product uses the TMDb API but is not endorsed or certified by TMDb.
					</div>
				</div>
			);
		}
	}
}


export default Landing;
