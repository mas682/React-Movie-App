import React, { Component } from 'react';
import {Link, Redirect, useLocation, withRouter} from 'react-router-dom';
import Alert from './Alert.js';
import queryString from "query-string";
import style from './css/Movies/moviefilterpages.module.css'
import MovieDisplay from './MovieDisplay.js';
import { useParams } from "react-router";
import {apiGetJsonRequest} from './StaticFunctions/ApiFunctions.js';
import {generateMessageState} from './StaticFunctions/StateGeneratorFunctions.js';
const moment = require('moment');

class MovieFilterPage extends React.Component {
    constructor(props){
        super(props);
        // getDerivedStateFromProps will set the state based off the props
        this.state = {
            header: "",
            movies: [],
            loading: true,
            // boolean used when going from one movie filter page to another
            // seperate from loading as loading can cause the page to return null
            // and do not want to dismount all movieDisplay components
            // needed so that shouldComponentUpdate catches that the new movies were loaded
            loadingNewData: false,
            // boolean for loading data on scroll
            loadingData: false,
            //boolean to indicate if more data to be pulled from api still
            moreData: true,
            offset: 0,
            startDate: undefined,
            queryString: "",
            currentUser: "",
            redirect: false
        };
        this.getMovies = this.getMovies.bind(this);
        this.apiCall = this.apiCall.bind(this);
        this.generateMovieDisplays = this.generateMovieDisplays.bind(this);
        this.removeMovieDisplay = this.removeMovieDisplay.bind(this);
        this.usersMoviesResultsHandler = this.usersMoviesResultsHandler.bind(this);
        this.apiMovieResultsHandler = this.apiMovieResultsHandler.bind(this);
        this.generateNewState = this.generateNewState.bind(this);
        this.scrollEventHandler = this.scrollEventHandler.bind(this);
    }

    static getDerivedStateFromProps(nextProps, prevState)
    {
        // if the page type changed
        if(nextProps.type !== prevState.header)
        {
            console.log("Type changed");
            // clear the messages on mount
            nextProps.setMessages({
                messages: undefined,
                clearMessages: true
            });
            //console.log("new type found in movie filter page");
            let result = MovieFilterPage.getNewStateFromProps(nextProps, true);
            let state = result.state;
            if(result.updated)
            {
                nextProps.history.replace({
                    pathname: nextProps.location.pathname,
                    search: state.queryString,
                });
            }
            return state;
        }
        // if the query parameters changed
        // checking the previous type as when going from one page to another, this will get hit if the type just changed
        else if((nextProps.location.search !== prevState.queryString) && (prevState.header === nextProps.type))
        {
            let result = MovieFilterPage.getNewStateFromProps(nextProps, true);
            // if the generated query string does not equal the new query string
            if(result.state.queryString !== prevState.queryString)
            {
                // clear the messages on mount
                nextProps.setMessages({
                    messages: undefined,
                    clearMessages: true
                });
                let state = result.state;
                if(result.updated)
                {
                    nextProps.history.replace({
                        pathname: nextProps.location.pathname,
                        search: state.queryString
                    });
                }
                return state;
            }
            else {
                // if the user went back to the exact same link
                if(result.updated)
                {
                    nextProps.history.replace({
                        pathname: nextProps.location.pathname,
                        search: result.state.queryString
                    });
                }
                if(nextProps.currentUser === "")
                {
                    return {
                        currentUser: ""
                    };
                }
                else
                {
                    return null;
                }
            }
        }
        else if(nextProps.currentUser === "")
        {
            return {
                currentUser: ""
            };
        }
        else
        {
            return null;
        }
    }

    static getNewStateFromProps(props, loadingNewData)
    {
        // generate the query string if not correct
        let queryResult = MovieFilterPage.updateMovieFilter(props);
        let query = queryResult.query;
        let startDate = queryResult.startDate;
        let state = {
            queryString: query,
            header: props.type,
            startDate: queryResult.startDate,
            // true if going from one movie filter page to another
            loadingNewData: loadingNewData,
            currentUser: props.currentUser,
            movies: [],
            moreData: true,
            offset: 0,
            loadingData: false
        };
        return {state: state, updated: queryResult.updated};
    }

    shouldComponentUpdate(nextProps, nextState)
    {
        /*
        console.log("Should componenet update");
        console.log(this.props);
        console.log(nextProps);
        console.log(this.state);
        console.log(nextState);
        */
        if(this.props.type !== nextProps.type)
        {
            //console.log("New type in props");
            return true;
        }
        else if(this.state.header !== nextState.header)
        {
            //console.log("New header in state");
            return true;
        }
        else if(this.state.queryString !== nextState.queryString)
        {
            //console.log("New query string in state");
            return true;
        }
        else if(this.state.loadingNewData !== nextState.loadingNewData)
        {
            //console.log("Loading new data changed");
            return true;
        }
        else if(this.state.loading !== nextState.loading)
        {
            //console.log("Loading changed");
            return true;
        }
        // if a movie is removed for some reason..
        else if(this.state.movies.length !== nextState.movies.length)
        {
            //console.log("Movie count changed");
            return true;
        }
        else if(this.state.currentUser !== nextState.currentUser)
        {
            //console.log("User chagned");
            return true;
        }
        else if(nextProps.currentUser !== this.props.currentUser)
        {
            //console.log("User chagned");
            return true;
        }
        else if(this.state.loadingData !== nextState.loadingData)
        {
            //console.log("Loading data changed");
            return true;
        }
        return false;
    }

