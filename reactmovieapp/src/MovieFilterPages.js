import React, { Component } from 'react';
import {Link, Redirect, withRouter} from 'react-router-dom';
import queryString from "query-string";
import style from './css/Movies/moviefilterpages.module.css'
import MovieDisplay from './MovieDisplay.js';

class MovieFilterPage extends React.Component {
    constructor(props){
        super(props);

        // will need fixed
        props.updateLoggedIn("admin", true);
        this.state = {
            header: this.props.type,
            movies: [],
            loading: false
        };
    }

    // called when component receiving new props
    // may or may not be needed
    componentWillReceiveProps(nextProps) {

    };

    render()
    {
        if(this.state.loading)
        {
            return null;
        }

        return (
            <div className={style.mainBodyContainer}>
                <div className={style.headerContainer}>
                    <h1>{this.state.header}</h1>
                </div>
                <div className={style.movieDisplayContainer}>
                    <div className={style.movieContainer}>
                        <MovieDisplay id={577922} poster="/k68nPLbIST6NP96JmTxmZijEvCA.jpg"/>
                    </div>
                    <div className={style.movieContainer}>
                        <MovieDisplay id={337401} poster="/aKx1ARwG55zZ0GpRvU2WrGrCG9o.jpg"/>
                    </div>
                    <div className={style.movieContainer}>
                        <MovieDisplay id={616251} poster="/wGkr4r1e8nubmSNKJpv3HL6sFrA.jpg"/>
                    </div>
                    <div className={style.movieContainer}>
                        <MovieDisplay id={577922} poster="/jq67d2UvbozXszkrLnGDzwnWSnu.jpg"/>
                    </div>
                    <div className={style.movieContainer}>
                        <MovieDisplay id={577922} poster="/k68nPLbIST6NP96JmTxmZijEvCA.jpg"/>
                    </div>
                    <div className={style.movieContainer}>
                        <MovieDisplay id={577922} poster="/aKx1ARwG55zZ0GpRvU2WrGrCG9o.jpg"/>
                    </div>
                    <div className={style.movieContainer}>
                        <MovieDisplay id={577922} poster="/wGkr4r1e8nubmSNKJpv3HL6sFrA.jpg"/>
                    </div>
                    <div className={style.movieContainer}>
                        <MovieDisplay id={577922} poster="/jq67d2UvbozXszkrLnGDzwnWSnu.jpg"/>
                    </div>
                    <div className={style.movieContainer}>
                        <MovieDisplay id={577922} poster="/k68nPLbIST6NP96JmTxmZijEvCA.jpg"/>
                    </div>
                    <div className={style.movieContainer}>
                        <MovieDisplay id={577922} poster="/aKx1ARwG55zZ0GpRvU2WrGrCG9o.jpg"/>
                    </div>
                    <div className={style.movieContainer}>
                        <MovieDisplay id={577922} poster="/wGkr4r1e8nubmSNKJpv3HL6sFrA.jpg"/>
                    </div>
                    <div className={style.movieContainer}>
                        <MovieDisplay id={577922} poster="/jq67d2UvbozXszkrLnGDzwnWSnu.jpg"/>
                    </div>
                </div>
            </div>
        )
    }

}

export default withRouter(MovieFilterPage);
