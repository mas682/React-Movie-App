import React from 'react';
import history from './History'
import { Link } from 'react-router-dom';
import Popup from 'reactjs-popup';
import style from './css/reviewform.module.css';
import'./css/reviewform.css';


class ReviewPopUp extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            open: false,
            title: "",
            rating: "",
            usedGoodButtons: [],
            usedBadButtons: [],
            unusedGoodButtons: ['Acting', 'Jokes', 'Too short', 'Too long', 'Story', 'Theme'],
            unusedBadButtons: ['Acting', 'Jokes', 'Too short', 'Too long', 'Story', 'Theme'],
            review: ""
        };
        this.openModal = this.openModal.bind(this);
        this.closeModal = this.closeModal.bind(this);
        this.generateButtons = this.generateButtons.bind(this);
        this.usedButtonHandler = this.usedButtonHandler.bind(this);
        this.validateForm = this.validateForm.bind(this);
        this.callApi = this.callApi.bind(this);
        this.changeHandler = this.changeHandler.bind(this);
    }

    callApi()
    {
        alert(this.state.title);
        // Simple POST request with a JSON body using fetch
        let goodString = "";
        let counter = 0;
        // get the number of good buttons minus 1
        let usedGoodButtonCount = this.state.usedGoodButtons.length - 1;
        // while still good buttons to get values for
        while(counter < this.state.usedGoodButtons.length)
        {
            if(counter == usedGoodButtonCount)
            {
                goodString = goodString + this.state.usedGoodButtons[counter];
            }
            else
            {
                goodString = goodString + this.state.usedGoodButtons[counter] + ",";
            }
            counter = counter + 1;
        }
        const requestOptions = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                title: this.state.title,
                rating: this.state.rating,
                // this will be changed eventually
                userId: 1,
                // for now, storing this with the review
                // but eventually want to associate each term
                // with many movie reviews in a sepearte table
                good: goodString,
                bad: "",
                review: this.state.review
            })
        };

        let returnValue = 0;
        alert("calling api");
        return fetch("http://localhost:9000/review", requestOptions)
            .then(res => {return res.text()});
    }

    validateForm(event) {
        event.preventDefault();
        this.callApi();

    }

    // used to update the state for the title, review, and the rating
    changeHandler(event) {
        let name = event.target.name;
        let value = event.target.value;
        this.setState({[name]: value});
    }

    usedButtonHandler(event)
    {
        // holds the new array to set the state to for the unused good buttons
        let unusedGoodArr = this.addButtonToArray(this.state.unusedGoodButtons, event.target.value);
        // holds the new array to set the state to for the unused bad buttons
        let unusedBadArr = this.addButtonToArray(this.state.unusedBadButtons, event.target.value);

        console.log(event.target);
        // if the button clicked was a good button
        if(event.target.id == "goodButton")
        {
            // remove the button from the used good buttons
            let usedGoodArr = this.removeButtonFromArray(this.state.usedGoodButtons, event.target.value);
            // update the state
            this.setState({usedGoodButtons: usedGoodArr, unusedGoodButtons: unusedGoodArr,
                unusedBadButtons: unusedBadArr});
        }
        else
        {
            // remove the button from the used bad buttons
            let usedBadArr = this.removeButtonFromArray(this.state.usedBadButtons, event.target.value);
            // update the state
            this.setState({usedBadButtons: usedBadArr, unusedGoodButtons: unusedGoodArr,
                unusedBadButtons: unusedBadArr});
        }
    }

    // function to add a new value to the buttons arrays
    addButtonToArray(oldArray, value)
    {
        // initialize loop counter
        let counter = 0;
        let newArray = [];
        let arrayLength = oldArray.length + 1;
        while(counter < arrayLength)
        {
            // if counter is less than the old array length, simply copy the value
            if(counter < oldArray.length)
            {
                newArray.push(oldArray[counter]);
            }
            else
            {
                // add the new value
                newArray.push(value);
            }
            counter = counter + 1;
        }
        return newArray;
    }

    // function to remove a old value from the buttons arrays
    removeButtonFromArray(oldArray, value)
    {
        console.log(oldArray);
        let counter = 0;
        let newArray = [];
        let arrayValue = "";

        while(counter < oldArray.length)
        {
            arrayValue = oldArray[counter];
            // skip the value if this is the value to remove
            if(arrayValue == value)
            {
                counter = counter + 1;
                continue;
            }
            newArray.push(arrayValue);
            counter = counter + 1;
        }
        return newArray;
    }

    unusedButtonHandler(event)
    {
        // remove the button from the unused buttons
        let unusedGoodArr = this.removeButtonFromArray(this.state.unusedGoodButtons, event.target.value);
        let unusedBadArr = this.removeButtonFromArray(this.state.unusedBadButtons, event.target.value);

        // if the button clicked was a good button
        if(event.target.id == "goodButton")
        {
            // add the button to the used good buttons array
            let usedGoodArr = this.addButtonToArray(this.state.usedGoodButtons, event.target.value);
            // update the state
            this.setState({usedGoodButtons: usedGoodArr, unusedGoodButtons: unusedGoodArr,
                unusedBadButtons: unusedBadArr});
        }
        else
        {
            // add the button to the used bad buttons
            let usedBadArr = this.addButtonToArray(this.state.usedBadButtons, event.target.value);
            // update the state
            this.setState({usedBadButtons: usedBadArr, unusedGoodButtons: unusedGoodArr,
                unusedBadButtons: unusedBadArr});
        }
    }

    // value is the value of the button
    // type is either good or bad
    // used is true or false
    generateButtons(value, type, used, selectedButtonLength)
    {
        if(type == "good" && used)
        {
            return <button value={value} title = "Click to remove" className={`${style.formButton} ${style.goodButton}`} id="goodButton" onClick={(e)=> this.usedButtonHandler(e)}>{value}</button>;
        }
        else if(type == "good" && !used)
        {
            if(selectedButtonLength < 5)
            {
                return <button value={value} title = "Click to select" className={`${style.formButton} ${style.unusedButtonOpacity} ${style.goodButton}`} id="goodButton" onClick={(e)=> this.unusedButtonHandler(e)}>{value}</button>;
            }
            else
            {
                return <div title="Remove one of the choices above to select this one"><button value={value} className={`${style.formButton} ${style.unusedButtonOpacity} ${style.unclickableButton} ${style.goodButton}`} id="goodButton" onClick={(e)=> this.unusedButtonHandler(e)}>{value}</button></div>;
            }
        }
        else if(type == "bad" && used)
        {
            return <button value={value} className={`${style.formButton} ${style.badButton}`} title = "Click to remove" id="badButton" onClick={(e)=> this.usedButtonHandler(e)}>{value}</button>;
        }
        else
        {
            if(selectedButtonLength < 5)
            {
                return <button value={value} className={`${style.formButton} ${style.unusedButtonOpacity} ${style.badButton}`} id="badButton" title = "Click to select" onClick={(e)=> this.unusedButtonHandler(e)}>{value}</button>;
            }
            else
            {
                return <div title="Remove one of the choices above to select this one" ><button value={value} className={`${style.formButton} ${style.unusedButtonOpacity} ${style.unclickableButton} ${style.badButton}`} id="badButton" onClick={(e)=> this.unusedButtonHandler(e)}>{value}</button></div>;
            }
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
                        <h4 className={style.h4NoMargin}>Movie Title</h4>
                    </label>
                    <input
                        type="text"
                        name="title"
                        form = "form2"
                        className="inputFieldBoxLong validInputBox"
                        onChange={this.changeHandler}
                    />
                </React.Fragment>);

        let reviewInput = (
                <React.Fragment>
                    <label>
                        <h4 className={style.h4NoMargin}>Optional Review</h4>
                    </label>
                    <textarea
                        type="text"
                        name="review"
                        form = "form2"
                        className={`inputFieldBoxLong ${style.reviewInputField}`}
                        onChange={this.changeHandler}
                        rows="10"
                    />
                </React.Fragment>);

        let instructionTextGood = (
            <React.Fragment>
                    <div className={style.instructionText}>Select up to 5 of the options below</div>
            </React.Fragment>);

        let instructionTextBad = (
            <React.Fragment>
                <div className={style.halfTextContainer}>
                    <div className={style.instructionText}>Select up to 5 of the options below</div>
                </div>
            </React.Fragment>);

        if(this.state.usedGoodButtons.length > 0)
        {
            instructionTextGood = "";
        }

        if(this.state.usedBadButtons.length > 0)
        {
            instructionTextBad = "";
        }


        let counter = 0;
        let unusedGoodButtonArr = [];
        let unusedBadButtonArr = [];
        let usedGoodButtonArr = [];
        let usedBadButtonArr = [];

        // generate the unused good buttons
        while(counter < this.state.unusedGoodButtons.length)
        {
            unusedGoodButtonArr.push(this.generateButtons(this.state.unusedGoodButtons[counter], "good", false, this.state.usedGoodButtons.length));
            counter = counter + 1;
        }

        // reset the counter
        counter = 0;
        // generate the unused bad buttons
        while(counter < this.state.unusedBadButtons.length)
        {
            unusedBadButtonArr.push(this.generateButtons(this.state.unusedBadButtons[counter], "bad", false, this.state.usedBadButtons.length));
            counter = counter + 1;
        }

        // reset the counter
        counter = 0;
        // generate the used good buttons
        while(counter < this.state.usedGoodButtons.length)
        {
            usedGoodButtonArr.push(this.generateButtons(this.state.usedGoodButtons[counter], "good", true, 0));
            counter = counter + 1;
        }


        // reset the counter
        counter = 0;
        // generate the unused bad buttons
        while(counter < this.state.usedBadButtons.length)
        {
            usedBadButtonArr.push(this.generateButtons(this.state.usedBadButtons[counter], "bad", true, 0));
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
                            <h3 className ="inlineH3"> Movie Review </h3>
                        </div>
                        <div className="content">
                            {/* This will eventually be a post form */}
                            <form id="form2" onSubmit={this.validateForm} noValidate/>
                            <div className = "inputFieldContainer">
                                {titleInput}
                            </div>
                            <div className = {`${style.centeredMaxWidthContainer} ${style.containerMarginBottom10}`}>
                                <h4 className={style.h4NoMargin}>Rating</h4>
                            </div>
                            <div className = {`${style.centeredMaxWidthContainer} ${style.containerMarginBottom10}`}>
                                <fieldset class="rating">
                                    <input type="radio" id="star5" name="rating" value="5" form="form2" onClick={this.changeHandler}/><label class="full" for="star5" title="Awesome - 5 stars"></label>
                                    <input type="radio" id="star4half" name="rating" value="4.5" form="form2" onClick={this.changeHandler}/><label class="half" for="star4half" title="Pretty good - 4.5 stars"></label>
                                    <input type="radio" id="star4" name="rating" value="4" form="form2" onClick={this.changeHandler}/><label class = "full" for="star4" title="Pretty good - 4 stars"></label>
                                    <input type="radio" id="star3half" name="rating" value="3.5" form="form2" onClick={this.changeHandler}/><label class="half" for="star3half" title="Meh - 3.5 stars"></label>
                                    <input type="radio" id="star3" name="rating" value="3" form="form2" onClick={this.changeHandler}/><label class = "full" for="star3" title="Meh - 3 stars"></label>
                                    <input type="radio" id="star2half" name="rating" value="2.5" form="form2" onClick={this.changeHandler}/><label class="half" for="star2half" title="Kinda bad - 2.5 stars"></label>
                                    <input type="radio" id="star2" name="rating" value="2" form="form2" onClick={this.changeHandler}/><label class = "full" for="star2" title="Kinda bad - 2 stars"></label>
                                    <input type="radio" id="star1half" name="rating" value="1.5" form="form2" onClick={this.changeHandler}/><label class="half" for="star1half" title="Meh - 1.5 stars"></label>
                                    <input type="radio" id="star1" name="rating" value="1" form="form2" onClick={this.changeHandler}/><label class = "full" for="star1" title="Sucks big time - 1 star"></label>
                                    <input type="radio" id="starhalf" name="rating" value="0.5" form="form2" onClick={this.changeHandler}/><label class="half" for="starhalf" title="Don't waste your time - 0.5 stars"></label>
                                </fieldset>
                            </div>
                            <div className={style.proConContainter}>
                                <div className={style.centeredMaxWidthContainer}>
                                    <h4 className={style.h4NoMargin}>The Good</h4>
                                </div>
                                <div className={`${style.centeredMaxWidthContainer} ${style.buttonContainer} ${style.usedButtonContainerHeight}`}>
                                    {usedGoodButtonArr}
                                    {instructionTextGood}
                                </div>
                                <div className={style.selectedDivider}></div>
                                <div className={`${style.centeredMaxWidthContainer} ${style.buttonContainer} ${style.marginTopBottom20}`}>
                                    {unusedGoodButtonArr}
                                </div>
                            </div>
                            <div className={style.proConContainter}>
                                <div className={style.centeredMaxWidthContainer}>
                                    <h4 className={style.h4NoMargin}>The Bad</h4>
                                </div>
                                <div className={`${style.centeredMaxWidthContainer} ${style.buttonContainer} ${style.usedButtonContainerHeight}`}>
                                    {usedBadButtonArr}
                                    {instructionTextBad}
                                </div>
                                <div className={style.selectedDivider}></div>
                                <div className={`${style.centeredMaxWidthContainer} ${style.buttonContainer} ${style.marginTopBottom20}`}>
                                    {unusedBadButtonArr}
                                </div>
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
                                onClick={this.validateForm}
                            >POST YOUR REVIEW</button>
                        </div>
                    </div>
                </Popup>
              </div>
            );
    }
}

export default ReviewPopUp;
