import React, { Component } from 'react';
import {Redirect, withRouter} from 'react-router-dom';
import MoviePosterPopUp from './MoviePosterPopUp.js';
import Alert from './Alert.js';
import style from './css/Movies/movieinfo.module.css';
import {getErrorDisplay} from './StaticFunctions/ErrorHtmlFunctions.js';
import {generateWatchListButton, generateWatchedListButton, generateMovieTrailer,
generateMovieInfo, generateOverview, generateDirector, generateGenres, generateRatingStars,
checkMovieOnWatchList, checkMovieOnWatchedList, generateMovieBackground} from './StaticFunctions/MovieHtmlFunctions.js';
import {apiPostJsonRequest, apiGetJsonRequest} from './StaticFunctions/ApiFunctions.js';
import {addMovieToWatchListResultsHandler, removeWatchListMovieResultsHandler,
    addMovieToWatchedListResultsHandler, removeWatchedListMovieResultsHandler}
     from './StaticFunctions/UserResultsHandlers.js';
import {generateMessageState} from './StaticFunctions/StateGeneratorFunctions.js';


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
              }
          }
          this.state = {
              id: id,
              rating: 0.0,
              totalRatings: 0,
              poster: null,
              headerImage: null,
              trailer: null,
              movie: null,
              url: this.props.match.params.id,
              posterPopup: false,
              movieInfoString: "",
              currentUser: this.props.currentUser,
              watchList: false,
              watched: false,
              errorMessage: "",
              loading: true
          }
          this.generateMoviePoster = this.generateMoviePoster.bind(this);
          this.posterClickHandler = this.posterClickHandler.bind(this);
          this.updateMovieInfo = this.updateMovieInfo.bind(this);
          this.buttonHandler = this.buttonHandler.bind(this);
          this.movieInfoResultsHandler = this.movieInfoResultsHandler.bind(this);
    	}

      componentDidUpdate(prevProps, prevState)
      {
          let id = null;
          let movieQuery = this.props.match.params.id;
          let queryElements = movieQuery.split("-", 1);
          if(queryElements.length > 0)
          {
              id = parseInt(queryElements[0]);
              if(isNaN(id)) return;
          }
          // if the movie id changed
          if(this.state.id !== id && !this.state.loading)
          {
              this.updateMovieInfo(id);
          }
          // if the logged in user changed
          else if(this.props.currentUser !== this.state.currentUser && !this.state.loading)
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

      // function to handle call to api and result
      async updateMovieInfo(value)
      {
          let url = "http://localhost:9000/movie/" + value;
          let movieData = await apiGetJsonRequest(url)
          let status = movieData[0];
          let requester = movieData[1].requester;
          let message = movieData[1].message;
          this.movieInfoResultsHandler(status, message, requester, movieData[1]);
      }

      movieInfoResultsHandler(status, message, requester, result)
      {
          if(status === 200)
          {
              let movie = result.movie;
              let movieInfo = generateMovieInfo(movie);
              let watchList = checkMovieOnWatchList(movie, requester);
              let watched = checkMovieOnWatchedList(movie, requester);
              let title = movie.title.replaceAll(" ", "_");
              let newUrl = movie.id + "-" + title;
              // fix the url to the appropriate value if title incorrect
              if(newUrl !== this.state.url)
              {
                  window.history.replaceState(null, movie.title, newUrl);
              }
              console.log(movie);
              this.setState({
                id: movie.id,
                rating: movie.userRating,
                totalRatings: movie.totalUserRatings,
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
                loading: false,
                errorMessage: ""
              });
              this.props.setMessages({
                  messages: [{message: message, type: "success"}],
                  clearMessages: true
              });
              this.props.updateLoggedIn(requester);
          }
          else
          {
              this.props.updateLoggedIn(requester);
              // movie id invalid format
              if(status === 400)
              {
                  // redirect to 400 page?
                  this.setState({
                      movie: undefined,
                      errorMessage: message,
                      loading: false
                  });
              }
              else if(status === 404)
              {
                  // movie could not be found
                  // show error message
                  this.setState({
                      movie: undefined,
                      errorMessage: message,
                      loading: false
                  });
              }
              else
              {
                  this.setState({
                      movie: undefined,
                      errorMessage: message,
                      loading: false
                  });
              }
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
              // will need to redirect to 404 page
              this.props.updateLoggedIn(requester);
              this.setState({
                  movie: undefined,
                  // set the message to display on the 404 page
                  errorMessage: message
              });
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
                  let state = result.state;
                  if(result.messageState !== undefined)
                  {
                      this.props.setMessages(result.messageState);
                  }
                  this.setState(state);
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
              return (
                  <div className={style.movieImageContainer}>
                      <div className={style.innerMovieImageContainer}>
                          <img className={style.moviePoster} src={posterPath} onClick={this.posterClickHandler}/>
                      </div>
                  </div>
              );
          }
          else
          {
              return (
                  <div className={style.movieImageContainer}>
                      <div className={style.innerMovieImageContainer}>
                          <div className={style.emptyMoviePoster}>
                              <div>
                                  No image to display
                              </div>
                          </div>
                      </div>
                  </div>
              );
          }
      }


  	render() {
        if(this.state.movie === null)
        {
            return null;
        }
        // if the movie is undefined, some error occurred trying to retrieve it
        if(this.state.movie === undefined)
        {
            return getErrorDisplay(this.state.errorMessage);
        }
        if(this.state.redirect404)
        {
            return <Redirect to={"/"} />;
        }

        let headerBackgroundCss = generateMovieBackground(style, this.state.headerImage, this.state.poster);
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
        console.log(this.state);
        let rating = String(this.state.totalRatings).replace(/(.)(?=(\d{3})+$)/g,'$1,')
    	return (
          <React.Fragment>
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
                                  <div className={style.totalRatings}>
                                    ({rating})
                                  </div>
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
          </React.Fragment>
    		);
  	}
}

export default withRouter(MovieInfoPage);
