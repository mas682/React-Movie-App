import React from 'react';
import Popup from 'reactjs-popup';
import style from '../css/Movies/MovieTrailerPopUp.module.css';
import {generateMovieTrailer} from '../StaticFunctions/MovieHtmlFunctions.js';
import '../css/Movies/MovieTrailerPopUp.css';

// component to display the movie poster large on screen when clicked on
// the movies page
class MovieTrailerPopUp extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			open: true,
      		trailerPath: this.props.trailerPath
		};
		this.openModal = this.openModal.bind(this);
		this.closeModal = this.closeModal.bind(this);
		this.changeHandler = this.changeHandler.bind(this);
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

    render() {
            console.log(this.state.trailerPath);
            let trailer = generateMovieTrailer(style, this.state.trailerPath);
            console.log(trailer);
    		return (
        			<div>
                  <Popup
                      open={this.state.open}
                      closeOnDocumentClick
                      onClose={this.closeModal}
					  className={"movieTrailer"}
                  >
                      <div className={style.modal}>
                          <div className={style.content}>
                              {trailer}
                          </div>
                      </div>
                  </Popup>
        			</div>
    		);
    }
}

export default MovieTrailerPopUp;
