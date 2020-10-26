import React from 'react';
import Popup from 'reactjs-popup';
import style from './css/Movies/MovieDisplayPopUp.module.css'

// component to display the movie poster large on screen when clicked on
// the movies page
class MovieDisplayPopUp extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			open: true,
            poster: this.props.poster,
            headerImage: this.props.headerImage,
            trailer: "LdOM0x0XDMo",
            overview: "Armed with only one word - Tenet - and fighting for the survival of the entire world, the Protagonist journeys through a twilight world of international espionage on a mission that will unfold in something beyond real time."
		};
		this.openModal = this.openModal.bind(this);
		this.closeModal = this.closeModal.bind(this);
		this.changeHandler = this.changeHandler.bind(this);
        this.generateMoviePoster = this.generateMoviePoster.bind(this);
        this.generateMovieTrailer = this.generateMovieTrailer.bind(this);
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
        return (
          <div className={style.movieImageContainer}>
              <img className={style.moviePoster} src={posterPath}/>
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

    render() {
            alert("Rendering");
            let poster = this.generateMoviePoster();
            let trailer = this.generateMovieTrailer();
            let overview = "";
            let genres = "";
            let director = "";
            let headerBackgroundCss = {backgroundImage: "linear-gradient(to bottom, rgba(112,107,107,0.9), rgba(112,107,107,0.9)),url(\"https://image.tmdb.org/t/p/original" + this.state.headerImage};
    		return (
        			<div>
                        <Popup
                            open={this.state.open}
                            closeOnDocumentClick
                            onClose={this.closeModal}
                            contentStyle={{ width: "50%", border: "0px", padding: "0px"}}
                        >
                            <div className={style.modal}>
                                <div className={style.content}>
                                    <div className={style.headerContainer}>
                                        {poster}
                                        <div className={style.movieDetailsOutterContainer}>
                                            <div className={style.movieDetailsContainer}>
                                                <div className={style.movieTitle}>
                                                    Tenet
                                                </div>
                                                <div className={style.detailsContainer}>
                                                    <div className={style.detailsHeader}>
                                                        Overview
                                                    </div>
                                                    {this.state.overview}
                                                </div>
                                                <div className={style.detailsContainer}>
                                                    <div className={style.detailsHeader}>
                                                        Overview
                                                    </div>
                                                    {this.state.overview}
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