    async componentDidUpdate(prevProps, prevState)
    {
        /*
        console.log("Component did update movie filter page");
        console.log(prevProps);
        console.log(this.props);
        console.log(prevState);
        console.log(this.state);
        */
        if(prevState.loading)
        {
            return;
        }
        // if the user changed
        else if(this.props.currentUser !== prevProps.currentUser)
        {
            // if the new user is not logged in
            if(this.props.currentUser === "")
            {
                // if on a page that you need to be logged in for
                if(this.props.type === "My Watch List" || this.props.type === "My Watched Movies")
                {
                    // set redirect to true as user should not be on this page
                    this.setState({redirect: true});
                    this.props.showLoginPopUp();
                }
                else
                {
                    //console.log("new user found in movie filter page");
                    this.generateNewState(this.props);
                }
            }
            else
            {
                //console.log("new user found in movie filter page");
                this.generateNewState(this.props);
            }
        }
        // if the page type changed
        else if(this.props.type !== prevProps.type)
        {
            //console.log("new type found in movie filter page");
            await this.generateNewState(this.props);
        }
        // if the query parameters changed
        // checking the previous type as when going from one page to another, this will get hit if the type just changed
        else if((prevState.queryString!== this.state.queryString) && (prevState.header === this.props.type))
        {
            //console.log("new parameters found in movie filter page");
            this.generateNewState(this.props);
        }
    }

    // called by componentDidUpdate when a change in the props is found
    async generateNewState()
    {
        let result = await this.getMovies(this.state.queryString, this.state.header, this.state.offset);
        let movies = (result.state.movies === undefined) ? [] : result.state.movies;
        let state = {...result.state};
        state.loadingNewData = false;
        state.movies = movies;
        this.setState(state);
        this.props.setMessages(result.messageState);
    }

