import React from 'react';
import Poster from './Poster';


const PhotoContainer = props => {
	const displayPosters  = () => {
		return props.movies.map(movie => {
			return <Poster 
						poster_path={movie.poster_path} 
						title={movie.title}
						release_date={movie.release_date}
					/>;			
		});
	};
	
	return(
		<>
			<section>
				{displayPosters()}
			</section>
		</>
	);
};


export default PhotoContainer;