import React from 'react';
import Popup from 'reactjs-popup';
import style from './css/Movies/MovieDisplayPopUp.module.css'
import {Link, Redirect, withRouter} from 'react-router-dom';
import {generateWatchListButton, generateWatchedListButton, generateMovieTrailer, generateMovieRuntime,
generateMovieInfo, generateOverview, generateDirector, generateGenres, generateMoviePoster} from './StaticFunctions/MovieHtmlFunctions.js';
import {apiPostJsonRequest} from './StaticFunctions/ApiFunctions.js';
import {addMovieToWatchListResultsHandler, removeWatchListMovieResultsHandler,
    addMovieToWatchedListResultsHandler, removeWatchedListMovieResultsHandler}
     from './StaticFunctions/UserResultsHandlers.js';

// component to display the movie poster large on screen when clicked on
// the movies page
class MovieDisplayPopUp extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			open: true,
			movie: this.props.movie,
            poster: this.props.movie.poster,
            headerImage: this.props.movie.backgroundImage,
            trailer: this.props.movie.trailer,
			currentUser: this.props.currentUser,
			movieInfoString: generateMovieInfo(this.props.movie),
			watched: this.props.watched,
			watchList: this.props.watchList,
			// index into array of movies if on one of the movie filter pages
			index: this.props.index,
			// the type of page the pop up is called from
			type: this.props.type
		};
		this.openModal = this.openModal.bind(this);
		this.closeModal = this.closeModal.bind(this);
		this.changeHandler = this.changeHandler.bind(this);
		this.buttonHandler = this.buttonHandler.bind(this);
	}

	openModal() {
		this.setState({ open: true });
	}

	closeModal() {
        this.setState({
            open: false,
        });
		this.props.removeFunction();
    }

	changeHandler(event) {
        let name = event.target.name;
        let value = event.target.value;
        this.setState({[name]: value});
    }

	async buttonHandler(event, type)
	{
		event.preventDefault();
        event.stopPropagation();

		/*
		may or may not need??
        if(!this.state.currentUser)
        {
            // will be dependent on the page..
            this.props.showLoginPopUp(false);
            return;
        }
		*/

        let url = "";
        let params = {movieId: this.state.movie.id};
        if(type === "watched")
        {
            url = "http://localhost:9000/profile/" + this.state.currentUser + "/add_to_watched";
            if(this.state.watched)
            {
                url = "http://localhost:9000/profile/" + this.state.currentUser + "/remove_from_watched";
            }
        }
        else if(type === "watchlist")
        {
            url = "http://localhost:9000/profile/" + this.state.currentUser + "/add_to_watchlist";
            if(this.state.watchList)
            {
                url = "http://localhost:9000/profile/" + this.state.currentUser + "/remove_from_watchlist";
            }
        }
        // send the request
        let apiResult = await apiPostJsonRequest(url, params);
        let status = apiResult[0];
        let message = apiResult[1].message;
        let requester = apiResult[1].requester;
        let result;
        if(type === "watched")
        {
            if(!this.state.watched)
            {
                result = addMovieToWatchedListResultsHandler(status, message, requester);
            }
            else
            {
                result = removeWatchedListMovieResultsHandler(status, message, requester, this.state.type);
                // if the movie was removed from the watchlist page or should have not been there alredy
                if(result.removeFromDiplay)
                {
                    this.props.removeMovieDisplay(this.state.index);
                    this.props.updateLoggedIn(requester);
                    return;
                }
            }
        }
        else
        {
            if(!this.state.watchList)
            {
                result = addMovieToWatchListResultsHandler(status, message, requester);
            }
            else
            {
                result = removeWatchListMovieResultsHandler(status, message, requester, this.state.type);
                // if the movie was removed from the watchlist page or should have not been there alredy
                if(result.removeFromDiplay)
                {
                    this.props.removeMovieDisplay(this.state.index);
                    this.props.updateLoggedIn(requester);
                    return;
                }
            }
        }

        if(result.movieNotFound)
        {
            this.props.removeMovieDisplay(this.state.index);
            this.props.updateLoggedIn(requester);
        }
        else
        {
            if(result.showLoginPopUp)
            {
                // this will also update who is logged in
                this.props.showLoginPopUp(true);
            }
            else
            {
                this.setState(result.state);
				// if the pop up was caused because of a movie review, do not call this
				if(this.state.type !== "Review")
				{
					this.props.updateParentState(result.state);
				}
                this.props.updateLoggedIn(requester);
            }
        }
	}

    render() {
            let poster = generateMoviePoster(style, this.state.poster, this.state.movie.id);
            let trailer = generateMovieTrailer(style, this.state.trailer);
            let overview = generateOverview(style, this.state.movie.overview);
            let genres = generateGenres(style, this.state.movie.Genres);
            let director = generateDirector(style, this.state.movie.director);
			let watchListIcon = generateWatchListButton(style, this.buttonHandler, this.state.watchList);
			let watchedIcon = generateWatchedListButton(style, this.buttonHandler, this.state.watched);

			let headerBackgroundCss = {backgroundImage: "linear-gradient(to bottom, rgba(112,107,107,0.9), rgba(112,107,107,0.9))"};
			if(this.state.headerImage !== null)
			{
            	headerBackgroundCss = {backgroundImage: "linear-gradient(to bottom, rgba(112,107,107,0.9), rgba(112,107,107,0.9)),url(\"https://image.tmdb.org/t/p/original" + this.state.headerImage};
			}
			else if(this.state.poster !== null)
			{
				headerBackgroundCss = {backgroundImage: "linear-gradient(to bottom, rgba(112,107,107,0.9), rgba(112,107,107,0.9)),url(\"https://image.tmdb.org/t/p/original" + this.state.poster};

			}
    		return (
        			<div>
                        <Popup
                            open={this.state.open}
                            closeOnDocumentClick
                            onClose={this.closeModal}
                            contentStyle={{ width: "50%", border: "0px", padding: "0px"}}
                        >
                            <div className={style.modal}>
                                <div className={style.content} style={headerBackgroundCss}>
                                    <div className={style.headerContainer}>
                                        {poster}
                                        <div className={style.movieDetailsOutterContainer}>
                                            <div className={style.movieDetailsContainer}>
                                                <div className={style.movieTitle}>
                                                    {this.state.movie.title}
                                                </div>
												<div className={style.infoContainer}>
													{this.state.movieInfoString}
												</div>
												<div className={style.icons}>
													{watchedIcon}
													{watchListIcon}
												</div>
												{overview}
                                                {genres}
                                                {director}
                                            </div>
                                        </div>
                                    </div>
                                    {trailer}
                                </div>
                            </div>
                        </Popup>
        			</div>
    		);
    }
}


export default MovieDisplayPopUp;
