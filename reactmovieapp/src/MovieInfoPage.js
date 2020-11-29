import React, { Component } from 'react';
import {Link, Redirect, withRouter} from 'react-router-dom';
import MoviePosterPopUp from './MoviePosterPopUp.js';
import queryString from "query-string";
import style from './css/Movies/movieinfo.module.css';
import {generateWatchListButton, generateWatchedListButton, generateMovieTrailer, generateMovieRuntime,
generateMovieInfo, generateOverview, generateDirector, generateGenres, generateRatingStars} from './StaticFunctions/MovieHtmlFunctions.js';
import {apiPostJsonRequest, apiGetJsonRequest} from './StaticFunctions/ApiFunctions.js';
import {addMovieToWatchListResultsHandler, removeWatchListMovieResultsHandler,
    addMovieToWatchedListResultsHandler, removeWatchedListMovieResultsHandler}
     from './StaticFunctions/UserResultsHandlers.js';


class MovieInfoPage extends React.Component {
      constructor(props){
          super(props);
          let movieQuery = this.props.match.params.id;
          let queryElements = movieQuery.split("-", 1);
          let id = null;
          if(queryElements.length > 0)
          {
              id = parseInt(queryElements[0]);
              if(isNaN(id))
              {
                  id = null;
                  alert("Invalid movie id provided");
              }
          }
          console.log(queryElements);
          this.state = {
              id: id,
              rating: 4.5,
              poster: null,
              headerImage: null,
              trailer: null,
              movie: null,
              url: this.props.match.params.id,
              posterPopup: false,
              movieInfoString: "",
              currentUser: this.props.currentUser,
              watchList: false,
              watched: false
          }

          this.generateMoviePoster = this.generateMoviePoster.bind(this);
          this.posterClickHandler = this.posterClickHandler.bind(this);
          this.getMovieInfo = this.getMovieInfo.bind(this);
          this.updateMovieInfo = this.updateMovieInfo.bind(this);
          this.buttonHandler = this.buttonHandler.bind(this);
         // this.movieWatchedResultsHandler = this.movieWatchedResultsHandler.bind(this);
         // this.movieWatchListResultsHandler = this.movieWatchListResultsHandler.bind(this);
    	}

      // called when the component is receiving new props
      // handles issue where receiving props from another movies page and does not update
      componentWillReceiveProps(nextProps) {
          let id = null;
          let movieQuery = nextProps.match.params.id;
          let queryElements = movieQuery.split("-", 1);
          if(queryElements.length > 0)
          {
              // get the movie id
              id = parseInt(queryElements[0]);
              if(isNaN(id))
              {
                  id = null;
                  alert("Invalid movie id provided");
              }
          }
          if(this.props.id !== id)
          {
              this.updateMovieInfo(id);
          }
      }

      posterClickHandler()
      {
          // do not expand the poster if one does not exist
          if(this.state.poster === null)
          {
              return;
          }
          let opened = this.state.posterPopup;
          this.setState({
              posterPopup: !opened
          });
      }

      // function to get the movie title suggestions based off of a
      // substring that the user has already entered
      getMovieInfo(id)
      {
          let url = "http://localhost:9000/movie/" + id;
          return apiGetJsonRequest(url);
      }

      // function to handle call to api and result
      async updateMovieInfo(value)
      {
          let movieData = await this.getMovieInfo(value);
          let status = movieData[0];
          let requester = movieData[1].requester;
          let message = movieData[1].message;
          if(status === 200)
          {
              let movie = movieData[1].movie;
              let movieInfo = generateMovieInfo(movie);
              let watchList = false;
              let watched = false;
              if(requester !== "")
              {
                  // make these two if's reusable functions...
                  if(movie.UserWatchLists !== undefined)
                  {
                      if(movie.UserWatchLists.length > 0)
                      {
                          if(movie.UserWatchLists[0].username === requester)
                          {
                              watchList = true;
                          }
                      }
                  }
                  if(movie.UsersWhoWatched !== undefined)
                  {
                      if(movie.UsersWhoWatched.length > 0)
                      {
                          if(movie.UsersWhoWatched[0].username === requester)
                          {
                              watched = true;
                          }
                      }
                  }
              }
              let title = movie.title.replaceAll(" ", "_");
              let newUrl = movie.id + "-" + title;
              // fix the url to the appropriate value if title incorrect
              if(newUrl !== this.state.url)
              {
                  window.history.replaceState(null, movie.title, newUrl);
              }
              this.setState({
                id: movie.id,
                rating: 4.5,
                poster: movie.poster,
                headerImage: movie.backgroundImage,
                trailer: movie.trailer,
                posterPopup: false,
                movie: movie,
                movieInfoString: movieInfo,
                currentUser: requester,
                watchList: watchList,
                watched: watched,
                url: newUrl,
              });
              this.props.updateLoggedIn(requester);
          }
          else
          {
              alert(message);
          }
      }

      async componentDidMount()
      {
          this.updateMovieInfo(this.state.id);
      }

