import React from 'react';
import {Link} from 'react-router-dom';

// these are reusable functions that can be used to generate html for various movie components
// such as generating the poster, watch buttons, etc.


// function to generate button to add movie to a watch list
// style is the css style to use
// buttonHandler is the function to call on the button click
// watchList is a boolean value of whether or not the movie is on the users watchlist
const generateWatchListButton = (style, buttonHandler, watchList) =>
{
    let watchListIcon = (
        <div className={`${style.watchListIconContainer}`}>
            <i class={`fas fa-eye ${style.watchListIcon} ${style.tooltip}`} onClick={(event) =>buttonHandler(event, "watchlist")}>
                <span class={style.tooltiptext}>Add to watch list</span>
            </i>
        </div>
    );

    if(watchList)
    {
        watchListIcon = (
            <div className={`${style.watchListIconContainer}`}>
                <i class={`fas fa-eye ${style.watchListIconSelected} ${style.tooltip}`} onClick={(event) =>buttonHandler(event, "watchlist")}>
                    <span class={style.tooltiptext}>Remove from watch list</span>
                </i>
            </div>
        )
    }
    return watchListIcon;
}


// function to generate button to add movie to a watched list
// style is the css style to use
// buttonHandler is the function to call on the button click
// watched is a boolean value of whether or not the movie is on the users watched list
const generateWatchedListButton = (style, buttonHandler, watched) =>
{
    let watchedIcon = (
        <div className={`${style.watchedIconContainer}`} >
            <i class={`fas fa-ticket-alt ${style.watchedIcon} ${style.tooltip}`} onClick={(event) => buttonHandler(event, "watched")}>
                <span class={style.tooltiptext}>Add to movies watched</span>
            </i>
        </div>
    );

    if(watched)
    {
        watchedIcon = (
            <div className={`${style.watchedIconContainer}`}>
                <i class={`fas fa-ticket-alt ${style.watchedIconSelected} ${style.tooltip}`} onClick={(event) => buttonHandler(event, "watched")}>
                    <span class={style.tooltiptext}>Remove movie from watched</span>
                </i>
            </div>
        );
    }
    return watchedIcon;
}

// function to generate the movie trailer for a movie
// style is the css style to use
// trailer is the path to the trailer
const generateMovieTrailer = (style, trailer) =>
{
    let trailerPath = "";
    let trailerElem = "";
    if(trailer !== null)
    {
        trailerPath = "https://www.youtube.com/embed/" + trailer;
        trailerElem = <iframe className={style.movieTrailer} src={trailerPath}></iframe>;
    }
    return (
        <div className={style.movieTrailerContainer}>
            {trailerElem}
        </div>
    );
}

// function to generate the movies overview
const generateOverview = (style, overview) =>
{
    if(overview !== null)
    {
        return (
            <div className={style.detailsContainer}>
                <div className={style.detailsHeader}>
                    Overview
                </div>
                {overview}
            </div>
        );
    }
    return "";
}

// function to generate the movies director
const generateDirector = (style, director) =>
{
    if(director !== null)
    {
        return (
          <div className={style.detailsContainer}>
              <div className={style.detailsHeader}>
                  Director
              </div>
              {director}
          </div>
        );
    }
    return "";
}

// function to generate the genres html for a movie
const generateGenres = (style, genres) =>
{
    if(genres === undefined) return "";
    if(genres > 0)
    {
        let genres = "";
        let counter = 0;
        while(counter < genres.length)
        {
            if((counter + 1) < genres.length)
            {
                genres = genres + genres[counter].value + ", ";
            }
            else
            {
                genres = genres + genres[counter].value;
            }
            counter = counter + 1;
        }
        return (
          <div className={style.detailsContainer}>
              <div className={style.detailsHeader}>
                  Genre
              </div>
              {genres}
          </div>
        );
    }
    return "";
}

// function to generate the html for the movie poster
const generateMoviePoster = (style, poster, movieId) =>
{
    let posterPath = "";
    if(poster !== null)
    {
        posterPath = "https://image.tmdb.org/t/p/original" + poster;
    }
    let moviePage = "movie/" + movieId;
    return (
      <div className={style.movieImageContainer}>
          <Link to={moviePage}><img className={style.moviePoster} src={posterPath}/></Link>
      </div>
    );
}


// called whenever the data is recieved from the server
// function to generate a string of the movie info
const generateMovieInfo = (movie) =>
{
    let valuesArray = [];
    let runTime = generateMovieRuntime(movie.runTime);
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

// function to generate the movies runtime as a string

const generateMovieRuntime = (value) =>
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

export {generateWatchListButton, generateWatchedListButton, generateMovieTrailer, generateOverview, generateDirector,
        generateGenres, generateMovieInfo, generateMovieRuntime, generateMoviePoster};
