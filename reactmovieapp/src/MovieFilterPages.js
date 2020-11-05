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

        let values = this.updateMovieFilter(false, this.props);
        let query = values[0];
        let startDate = values[1];
        // will need fixed
        props.updateLoggedIn("admin", true);
        this.state = {
            header: this.props.type,
            movies: [],
            loading: false,
            startDate: startDate,
            queryString: query,
            loggedIn: false,
            username: ""
        };
        this.getMovies = this.getMovies.bind(this);
        this.apiCall = this.apiCall.bind(this);
        this.generateMovieDisplays = this.generateMovieDisplays.bind(this);
        this.updateMovieFilter = this.updateMovieFilter.bind(this);
    }

    componentWillReceiveProps(nextProps) {
        // currently any time props are received, this will update them
        // but may need to test the query string??
        let query = this.updateMovieFilter(true, nextProps);
        this.getMovies(query);
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
        this.getMovies();
    }

    // function to handle call to api and result
    async getMovies(query)
    {
        let movieData = await this.apiCall(query);
        let status = movieData[0];
        let loggedIn = false;
        let username = movieData[1][1];
        if(username !== "")
        {
            loggedIn = true;
        }
        this.props.updateLoggedIn(username, loggedIn);
        if(status === 200)
        {
            console.log("Movie Info");
            console.log(movieData[1][0]);
            this.setState({
              movies: movieData[1][0],
              username: username,
              loggedIn: loggedIn
            });
        }
        else
        {
            alert(movieData[1][0]);
        }
    }

    apiCall(query)
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
        if(this.state.header === "My Watch List")
        {
            url = "http://localhost:9000/movies/my_watch_list";
        }
        else if(this.state.header === "My Watched Movies")
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
        console.log("query string");
        console.log(this.state.queryString);
        //url = "http://localhost:9000/search/movies/?date_gt=9-20-20";
        return fetch(url, requestOptions)
            .then(res => {
                status = res.status;
                return res.json();
            }).then(result=> {
                return [status, result];
            });
    }

    generateMovieDisplays()
    {
        let movies = [];
        this.state.movies.forEach((movie) => {
            let html = (
                <div className={style.movieContainer}>
                    <MovieDisplay movie={movie} updateLoggedIn={this.props.updateLoggedIn} showLoginPopUp={this.props.showLoginPopUp} username={this.state.username} loggedIn={this.state.loggedIn}/>
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
