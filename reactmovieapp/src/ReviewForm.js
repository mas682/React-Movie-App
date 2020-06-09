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
            usedGoodButtons: ['Jokes', 'Too short', 'Too long'],
            usedBadButtons: ['Story', 'Acting', 'Jokes'],
            unusedGoodButtons: ['Acting', 'Jokes', 'Too short', 'Too long', 'Story'],
            unusedBadButtons: ['Acting', 'Jokes', 'Too short', 'Too long', 'Story']
        };
        this.openModal = this.openModal.bind(this);
        this.closeModal = this.closeModal.bind(this);
        this.generateButtons = this.generateButtons.bind(this);
        this.goodBadButtonHandler = this.goodBadButtonHandler.bind(this);
    }

    goodBadButtonHandler(event)
    {
        console.log(event.target.id);
        let moveFromUnused = true;
        /*
        if(this.state.unusedGoodButtons.contains(event.value))
        {

        }
        */
    }

    generateButtons(value, type)
    {
        if(type == "good")
        {
            return <button value={value} className="formButton" id="goodButton" onClick={(e)=> this.goodBadButtonHandler(e)}>{value}</button>;
        }
        else
        {
            return <button value={value} className="formButton" id="badButton" onClick={(e)=> this.goodBadButtonHandler(e)}>{value}</button>;
        }
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

        let titleInput = (
                <React.Fragment>
                    <label>
                        <h4>Movie Title</h4>
                    </label>
                    <input
                        type="text"
                        name="movie"
                        form = "form2"
                        id="validInputBox"
                        className="inputFieldBoxLong"
                        onChange={this.changeHandler}
                    />
                </React.Fragment>);

        let reviewInput = (
                <React.Fragment>
                    <label>
                        <h4>Optional Review</h4>
                    </label>
                    <textarea
                        type="text"
                        name="review"
                        form = "form2"
                        id="reviewInputField"
                        className="inputFieldBoxLong"
                        onChange={this.changeHandler}
                        rows="10"
                    />
                </React.Fragment>);

        let counter = 0;
        let unusedGoodButtonArr = [];
        let unusedBadButtonArr = [];
        let usedGoodButtonArr = [];
        let usedBadButtonArr = [];

        // generate the unused good buttons
        while(counter < this.state.unusedGoodButtons.length)
        {
            unusedGoodButtonArr.push(this.generateButtons(this.state.unusedGoodButtons[counter], "good"));
            counter = counter + 1;
        }

        // reset the counter
        counter = 0;
        // generate the unused bad buttons
        while(counter < this.state.unusedBadButtons.length)
        {
            unusedBadButtonArr.push(this.generateButtons(this.state.unusedBadButtons[counter], "bad"));
            counter = counter + 1;
        }

        // reset the counter
        counter = 0;
        // generate the used good buttons
        while(counter < this.state.usedGoodButtons.length)
        {
            usedGoodButtonArr.push(this.generateButtons(this.state.usedGoodButtons[counter], "good"));
            counter = counter + 1;
        }


        // reset the counter
        counter = 0;
        // generate the unused bad buttons
        while(counter < this.state.usedBadButtons.length)
        {
            usedBadButtonArr.push(this.generateButtons(this.state.usedBadButtons[counter], "bad"));
            counter = counter + 1;
        }

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
                            <div className = "inputFieldContainer">
                                {titleInput}
                            </div>
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
                            <div className="proConContainter">
                                <div className="halfHeaderContainer">
                                    <h4 className = "h4NoMargin">The Good</h4>
                                </div>
                                {usedGoodButtonArr}
                                <div>Select from the options below</div>
                                <div className="selectedDivider"></div>
                                {unusedGoodButtonArr}
                            </div>
                            <div className="proConContainter">
                                <div className="halfHeaderContainer">
                                    <h4 className = "h4NoMargin">The Bad</h4>
                                </div>
                                {usedBadButtonArr}
                                <div>Select from the options below</div>
                                <div className="selectedDivider"></div>
                                {unusedBadButtonArr}
                            </div>
                            <div className = "inputFieldContainer">
                                {reviewInput}
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
