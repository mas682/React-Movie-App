import React, { Component } from 'react';
import {Link, Redirect, useLocation, withRouter} from 'react-router-dom';
import queryString from "query-string";
import style from './css/Movies/moviefilterpages.module.css'
import MovieDisplay from './MovieDisplay.js';
import { useParams } from "react-router";
import {apiGetJsonRequest} from './StaticFunctions/ApiFunctions.js';
const moment = require('moment');

class MovieFilterPage extends React.Component {
    constructor(props){
        super(props);
        // the function returns the query string and the start date
        // made this function as these steps are also done when
        // recieving new props
        let values = MovieFilterPage.updateMovieFilter(this.props);
        let query = values.query;
        let startDate = values.startDate;
        this.state = {
            header: this.props.type,
            movies: [],
            loading: true,
            startDate: startDate,
            queryString: query,
            currentUser: this.props.currentUser
        };
        // if the query parameters were updated
        if(values.updated)
        {
            this.props.history.replace({
                pathname: this.props.location.pathname,
                search: query
            });
        }
        this.getMovies = this.getMovies.bind(this);
        this.apiCall = this.apiCall.bind(this);
        this.generateMovieDisplays = this.generateMovieDisplays.bind(this);
        this.removeMovieDisplay = this.removeMovieDisplay.bind(this);
        this.usersMoviesResultsHandler = this.usersMoviesResultsHandler.bind(this);
        this.apiMovieResultsHandler = this.apiMovieResultsHandler.bind(this);
        this.generateNewState = this.generateNewState.bind(this);
    }

    componentDidUpdate(prevProps, prevState)
    {
        // if the user changed
        if(!prevState.loading && (this.props.currentUser !== prevProps.currentUser))
        {
            console.log("new user found in movie filter page");
            this.generateNewState(this.props);
        }
        // if the page type changed
        else if(!prevState.loading && (this.props.type !== prevProps.type))
        {
            console.log("new type found in movie filter page");
            this.generateNewState(this.props);
        }
        // if the query parameters changed
        // checking the previous type as when going from one page to another, this will get hit if the type just changed
        else if(!prevState.loading && (this.props.location.search !== this.state.queryString) && (prevState.header === this.props.type))
        {
            console.log("new parameters found in movie filter page");
            this.generateNewState(this.props);
        }
    }

    // called by componentDidUpdate when a change in the props is found
    async generateNewState(props)
    {
        let queryResult = MovieFilterPage.updateMovieFilter(props);
        let query = queryResult.query;
        let startDate = queryResult.startDate;
        let result = await this.getMovies(query, props.type);
        let movies = (result.movies === undefined) ? [] : result.movies;
        let currentUser = result.currentUser;
        this.setState({
            header: this.props.type,
            movies: movies,
            loading: false,
            startDate: startDate,
            queryString: query,
            currentUser: currentUser
        });
        // if the query parameters changed
        if(queryResult.updated)
        {
            props.history.replace({
                pathname: this.props.location.pathname,
                search: query
            });
        }
    }

    static updateMovieFilter(props) {
        let queryParams = queryString.parse(props.location.search);
        let startDateResult = MovieFilterPage.generateStartDate(props.type, queryParams["release_date_gte"], props.location.search);
        let endDateResult = MovieFilterPage.generateEndDate(props.type, queryParams["release_date_lte"], startDateResult.query);
        let sortResult = MovieFilterPage.generateSorting(props.type, queryParams["sort"], endDateResult.query);
        let startDate = startDateResult.startDate;
        let endDate = endDateResult.endDate;
        let sorting = sortResult.sort;
        let query = sortResult.query;
        let updated = false;
        // if any of these are true, the query string was updated
        if(startDateResult.changed || endDateResult.changed || sortResult.changed)
        {
            updated = true;
        }
        return {
            query: query,
            startDate: startDate,
            updated: updated
        };;
    }

    // function to generate the start date for the query string if not defined
    // type is the type of page the user is on
    // startDate is either the startDate query parameter or undefined
    // queryString is the queryString to append the parameter value to
    static generateStartDate(type, startDate, queryString)
    {
        let changed = false;
        if(startDate === undefined)
        {
            changed = true;
            let date = new Date();
            if(type === "Upcoming Movies")
            {
                // these are for testing, will be removed
                date.setMonth(8);
                date.setDate(1);
            }
            else if(type === "New Releases")
            {
                let month = date.getMonth();
                // go back 1 month, set to 3 for testing
                let newMonth = month - 3;
                if(month === 0)
                {
                    newMonth = 11;
                }
                date.setMonth(newMonth);
            }
            startDate = moment(date).format('YYYY-MM-DD');
            if(queryString.length > 0)
            {
                queryString = queryString + "&release_date_gte=" + startDate;
            }
            else
            {
                queryString = "?release_date_gte=" + startDate;
            }
        }
        return {
            changed: changed,
            query: queryString.toString(),
            startDate: startDate
        };
    }

