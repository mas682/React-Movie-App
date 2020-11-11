import React, { Component } from 'react';
import {Link, Redirect, withRouter} from 'react-router-dom';
import MoviePosterPopUp from './MoviePosterPopUp.js';
import queryString from "query-string";
import style from './css/Movies/movieinfo.module.css';


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
          loggedIn: false,
          username: "",
          watchList: false,
          watched: false
      }
      this.generateRatingStars = this.generateRatingStars.bind(this);
      this.generateMoviePoster = this.generateMoviePoster.bind(this);
      this.generateMovieTrailer = this.generateMovieTrailer.bind(this);
      this.posterClickHandler = this.posterClickHandler.bind(this);
      this.generateMovieInfo = this.generateMovieInfo.bind(this);
      this.generateMovieRuntime = this.generateMovieRuntime.bind(this);
      this.generateOverview = this.generateOverview.bind(this);
      this.generateDirector = this.generateDirector.bind(this);
      this.generateGenres = this.generateGenres.bind(this);
      this.getMovieInfo = this.getMovieInfo.bind(this);
      this.updateMovieInfo = this.updateMovieInfo.bind(this);
      this.movieWatchedHandler = this.movieWatchedHandler.bind(this);
      this.movieWatchListHandler = this.movieWatchListHandler.bind(this);
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
      // Simple POST request with a JSON body using fetch
      const requestOptions = {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
      };

      let status = 0;
      let url = "http://localhost:9000/movie/" + id;
      return fetch(url, requestOptions)
          .then(res => {
              status = res.status;
              return res.json();
          }).then(result=> {
              return [status, result];
          });
  }

  // function to handle call to api and result
  async updateMovieInfo(value)
  {
      let movieData = await this.getMovieInfo(value);
      let status = movieData[0];
      if(status === 200)
      {
          let movieInfo = this.generateMovieInfo(movieData[1][0]);
          let movie = movieData[1][0];
          let username = movieData[1][1];
          console.log("Movie Info");
          console.log(movie);
          let signedIn = false;
          if(username !== "")
          {
              signedIn = true;
          }
          let watchList = false;
          let watched = false;
          if(signedIn)
          {
              if(movie.UserWatchLists !== undefined)
              {
                  if(movie.UserWatchLists.length > 0)
                  {
                      if(movie.UserWatchLists[0].username === username)
                      {
                          watchList = true;
                      }
                  }
              }
              if(movie.UsersWhoWatched !== undefined)
              {
                  if(movie.UsersWhoWatched.length > 0)
                  {
                      if(movie.UsersWhoWatched[0].username === username)
                      {
                          watched = true;
                      }
                  }
              }
          }
          this.setState({
            id: movie.id,
            poster: movie.poster,
            headerImage: movie.backgroundImage,
            trailer: movie.trailer,
            movie: movie,
            movieInfoString: movieInfo,
            loggedIn: signedIn,
            username: username,
            watchList: watchList,
            watched: watched
          });
          this.props.updateLoggedIn(username, signedIn);
          let title = movie.title.replaceAll(" ", "_");
          let newUrl = movie.id + "-" + title;
          // fix the url to the appropriate value if title incorrect
          if(newUrl !== this.state.url)
          {
              window.history.replaceState(null, movieData[1].title, newUrl);
          }
      }
      else
      {
          alert("Movie request failed");
      }
  }

  async componentDidMount()
  {
      this.updateMovieInfo(this.state.id);
  }

  movieWatchListHandler(event)
  {
      event.preventDefault();
      event.stopPropagation();

      if(!this.state.loggedIn)
      {
          this.setState({
              displaySignIn: true
          });
          // eventually need to show this..
          //this.props.showLoginPopUp(true);
          return;
      }

      const requestOptions = {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json'},
          body: JSON.stringify({
              movieId: this.state.id
          })
      };

      let status = 0;
      let url = "http://localhost:9000/profile/" + this.state.username + "/add_to_watchlist";
      if(this.state.watchList)
      {
          url = "http://localhost:9000/profile/" + this.state.username + "/remove_from_watchlist";
      }
      fetch(url, requestOptions)
          .then(res => {
              status = res.status;
              if(status !== 401)
              {
                  return res.json();
              }
              else
              {
                  return res.text();
              }
          }).then(result =>{
              // not logged in/cookie not found
              if(status === 401)
              {
                  this.props.updateLoggedIn("", false);
                  if(this.state.loggedIn)
                  {
                      this.setState({
                          loggedIn: false,
                          username: ""
                      })
                  }
              }
              else
              {
                  let username = result[1];
                  if(status === 200 && result[0] === "Movie added to watch list")
                  {
                      this.setState({
                          watchList: true,
                          loggedIn: true,
                          username: result[1]
                      });
                  }
                  else if(status === 200 && result[0] === "Movie removed from watch list")
                  {
                      this.setState({
                          watchList: false,
                          loggedIn: true,
                          username: result[1]
                      });
                      if(this.state.type === "My Watch List")
                      {
                          this.props.removeMovieDisplay(this.state.index);
                      }
                  }
                  else if(status === 200 && result[0] === "Movie already on watch list")
                  {
                      alert(result[0]);
                      this.setState({
                          watchList: true,
                          loggedIn: true,
                          username: result[1]
                      });
                  }
                  else if(status === 200 && result[1] === "Movie already not on watch list")
                  {
                      alert(result[0]);
                      this.setState({
                          watchList: false,
                          loggedIn: true,
                          username: result[1]
                      });
                      if(this.state.type === "My Watch List")
                      {
                          this.props.removeMovieDisplay(this.state.index);
                      }
                  }
                  else
                  {
                      alert(result[0]);
                  }
              }
          });
  }

  movieWatchedHandler(event)
  {
      event.preventDefault();
      event.stopPropagation();

      if(!this.state.loggedIn)
      {
          // eventually need to show this..
          //this.props.showLoginPopUp(true);
          //return;

          this.setState({
              displaySignIn: true
          });
          // eventually need to show this..
          //this.props.showLoginPopUp(true);
          return;
      }

      const requestOptions = {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json'},
          body: JSON.stringify({
              movieId: this.state.id
          })
      };

      let status = 0;
      let url = "http://localhost:9000/profile/" + this.state.username + "/add_to_watched";
      if(this.state.watched)
      {
          url = "http://localhost:9000/profile/" + this.state.username + "/remove_from_watched";
      }
      fetch(url, requestOptions)
          .then(res => {
              status = res.status;
              if(status !== 401)
              {
                  return res.json();
              }
              else
              {
                  return res.text();
              }
          }).then(result =>{
              // not logged in/cookie not found
              if(status === 401)
              {
                  this.props.updateLoggedIn("", false);
                  if(this.state.loggedIn)
                  {
                      this.setState({
                          loggedIn: false,
                          username: ""
                      })
                  }
              }
              else
              {
                  let username = result[1];
                  if(status === 200 && result[0] === "Movie added to movies watched list")
                  {
                      this.setState({
                          watched: true,
                          loggedIn: true,
                          username: result[1]
                      });
                  }
                  else if(status === 200 && result[0] === "Movie removed from watched movies list")
                  {
                      this.setState({
                          watched: false,
                          loggedIn: true,
                          username: result[1]
                      });
                      if(this.state.type === "My Watched Movies")
                      {
                          this.props.removeMovieDisplay(this.state.index);
                      }
                  }
                  else if(status === 200 && result[0] === "Movie already on movies watched list")
                  {
                      alert(result[0]);
                      this.setState({
                          watched: true,
                          loggedIn: true,
                          username: result[1]
                      });
                  }
                  else if(status === 200 && result[1] === "Movie already not on watched movies list")
                  {
                      alert(result[0]);
                      this.setState({
                          watched: false,
                          loggedIn: true,
                          username: result[1]
                      });
                      if(this.state.type === "My Watched Movies")
                      {
                          this.props.removeMovieDisplay(this.state.index);
                      }
                  }
                  else
                  {
                      alert(result[0]);
                  }
              }
          });
  }


  /*
      This function is used to generate the stars and set the appropriate ones to being colored or not
      based off of the rating passed in by the props to the state
  */
  generateRatingStars()
  {
      let stars = [];
      let tempId = "star5" + this.state.id;
      if(this.state.rating == 5.0)
      {
          stars.push(<React.Fragment><input type="radio" id={tempId} name={style.rating} value="5" form={this.state.form} checked={true}/><label class={style.full} for={tempId} title="Awesome - 5 stars"></label></React.Fragment>);
      }
      else
      {
          stars.push(<React.Fragment><input type="radio" id={tempId} name={style.rating} value="5" form={this.state.form}/><label class={style.full} for={tempId} title="Awesome - 5 stars"></label></React.Fragment>);
      }
      tempId = "star4half" + this.state.id;
      if(this.state.rating == 4.50)
      {
          stars.push(<React.Fragment><input type="radio" id={tempId} name={style.rating} value="4.5" form={this.state.form} checked={true}/><label class={style.half} for={tempId} title="Pretty good - 4.5 stars"></label></React.Fragment>);
      }
      else
      {
          stars.push(<React.Fragment><input type="radio" id={tempId} name={style.rating} value="4.5" form={this.state.form}/><label class={style.half} for={tempId} title="Pretty good - 4.5 stars"></label></React.Fragment>);
      }
      tempId = "star4" + this.state.id;
      if(this.state.rating == 4.00)
      {
          stars.push(<React.Fragment><input type="radio" id={tempId} name={style.rating} value="4" form={this.state.form} checked={true}/><label class = {style.full} for={tempId} title="Pretty good - 4 stars"></label></React.Fragment>);
      }
      else
      {
          stars.push(<React.Fragment><input type="radio" id={tempId} name={style.rating} value="4" form={this.state.form}/><label class = {style.full} for={tempId} title="Pretty good - 4 stars"></label></React.Fragment>);
      }
      tempId = "star3half" + this.state.id;
      if(this.state.rating == 3.50)
      {
          stars.push(<React.Fragment><input type="radio" id={tempId} name={style.rating} value="3.5" form={this.state.form} checked={true}/><label class={style.half} for={tempId} title="Meh - 3.5 stars"></label></React.Fragment>);
      }
      else
      {
          stars.push(<React.Fragment><input type="radio" id={tempId} name={style.rating} value="3.5" form={this.state.form}/><label class={style.half} for={tempId} title="Meh - 3.5 stars"></label></React.Fragment>);
      }
      tempId = "star3" + this.state.id;
      if(this.state.rating == 3.00)
      {
          stars.push(<React.Fragment><input type="radio" id={tempId} name={style.rating} value="3" form={this.state.form} checked={true}/><label class = {style.full} for={tempId} title="Meh - 3 stars"></label></React.Fragment>);
      }
      else
      {
          stars.push(<React.Fragment><input type="radio" id={tempId} name={style.rating} value="3" form={this.state.form}/><label class = {style.full} for={tempId} title="Meh - 3 stars"></label></React.Fragment>);
      }
      tempId = "star2half" + this.state.id;
      if(this.state.rating == 2.50)
      {
          stars.push(<React.Fragment><input type="radio" id={tempId} name={style.rating} value="2.5" form={this.state.form} checked={true}/><label class={style.half} for={tempId} title="Kinda bad - 2.5 stars"></label></React.Fragment>);
      }
      else
      {
          stars.push(<React.Fragment><input type="radio" id={tempId} name={style.rating} value="2.5" form={this.state.form}/><label class={style.half} for={tempId} title="Kinda bad - 2.5 stars"></label></React.Fragment>);
      }
      tempId = "star2" + this.state.id;
      if(this.state.rating == 2.00)
      {
          stars.push(<React.Fragment><input type="radio" id={tempId} name={style.rating} value="2" form={this.state.form} checked={true}/><label class = {style.full} for={tempId} title="Kinda bad - 2 stars"></label></React.Fragment>);
      }
      else
      {
          stars.push(<React.Fragment><input type="radio" id={tempId} name={style.rating} value="2" form={this.state.form}/><label class = {style.full} for={tempId} title="Kinda bad - 2 stars"></label></React.Fragment>);
      }
      tempId = "star1half" + this.state.id;
      if(this.state.rating == 1.50)
      {
          stars.push(<React.Fragment><input type="radio" id={tempId} name={style.rating} value="1.5" form={this.state.form} checked={true}/><label class={style.half} for={tempId} title="Meh - 1.5 stars"></label></React.Fragment>);
      }
      else
      {
          stars.push(<React.Fragment><input type="radio" id={tempId} name={style.rating} value="1.5" form={this.state.form}/><label class={style.half} for={tempId} title="Meh - 1.5 stars"></label></React.Fragment>);
      }
      tempId = "star1half" + this.state.id;
      if(this.state.rating == 1.00)
      {
          stars.push(<React.Fragment><input type="radio" id={tempId} name={style.rating} value="1" form={this.state.form} checked={true}/><label class = {style.full} for={tempId} title="Sucks big time - 1 star"></label></React.Fragment>);
      }
      else
      {
          stars.push(<React.Fragment><input type="radio" id={tempId} name={style.rating} value="1" form={this.state.form}/><label class = {style.full} for={tempId} title="Sucks big time - 1 star"></label></React.Fragment>);
      }
      tempId = "starhalf" + this.state.id;
      if(this.state.rating == 0.50)
      {
          stars.push(<React.Fragment><input type="radio" id={tempId} name={style.rating} value="0.5" form={this.state.form} checked={true}/><label class={style.half} for={tempId} title="Don't waste your time - 0.5 stars"></label></React.Fragment>);
      }
      else
      {
          stars.push(<React.Fragment><input type="radio" id={tempId} name={style.rating} value="0.5" form={this.state.form}/><label class={style.half} for={tempId} title="Don't waste your time - 0.5 stars"></label></React.Fragment>);
      }
      return stars;
  }

    // function to generate the movies runtime as a string
    generateMovieRuntime(value)
    {
        let runTime = "";
        if(value > 0)
        {
            let hours = Math.floor(value / 60);
            let minutes = value % 60;
            let hourType = "Hours";
            if(hours < 2)
            {
                hourType = "Hour";
            }
            if(minutes > 0)
            {
                if(minutes > 1)
                {
                    runTime = hours + " " + hourType + " " + minutes + " Minutes";
                }
                else
                {
                    runTime = hours + " " + hourType + " " + minutes + " Minute";
                }
            }
            else
            {
                runTime = hours + " Hours";
            }
        }
        return runTime;
    }

    // called whenever the data is recieved from the server
    generateMovieInfo(movie)
    {
        let valuesArray = [];
        let runTime = this.generateMovieRuntime(movie.runTime);
        if(movie.rating !== null)
        {
            valuesArray.push(movie.rating);
        }
        if(runTime.length > 0)
        {
            valuesArray.push(runTime);
        }
        if(movie.releaseDate !== null)
        {
            valuesArray.push(movie.releaseDate);
        }

        let counter = 0;
        let movieInfo = "";
        while(counter < valuesArray.length)
        {
            if((counter + 1) < valuesArray.length)
            {
                movieInfo = movieInfo + valuesArray[counter] + "    |    ";

            }
            else
            {
                movieInfo = movieInfo + valuesArray[counter];
            }
            counter = counter + 1;
        }
        return movieInfo;
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

    generateMovieTrailer()
    {
        let trailerPath = "";
        let trailerElem = "";
        if(this.state.trailer !== null)
        {
            trailerPath = "https://www.youtube.com/embed/" + this.state.trailer;
            trailerElem = <iframe className={style.movieTrailer} src={trailerPath}></iframe>;
        }
        return (
            <div className={style.movieTrailerContainer}>
                {trailerElem}
            </div>
        );
    }

    generateOverview()
    {
        if(this.state.movie.overview !== null)
        {
            return (
                <div className={style.overviewContainer}>
                    <div className={style.overviewHeader}>
                        Overview
                    </div>
                    {this.state.movie.overview}
                </div>
            );
        }
        return "";
    }

    generateDirector()
    {
        if(this.state.movie.director !== null)
        {
            return (
              <div className={style.overviewContainer}>
                  <div className={style.overviewHeader}>
                      Director
                  </div>
                  {this.state.movie.director}
              </div>
            );
        }
        return "";
    }

    generateGenres()
    {
        if(this.state.movie.Genres.length > 0)
        {
            let genres = "";
            let counter = 0;
            while(counter < this.state.movie.Genres.length)
            {
                if((counter + 1) < this.state.movie.Genres.length)
                {
                    genres = genres + this.state.movie.Genres[counter].value + ", ";
                }
                else
                {
                    genres = genres + this.state.movie.Genres[counter].value;
                }
                counter = counter + 1;
            }
            return (
              <div className={style.overviewContainer}>
                  <div className={style.overviewHeader}>
                      Genre
                  </div>
                  {genres}
              </div>
            );
        }
        return "";
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
        let trailer = this.generateMovieTrailer();
        let stars = this.generateRatingStars();
        let director = this.generateDirector();
        let overview = this.generateOverview();
        let genres = this.generateGenres();

        let watchListIcon = (
            <div className={`${style.watchListIconContainer}`}>
                <i class={`fas fa-eye ${style.watchListIcon} ${style.tooltip}`} onClick={(event) =>this.movieWatchListHandler(event)}>
                    <span class={style.tooltiptext}>Add to watch list</span>
                </i>
            </div>
        );
        if(this.state.watchList)
        {
            watchListIcon = (
                <div className={`${style.watchListIconContainer}`}>
                    <i class={`fas fa-eye ${style.watchListIconSelected} ${style.tooltip}`} onClick={(event) =>this.movieWatchListHandler(event)}>
                        <span class={style.tooltiptext}>Remove from watch list</span>
                    </i>
                </div>
            )
        }
        let watchedIcon = (
            <div className={`${style.watchedIconContainer}`} >
                <i className={`fas fa-ticket-alt ${style.watchedIcon} ${style.tooltip}`} onClick={(event) => this.movieWatchedHandler(event)}>
                    <span class={style.tooltiptext}>Add to watched movies</span>
                </i>
            </div>
        );

        //<h1> TEST </h1>
        if(this.state.watched)
        {
            watchedIcon = (
                <div className={`${style.watchedIconContainer}`}>
                    <i className={`fas fa-ticket-alt ${style.watchedIconSelected} ${style.tooltip}`} onClick={(event) => this.movieWatchedHandler(event)}>
                        <span class={style.tooltiptext}>Remove movie from watched</span>
                    </i>
                </div>
            );
        }

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
