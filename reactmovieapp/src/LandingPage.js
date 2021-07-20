import React from 'react';
import { Redirect, Link } from 'react-router-dom';
import style from './css/LandingPage/landingPage.module.css';
import {apiGetJsonRequest} from './StaticFunctions/ApiFunctions.js';
import CarouselDisplay from './CarouselDisplay.js';
import MovieDisplay from './MovieDisplay.js';
import MovieTrailerPopUp from './MovieTrailerPopUp.js';
import MovieDisplayPopUp from './MovieDisplayPopUp.js';
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
			watchList: [],
			showTrailer: false,
			trailerIndex: undefined,
			resultsRecieved: 0,
			// show movie popup display
			moviePopup: false,
			// the movie whose pop up should be displayed
			popupMovie: {}
		};
		this.getMovies = this.getMovies.bind(this);
		this.generateFeaturedMovies = this.generateFeaturedMovies.bind(this);
		this.generateMovieDisplays = this.generateMovieDisplays.bind(this);
		this.showTrailerHandler = this.showTrailerHandler.bind(this);
		this.movieClickHandler = this.movieClickHandler.bind(this);
		this.removeMovieDisplay = this.removeMovieDisplay.bind(this);
		this.getMoviesResultsHandler = this.getMoviesResultsHandler.bind(this);
		this.sendApiRequest = this.sendApiRequest.bind(this);
		this.moviePopupResultsHandler = this.moviePopupResultsHandler.bind(this);
		this.getWatchListMovies = this.getWatchListMovies.bind(this);
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
			// if not logged in, clear the watchList
			if(nextProps.currentUser === "")
			{
				return {
					currentUser: nextProps.currentUser,
					watchList: []
				};
			}
			return {currentUser: nextProps.currentUser};
		}
		else
		{
			return null;
		}
	}

	async componentDidUpdate(prevProps, prevState)
	{
		if(this.props.currentUser !== prevProps.currentUser)
		{
			if(this.props.currentUser !== "")
			{
				// only call the api if the user changed to another user
				this.getMovies();
			}
		}
	}

	// function to generate urls to get movies
	getMovies()
	{
		// get the featuread movies
		let url = "https://localhost:9000/movies/featured";
		this.sendApiRequest(url, "featuredMovies");
		let date = new Date();
		// for testing
		date.setYear(2021);
		date.setMonth(2);
		date.setDate(20);
		let month = date.getMonth();
		let newMonth = month - 2;
		date.setMonth(newMonth);
		let startDate = moment(date).format('YYYY-MM-DD');
		date = new Date();
		// for testing
		date.setYear(2021);
		date.setMonth(2);
		date.setDate(20);
		let endDate = moment(date).format('YYYY-MM-DD');
		url = "https://localhost:9000/search/movies?release_date_gte=" + startDate + "&release_date_lte=" + endDate + "&sort=release_date_desc&poster_is_null=false&offset=0&max=24";
		this.sendApiRequest(url, "newReleases");
		// get upcoming movies
		date.setDate(date.getDate() + 1);
		startDate = moment(date).format('YYYY-MM-DD');
		url = "https://localhost:9000/search/movies?release_date_gte=" + startDate + "&sort=release_date_asc&poster_is_null=false&offset=0&max=24";
		this.sendApiRequest(url, "upcomingMovies");
		// get watch list if logged in
		this.getWatchListMovies();
	}

	// function to handle sending api requests to get movies
	async sendApiRequest(url, type)
	{
		await apiGetJsonRequest(url).then((result)=>{
			let status = result[0];
			let message = result[1].message;
			let requester = result[1].requester;
			this.getMoviesResultsHandler(status, message, requester, result, type);
		});
	}

	// handle the results of api calls
	getMoviesResultsHandler(status, message, requester, result, type)
	{
		let loading = this.state.loading;
		if((this.state.currentUser === "" && this.state.resultsRecieved >= 2)
			|| (this.state.currentUser !== "" && this.state.resultsRecieved >= 3))
		{
			loading = false;
		}
		if(status === 200)
		{
			this.setState({
				[type]: result[1].movies,
				loading: loading,
				resultsRecieved: this.state.resultsRecieved + 1
			});
		}
		else
		{
			this.props.updateLoggedIn(requester);
			// only for users watch list
			if(status === 401 && type === "watchList")
			{
				// display message saying failed to get some movies?
				this.setState({
					loading: loading,
					resultsRecieved: (loading) ? this.state.resultsRecieved : 0
				});
			}
			else
			{
				// display message saying failed to get some movies?
				this.setState({
					loading: loading,
					resultsRecieved: (loading) ? this.state.resultsRecieved + 1 : 0
				});
				this.props.setMessages({messages: [{message: message, type: "failure", timeout: 5000}]});
			}
		}
	}

	movieClickHandler(movie)
	{
		console.log(movie);
		let opened = this.state.moviePopup;
		this.setState({
			moviePopup: !opened,
			popupMovie: movie
		});
	}

	// called when watch/watchlist button clicked on movie pop up and movie was not found
	// forces movies to be reloaded
	removeMovieDisplay(index)
	{
		this.setState({
			moviePopup: false,
			popupMovie: undefined
		});
		this.getMovies();
	}

	// function called when a user adds a movie to their watchlist from
	// the pop up
	moviePopupResultsHandler(state)
	{
		if(state.watchList !== undefined)
		{
			this.getWatchListMovies();
		}
	}


	getWatchListMovies()
	{
		if(this.state.currentUser !== "")
		{
			let url = "https://localhost:9000/movies/my_watch_list?offset=0&max=24";
			this.sendApiRequest(url, "watchList");
		}
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
				<div className={style.featuredMovieDisplayContainer}>
					<div className={style.innerDisplayContainer} id="featuredMovieDisplayContainer">
						<CarouselDisplay
							items={movieDisplays}
							id={"featuredMovieCarousel"}
							itemContainerClass={style.featuredMovieContainer}
							// used to make windowResizeEventHandler more efficint
							maxVisibleItems={1}
						/>
					</div>
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
		else if(type === "My Watch List")
		{
			movieArray = this.state.watchList;
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
						type={type}
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
		else if(type === "My Watch List")
		{
			itemId = "watchListCarousel";
			displayId = "watchListDisplayContainer";
			path = "/watch_list";
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
			let watchList = "";
			if(this.state.currentUser !== "")
			{
				watchList = this.generateMovieDisplays("My Watch List");
			}
			let upcomingMovies = this.generateMovieDisplays("Upcoming");
			//let playingNearMe = this.generateMovieDisplays("Playing near you");
			let trailer = "";

			let moviePopup = "";
			if(this.state.moviePopup)
			{
				moviePopup = <MovieDisplayPopUp
								movie={this.state.popupMovie.movie}
								removeFunction={this.movieClickHandler}
								currentUser = {this.state.currentUser}
								removeMovieDisplay = {this.removeMovieDisplay}
								updateLoggedIn = {this.props.updateLoggedIn}
								index = {this.state.popupMovie.index}
								showLoginPopUp = {this.props.showLoginPopUp}
								type = {this.state.popupMovie.type}
								setMessages={this.props.setMessages}
								loadData={true}
								updateParentState={this.moviePopupResultsHandler}
							/>;
			}
			if(this.state.showTrailer)
			{
				trailer = <MovieTrailerPopUp
								trailerPath={this.state.featuredMovies[this.state.trailerIndex].trailer}
								removeFunction={this.showTrailerHandler}
							/>;
			}
			return (
				<div className={style.landingPage}>
					<div className={style.mainBodyContainer}>
						{movies}
						{newReleases}
						{watchList}
						{upcomingMovies}
						{trailer}
						{moviePopup}
						This product uses the TMDb API but is not endorsed or certified by TMDb.
					</div>
				</div>
			);
		}
	}
}


export default Landing;
