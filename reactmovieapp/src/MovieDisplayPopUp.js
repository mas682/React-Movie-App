import React from 'react';
import Popup from 'reactjs-popup';
import style from './css/Movies/MovieDisplayPopUp.module.css'
import {Link, Redirect, withRouter} from 'react-router-dom';

// component to display the movie poster large on screen when clicked on
// the movies page
class MovieDisplayPopUp extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			open: true,
			movie: this.props.movie,
            poster: this.props.movie.poster,
            headerImage: this.props.movie.backgroundImage,
            trailer: this.props.movie.trailer,
			movieInfoString: this.generateMovieInfo(this.props.movie)
		};
		this.openModal = this.openModal.bind(this);
		this.closeModal = this.closeModal.bind(this);
		this.changeHandler = this.changeHandler.bind(this);
        this.generateMoviePoster = this.generateMoviePoster.bind(this);
        this.generateMovieTrailer = this.generateMovieTrailer.bind(this);
		this.generateMovieRuntime = this.generateMovieRuntime.bind(this);
		this.generateMovieInfo = this.generateMovieInfo.bind(this);
		this.generateOverview = this.generateOverview.bind(this);
		this.generateDirector = this.generateDirector.bind(this);
		this.generateGenres = this.generateGenres.bind(this);
	}

	openModal() {
		this.setState({ open: true });
	}

	closeModal() {
        this.setState({
            open: false,
        });
		this.props.removeFunction();
    }

	changeHandler(event) {
        let name = event.target.name;
        let value = event.target.value;
        this.setState({[name]: value});
    }

    generateMoviePoster()
    {
        let posterPath = "";
        if(this.state.poster !== null)
        {
            posterPath = "https://image.tmdb.org/t/p/original" + this.state.poster;
        }
		let moviePage = "movie/" + this.state.movie.id;
        return (
          <div className={style.movieImageContainer}>
              <Link to={moviePage}><img className={style.moviePoster} src={posterPath}/></Link>
          </div>
        );
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

	generateOverview()
	{
		if(this.state.movie.overview !== null)
		{
			return (
				<div className={style.detailsContainer}>
					<div className={style.detailsHeader}>
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
			  <div className={style.detailsContainer}>
				  <div className={style.detailsHeader}>
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

    render() {
            let poster = this.generateMoviePoster();
            let trailer = this.generateMovieTrailer();
            let overview = this.generateOverview();
            let genres = this.generateGenres();
            let director = this.generateDirector();
			let headerBackgroundCss = {backgroundImage: "linear-gradient(to bottom, rgba(112,107,107,0.9), rgba(112,107,107,0.9))"};
			if(this.state.headerImage !== null)
			{
            	headerBackgroundCss = {backgroundImage: "linear-gradient(to bottom, rgba(112,107,107,0.9), rgba(112,107,107,0.9)),url(\"https://image.tmdb.org/t/p/original" + this.state.headerImage};
			}
			else if(this.state.poster !== null)
			{
				headerBackgroundCss = {backgroundImage: "linear-gradient(to bottom, rgba(112,107,107,0.9), rgba(112,107,107,0.9)),url(\"https://image.tmdb.org/t/p/original" + this.state.poster};

			}
    		return (
        			<div>
                        <Popup
                            open={this.state.open}
                            closeOnDocumentClick
                            onClose={this.closeModal}
                            contentStyle={{ width: "50%", border: "0px", padding: "0px"}}
                        >
                            <div className={style.modal}>
                                <div className={style.content} style={headerBackgroundCss}>
                                    <div className={style.headerContainer}>
                                        {poster}
                                        <div className={style.movieDetailsOutterContainer}>
                                            <div className={style.movieDetailsContainer}>
                                                <div className={style.movieTitle}>
                                                    {this.state.movie.title}
                                                </div>
												<div className={style.infoContainer}>
													{this.state.movieInfoString}
												</div>
												{overview}
                                                {genres}
                                                {director}
                                            </div>
                                        </div>
                                    </div>
                                    {trailer}
                                </div>
                            </div>
                        </Popup>
        			</div>
    		);
    }
}


export default MovieDisplayPopUp;
