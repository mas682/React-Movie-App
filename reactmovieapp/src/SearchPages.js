import React, { Component } from 'react';
import {Link, Redirect, useLocation, withRouter} from 'react-router-dom';
import Alert from './Alert.js';
import SearchDropDown from './SearchDropDown.js';
import MovieDisplay from './MovieDisplay.js';
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
            currentUser: this.props.currentUser
        };
        this.getSearchSuggestions = this.getSearchSuggestions.bind(this);
        this.generateMovieDisplays = this.generateMovieDisplays.bind(this);
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
        return movies;
    }

    render()
    {
        if(this.state.loading) return null;
        let movies = this.generateMovieDisplays();
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
                    <div className={style.movieDisplayContainer}>
                        {movies}
                    </div>
                </div>
            </div>
        );
    }
}

export default SearchPage;
