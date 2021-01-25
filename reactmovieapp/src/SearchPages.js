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
            currentUser: this.props.currentUser,
            movieIndex: 0
        };
        this.getSearchSuggestions = this.getSearchSuggestions.bind(this);
        this.generateMovieDisplays = this.generateMovieDisplays.bind(this);
        this.forwardButtonHandler = this.forwardButtonHandler.bind(this);
        this.backwardButtonHandler = this.backwardButtonHandler.bind(this);
        this.getAllSearchSuggestions = this.getAllSearchSuggestions.bind(this);
        this.generateMovieSearchResults = this.generateMovieSearchResults.bind(this);
        this.generateUserDisplays = this.generateUserDisplays.bind(this);
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

    // function to get suggestions for search bar
    // for now, just getting users
    // will eventually get users and movies..
    async getSearchSuggestions(value)
    {
      // Simple POST request with a JSON body using fetch
      const requestOptions = {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
      };

      let status = 0;
      let url = "http://localhost:9000/search/movies?release_date_gte=2021-12-18&release_date_lte=2021-01-18&sort=release_date_desc"
      return fetch(url, requestOptions)
          .then(async (res) => {
              status = res.status;
              if(status === 200)
              {
                  let result = await res.json();
                  console.log(result);
                  this.setState({movies: result.movies});
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

    // function to get suggestions for search bar
    // for now, just getting users
    // will eventually get users and movies..
    getAllSearchSuggestions(value)
    {
      // Simple POST request with a JSON body using fetch
      const requestOptions = {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
      };

      let status = 0;
      let url = "http://localhost:9000/search/query_all?value=" + value;
      return fetch(url, requestOptions)
          .then(async(res) => {
              status = res.status;
              if(status === 200)
              {
                  let result = await res.json();
                  console.log(result);
                  this.setState({
                      movies: result.Movies,
                      users: result.Users
                  });
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

    generateMovieDisplays()
    {
        let movies = [];
        let counter = 0;
        for(let movie of this.state.movies)
        {
            let html = (
                <div className={style.movieContainer}>
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
                        moviePosterStyle={{"min-height":"0px"}}
                    />
                </div>
            );
            movies.push(html);
            counter = counter + 1;
        }
        return movies;
    }

    generateMovieSearchResults()
    {
        let movies = [];
        this.state.movies.forEach((movie, index) => {
            let html = (
                <div className={style.movieContainer2}>
                    <MovieDisplay
                        movie={movie}
                        type={""}
                        index={index}
                        removeMovieDisplay={undefined}
                        setMessages={this.props.setMessages}
                        updateLoggedIn={this.props.updateLoggedIn}
                        showLoginPopUp={this.props.showLoginPopUp}
                        currentUser={this.state.currentUser}
                        key={index}
                        showMovieInfo={false}
                        moviePosterStyle={{"min-height":"0px", "border-radius":"5px"}}
                    />
                </div>
            );
            movies.push(html);
        });
        return movies;
    }

    generateUserDisplays()
    {
        let users = [];
        let counter = 0;
        let user = {
            id: 1,
            poster: "",
            username: "steelcity"
        };
        console.log(this.state.users);
        this.state.users.forEach((user, index) => {
            let html = (
                <div className={style.userContainer}>
                    <UserDisplay
                        user={user}
                        type={""}
                        index={index}
                        setMessages={this.props.setMessages}
                        updateLoggedIn={this.props.updateLoggedIn}
                        showLoginPopUp={this.props.showLoginPopUp}
                        currentUser={this.state.currentUser}
                        key={index}
                    />
                </div>
            );
            users.push(html);
        })
        /*
        //for(let movie of this.state.movies)
        while(counter < 15)
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
            users.push(html);
            counter = counter + 1;
        }
        */
        return users;
    }

    render()
    {
        if(this.state.loading) return null;
        let movies = this.generateMovieDisplays();
        let movieCarousel = "";
        if(movies.length > 0)
        {
            movieCarousel = (
                <div className={style.resultsContainer}>
                    <div className={style.resultsHeader}>
                        <div className={style.resultType}>
                            Movies
                        </div>
                        <div className={style.resultsShowAllButton}>
                            <div>
                                See More
                            </div>
                            <i className={`fas fa-angle-right ${style.showMoreIcon}`}/>
                        </div>
                    </div>
                    <div className={style.movieDisplayContainer} id="movieDisplayContainer">
                        <CarouselDisplay
                            items={movies}
                            id={"movieCarousel1"}
                            itemContainerClass={style.movieContainer}
                            // used to make windowResizeEventHandler more efficint
                            maxVisibleItems={7}
                        />
                    </div>
                </div>
            )
        }

        let users = this.generateUserDisplays();
        let userHTML = "";
        if(users.length > 0)
        {
            userHTML = (
                <div className={style.resultsContainer}>
                    <div className={style.resultsHeader}>
                        <div className={style.resultType}>
                            Users
                        </div>
                        <div className={style.resultsShowAllButton}>
                            <div>
                                See More
                            </div>
                            <i className={`fas fa-angle-right ${style.showMoreIcon}`}/>
                        </div>
                    </div>
                    <div className={style.movieDisplayContainer} id="userDisplayContainer">
                        <CarouselDisplay
                            items={users}
                            id={"userCarousel"}
                            itemContainerClass={style.userContainer}
                            // used to make windowResizeEventHandler more efficint
                            maxVisibleItems={7}
                        />
                    </div>
                </div>
            );
        }


        return (
            <div className={style.mainBodyContainer}>
                <div className={style.searchBarContainer}>
                    <SearchDropDown
                        showSearchIcon={true}
                        allowNoSuggestion={true}
                        getSuggestions={this.getAllSearchSuggestions}
                        multipleTypes={true}
                        valueKeys={{Movies:"title", Users: "username"}}
                        redirectPaths={{Movies: {path:"/movie/", key:"id"}, Users: {path:"/profile/",key:"username"}}}
                        showSuggestions={false}
                    />
                </div>
                <div className={style.typeContainer}>
                    <div className={style.typeButtonContainer}>
                        <button className={`${style.typeButton} ${style.selectedType}`}>All</button>
                    </div>
                    <div className={style.typeButtonContainer}>
                        <button className={`${style.typeButton} ${style.unselectedType}`}>Movies</button>
                    </div>
                    <div className={style.typeButtonContainer}>
                        <button className={`${style.typeButton} ${style.unselectedType}`}>Users</button>
                    </div>
                    <div className={style.typeButtonContainer}>
                        <button className={`${style.typeButton} ${style.unselectedType}`}>Genres</button>
                    </div>
                    <div className={style.typeButtonContainer}>
                        <button className={`${style.typeButton} ${style.unselectedType}`}>Directors</button>
                    </div>
                    <div className={style.typeButtonContainer}>
                        <button className={`${style.typeButton} ${style.unselectedType}`}>Actors</button>
                    </div>
                </div>
                {movieCarousel}
                {userHTML}
            </div>
        );
    }
}

export default SearchPage;
