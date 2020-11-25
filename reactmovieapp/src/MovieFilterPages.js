import React, { Component } from 'react';
import {Link, Redirect, useLocation, withRouter} from 'react-router-dom';
import queryString from "query-string";
import style from './css/Movies/moviefilterpages.module.css'
import MovieDisplay from './MovieDisplay.js';
import { useParams } from "react-router";
const moment = require('moment');

class MovieFilterPage extends React.Component {
    constructor(props){
        super(props);

        // the function returns the query string and the start date
        // made this function as these steps are also done when
        // recieving new props
        let values = this.updateMovieFilter(false, this.props);
        let query = values[0];
        let startDate = values[1];
        this.state = {
            header: this.props.type,
            movies: [],
            loading: true,
            startDate: startDate,
            queryString: query,
            loggedIn: false,
            username: ""
        };
        this.getMovies = this.getMovies.bind(this);
        this.apiCall = this.apiCall.bind(this);
        this.generateMovieDisplays = this.generateMovieDisplays.bind(this);
        this.updateMovieFilter = this.updateMovieFilter.bind(this);
        this.removeMovieDisplay = this.removeMovieDisplay.bind(this);
    }

    remove this...
    componentWillReceiveProps(nextProps) {
        // currently any time props are received, this will update them
        // but may need to test the query string??
        let query = this.updateMovieFilter(true, nextProps);
        this.getMovies(query, nextProps.type);
    };

    updateMovieFilter(newProps, props) {
        let queryParams = queryString.parse(props.location.search);
        let startDate = queryParams["release_date_gte"];
        let endDate = queryParams["release_date_lte"];
        let sorting = queryParams["sort"];
        let query = props.location.search;
        if(props.type === "Upcoming Movies")
        {
            if(startDate === undefined || sorting === undefined)
                if(startDate === undefined)
                {
                    let date = new Date();
                    // these are for testing, will be removed
                    date.setMonth(8);
                    date.setDate(1);
                    startDate = moment(date).format('YYYY-MM-DD');
                    query = "?release_date_gte=" + startDate;
                    if(props.location.search.length > 0)
                    {
                        query = props.location.search + "&release_date_gte=" + startDate;
                    }
                }
                if(sorting === undefined)
                {
                    query = query + "&sort=release_date_asc";
                }
                window.history.replaceState(null, "Upcoming Movies", query);

        }
        else if(props.type === "New Releases")
        {
            if(startDate === undefined || endDate === undefined || sorting === undefined)
            {
                if(startDate === undefined)
                {
                    let date = new Date();
                    let month = date.getMonth();
                    // go back 1 month
                    // set to 2 for testing
                    let newMonth = month - 2;
                    if(month === 0)
                    {
                        newMonth = 11;
                    }
                    date.setMonth(newMonth);
                    startDate = moment(date).format('YYYY-MM-DD');
                    query = "?release_date_gte=" + startDate;
                    if(props.location.search.length > 0)
                    {
                        query = props.location.search + "&release_date_gte=" + startDate;
                    }
                }
                if(endDate === undefined)
                {
                    let date = new Date();
                    endDate = moment(date).format('YYYY-MM-DD');
                    query = query + "&release_date_lte=" + endDate
                }
                if(sorting === undefined)
                {
                    query = query + "&sort=release_date_desc";
                }
                window.history.replaceState(null, "Upcoming Movies", query);
            }
            else
            {
                startDate = queryParams["release_date_gte"]
            }
        }
        if(newProps)
        {
            this.setState({
                header: props.type,
                movies: [],
                loading: false,
                startDate: startDate,
                queryString: query
            });
            return query;
        }
        else
        {
            return [query, startDate];
        }
    }

    async componentDidMount()
    {
        this.getMovies(undefined, this.state.header);
    }

    // function to handle call to api and result
    async getMovies(query, type)
    {
        let movieData = await this.apiCall(query, type);
        let status = movieData[0];
        if(status === 200)
        {
            let loggedIn = false;
            let username = movieData[1][1];
            if(username !== "")
            {
                loggedIn = true;
            }
            this.props.updateLoggedIn(username, loggedIn);
            this.setState({
              movies: movieData[1][0],
              username: username,
              loggedIn: loggedIn,
              loading: false
            });
        }
        else if(status === 401)
        {
            // if not logged in, update the header so it knows user not logged in
            this.props.updateLoggedIn("", false);
            // also show the login pop up
            // this will be dipslayed immediately but will be redirected to the home page
            // almost immediately to display there
            this.props.showLoginPopUp(true);
            this.setState({
                loggedIn: false,
                username: ""
            });
        }
        else if(status === 404)
        {
            alert(movieData[1][0]);
            let username = movieData[1][1];
            let loggedIn = false;
            if(username !== "")
            {
                loggedIn = true;
            }
            this.props.updateLoggedIn(username, loggedIn);
            this.setState({
                username: username,
                loggedIn: loggedIn,
                loading: false
            });
        }
        else
        {
            alert(movieData[1][0]);
            this.setState({
                loading: false,
            });
        }
    }

    apiCall(query, type)
    {
        // Simple POST request with a JSON body using fetch
        const requestOptions = {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
        };

        let status = 0;
        let url = "";
        // params: title, revenue, director, runtime, rating, trailer, releasedate
        if(type === "My Watch List")
        {
            url = "http://localhost:9000/movies/my_watch_list";
        }
        else if(type === "My Watched Movies")
        {
            url = "http://localhost:9000/movies/my_watched_list";
        }
        else if(query === undefined)
        {
            url = "http://localhost:9000/search/movies/" + this.state.queryString;
        }
        else
        {
            url = "http://localhost:9000/search/movies/" + query;
        }

        return fetch(url, requestOptions)
            .then(res => {
                status = res.status;
                return res.json()
            }).then(result=> {
                return [status, result];
            });
    }

    // remove a movie being displayed from the array of movies
    // used for watch list and movies watched
    removeMovieDisplay(index)
    {
        let updatedMovies = this.state.movies;
        updatedMovies.splice(index, 1);
        this.setState({
            movies: updatedMovies
        });
    }

    generateMovieDisplays()
    {
        let movies = [];
        this.state.movies.forEach((movie, index) => {
            let html = (
                <div className={style.movieContainer}>
                    <MovieDisplay movie={movie} type={this.state.header} index={index} removeMovieDisplay={this.removeMovieDisplay} updateLoggedIn={this.props.updateLoggedIn} username={this.state.username} loggedIn={this.state.loggedIn}/>
                </div>
            );
            movies.push(html);
        });
        return movies;

    }

    render()
    {
        if(this.state.loading)
        {
            return null;
        }
        else if(!this.state.loggedIn && (this.state.header === "My Watch List" || this.state.header === "My Watched Movies"))
        {
            return <Redirect to={"/"} />;
        }
        let movies = this.generateMovieDisplays();

        return (
            <div className={style.mainBodyContainer}>
                <div className={style.headerContainer}>
                    <h1>{this.state.header}</h1>
                </div>
                <div className={style.movieDisplayContainer}>
                    {movies}
                </div>
            </div>
        )
    }

}

export default MovieFilterPage;
