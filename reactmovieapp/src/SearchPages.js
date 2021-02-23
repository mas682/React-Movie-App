import React, { Component } from 'react';
import {Link, Redirect, useLocation, withRouter} from 'react-router-dom';
import Alert from './Alert.js';
import SearchDropDown from './SearchDropDown.js';
import MovieDisplay from './MovieDisplay.js';
import CarouselDisplay from './CarouselDisplay.js';
import UserDisplay from './UserDisplay.js';
import style from './css/SearchPage/SearchPage.module.css';
import queryString from "query-string";
import {apiGetJsonRequest} from './StaticFunctions/ApiFunctions.js';
import {generateMessageState} from './StaticFunctions/StateGeneratorFunctions.js';
import {getErrorDisplay} from './StaticFunctions/ErrorHtmlFunctions.js';
import MovieDisplayPopUp from './MovieDisplayPopUp.js';

class SearchPage extends React.Component {
    constructor(props){
        super(props);
        // may want to do this in getDerivedStateFromProps
        let queryParams = SearchPage.updateSearchFilter(props);
        this.state = {
            loading: true,
            // boolean for loading data on type change
            loadingNewData: false,
            // boolean for loading data on scroll
            loadingData: false,
            offset: 0,
            // boolean to indicate if more data to be pulled from api still
            // false if on last pull, less than max records were returned from api
            moreData: true,
            movies: [],
            users: [],
            type: queryParams.type,
            searchValue: queryParams.value,
            // boolean indicating if the search value changed due to new props coming in
            newValue: false,
            currentUser: this.props.currentUser,
            // need to rename this...
            movieIndex: 0,
            // if bad type
            redirect404: queryParams.redirect,
            // show movie popup display
            moviePopup: false,
            // the movie whose pop up should be displayed
            popupMovie: {},
            errorMessage: ""
        };
        console.log(queryParams);
        if(queryParams.updated)
        {
            props.history.replace({
                pathname: props.location.pathname,
                search: queryParams.query,
                state: {newValue: false}
            });
        }
        this.getSearchSuggestions = this.getSearchSuggestions.bind(this);
        this.generateMovieDisplays = this.generateMovieDisplays.bind(this);
        this.forwardButtonHandler = this.forwardButtonHandler.bind(this);
        this.backwardButtonHandler = this.backwardButtonHandler.bind(this);
        this.generateUserDisplays = this.generateUserDisplays.bind(this);
        this.typeHandler = this.typeHandler.bind(this);
        this.generateTypes = this.generateTypes.bind(this);
        this.scrollEventHandler = this.scrollEventHandler.bind(this);
        this.getAllResultsHandler = this.getAllResultsHandler.bind(this);
        this.getMoviesResultsHandler = this.getMoviesResultsHandler.bind(this);
        this.getUsersResultsHandler = this.getUsersResultsHandler.bind(this);
        this.setNewValue = this.setNewValue.bind(this);

        this.movieClickHandler = this.movieClickHandler.bind(this);
        this.removeMovieDisplay = this.removeMovieDisplay.bind(this);
    }

    componentDidMount()
    {
        document.addEventListener('scroll', this.scrollEventHandler, {passive: true});
        if(this.state.searchValue !== "")
        {
            this.getSearchSuggestions(this.state.searchValue);
        }
        else
        {
            this.setState({
                loading: false
            });
        }
        // clear the messages on mount
        this.props.setMessages({
            message: undefined,
            clearMessages: true
        });
    }

    static getDerivedStateFromProps(nextProps, nextState)
    {
        console.log("Get derived state from props: ");
        /*
        console.log("next props: ");
        console.log(nextProps);
        console.log("prev state: ");
        console.log(nextState);
        */

        let newSearchValue = queryString.parse(nextProps.location.search).value;
        newSearchValue = (newSearchValue === undefined) ? "" : newSearchValue;
        if(newSearchValue.length > 250)
        {
            newSearchValue = newSearchValue.substring(0, 250);
        }
        let newType = queryString.parse(nextProps.location.search).type;
        newType = (newType === undefined) ? "" : newType;
        let errorMessage = "";
        if(newType !== "all" && newType !== "movies" && newType !== "users")
        {
            errorMessage = "The search type \"" + newType + "\" does not exist";
        }
        if(nextState.searchValue !== newSearchValue || nextState.type !== newType)
        {
            console.log("Search value or type change found");
            let newValue = (nextProps.location.state === undefined) ? false : nextProps.location.state.newValue;
            return {
                searchValue: newSearchValue,
                offset: 0,
                moreData: true,
                newValue: newValue,
                loadingNewData: true,
                type: queryString.parse(nextProps.location.search).type,
                currentUser: nextProps.currentUser,
                errorMessage: errorMessage
            };
        }
        else if(nextState.currentUser !== nextProps.currentUser)
        {
            return {
                currentUser: nextProps.currentUser,
                errorMessage: errorMessage
            }
        }
        else if(errorMessage !== nextState.errorMessage)
        {
            return {
                errorMessage: errorMessage
            }
        }
        return null;
    }

