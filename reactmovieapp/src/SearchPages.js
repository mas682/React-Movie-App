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
        this.state = {
            loading: false,
            movies: [],
            users: [],
            query: "",
            type: "all",
            searchValue: "",
            currentUser: this.props.currentUser,
            movieIndex: 0
        };
        this.getSearchSuggestions = this.getSearchSuggestions.bind(this);
        this.generateMovieDisplays = this.generateMovieDisplays.bind(this);
        this.forwardButtonHandler = this.forwardButtonHandler.bind(this);
        this.backwardButtonHandler = this.backwardButtonHandler.bind(this);
        this.generateUserDisplays = this.generateUserDisplays.bind(this);
        this.typeHandler = this.typeHandler.bind(this);
        this.generateTypes = this.generateTypes.bind(this);
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

    typeHandler(value)
    {
        if(this.state.type !== value)
        {
            this.setState({
                type: value
            });
        }
        this.getSearchSuggestions(this.state.searchValue, value);
    }

    // function to get suggestions for search bar
    // for now, just getting users
    // will eventually get users and movies..
    getSearchSuggestions(value, type)
    {
        type = (type === undefined) ? this.state.type : type;
        this.props.history.replace({
            pathname: this.props.location.pathname,
            search: "?type=" + type + "&value=" + value
        });
        if(value.length < 1)
        {
            this.setState({
                movies: [],
                users: [],
                searchValue: value
            });
            return {};
        }
      // Simple POST request with a JSON body using fetch
      const requestOptions = {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
      };

      let status = 0;
      let url = "";
      if(type === "all")
      {
          url = "http://localhost:9000/search/query_all?value=" + value + "&count=20";
      }
      else if(type === "movies")
      {
          url = "http://localhost:9000/search/movies?title_contains=" + value;
      }
      else if(type === "users")
      {
          url = "http://localhost:9000/search/users?value=" + value + "&count=20";
      }
      return fetch(url, requestOptions)
          .then(async(res) => {
              status = res.status;
              if(status === 200)
              {
                  let result = await res.json();
                  if(type === "all")
                  {
                      this.setState({
                          movies: result.Movies,
                          users: result.Users,
                          searchValue: value
                      });
                  }
                  else if(type === "movies")
                  {
                      this.setState({
                          movies: result.movies,
                          users: [],
                          searchValue: value
                      });
                  }
                  else if(type === "users")
                  {
                      this.setState({
                          movies: [],
                          users: result.users,
                          searchValue: value
                      });
                  }
                  return {};
              }
              else
              {
                  return res.text();
              }
          }).then(result=> {
              if(status !== 200)
              {
                return {};
              }
              else
              {
                  return result;
              }
          });
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
                        showSearchIcon={true}
                        allowNoSuggestion={true}
                        getSuggestions={this.getSearchSuggestions}
                        multipleTypes={true}
                        valueKeys={{Movies:"title", Users: "username"}}
                        redirectPaths={{Movies: {path:"/movie/", key:"id"}, Users: {path:"/profile/",key:"username"}}}
                        showSuggestions={false}
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
