import React, { Component } from 'react';
import {Link, Redirect, useLocation, withRouter} from 'react-router-dom';
import Alert from './Alert.js';
import SearchDropDown from './SearchDropDown.js';
import MovieDisplay from './MovieDisplay.js';
import CarouselDisplay from './CarouselDisplay.js';
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
            currentUser: this.props.currentUser,
            movieIndex: 0
        };
        this.getSearchSuggestions = this.getSearchSuggestions.bind(this);
        this.generateMovieDisplays = this.generateMovieDisplays.bind(this);
        this.forwardButtonHandler = this.forwardButtonHandler.bind(this);
        this.backwardButtonHandler = this.backwardButtonHandler.bind(this);
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
      let url = "http://localhost:9000/search/movies/new_releases?release_date_gte=2021-12-18&release_date_lte=2021-01-18&sort=release_date_desc"
      return fetch(url, requestOptions)
          .then(async (res) => {
              status = res.status;
              if(status === 200)
              {
                  let result = await res.json();
                  console.log(result);
                  this.setState({movies: result.movies});
                  return {"Movies": result.movies};
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
        /*
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
                        moviePosterStyle={{"min-height":"300px"}}
                    />
                </div>
            );
            movies.push(html);
            counter = counter + 1;
        }
        */
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

    render()
    {
        /*
        still working on the search page....
        need to put a arrow overlay on top of movies at beginning/end
        then transform as movies become visible
        may be easier to do with a grid??
        actually use transform: translate3d...
        */
        if(this.state.loading) return null;
        let movies = this.generateMovieDisplays();
        let carousel = "";
        if(movies.length > 0)
        {
            carousel = <CarouselDisplay
                            items={movies}
                            id={"movieCarousel1"}
                            itemContainerClass={style.movieContainer}
                        />;
        }
        let carousel2 = "";
        if(movies.length > 0)
        {
            carousel2 = <CarouselDisplay
                            items={movies}
                            id={"movieCarousel2"}
                            itemContainerClass={style.movieContainer}
                        />;
        }
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
                <div className={style.resultsContainer}>
                    <div className={style.resultType}>
                        Movies
                    </div>
                    <div className={style.movieDisplayContainer} id="movieDisplayContainer">
                        {carousel}
                    </div>
                </div>
                <div className={style.resultsContainer}>
                    <div className={style.resultType}>
                        Movies
                    </div>
                    <div className={style.movieDisplayContainer} id="movieDisplayContainer">
                        {carousel2}
                    </div>
                </div>
            </div>
        );
    }
}

export default SearchPage;
