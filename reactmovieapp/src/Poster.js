import React from 'react';
import {Link, Redirect } from 'react-router-dom';
import './css/upcomingmovies.css';


const Poster = (props) => {
	var date = props.release_date
	var months = {
		'01': "January",
		'02': "February",
		'03': "March",
		'04': "April",
		'05': "May",
		'06': "June",
		'07': "July",
		'08': "August",
		'09': "September",
		'10': "October",
		'11': "November",
		'12': "December",
	}
	
	function getDay() {
		var date = props.release_date
		var day = date.slice(8, 9)
		if(day == '0') {
			return date.slice(9, 10)
		} else {
			return date.slice(8, 10)
		}
	}
	
	return(
		<section>
			<Link to="/movie"><img src={"https://image.tmdb.org/t/p/original" + props.poster_path} height="500" width="300"/></Link>
			<Link to="/movie" className="movieTitle"><h3>{props.title}</h3></Link>
			<h4>Release Date: {months[date.slice(5, 7)]} {getDay()}, {date.slice(0, 4)}</h4>
		</section>
	)
}


export default Poster