    shouldComponentUpdate(nextProps, nextState)
    {
        console.log("Should componenet update:");
        /*
        console.log(this.props);
        console.log(nextProps);
        console.log(this.state);
        console.log(nextState);
        */
        let newSearchValue = queryString.parse(nextProps.location.search).value;
        let oldSearchValue = this.state.type;
        let newType = queryString.parse(nextProps.location.search).type;
        let oldType = this.state.type;
        if(this.state.type !== nextState.type)
        {
            //console.log("New type in state");
            return true;
        }
        else if(this.state.searchValue !== nextState.searchValue)
        {
            //console.log("New search value detected in state");
            return true;
        }
        else if(this.state.loadingData !== nextState.loadingData)
        {
            //console.log("Loading new data changed");
            return true;
        }
        else if(this.state.loading !== nextState.loading)
        {
            //console.log("Loading changed");
            return true;
        }
        else if(this.state.currentUser !== nextState.currentUser)
        {
            //console.log("User changed");
            return true;
        }
        else if(this.state.loadingNewData !== nextState.loadingNewData)
        {
            //console.log("New data loaded from type change");
            return true;
        }
        else if(this.state.newValue !== nextState.newValue)
        {
            //console.log("New value state changed");
            return true;
        }
        else if(this.state.moviePopup !== nextState.moviePopup)
        {
            //console.log("Movie display click caused render");
            return true;
        }
        return false;
    }

