import React, { Component } from 'react';
import {Link, Redirect, withRouter} from 'react-router-dom';
import style from './css/Movies/MovieDisplay.module.css'
import MovieDisplayPopUp from './MovieDisplayPopUp.js';

class MovieDisplay extends React.Component {
    constructor(props){
        super(props);

        this.state = {
            id: this.props.id,
            poster: this.props.poster,
            movie: [],
            loading: false,
            moviePopup: false
        };
        this.posterClickHandler = this.posterClickHandler.bind(this);
    }

    // called when component receiving new props
    // may or may not be needed
    componentWillReceiveProps(nextProps) {

    };

    posterClickHandler()
    {
        alert("HERE");
        let opened = this.state.moviePopup;
        this.setState({
            moviePopup: !opened
        });
    }

    render()
    {
        if(this.state.loading)
        {
            return null;
        }

        let posterPath = "";
        if(this.state.poster !== null)
        {
            posterPath = "https://image.tmdb.org/t/p/original" + this.state.poster;
        }
        let moviePopup = "";
        if(this.state.moviePopup)
        {
            alert("Pop up");
            moviePopup = <MovieDisplayPopUp poster={this.state.poster} headerImage="/wzJRB4MKi3yK138bJyuL9nx47y6.jpg"/>;
        }

        return (
            <div className={style.main} onClick={this.posterClickHandler}>
                <div className={style.movieImageContainer}>
                    <img className={style.moviePoster} src={posterPath}/>
                </div>
                <h3>Mulan</h3>
                {moviePopup}
            </div>
        )
    }

}

export default withRouter(MovieDisplay);