      async buttonHandler(event, type)
      {
          event.preventDefault();
          event.stopPropagation();

          if(!this.state.currentUser)
          {
              // will be dependent on the page..
              this.props.showLoginPopUp(false);
              return;
          }

          let url = "";
          let params = {movieId: this.state.id};
          if(type === "watched")
          {
              url = "http://localhost:9000/movies/add_to_watched";
              if(this.state.watched)
              {
                  url = "http://localhost:9000/movies/remove_from_watched";
              }
          }
          else if(type === "watchlist")
          {
              url = "http://localhost:9000/movies/add_to_watchlist";
              if(this.state.watchList)
              {
                  url = "http://localhost:9000/movies/remove_from_watchlist";
              }
          }
          // send the request
          let apiResult = await apiPostJsonRequest(url, params);
          let status = apiResult[0];
          let message = apiResult[1].message;
          let requester = apiResult[1].requester;
          let result;
          if(type === "watched")
          {
              if(!this.state.watched)
              {
                  result = addMovieToWatchedListResultsHandler(status, message, requester);
              }
              else
              {
                  result = removeWatchedListMovieResultsHandler(status, message, requester, "Movie page");
              }
          }
          else
          {
              if(!this.state.watchList)
              {
                  result = addMovieToWatchListResultsHandler(status, message, requester);
              }
              else
              {
                  result = removeWatchListMovieResultsHandler(status, message, requester, "Movie Page");
              }
          }

          if(result.movieNotFound)
          {
              //this.props.removeMovieDisplay(this.state.index);
              // will need to redirect to 404 page
              this.props.updateLoggedIn(requester);
          }
          else
          {
              if(result.showLoginPopUp)
              {
                  // this will also update who is logged in
                  this.props.showLoginPopUp(true);
              }
              else
              {
                  this.setState(result.state);
                  this.props.updateLoggedIn(requester);
              }
          }
      }

      generateMoviePoster()
      {
          let posterPath = "";
          if(this.state.poster !== null)
          {
              posterPath = "https://image.tmdb.org/t/p/original" + this.state.poster;
          }
          return (
            <div className={style.movieImageContainer}>
                <img className={style.moviePoster} src={posterPath} onClick={this.posterClickHandler}/>
            </div>
          );
      }


  	render() {
        if(this.state.movie === null)
        {
            return null;
        }

        let headerBackgroundCss = {backgroundImage: "linear-gradient(to bottom, rgba(112,107,107,0.9), rgba(112,107,107,0.9)"};
        if(this.state.headerImage !== null)
        {
            headerBackgroundCss = {backgroundImage: "linear-gradient(to bottom, rgba(112,107,107,0.9), rgba(112,107,107,0.9)),url(\"https://image.tmdb.org/t/p/original" + this.state.headerImage};
        }
        // if there is no background image, try to use the poster itself
        else if(this.state.poster !== null)
        {
            headerBackgroundCss = {backgroundImage: "linear-gradient(to bottom, rgba(112,107,107,0.9), rgba(112,107,107,0.9)),url(\"https://image.tmdb.org/t/p/original" + this.state.poster};
        }
        let poster = this.generateMoviePoster();
        let trailer = generateMovieTrailer(style, this.state.trailer);
        let stars = generateRatingStars(style, this.state.id, this.state.rating);
        let director = generateDirector(style, this.state.movie.director);
        let overview = generateOverview(style, this.state.movie.overview);
        let genres = generateGenres(style, this.state.movie.Genres);
        let watchListIcon = generateWatchListButton(style, this.buttonHandler, this.state.watchList);
        let watchedIcon = generateWatchedListButton(style, this.buttonHandler, this.state.watched);
        // if the poster was clicked, show it larger
        let posterPopup = "";
        if(this.state.posterPopup)
        {
            if(this.state.poster !== null)
            {
                let posterPath = "https://image.tmdb.org/t/p/original" + this.state.poster;
                posterPopup = <MoviePosterPopUp posterPath={posterPath} removeFunction={this.posterClickHandler} />;
            }
        }
    	return (
          <div className={style.mainBodyContainer}>
              <div className={style.headerContainer} style={headerBackgroundCss}>
                  {poster}
                  <div className={style.movieDetailsOutterContainer}>
                      <div className={style.movieDetailsContainer}>
                          <div className={style.movieTitle}>
                              {this.state.movie.title}
                          </div>
                          <div className={style.infoContainer}>
                              {this.state.movieInfoString}
                          </div>
                          <div className={style.ratingContainer}>
                              <fieldset className={style.rating}>
                                  {stars}
                              </fieldset>
                          </div>
                          <div className={style.icons}>
                                {watchedIcon}
                                {watchListIcon}
                          </div>
                          <div className={style.ratingContainer}>
                          </div>
                          {overview}
                          {genres}
                          {director}
                      </div>
                  </div>
              </div>
              {trailer}
              {posterPopup}
          </div>
    		);
  	}
}

export default withRouter(MovieInfoPage);
