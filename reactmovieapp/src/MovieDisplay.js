import React, { Component } from 'react';
import {Link, Redirect, withRouter} from 'react-router-dom';
import style from './css/Movies/MovieDisplay.module.css'
import MovieDisplayPopUp from './MovieDisplayPopUp.js';
import SignInPopup from './SignIn.js';

class MovieDisplay extends React.Component {
    constructor(props){
        super(props);

        let watchList = false;
        if(this.props.movie.UserWatchLists !== undefined)
        {
            if(this.props.movie.UserWatchLists.length > 0)
            {
                if(this.props.movie.UserWatchLists[0].username === this.props.username)
                {
                    watchList = true;
                }
            }
        }
        let watched = false;
        if(this.props.movie.UsersWhoWatched !== undefined)
        {
            if(this.props.movie.UsersWhoWatched.length > 0)
            {
                if(this.props.movie.UsersWhoWatched[0].username === this.props.username)
                {
                    watched = true;
                }
            }
        }
        this.state = {
            id: this.props.movie.id,
            poster: this.props.movie.poster,
            movie: this.props.movie,
            loading: false,
            moviePopup: false,
            loggedIn: this.props.loggedIn,
            username: this.props.username,
            watchList: watchList,
            watched: watched,
            index: this.props.index,
            type: this.props.type,
            displaySignIn: false
        };
        this.posterClickHandler = this.posterClickHandler.bind(this);
        this.movieWatchListHandler = this.movieWatchListHandler.bind(this);
        this.movieWatchedHandler = this.movieWatchedHandler.bind(this);
        this.setDisplayState = this.setDisplayState.bind(this);
        this.signInRemoveFunction = this.signInRemoveFunction.bind(this);
    }

    // called when component receiving new props
    // may or may not be needed
    componentWillReceiveProps(nextProps) {
        if(nextProps.movie.id !== this.state.id)
        {
            this.setDisplayState(nextProps);
        }
    };

