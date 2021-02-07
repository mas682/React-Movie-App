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
        trailerElem = <iframe
                        allowfullscreen="allowfullscreen"
                        className={style.movieTrailer}
                        src={trailerPath}
                      ></iframe>;
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
    if(genres.length > 0)
    {
        let genreString = "";
        let counter = 0;
        while(counter < genres.length)
        {
            if((counter + 1) < genres.length)
            {
                genreString = genreString + genres[counter].value + ", ";
            }
            else
            {
                genreString = genreString + genres[counter].value;
            }
            counter = counter + 1;
        }
        return (
          <div className={style.detailsContainer}>
              <div className={style.detailsHeader}>
                  Genre
              </div>
              {genreString}
          </div>
        );
    }
    return "";
}

// function to generate the stars for a rating that already exists
// id is the movie or review id
// rating is the value to set the stars to
const generateRatingStars = (style, id, rating, form) =>
{
    let stars = [];
    let tempId = "star5" + id;
    form = (form === undefined) ? "moviepage" : form;
    if(rating == 5.0)
    {
        stars.push(<React.Fragment><input type="radio" id={tempId} name={style.rating} value="5" form={form} checked={true}/><label class={style.full} for={tempId} title="Awesome - 5 stars"></label></React.Fragment>);
    }
    else
    {
        stars.push(<React.Fragment><input type="radio" id={tempId} name={style.rating} value="5" form={form}/><label class={style.full} for={tempId} title="Awesome - 5 stars"></label></React.Fragment>);
    }
    tempId = "star4half" + id;
    if(rating == 4.50)
    {
        stars.push(<React.Fragment><input type="radio" id={tempId} name={style.rating} value="4.5" form={form} checked={true}/><label class={style.half} for={tempId} title="Pretty good - 4.5 stars"></label></React.Fragment>);
    }
    else
    {
        stars.push(<React.Fragment><input type="radio" id={tempId} name={style.rating} value="4.5" form={form}/><label class={style.half} for={tempId} title="Pretty good - 4.5 stars"></label></React.Fragment>);
    }
    tempId = "star4" + id;
    if(rating == 4.00)
    {
        stars.push(<React.Fragment><input type="radio" id={tempId} name={style.rating} value="4" form={form} checked={true}/><label class = {style.full} for={tempId} title="Pretty good - 4 stars"></label></React.Fragment>);
    }
    else
    {
        stars.push(<React.Fragment><input type="radio" id={tempId} name={style.rating} value="4" form={form}/><label class = {style.full} for={tempId} title="Pretty good - 4 stars"></label></React.Fragment>);
    }
    tempId = "star3half" + id;
    if(rating == 3.50)
    {
        stars.push(<React.Fragment><input type="radio" id={tempId} name={style.rating} value="3.5" form={form} checked={true}/><label class={style.half} for={tempId} title="Meh - 3.5 stars"></label></React.Fragment>);
    }
    else
    {
        stars.push(<React.Fragment><input type="radio" id={tempId} name={style.rating} value="3.5" form={form}/><label class={style.half} for={tempId} title="Meh - 3.5 stars"></label></React.Fragment>);
    }
    tempId = "star3" + id;
    if(rating == 3.00)
    {
        console.log("HERE");
        stars.push(<React.Fragment><input type="radio" id={tempId} name={style.rating} value="3" form={form} checked={true}/><label class = {style.full} for={tempId} title="Meh - 3 stars"></label></React.Fragment>);
    }
    else
    {
        stars.push(<React.Fragment><input type="radio" id={tempId} name={style.rating} value="3" form={form}/><label class = {style.full} for={tempId} title="Meh - 3 stars"></label></React.Fragment>);
    }
    tempId = "star2half" + id;
    if(rating == 2.50)
    {
        stars.push(<React.Fragment><input type="radio" id={tempId} name={style.rating} value="2.5" form={form} checked={true}/><label class={style.half} for={tempId} title="Kinda bad - 2.5 stars"></label></React.Fragment>);
    }
    else
    {
        stars.push(<React.Fragment><input type="radio" id={tempId} name={style.rating} value="2.5" form={form}/><label class={style.half} for={tempId} title="Kinda bad - 2.5 stars"></label></React.Fragment>);
    }
    tempId = "star2" + id;
    if(rating == 2.00)
    {
        stars.push(<React.Fragment><input type="radio" id={tempId} name={style.rating} value="2" form={form} checked={true}/><label class = {style.full} for={tempId} title="Kinda bad - 2 stars"></label></React.Fragment>);
    }
    else
    {
        stars.push(<React.Fragment><input type="radio" id={tempId} name={style.rating} value="2" form={form}/><label class = {style.full} for={tempId} title="Kinda bad - 2 stars"></label></React.Fragment>);
    }
    tempId = "star1half" + id;
    if(rating == 1.50)
    {
        stars.push(<React.Fragment><input type="radio" id={tempId} name={style.rating} value="1.5" form={form} checked={true}/><label class={style.half} for={tempId} title="Meh - 1.5 stars"></label></React.Fragment>);
    }
    else
    {
        stars.push(<React.Fragment><input type="radio" id={tempId} name={style.rating} value="1.5" form={form}/><label class={style.half} for={tempId} title="Meh - 1.5 stars"></label></React.Fragment>);
    }
    tempId = "star1half" + id;
    if(rating == 1.00)
    {
        stars.push(<React.Fragment><input type="radio" id={tempId} name={style.rating} value="1" form={form} checked={true}/><label class = {style.full} for={tempId} title="Sucks big time - 1 star"></label></React.Fragment>);
    }
    else
    {
        stars.push(<React.Fragment><input type="radio" id={tempId} name={style.rating} value="1" form={form}/><label class = {style.full} for={tempId} title="Sucks big time - 1 star"></label></React.Fragment>);
    }
    tempId = "starhalf" + id;
    if(rating == 0.50)
    {
        stars.push(<React.Fragment><input type="radio" id={tempId} name={style.rating} value="0.5" form={form} checked={true}/><label class={style.half} for={tempId} title="Don't waste your time - 0.5 stars"></label></React.Fragment>);
    }
    else
    {
        stars.push(<React.Fragment><input type="radio" id={tempId} name={style.rating} value="0.5" form={form}/><label class={style.half} for={tempId} title="Don't waste your time - 0.5 stars"></label></React.Fragment>);
    }
    return stars;
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

// function to generate the background image for a movie's page or popup
const generateMovieBackground = (style, headerImage, poster, useGradient) =>
{
    useGradient = (useGradient === undefined) ? true : useGradient;
    let headerBackgroundCss;
    if(useGradient)
    {
        headerBackgroundCss = {backgroundImage: "linear-gradient(to bottom, rgba(112,107,107,0.9), rgba(112,107,107,0.9)"};
        if(headerImage !== null)
        {
            headerBackgroundCss = {backgroundImage: "linear-gradient(to bottom, rgba(112,107,107,0.9), rgba(112,107,107,0.9)),url(\"https://image.tmdb.org/t/p/original" + headerImage};
        }
        // if there is no background image, try to use the poster itself
        else if(poster !== null)
        {
            headerBackgroundCss = {backgroundImage: "linear-gradient(to bottom, rgba(112,107,107,0.9), rgba(112,107,107,0.9)),url(\"https://image.tmdb.org/t/p/original" + poster};
        }
    }
    else
    {
        headerBackgroundCss = {backgroundImage: "linear-gradient(to bottom, rgba(112,107,107,0.9), rgba(112,107,107,0.9)"};
        if(headerImage !== null)
        {
            headerBackgroundCss = {backgroundImage: "url(\"https://image.tmdb.org/t/p/original" + headerImage};
        }
        // if there is no background image, try to use the poster itself
        else if(poster !== null)
        {
            headerBackgroundCss = {backgroundImage: "url(\"https://image.tmdb.org/t/p/original" + poster};
        }
    }
    return headerBackgroundCss;
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

// function to check if a movie is on a users watchlist
const checkMovieOnWatchList = (movie, username) =>
{
    if(username === "") return false;
    let watchList = false;
    // make these two if's reusable functions...
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
    return watchList;
}

// function to check if a movie has been watched by a user
const checkMovieOnWatchedList = (movie, username) =>
{
    if(username === "") return false;
    let watched = false;
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
    return watched;
}

export {generateWatchListButton, generateWatchedListButton, generateMovieTrailer, generateOverview, generateDirector,
        generateGenres, generateMovieInfo, generateMovieRuntime, generateMoviePoster, generateRatingStars,
        checkMovieOnWatchList, checkMovieOnWatchedList, generateMovieBackground};
