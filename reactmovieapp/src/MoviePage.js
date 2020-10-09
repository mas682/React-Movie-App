import React, { Component } from 'react';
//import axios from 'axios';
import {Link, Redirect, withRouter} from 'react-router-dom';
import MainPage from './MainPage.js';
import Movie from './MovieReview.js';
import PhotoContainer from "./PhotoContainer";
//const querySTring = require('query-string');
import queryString from "query-string";


class MoviePage extends React.Component {
	constructor(props) {
		super(props);
		props.updateLoggedIn("admin", true);
	}

	render() {
	//	alert(useHistory());
		console.log(queryString.parse(this.props.location.search));
		return (
			<section className="app">
				<h1>Movie Info Page</h1>
				<iframe width="420" height="315" src="https://www.youtube.com/embed/LdOM0x0XDMo"></iframe>
				<iframe width="560" height="315" src="https://www.youtube.com/embed/AZGcmvrTX9M" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
			</section>
		);
	}
}


export default withRouter(MoviePage);