    setDisplayState(props)
    {
        let watchList = false;
        if(props.movie.UserWatchLists !== undefined)
        {
            if(props.movie.UserWatchLists.length > 0)
            {
                if(props.movie.UserWatchLists[0].username === this.props.username)
                {
                    watchList = true;
                }
            }
        }
        let watched = false;
        if(props.movie.UsersWhoWatched !== undefined)
        {
            if(props.movie.UsersWhoWatched.length > 0)
            {
                if(props.movie.UsersWhoWatched[0].username === this.props.username)
                {
                    watched = true;
                }
            }
        }
        this.state = {
            id: props.movie.id,
            poster: props.movie.poster,
            movie: props.movie,
            loading: false,
            moviePopup: false,
            loggedIn: props.loggedIn,
            username: props.username,
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

    movieWatchListHandler(event)
    {
        event.preventDefault();
        event.stopPropagation();

        if(!this.state.loggedIn)
        {
            this.setState({
                displaySignIn: true
            });
            // eventually need to show this..
            //this.props.showLoginPopUp(true);
            return;
        }

        const requestOptions = {
            method: 'POST',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json'},
            body: JSON.stringify({
                movieId: this.state.id
            })
        };

        let status = 0;
        let url = "http://localhost:9000/profile/" + this.state.username + "/add_to_watchlist";
        if(this.state.watchList)
        {
            url = "http://localhost:9000/profile/" + this.state.username + "/remove_from_watchlist";
        }
        fetch(url, requestOptions)
            .then(res => {
                status = res.status;
                if(status !== 401)
                {
                    return res.json();
                }
                else
                {
                    return res.text();
                }
            }).then(result =>{
                // not logged in/cookie not found
                if(status === 401)
                {
                    this.props.updateLoggedIn("", false);
                    if(this.state.loggedIn)
                    {
                        this.setState({
                            loggedIn: false,
                            username: ""
                        })
                    }
                }
                else
                {
                    let username = result[1];
                    if(status === 200 && result[0] === "Movie added to watch list")
                    {
                        this.setState({
                            watchList: true,
                            loggedIn: true,
                            username: result[1]
                        });
                    }
                    else if(status === 200 && result[0] === "Movie removed from watch list")
                    {
                        this.setState({
                            watchList: false,
                            loggedIn: true,
                            username: result[1]
                        });
                        if(this.state.type === "My Watch List")
                        {
                            this.props.removeMovieDisplay(this.state.index);
                        }
                    }
                    else if(status === 200 && result[0] === "Movie already on watch list")
                    {
                        alert(result[0]);
                        this.setState({
                            watchList: true,
                            loggedIn: true,
                            username: result[1]
                        });
                    }
                    else if(status === 200 && result[1] === "Movie already not on watch list")
                    {
                        alert(result[0]);
                        this.setState({
                            watchList: false,
                            loggedIn: true,
                            username: result[1]
                        });
                        if(this.state.type === "My Watch List")
                        {
                            this.props.removeMovieDisplay(this.state.index);
                        }
                    }
                    else
                    {
                        alert(result[0]);
                    }
                }
            });
    }

    movieWatchedHandler(event)
    {
        event.preventDefault();
        event.stopPropagation();

        if(!this.state.loggedIn)
        {
            // eventually need to show this..
            //this.props.showLoginPopUp(true);
            //return;

            this.setState({
                displaySignIn: true
            });
            // eventually need to show this..
            //this.props.showLoginPopUp(true);
            return;
        }

        const requestOptions = {
            method: 'POST',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json'},
            body: JSON.stringify({
                movieId: this.state.id
            })
        };

        let status = 0;
        let url = "http://localhost:9000/profile/" + this.state.username + "/add_to_watched";
        if(this.state.watched)
        {
            url = "http://localhost:9000/profile/" + this.state.username + "/remove_from_watched";
        }
        fetch(url, requestOptions)
            .then(res => {
                status = res.status;
                if(status !== 401)
                {
                    return res.json();
                }
                else
                {
                    return res.text();
                }
            }).then(result =>{
                // not logged in/cookie not found
                if(status === 401)
                {
                    this.props.updateLoggedIn("", false);
                    if(this.state.loggedIn)
                    {
                        this.setState({
                            loggedIn: false,
                            username: ""
                        })
                    }
                }
                else
                {
                    let username = result[1];
                    if(status === 200 && result[0] === "Movie added to movies watched list")
                    {
                        this.setState({
                            watched: true,
                            loggedIn: true,
                            username: result[1]
                        });
                    }
                    else if(status === 200 && result[0] === "Movie removed from watched movies list")
                    {
                        this.setState({
                            watched: false,
                            loggedIn: true,
                            username: result[1]
                        });
                        if(this.state.type === "My Watched Movies")
                        {
                            this.props.removeMovieDisplay(this.state.index);
                        }
                    }
                    else if(status === 200 && result[0] === "Movie already on movies watched list")
                    {
                        alert(result[0]);
                        this.setState({
                            watched: true,
                            loggedIn: true,
                            username: result[1]
                        });
                    }
                    else if(status === 200 && result[1] === "Movie already not on watched movies list")
                    {
                        alert(result[0]);
                        this.setState({
                            watched: false,
                            loggedIn: true,
                            username: result[1]
                        });
                        if(this.state.type === "My Watched Movies")
                        {
                            this.props.removeMovieDisplay(this.state.index);
                        }
                    }
                    else
                    {
                        alert(result[0]);
                    }
                }
            });
    }

    signInRemoveFunction = (username) =>
    {
        if(username !== undefined)
        {
            this.props.updateLoggedIn(username, true);
        }
        this.setState({
            displaySignIn: false,
            loggedIn: true,
            username: username
        });
    }

    render()
    {
        if(this.state.loading)
        {
            return null;
        }

        let signInPopup = "";
        if(this.state.displaySignIn)
        {
            signInPopup = <SignInPopup removeFunction={this.signInRemoveFunction} redirectOnLogin={false}/>;
        }

        let posterPath = "";
        if(this.state.poster !== null)
        {
            posterPath = "https://image.tmdb.org/t/p/original" + this.state.poster;
        }
        let moviePopup = "";
        if(this.state.moviePopup)
        {
            moviePopup = <MovieDisplayPopUp movie={this.state.movie} removeFunction={this.posterClickHandler}/>;
        }
        let watchListIcon = (
            <div className={`${style.watchListIconContainer}`}>
                <i class={`fa fa-eye ${style.watchListIcon} ${style.tooltip}`} onClick={(event) =>this.movieWatchListHandler(event)}>
                    <span class={style.tooltiptext}>Add to watch list</span>
                </i>
            </div>
        );
        if(this.state.watchList)
        {
            watchListIcon = (
                <div className={`${style.watchListIconContainer}`}>
                    <i class={`fa fa-eye ${style.watchListIconSelected} ${style.tooltip}`} onClick={(event) =>this.movieWatchListHandler(event)}>
                        <span class={style.tooltiptext}>Remove from watch list</span>
                    </i>
                </div>
            )
        }
        let watchedIcon = (
            <div className={`${style.watchedIconContainer}`} >
                <i class={`fa fa-star ${style.watchedIcon} ${style.tooltip}`} onClick={(event) => this.movieWatchedHandler(event)}>
                    <span class={style.tooltiptext}>Add to movies watched</span>
                </i>
            </div>
        );
        if(this.state.watched)
        {
            watchedIcon = (
                <div className={`${style.watchedIconContainer}`}>
                    <i class={`fa fa-star ${style.watchedIconSelected} ${style.tooltip}`} onClick={(event) => this.movieWatchedHandler(event)}>
                        <span class={style.tooltiptext}>Remove movie from watched</span>
                    </i>
                </div>
            );
        }

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
                {signInPopup}
            </div>
        )
    }

}

export default withRouter(MovieDisplay);
