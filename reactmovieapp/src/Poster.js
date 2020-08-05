import React from 'react';


const Poster = (props) => {
	return(
		<section>
			<img src={"https://image.tmdb.org/t/p/original" + props.poster_path} height="500" width="300"/>
		</section>
	)
}


export default Poster