    static updateMovieFilter(props) {
        let  queryParams = queryString.parse(props.location.search);
        let startDate = queryParams["release_date_gte"];
        let endDate = queryParams["release_date_lte"];
        let sorting = queryParams["sort"];
        let query = props.location.search;
        let updated = false;

        // if the watchlist/watched pages, no parameters are required at this time
        if(props.type === "Upcoming Movies" || props.type === "New Releases")
        {
            let startDateResult = MovieFilterPage.generateStartDate(props.type, queryParams["release_date_gte"], props.location.search);
            let endDateResult = MovieFilterPage.generateEndDate(props.type, queryParams["release_date_lte"], startDateResult.query);
            let sortResult = MovieFilterPage.generateSorting(props.type, queryParams["sort"], endDateResult.query);
            startDate = startDateResult.startDate;
            endDate = endDateResult.endDate;
            sorting = sortResult.sort;
            query = sortResult.query;
            updated = false;
            // if any of these are true, the query string was updated
            if(startDateResult.changed || endDateResult.changed || sortResult.changed)
            {
                updated = true;
            }
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
                date.setYear(2020);
            }
            else if(type === "New Releases")
            {
                let month = date.getMonth();
                // go back 1 month, set to 3 for testing
                let newMonth = month - 6;
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

    async scrollEventHandler(event)
    {
        // if there is no more data to load return
        if(!this.state.moreData || this.state.loadingData) return;
        let element = document.querySelector("." + style.mainBodyContainer);
        let mainElementHeight = parseFloat(getComputedStyle(document.querySelector("main")).height);
        let headerHeight = parseFloat(document.body.offsetHeight);
        // get the total height of the page
        let pageHeight = headerHeight + mainElementHeight;
        // if scrolled to 75% of the page, start loading new data
        if((pageHeight * .75) < (parseFloat(window.pageYOffset) + parseFloat(window.innerHeight)))
        {
            // if already loading data, do nothing
            if(!this.state.loadingData)
            {
                this.setState({
                   loadingData: true
                });
                let result = await this.getMovies(this.state.queryString, this.state.header, this.state.offset);
                this.setState(result.state);
                this.props.setMessages(result.messageState);
            }
        }
    }

    componentWillUnmount()
    {
        document.removeEventListener('scroll', this.scrollEventHandler, {passive: true});
    }

    async componentDidMount()
    {
        document.addEventListener('scroll', this.scrollEventHandler, {passive: true});
        // clear the messages on mount
        this.props.setMessages({
            messages: undefined,
            clearMessages: true
        });
        // if the new user is not logged in
        if(this.state.currentUser === "")
        {
            // if on a page that you need to be logged in for
            if(this.state.header === "My Watch List" || this.state.header === "My Watched Movies")
            {
                // set redirect to true as user should not be on this page
                this.setState({
                    redirect: true,
                    loading: false
                });
                this.props.showLoginPopUp();
            }
            else
            {
                let result = await this.getMovies(undefined, this.state.header, this.state.offset);
                this.setState(result.state);
                this.props.setMessages(result.messageState);
            }
        }
        else
        {
            let result = await this.getMovies(undefined, this.state.header, this.state.offset);
            this.setState(result.state);
            this.props.setMessages(result.messageState);
        }
    }

    // function to handle call to api and result
    async getMovies(query, type, offset)
    {
        let movieData = await this.apiCall(query, type, offset);
        let status = movieData[0];
        let message = movieData[1].message;
        let username = movieData[1].requester;
        let result = movieData[1];
        if(type === "My Watch List" || type === "My Watched Movies")
        {
            return await this.usersMoviesResultsHandler(status, message, username, result, offset);
        }
        else
        {
            return await this.apiMovieResultsHandler(status, message, username, result, offset);
        }
    }

    async apiCall(query, type, offset)
    {
        let url = "";
        // params: title, revenue, director, runtime, rating, trailer, releasedate
        if(type === "My Watch List")
        {
            url = "http://localhost:9000/movies/my_watch_list?offset=" + offset + "&max=30";
        }
        else if(type === "My Watched Movies")
        {
            url = "http://localhost:9000/movies/my_watched_list?offset=" + offset + "&max=30";
        }
        else if(query === undefined)
        {
            url = "http://localhost:9000/search/movies" + this.state.queryString + "&offset=" + offset + "&max=30";
        }
        else
        {
            url = "http://localhost:9000/search/movies" + query + "&offset=" + offset + "&max=30";;
        }
        return await apiGetJsonRequest(url);
    }

    // handles both the watch list page and watched list page
    // api results
    usersMoviesResultsHandler(status, message, requester, result, offset)
    {
        if(status === 200)
        {
            this.props.updateLoggedIn(requester);
            let oldMovies = [...this.state.movies];
            return {
                state: {
                    movies: oldMovies.concat(result.movies),
                    currentUser: requester,
                    loading: false,
                    offset: offset + result.movies.length,
                    moreData: (result.movies.length === 30) ? true : false,
                    loadingData: false

                }
            };
        }
        else
        {
            this.props.updateLoggedIn(requester);
            if(status === 401)
            {
                // this will be dipslayed immediately but will be redirected to the home page
                // almost immediately to display there
                this.props.showLoginPopUp();
                return {
                    state: {
                        redirect: true,
                        loading: false
                    }
                };
            }
            else
            {
                return {
                    state: {
                        currentUser: requester,
                        loading: false,
                        moreData: false,
                        offset: 0
                    },
                    messageState: {
                        messages: [{message: message, type: "failure"}],
                        clearMessages: true,
                    }
                };
            }
        }
    }

    // funciton to handle api results for pages such as upcoming movies,
    // new releases, etc.
    // utilize the search api
    apiMovieResultsHandler(status, message, requester, result, offset)
    {
        if(status === 200)
        {
            let oldMovies = [...this.state.movies];
            this.props.updateLoggedIn(requester);
            return {
                state: {
                    movies: oldMovies.concat(result.movies),
                    currentUser: requester,
                    loading: false,
                    offset: offset + result.movies.length,
                    moreData: (result.movies.length === 30) ? true : false,
                    loadingData: false
                }
            };
        }
        else
        {
            this.props.updateLoggedIn(requester);
            if(status === 404)
            {
                // if this occurs, some query parameter was invalid,
                // or too may query parameters provided
                // should redirect to 404 page
                let messageCount = this.state.messageId + 1;
                return {
                    state: {
                        currentUser: requester,
                        loading: false,
                        moreData: false,
                        offset: 0
                    },
                    messageState: {
                        messages: [{message: message, type: "failure"}],
                        clearMessages: true
                    }
                };
            }
            else
            {
                return {
                    state: {
                        currentUser: requester,
                        loading: false
                    },
                    messageState: {
                        clearMessages: true,
                        messages: [{message: message, type: "failure"}],
                    }
                };
            }
        }
    }

    // remove a movie being displayed from the array of movies
    // used for watch list and movies watched
    removeMovieDisplay(index)
    {
        let updatedMovies = [...this.state.movies];
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
                        setMessages={this.props.setMessages}
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
        //alert("Rendering movie filter page");
        if(this.state.loading)
        {
            return null;
        }
        else if(this.state.redirect)
        {
            return <Redirect to="" />;
        }
        else if(this.state.currentUser === "" && (this.state.header === "My Watch List" || this.state.header === "My Watched Movies"))
        {
            return <Redirect to={"/"} />;
        }
        let movies = this.generateMovieDisplays();
        return (
            <React.Fragment>
                <div className={style.mainBodyContainer}>
                    <div className={style.headerContainer}>
                        <h1>{this.state.header}</h1>
                    </div>
                    <div className={style.movieDisplayContainer}>
                        {movies}
                    </div>
                </div>
            </React.Fragment>
        )
    }

}

export default MovieFilterPage;
