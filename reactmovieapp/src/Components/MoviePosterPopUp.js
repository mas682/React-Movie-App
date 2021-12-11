import React from 'react';
import Popup from 'reactjs-popup';
import style from '../css/Movies/movieinfo.module.css'
import '../css/Movies/MoviePosterPopup.css';

// component to display the movie poster large on screen when clicked on
// the movies page
class MoviePosterPopUp extends React.Component {
	constructor(props) {
		super(props);
		this.state = { 
			open: true,
      		posterPath: this.props.posterPath
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
            let containerStyle = {};
    		return (
        			<div>
                  <Popup
                      open={this.state.open}
                      closeOnDocumentClick
                      onClose={this.closeModal}
					  className={"moviePoster"}
                  >
                      <div className={style.modal}>
                          <div className={style.content}>
                              <div className={style.posterContainer} style={containerStyle}>
                                  <img className={style.moviePosterLarge} src={this.state.posterPath} onClick={this.posterClickHandler}/>
                              </div>
                          </div>
                      </div>
                  </Popup>
        			</div>
    		);
    }
}

export default MoviePosterPopUp;