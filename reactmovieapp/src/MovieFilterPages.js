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

        // will need fixed
        props.updateLoggedIn("admin", true);
        let queryParams = queryString.parse(this.props.location.search);
        console.log(queryParams);
        let startDate = queryParams["release_date_gte"];
        let endDate = queryParams["release_date_lte"];
        let sorting = queryParams["sort"];
        let query = this.props.location.search;
        if(this.props.type === "Upcoming Movies")
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
                    if(this.props.location.search.length > 0)
                    {
                        query = this.props.location.search + "&release_date_gte=" + startDate;
                    }
                }
                if(sorting === undefined)
                {
                    query = query + "&sort=release_date_asc";
                }
                window.history.replaceState(null, "Upcoming Movies", query);

        }
        else if(this.props.type === "New Releases")
        {
            if(startDate === undefined || endDate === undefined || sorting === undefined)
            {
                if(startDate === undefined)
                {
                    let date = new Date();
                    let month = date.getMonth();
                    // go back 1 month
                    let newMonth = month - 1;
                    if(month === 0)
                    {
                        newMonth = 11;
                    }
                    date.setMonth(newMonth);
                    startDate = moment(date).format('YYYY-MM-DD');
                    query = "?release_date_gte=" + startDate;
                    if(this.props.location.search.length > 0)
                    {
                        query = this.props.location.search + "&release_date_gte=" + startDate;
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
        this.state = {
            header: this.props.type,
            movies: [],
            loading: false,
            startDate: startDate,
            queryString: query
        };
        this.getMovies = this.getMovies.bind(this);
        this.apiCall = this.apiCall.bind(this);
        this.generateMovieDisplays = this.generateMovieDisplays.bind(this);
    }

    // called when component receiving new props
    // may or may not be needed
    componentWillReceiveProps(nextProps) {

    };

    /* for testing, this will not actually be used here */
    async componentDidMount()
    {
        this.getMovies("upcoming");
    }

    // function to handle call to api and result
    async getMovies(type)
    {
        let movieData = await this.apiCall(type);
        let status = movieData[0];
        if(status === 200)
        {
            console.log("Movie Info");
            console.log(movieData[1]);
            this.setState({
              movies: movieData[1]
            });
        }
        else
        {
            alert("Movie request failed");
        }
    }

    apiCall(type)
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
        if(type === "upcoming")
        {
            url = "http://localhost:9000/search/movies/" + this.state.queryString;
        }
        //url = "http://localhost:9000/search/movies/?date_gt=9-20-20";
        return fetch(url, requestOptions)
            .then(res => {
                status = res.status;
                if(status === 200)
                {
                    return res.json();
                }
                else
                {
                    return res.text();
                }
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
                    <MovieDisplay movie={movie}/>
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
