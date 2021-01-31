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
            query: queryParams.query,
            type: queryParams.type,
            searchValue: queryParams.value,
            // boolean indicating if the search value changed due to new props coming in
            newValue: false,
            currentUser: this.props.currentUser,
            // need to rename this...
            movieIndex: 0,
            // if bad type
            redirect404: queryParams.redirect
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
    }

    static getDerivedStateFromProps(nextProps, nextState)
    {
        console.log("Get derived state from props: ");
        /*
        console.log("next props: ");
        console.log(nextProps);
        console.log("prev state: ");
        console.log(nextState);
        console.log(queryString.parse(nextProps.location.search).value);
        */
        let newSearchValue = queryString.parse(nextProps.location.search).value;
        let newType = queryString.parse(nextProps.location.search).type;
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
                type: queryString.parse(nextProps.location.search).type
            };
        }
        return null;
    }

    shouldComponentUpdate(nextProps, nextState)
    {
        console.log("Should componenet update:");
        console.log(this.props);
        console.log(nextProps);
        console.log(this.state);
        console.log(nextState);
        let newSearchValue = queryString.parse(nextProps.location.search).value;
        let oldSearchValue = this.state.type;
        let newType = queryString.parse(nextProps.location.search).type;
        let oldType = this.state.type;
        if(this.state.type !== nextState.type)
        {
            console.log("New type in state");
            return true;
        }
        else if(this.state.searchValue !== nextState.searchValue)
        {
            console.log("New search value detected in state");
            return true;
        }
        else if(this.state.loadingData !== nextState.loadingData)
        {
            console.log("Loading new data changed");
            return true;
        }
        else if(this.state.loading !== nextState.loading)
        {
            console.log("Loading changed");
            return true;
        }
        else if(this.state.currentUser !== this.props.currentUser)
        {
            console.log("User changed");
            return true;
        }
        else if(this.state.loadingNewData !== nextState.loadingNewData)
        {
            console.log("New data loaded from type change");
            return true;
        }
        else if(this.state.newValue !== nextState.newValue)
        {
            console.log("New value state changed");
            return true;
        }
        return false;
    }

    componentDidUpdate(prevProps, prevState)
    {
        console.log("Component did update");
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
            console.log("Search value in state changed");
            this.getSearchSuggestions(this.state.searchValue, undefined, this.state.newValue);
        }
        else if(prevState.type !== this.state.type)
        {
            console.log("Type in state changed");
            this.getSearchSuggestions(this.state.searchValue, undefined, this.state.newValue);
        }
        // don't think this is needed? but think about it
        // else if(this.props.currentUser !== prevProps.currentUser...)
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
        else if(type !== "all" && type !== "movies" && type !== "users")
        {
            // redirect to 404 page
            return {
                updated: true,
                query: "",
                type: "",
                value: "",
                redirect: true
            }
        }
        if(updated)
        {
            let queryValue = (value === undefined) ? "" : "&value=" + value;
            query = "?type=" + type + queryValue;
        }
        return {
            updated: updated,
            query: query,
            type: type,
            value: (value === undefined) ? "" : value,
            redirect: false
        };
    }

    scrollEventHandler(event)
    {
        // if there is no more data to load return
        if(!this.state.moreData) return;
        let element = document.querySelector("." + style.mainBodyContainer);
        let mainElementHeight = parseFloat(getComputedStyle(document.querySelector("main")).height);
        let headerHeight = parseFloat(document.body.offsetHeight);
        // get the total height of the page
        let pageHeight = headerHeight + mainElementHeight;
        // if scrolled to 75% of the page, start loading new data
        if((pageHeight * .75) < parseFloat(window.pageYOffset))
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
        if(value.length < 1)
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
            max = 20;
            url = "http://localhost:9000/search/movies_title?value=" + value + "&offset=" + offset + "&max=" + max;
        }
        else if(type === "users")
        {
            max = 20;
            url = "http://localhost:9000/search/users?value=" + value + "&offset=" + offset + "&max=" + max;
        }
        let result = await apiGetJsonRequest(url);
        let status = result.[0];
        let message = result[1].message;
        let requester = result[1].requester;
        let res;
        if(type === "movies")
        {
            return this.getMoviesResultsHandler(status, message, result[1], offset, max, value);
        }
        else if(type === "users")
        {
            return this.getUsersResultsHandler(status, message, result[1], offset, max, value);
        }
        else
        {
            return this.getAllResultsHandler(status, message, result[1], offset, max, value);
        }
    }

    getAllResultsHandler(status, message, result, offset, max, value)
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
        }
        else
        {
            this.setState({
                searchValue: value
            });
        }
        return {};
    }

    getMoviesResultsHandler(status, message, result, offset, max, value)
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
            return {};
        }
    }

    getUsersResultsHandler(status, message, result, offset, max, value)
    {
        if(status === 200)
        {
            this.setState({
                movies: [],
                users: result.Users,
                searchValue: value,
                loading: false,
                loadingNewData: false
            });
            return {};
        }
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
            let className = (this.state.type === "all") ? style.movieContainer : style.movieContainer2;
            for(let movie of this.state.movies)
            {
                let html = (
                    <div className={className}>
                        <MovieDisplay
                            movie={movie}
                            type={""}
                            index={counter}
                            removeMovieDisplay={undefined}
                            setMessages={this.props.setMessages}
                            updateLoggedIn={this.props.updateLoggedIn}
                            showLoginPopUp={this.props.showLoginPopUp}
                            currentUser={this.state.currentUser}
                            key={counter}
                            showMovieInfo={false}
                            moviePosterStyle={{"min-height":"0px", "border-radius":"5px"}}
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
                            <div className={style.resultsShowAllButton} onClick={()=> {this.typeHandler("movies")}}>
                                <div>
                                    See More
                                </div>
                                <i className={`fas fa-angle-right ${style.showMoreIcon}`}/>
                            </div>
                        </div>
                        <div className={style.movieDisplayContainer} id="movieDisplayContainer">
                            <CarouselDisplay
                                items={movieDisplays}
                                id={"movieCarousel"}
                                itemContainerClass={style.movieContainer}
                                // used to make windowResizeEventHandler more efficint
                                maxVisibleItems={7}
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
        return movies;
    }

    generateUserDisplays()
    {
        let users = "";
        if((this.state.type === "all" || this.state.type === "users") && this.state.users.length > 0)
        {
            let userDisplays = [];
            let counter = 0;
            let className = (this.state.type === "all") ? style.userContainer : style.userContainer2;
            for(let user of this.state.users)
            {
                let html = (
                    <div className={className}>
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
                            <div className={style.resultsShowAllButton} onClick={()=> {this.typeHandler("users")}}>
                                <div>
                                    See More
                                </div>
                                <i className={`fas fa-angle-right ${style.showMoreIcon}`}/>
                            </div>
                        </div>
                        <div className={style.movieDisplayContainer} id="userDisplayContainer">
                            <CarouselDisplay
                                items={userDisplays}
                                id={"userCarousel"}
                                itemContainerClass={style.userContainer}
                                // used to make windowResizeEventHandler more efficint
                                maxVisibleItems={7}
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
        return users;
    }

    render()
    {
        console.log("Redering search page");
        if(this.state.loading) return null;
        let movies = this.generateMovieDisplays();
        let users = this.generateUserDisplays();
        let types = this.generateTypes();

        /*
        set up client side as far as you can first
            - need to do component did update/getDerivedStateFromProps
            - also do pagination behind the scenes by appending it to query string
            - fix see more to be a button
            - try to set it up to eventually handle advanced querying but don't go too far
            - fix resposive views/css, avoid duplication
        then fix api
            - need to do pagination
            - fix movies to query in order of values
            - users will eventually need fixed to like movies to
            pass various parameters
            - also do error handing on query values passed
        */

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
                    />
                </div>
                {types}
                {movies}
                {users}
            </div>
        );
    }
}

export default SearchPage;