    // function to generate the end date for the query string
    // if not defined
    // type is the type of page the user is on
    // endDate is either the endDate query parameter or undefined
    // queryString is the queryString to append the parameter value to
    static generateEndDate(type, endDate, queryString)
    {
        let changed = false;
        if(endDate === undefined && type === "New Releases")
        {
            changed = true;
            let date = new Date();
            endDate = moment(date).format('YYYY-MM-DD');
            if(queryString.length > 0)
            {
                queryString = queryString + "&release_date_lte=" + endDate
            }
            else
            {
                queryString = "?release_date_lte=" + endDate
            }
        }
        return {
            changed: changed,
            query: queryString.toString(),
            endDate: endDate
        };
    }

    // function to generate the sort for the query string
    // type is the type of page the user is on
    // sorting is either the sorting query parameter or undefined
    // queryString is the queryString to append the parameter value to
    static generateSorting(type, sorting, queryString)
    {
        let changed = false;
        let sortOrder = sorting;
        if(sorting === undefined)
        {
            changed = true;
            sortOrder = "release_date_asc";
            if(type === "New Releases")
            {
                sortOrder = "release_date_desc";
            }
            if(queryString.length > 0)
            {
                queryString = queryString + "&sort=" + sortOrder;
            }
            else
            {
                queryString = "?sort=" + sortOrder;
            }
        }
        return {
            chnaged: changed,
            sort: sortOrder,
            query: queryString.toString()
        };
    }

    async componentDidMount()
    {
        let result = await this.getMovies(undefined, this.state.header);
        this.setState(result);
    }

    // function to handle call to api and result
    async getMovies(query, type)
    {
        let movieData = await this.apiCall(query, type);
        let status = movieData[0];
        let message = movieData[1].message;
        let username = movieData[1].requester;
        let result = movieData[1];
        if(type === "My Watch List" || type === "My Watched Movies")
        {
            return await this.usersMoviesResultsHandler(status, message, username, result);
        }
        else
        {
            return await this.apiMovieResultsHandler(status, message, username, result);
        }
    }

    async apiCall(query, type)
    {
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
        return await apiGetJsonRequest(url);
    }

    // handles both the watch list page and watched list page
    // api results
    usersMoviesResultsHandler(status, message, requester, result)
    {
        if(status === 200)
        {
            this.props.updateLoggedIn(requester);
            this.setState({
              movies: result.movies,
              currentUser: requester,
              loading: false
            });
        }
        else
        {
            alert(message);
            this.props.updateLoggedIn(requester);
            if(status === 401)
            {
                // this will be dipslayed immediately but will be redirected to the home page
                // almost immediately to display there
                this.props.showLoginPopUp(true);
            }
            else if(status === 404)
            {
                alert(message);
                // if this occurs, the user was not found but this should never
                // really occur as a 401 should come instead I think
                this.setState({
                    currentUser: requester,
                    loading: false
                });
            }
            else
            {
                this.setState({
                    loading: false,
                });
            }
        }
    }

    // funciton to handle api results for pages such as upcoming movies,
    // new releases, etc.
    // utilize the search api
    apiMovieResultsHandler(status, message, requester, result)
    {
        if(status === 200)
        {
            this.props.updateLoggedIn(requester);
            return {
              movies: result.movies,
              currentUser: requester,
              loading: false
            };
        }
        else
        {
            alert(message);
            this.updateLoggedIn(requester);
            if(status === 404)
            {
                alert(message);
                // if this occurs, some query parameter was invalid,
                // or too may query parameters provided
                // should redirect to 404 page
                return {
                    currentUser: requester,
                    loading: false
                };
            }
            else
            {
                return {
                    currentUser: requester,
                    loading: false
                };
            }
        }
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
                    <MovieDisplay
                        movie={movie}
                        type={this.state.header}
                        index={index}
                        removeMovieDisplay={this.removeMovieDisplay}
                        updateLoggedIn={this.props.updateLoggedIn}
                        showLoginPopUp={this.props.showLoginPopUp}
                        currentUser={this.state.currentUser}
                        key={index}
                    />
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
        else if(!this.state.currentUser && (this.state.header === "My Watch List" || this.state.header === "My Watched Movies"))
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
