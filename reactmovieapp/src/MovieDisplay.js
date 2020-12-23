import React, { Component } from 'react';
import {Link, Redirect, withRouter} from 'react-router-dom';
import style from './css/Movies/MovieDisplay.module.css'
import MovieDisplayPopUp from './MovieDisplayPopUp.js';
import {apiPostJsonRequest} from './StaticFunctions/ApiFunctions.js';
import {addMovieToWatchListResultsHandler, removeWatchListMovieResultsHandler,
    addMovieToWatchedListResultsHandler, removeWatchedListMovieResultsHandler}
     from './StaticFunctions/UserResultsHandlers.js';
import {generateWatchListButton, generateWatchedListButton, checkMovieOnWatchList,
        checkMovieOnWatchedList} from './StaticFunctions/MovieHtmlFunctions.js';

class MovieDisplay extends React.Component {
    constructor(props){
        super(props);
        let state = MovieDisplay.generateDisplayState(this.props);
        this.state = state;

        this.posterClickHandler = this.posterClickHandler.bind(this);
        this.buttonHandler = this.buttonHandler.bind(this);
        this.updateState = this.updateState.bind(this);
    }


    static getDerivedStateFromProps(nextProps, prevState)
    {
        if(prevState.id !== nextProps.movie.id)
        {
            console.log("False");
            // do not display the popup as there was a change in the movie id
            return MovieDisplay.generateDisplayState(nextProps, false);
        }
        else if(prevState.currentUser !== nextProps.currentUser)
        {
            console.log("False2");
            let moviePopup = false;
            if(prevState.moviePopup)
            {
                moviePopup = true;
            }
            // if the popup was open, leave it open
            return MovieDisplay.generateDisplayState(nextProps, moviePopup);
        }
        else
        {
            console.log("Null");
            return null;
        }
    }

    // function to set the state for the movie display
    // called on initialization and whenever new props come in
    static generateDisplayState(props, moviePopup)
    {
        let watchList = checkMovieOnWatchList(props.movie, props.currentUser);
        let watched = checkMovieOnWatchedList(props.movie, props.currentUser);
        return {
            id: props.movie.id,
            poster: props.movie.poster,
            movie: props.movie,
            // show the movie display popup
            moviePopup: moviePopup,
            currentUser: props.currentUser,
            watchList: watchList,
            watched: watched,
            index: props.index,
            type: props.type
        };
    }

    posterClickHandler()
    {
        let opened = this.state.moviePopup;
        this.setState({
            moviePopup: !opened
        });
    }

    async buttonHandler(event, type)
    {
        event.preventDefault();
        event.stopPropagation();

        if(!this.state.currentUser)
        {
            // will be dependent on the page..
            this.props.showLoginPopUp(false);
            return;
        }

        let url = "";
        let params = {movieId: this.state.id};
        if(type === "watched")
        {
            url = "http://localhost:9000/movies/add_to_watched";
            if(this.state.watched)
            {
                url = "http://localhost:9000/movies/remove_from_watched";
            }
        }
        else if(type === "watchlist")
        {
            url = "http://localhost:9000/movies/add_to_watchlist";
            if(this.state.watchList)
            {
                url = "http://localhost:9000/movies/remove_from_watchlist";
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
                    this.props.setMessages(result.messageState);
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
                    this.props.setMessages(result.messageState);
                    return;
                }
            }
        }

        if(result.movieNotFound)
        {
            this.props.removeMovieDisplay(this.state.index);
            this.props.updateLoggedIn(requester);
            this.props.setMessages(result.messageState);
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
                if(result.messageState !== undefined)
                {
                    console.log("Set message");
                    this.props.setMessages(result.messageState)
                }
                this.setState(result.state);
                this.props.updateLoggedIn(requester);
            }
        }
    }

    // function called by popup when user adds/removes a movie to their watchlist or watchedlist
    updateState(newState)
    {
        this.setState(newState);
    }

    render()
    {
        let posterPath = "";
        if(this.state.poster !== null)
        {
            posterPath = "https://image.tmdb.org/t/p/original" + this.state.poster;
        }
        let moviePopup = "";
        if(this.state.moviePopup)
        {
            moviePopup = <MovieDisplayPopUp
                            movie={this.state.movie}
                            removeFunction={this.posterClickHandler}
                            currentUser = {this.state.currentUser}
                            watched = {this.state.watched}
                            watchList = {this.state.watchList}
                            removeMovieDisplay = {this.props.removeMovieDisplay}
                            updateLoggedIn = {this.props.updateLoggedIn}
                            index = {this.state.index}
                            showLoginPopUp = {this.props.showLoginPopUp}
                            type = {this.state.type}
                            updateParentState = {this.updateState}
                            setMessages={this.props.setMessages}
                        />;
        }
        let watchListIcon = generateWatchListButton(style, this.buttonHandler, this.state.watchList);
        let watchedIcon = generateWatchedListButton(style, this.buttonHandler, this.state.watched);

        return (
            <div className={style.main}>
                <div className={style.movieImageContainer} onClick={this.posterClickHandler}>
                    <img className={style.moviePoster} src={posterPath}/>
                </div>
                <div className={style.bottomContainer} onClick={this.posterClickHandler}>
                    <div className={style.movieDetailsContainer}>
                        <div className={style.movieTitle}>
                            {this.state.movie.title}
                        </div>
                        <div className={style.releaseDate}>
                            {this.state.movie.releaseDate}
                        </div>
                    </div>
                    <div className={style.icons}>
                        {watchListIcon}
                        {watchedIcon}
                    </div>
                </div>
                {moviePopup}
            </div>
        )
    }

}

export default withRouter(MovieDisplay);
