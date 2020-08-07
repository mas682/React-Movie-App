import React from 'react';


const Poster = (props) => {
	return(
		<section>
			<img src={"https://image.tmdb.org/t/p/original" + props.poster_path} height="500" width="300"/>
			<h3>{props.title}</h3>
			<h4>Release Date: {props.release_date}</h4>
		</section>
	)
}


export default Poster