    componentDidUpdate(prevProps, prevState)
    {
        //console.log("Component did update");
        /*
        console.log("Old props: ");
        console.log(prevProps);
        console.log("New props: ");
        console.log(this.props);
        console.log("Old state: ");
        console.log(prevState);
        console.log("New state: ");
        console.log(this.state);
        */

        if(prevState.loading)
        {
            return;
        }
        if(prevState.searchValue !== this.state.searchValue)
        {
            //console.log("Search value in state changed");
            // clear the messages on value change
            this.props.setMessages({
                message: undefined,
                clearMessages: true
            });
            this.getSearchSuggestions(this.state.searchValue, undefined, this.state.newValue);
        }
        else if(prevState.type !== this.state.type)
        {
            //console.log("Type in state changed");
            // clear the messages on type change
            this.props.setMessages({
                message: undefined,
                clearMessages: true
            });
            this.getSearchSuggestions(this.state.searchValue, undefined, this.state.newValue);
        }
        // don't think this is needed? but think about it
        // else if(this.props.currentUser !== prevProps.currentUser...)
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

    // remove a movie being displayed from the array of movies
    // used for watch list and movies watched
    removeMovieDisplay(index)
    {
        let updatedMovies = [...this.state.movies];
        updatedMovies.splice(index, 1);
        this.setState({
            movies: updatedMovies,
            moviePopup: false,
            popupMovie: undefined
        });
    }

    static updateSearchFilter(props) {
        let query = props.location.search;
        let queryParams = queryString.parse(query);
        let type = queryParams["type"];
        let value = queryParams["value"];
        let updated = false;
        if(type === undefined || type === "")
        {
            type = "all";
            updated = true;
        }
        if(value === undefined)
        {
            value = "";
            updated = true;
        }
        if(value.length > 250)
        {
            value = value.substring(0, 250);
            updated = true;
        }
        if(updated)
        {
            let queryValue = "&value=" + value;
            query = "?type=" + type + queryValue;
        }

        return {
            updated: updated,
            query: query,
            type: type,
            value: value,
            redirect: false
        };
    }

    scrollEventHandler(event)
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
                console.log("Get new data");
                this.getSearchSuggestions(this.state.searchValue, this.state.type);
            }
        }
    }

    forwardButtonHandler()
    {
        let movieContainers = document.querySelectorAll("." + style.movieContainer);
        let counter = 0;
        let widthString = "0px";
        while(counter < movieContainers.length)
        {
            let movieContainer = movieContainers[counter];
            if(counter === 0)
            {
                let style = getComputedStyle(movieContainer);
                let width = parseFloat(style.width);
                let margin = parseFloat(style.marginLeft) + parseFloat(style.marginRight);
                width = (width + margin) * -4 * (this.state.movieIndex + 1);
                widthString = width + "px";
            }
            movieContainer.style.transform = "translate3d(" + widthString + ", 0px, 0px)";
            counter = counter + 1;
        }
        this.setState({movieIndex: this.state.movieIndex + 1});
    }

    backwardButtonHandler()
    {
        let movieContainers = document.querySelectorAll("." + style.movieContainer);
        let counter = 0;
        let widthString = "0px";
        while(counter < movieContainers.length)
        {
            let movieContainer = movieContainers[counter];
            if(counter === 0)
            {
                let style = getComputedStyle(movieContainer);
                let width = parseFloat(style.width);
                let margin = parseFloat(style.marginLeft) + parseFloat(style.marginRight);
                width = (width + margin) * -4 * (this.state.movieIndex - 1);
                widthString = width + "px";
            }
            movieContainer.style.transform = "translate3d(" + widthString + ", 0px, 0px)";
            counter = counter + 1;
        }
        this.setState({movieIndex: this.state.movieIndex - 1});
    }

    // function to change the type to search for
    typeHandler(type)
    {
        if(this.state.type !== type)
        {
            this.props.history.replace({
                pathname: this.props.location.pathname,
                search: "?type=" + type + "&value=" + this.state.searchValue,
                state: {newValue: false}
            });
        }
    }

    // function called by SearchDropDown to set the value to search for
    setNewValue(value)
    {
        if(this.state.searchValue !== value)
        {
            this.props.history.replace({
                pathname: this.props.location.pathname,
                search: "?type=" + this.state.type + "&value=" + value,
                state: {newValue: false}
            });
        }
        return {};
    }

    // function to get suggestions for search bar
    async getSearchSuggestions(value, newValue)
    {
        let type = this.state.type;
        if(value.length < 1 || value.length > 250)
        {
            this.setState({
                movies: [],
                users: [],
                searchValue: value,
                type: type,
                offset: 0,
                newValue: (newValue === undefined) ? false : newValue,
                loadingNewData: false
            });
            return {};
        }
        // if the searchValue has changed, reset the offset
        let offset = (value === this.state.searchValue) ? this.state.offset : 0;
        let url = "";
        let max = 0;
        if(type === "all")
        {
            max = 20;
            url = "http://localhost:9000/search/query_all?value=" + value + "&offset=0&max=" + max;
        }
        else if(type === "movies")
        {
            max = 30;
            url = "http://localhost:9000/search/movies_title?value=" + value + "&offset=" + offset + "&max=" + max;
        }
        else if(type === "users")
        {
            max = 30;
            url = "http://localhost:9000/search/users?value=" + value + "&offset=" + offset + "&max=" + max;
            if(value.length > 20)
            {
                this.setState({
                    movies: [],
                    users: [],
                    searchValue: value,
                    loading: false,
                    loadingNewData: false,
                    newValue: false
                });
                return;
            }
        }
        else if(type !== "")
        {
            this.setState({
                movies: [],
                users: [],
                searchValue: value,
                loading: false,
                loadingNewData: false,
                newValue: false,
                errorMessage: "The search type \"" + type + "\" does not exist"
            });
            return;
        }
        let result = await apiGetJsonRequest(url);
        let status = result.[0];
        let message = result[1].message;
        let requester = result[1].requester;
        let res;
        if(type === "movies")
        {
            return this.getMoviesResultsHandler(status, message, result[1], requester, offset, max, value);
        }
        else if(type === "users")
        {
            return this.getUsersResultsHandler(status, message, result[1], requester, offset, max, value);
        }
        else
        {
            return this.getAllResultsHandler(status, message, result[1], requester, offset, max, value);
        }
    }

    getAllResultsHandler(status, message, result, requester, offset, max, value)
    {
        if(status === 200)
        {
            this.setState({
                movies: result.Movies,
                users: result.Users,
                searchValue: value,
                loading: false,
                loadingNewData: false,
                newValue: false
            });
            this.props.updateLoggedIn(requester);
        }
        else
        {
            this.props.updateLoggedIn(requester);
            if(status === 404)
            {
                // message: "The search path sent to the server does not exist",
                this.setState({
                    movies: [],
                    users: [],
                    searchValue: value,
                    loading: false,
                    loadingNewData: false,
                    newValue: false,
                    errorMessage: message
                });
            }
            else if(status === 400)
            {
                this.setState({
                    movies: [],
                    users: [],
                    searchValue: value,
                    loading: false,
                    loadingNewData: false,
                    newValue: false
                });
                if(message === "The maximum number of records to return per type is invalid")
                {
                    this.props.setMessages({
                        messages: [{type: "warning", message: message}]
                    });
                }
                // message: "The value to search for is invalid"
                    // in this scenario, could be invalid as string too long or no value provided
                    // so nothing is really wrong
            }
            else {
                this.setState({
                    movies: [],
                    users: [],
                    searchValue: value,
                    loading: false,
                    loadingNewData: false,
                    newValue: false
                });
                this.props.setMessages({
                    messages: [{type: "failure", message: message}]
                });
            }
        }
        return {};
    }

    getMoviesResultsHandler(status, message, result, requester, offset, max, value)
    {
        if(status === 200)
        {
            let movies = [...this.state.movies];
            this.setState({
                movies: (this.state.loadingData) ? movies.concat(result.Movies) : result.Movies,
                users: [],
                offset: offset + max,
                searchValue: value,
                // if the number of movies returned = max requested, there may be more
                moreData: (result.Movies.length === max) ? true : false,
                loadingData: false,
                loading: false,
                loadingNewData: false
            });
        }
        else
        {
            this.props.updateLoggedIn(requester);
            if(status === 404)
            {
                // message: "The search path sent to the server does not exist",
                this.setState({
                    movies: [],
                    users: [],
                    searchValue: value,
                    loading: false,
                    loadingNewData: false,
                    newValue: false,
                    errorMessage: message
                });
            }
            else if(status === 400)
            {
                this.setState({
                    movies: [],
                    users: [],
                    searchValue: value,
                    loading: false,
                    loadingNewData: false,
                    newValue: false
                });
                // messsage: "The maximum number of movies to return is invalid"
                // message: "The offset for the movies to return is invalid"
                if(message !== "The movie title is invalid.  Movie title be between 0-250 characters")
                {
                    this.props.setMessages({
                        messages: [{type: "warning", message: message}]
                    });
                }
            }
            else
            {
                this.setState({
                    movies: [],
                    users: [],
                    searchValue: value,
                    loading: false,
                    loadingNewData: false,
                    newValue: false
                });
                this.props.setMessages({
                    messages: [{type: "failure", message: message}]
                });
            }
        }
        return {};
    }

    getUsersResultsHandler(status, message, result, requester, offset, max, value)
    {
        if(status === 200)
        {
            let users = [...this.state.users];
            this.setState({
                movies: [],
                users: (this.state.loadingData) ? users.concat(result.Users) : result.Users,
                offset: offset + max,
                moreData: (result.Users.length === max) ? true : false,
                searchValue: value,
                loading: false,
                loadingNewData: false,
                loadingData: false
            });
        }
        else
        {
            if(status === 404)
            {
                // message: "The search path sent to the server does not exist",
                this.setState({
                    movies: [],
                    users: [],
                    searchValue: value,
                    loading: false,
                    loadingNewData: false,
                    newValue: false,
                    errorMessage: message
                });
            }
            else if(status === 400)
            {
                this.setState({
                    movies: [],
                    users: [],
                    searchValue: value,
                    loading: false,
                    loadingNewData: false,
                    newValue: false
                });
                // "The maximum number of users to return is invalid"
                // "The offset for the users to return is invalid"
                if(message !== "Username invalid.  Username must be between 0-20 characters.")
                {
                    this.props.setMessages({
                        messages: [{type: "warning", message: message}]
                    });
                }

            }
            else
            {
                this.setState({
                    movies: [],
                    users: [],
                    searchValue: value,
                    loading: false,
                    loadingNewData: false,
                    newValue: false
                });
                this.props.setMessages({
                    messages: [{type: "failure", message: message}]
                });
            }
        }
    }

    // function to generate the parameters to use in the link when the search
    // icon is clicked when the SearchDropDown is visible
    generateSearchClickURL(value)
    {
        // state is used if already on search page
        return {pathname: "/search", search: "?type=all&value=" + value, state: {newValue: true}};
    }

    generateTypes()
    {
        let searchAll = (
            <div className={style.typeButtonContainer}>
                <button className={`${style.typeButton} ${style.unselectedType}`} onClick={()=>{this.typeHandler("all")}}>All</button>
            </div>
        );
        if(this.state.type === "all")
        {
            searchAll = (
                <div className={style.typeButtonContainer}>
                    <button className={`${style.typeButton} ${style.selectedType}`} onClick={()=>{this.typeHandler("all")}}>All</button>
                </div>
            );
        }

        let searchMovies = (
            <div className={style.typeButtonContainer}>
                <button className={`${style.typeButton} ${style.unselectedType}`} onClick={()=>{this.typeHandler("movies")}}>Movies</button>
            </div>
        );
        if(this.state.type === "movies")
        {
            searchMovies = (
                <div className={style.typeButtonContainer}>
                    <button className={`${style.typeButton} ${style.selectedType}`} onClick={()=>{this.typeHandler("movies")}}>Movies</button>
                </div>
            );
        }

        let searchUsers = (
            <div className={style.typeButtonContainer}>
                <button className={`${style.typeButton} ${style.unselectedType}`} onClick={()=>{this.typeHandler("users")}}>Users</button>
            </div>
        );
        if(this.state.type === "users")
        {
            searchUsers = (
                <div className={style.typeButtonContainer}>
                    <button className={`${style.typeButton} ${style.selectedType}`} onClick={()=>{this.typeHandler("users")}}>Users</button>
                </div>
            );
        }

        return (
            <div className={style.typeContainer}>
                {searchAll}
                {searchMovies}
                {searchUsers}
            </div>
        );
    }

    // if showing multiple types, use this
    generateMovieDisplays()
    {
        let movies = "";
        if((this.state.type === "movies" || this.state.type === "all") && this.state.movies.length > 0)
        {
            let movieDisplays = [];
            let counter = 0;
            for(let movie of this.state.movies)
            {
                let html = (
                    <div className={style.movieContainer}>
                        <MovieDisplay
                            movie={movie}
                            type={"search"}
                            index={counter}
                            removeMovieDisplay={undefined}
                            setMessages={this.props.setMessages}
                            updateLoggedIn={this.props.updateLoggedIn}
                            showLoginPopUp={this.props.showLoginPopUp}
                            currentUser={this.state.currentUser}
                            key={counter}
                            showMovieInfo={false}
                            posterClickHandler={this.movieClickHandler}
                        />
                    </div>
                );
                movieDisplays.push(html);
                counter = counter + 1;
            }
            if(this.state.type === "all")
            {
                movies = (
                    <div className={style.resultsContainer}>
                        <div className={style.resultsHeader}>
                            <div className={style.resultType}>
                                Movies
                            </div>
                            <div className={style.resultsShowAllButtonContainer} onClick={()=> {this.typeHandler("movies")}}>
                                <button className={style.resultsShowAllButton}>
                                <div>
                                    See More
                                </div>
                                <i className={`fas fa-angle-right ${style.showMoreIcon}`}/>
                                </button>
                            </div>
                        </div>
                        <div className={style.movieDisplayContainer} id="movieDisplayContainer">
                            <CarouselDisplay
                                items={movieDisplays}
                                id={"movieCarousel"}
                                itemContainerClass={style.movieContainer}
                                // used to make windowResizeEventHandler more efficint
                                maxVisibleItems={6}
                            />
                        </div>
                    </div>
                )
            }
            else if(this.state.type === "movies")
            {
                movies = (
                    <div className={style.resultsContainer}>
                        <div className={style.resultsHeader}>
                            <div className={style.resultType}>
                                Movies
                            </div>
                        </div>
                        <div className={style.displayAllContainer}>
                            {movieDisplays}
                        </div>
                    </div>
                );
            }
        }
        else if((this.state.type === "movies" || this.state.type === "all") && this.state.movies.length < 1 && this.state.searchValue.length > 0)
        {
            movies = (
                <div className={style.resultsContainer}>
                    <div className={style.resultsHeader}>
                        <div className={style.resultType}>
                            Movies
                        </div>
                    </div>
                    <div className={`${style.displayAllContainer} ${style.noResultsText}`}>
                        No results to display for "{this.state.searchValue}"
                    </div>
                </div>
            );
        }
        return movies;
    }

    generateUserDisplays()
    {
        let users = "";
        if((this.state.type === "all" || this.state.type === "users") && this.state.users.length > 0)
        {
            let userDisplays = [];
            let counter = 0;
            for(let user of this.state.users)
            {
                let html = (
                    <div className={style.userContainer}>
                        <UserDisplay
                            user={user}
                            type={""}
                            index={counter}
                            setMessages={this.props.setMessages}
                            updateLoggedIn={this.props.updateLoggedIn}
                            showLoginPopUp={this.props.showLoginPopUp}
                            currentUser={this.state.currentUser}
                            key={counter}
                        />
                    </div>
                );
                userDisplays.push(html);
                counter = counter + 1;
            }
            if(this.state.type === "all")
            {
                users = (
                    <div className={style.resultsContainer}>
                        <div className={style.resultsHeader}>
                            <div className={style.resultType}>
                                Users
                            </div>
                            <div className={style.resultsShowAllButtonContainer} onClick={()=> {this.typeHandler("users")}}>
                                <button className={style.resultsShowAllButton}>
                                <div>
                                    See More
                                </div>
                                <i className={`fas fa-angle-right ${style.showMoreIcon}`}/>
                                </button>
                            </div>
                        </div>
                        <div className={style.movieDisplayContainer} id="userDisplayContainer">
                            <CarouselDisplay
                                items={userDisplays}
                                id={"userCarousel"}
                                itemContainerClass={style.userContainer}
                                // used to make windowResizeEventHandler more efficint
                                maxVisibleItems={6}
                            />
                        </div>
                    </div>
                );
            }
            else if(this.state.type === "users")
            {
                users = (
                    <div className={style.resultsContainer}>
                        <div className={style.resultsHeader}>
                            <div className={style.resultType}>
                                Users
                            </div>
                        </div>
                        <div className={style.displayAllContainer}>
                            {userDisplays}
                        </div>
                    </div>
                );
            }

        }
        else if((this.state.type === "users" || this.state.type === "all") && this.state.users.length < 1 && this.state.searchValue.length > 0)
        {
            users = (
                <div className={style.resultsContainer}>
                    <div className={style.resultsHeader}>
                        <div className={style.resultType}>
                            Users
                        </div>
                    </div>
                    <div className={`${style.displayAllContainer} ${style.noResultsText}`}>
                        No results to display for "{this.state.searchValue}"
                    </div>
                </div>
            );
        }
        return users;
    }

    render()
    {
        console.log("Redering search page");
        if(this.state.loading) return null;
        if(this.state.errorMessage !== "")
        {
            return getErrorDisplay(this.state.errorMessage);
        }
        let movies = this.generateMovieDisplays();
        let users = this.generateUserDisplays();
        let types = this.generateTypes();

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
                            type = {this.state.type}
                            setMessages={this.props.setMessages}
                            loadData={true}
                        />;
        }

        return (
            <div className={style.mainBodyContainer}>
                <div className={style.searchBarContainer}>
                    <SearchDropDown
                        newValue={this.state.newValue}
                        value={this.state.searchValue}
                        showSearchIcon={true}
                        allowNoSuggestion={true}
                        getSuggestions={this.setNewValue}
                        multipleTypes={true}
                        valueKeys={{Movies:"title", Users: "username"}}
                        redirectPaths={{Movies: {path:"/movie/", key:"id"}, Users: {path:"/profile/",key:"username"}}}
                        showSuggestions={false}
                        placeHolder={"Find a movie or user"}
                        form={"searchPage"}
                        maxLength={250}
                    />
                </div>
                {types}
                {movies}
                {users}
                {moviePopup}
            </div>
        );
    }
}

export default SearchPage;
