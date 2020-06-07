import React from 'react';
import history from './History'
import { Link } from 'react-router-dom';
import Popup from 'reactjs-popup';
import './css/reviewform.css';


class ReviewPopUp extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            open: false,
        };
        this.openModal = this.openModal.bind(this);
        this.closeModal = this.closeModal.bind(this);
    }

    openModal() {
        this.setState({ open: true });
    }

    closeModal() {
        this.setState({
            open: false,
        });
    }

    render() {
        return (
            <div>
                <button className="button" onClick={this.openModal}>
                    Write Review
                </button>
                <Popup
                    open={this.state.open}
                    closeOnDocumentClick
                    onClose={this.closeModal}
                >
                    <div className="modal">
                        {/* &times is the multiplication symbol (x) --> */}
                        <a className="close" onClick={this.closeModal}>
                        &times;
                        </a>
                        <div className="header">
                            <h3> Movie Review </h3>
                        </div>
                        <div className="content">
                            {/* This will eventually be a post form */}
                            <form id="form2" onSubmit={this.validateForm} noValidate/>
                            <div className = "ratingContainer">
                                <fieldset class="rating">
                                    <input type="radio" id="star5" name="rating" value="5" form="form2"/><label class = "full" for="star5" title="Awesome - 5 stars"></label>
                                    <input type="radio" id="star4half" name="rating" value="4.5" form="form2"/><label class="half" for="star4half" title="Pretty good - 4.5 stars"></label>
                                    <input type="radio" id="star4" name="rating" value="4" form="form2"/><label class = "full" for="star4" title="Pretty good - 4 stars"></label>
                                    <input type="radio" id="star3half" name="rating" value="3.5" form="form2"/><label class="half" for="star3half" title="Meh - 3.5 stars"></label>
                                    <input type="radio" id="star3" name="rating" value="3" form="form2"/><label class = "full" for="star3" title="Meh - 3 stars"></label>
                                    <input type="radio" id="star2half" name="rating" value="2.5" form="form2"/><label class="half" for="star2half" title="Kinda bad - 2.5 stars"></label>
                                    <input type="radio" id="star2" name="rating" value="2" form="form2"/><label class = "full" for="star2" title="Kinda bad - 2 stars"></label>
                                    <input type="radio" id="star1half" name="rating" value="1.5" form="form2"/><label class="half" for="star1half" title="Meh - 1.5 stars"></label>
                                    <input type="radio" id="star1" name="rating" value="1" form="form2"/><label class = "full" for="star1" title="Sucks big time - 1 star"></label>
                                    <input type="radio" id="starhalf" name="rating" value="0.5" form="form2"/><label class="half" for="starhalf" title="Don't waste your time - 0.5 stars"></label>
                                </fieldset>
                            </div>
                        </div>
                        <div className="actions">
                            <button
                                form="form1"
                                value="create_account"
                                className="submitButton"
                            >POST YOUR REVIEW</button>
                        </div>
                    </div>
                </Popup>
              </div>
            );
    }
}

export default ReviewPopUp;
