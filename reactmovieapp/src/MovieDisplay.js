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

    /* for testing, this will not actually be used here */
    async componentDidMount()
    {
        this.updateMovieInfo(this.state.id);
    }

    // function to handle call to api and result
    async updateMovieInfo(value)
    {
        let movieData = await this.getMovieInfo(value);
        let status = movieData[0];
        if(status === 200)
        {
            console.log("Movie Info");
            console.log(movieData[1]);
            this.setState({
              movie: movieData[1]
            });
        }
        else
        {
            alert("Movie request failed");
        }
    }

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
                if(status === 200)
                {
                    return res.json();
                }
                else
                {
                    return res.text();
                }
            }).then(result=> {
                return [status, result];
            });
    }



    /* for testing */

    posterClickHandler()
    {
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
            moviePopup = <MovieDisplayPopUp movie={this.state.movie} removeFunction={this.posterClickHandler}/>;
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
