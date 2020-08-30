/* eslint-disable */ // need to ignore a warning when opening review form
import React from 'react';
import history from './History'
import { Link } from 'react-router-dom';
import Popup from 'reactjs-popup';
import style from './css/reviewform.module.css';


class ReviewPopUp extends React.Component {
    constructor(props) {
        super(props);
        // state will have 2 scenarios, 1 for if a user is editing a existing post
        // anoter for if the user is creating a new post
        if(this.props.edit)
        {
            this.ununsedButtonInitializer = this.ununsedButtonInitializer.bind(this);
            this.state = {
                // only true if editing the post
                edit: this.props.edit,
                open: false,
                title:this.props.data.title,
                user:this.props.data.user,
                form:this.props.data.form,
                username: this.props.data.username,
                id: this.props.data.id,
                rating: this.props.data.rating,
                usedGoodButtons: this.props.data.usedGoodButtons,
                usedBadButtons: this.props.data.usedBadButtons,
                unusedGoodButtons: ['Acting', 'Jokes', 'Too short', 'Too long', 'Story', 'Theme'],
                unusedBadButtons: ['Acting', 'Jokes', 'Too short', 'Too long', 'Story', 'Theme'],
                review: this.props.data.review,
                editUpdate: false,
            };
        }
        else
        {
            this.state = {
                edit: this.props.edit,
                open: true,
                title: "",
                rating: "",
                usedGoodButtons: [],
                usedBadButtons: [],
                unusedGoodButtons: ['Acting', 'Jokes', 'Too short', 'Too long', 'Story', 'Theme'],
                unusedBadButtons: ['Acting', 'Jokes', 'Too short', 'Too long', 'Story', 'Theme'],
                review: "",

            };
        }
        this.openModal = this.openModal.bind(this);
        this.closeModal = this.closeModal.bind(this);
        this.generateButtons = this.generateButtons.bind(this);
        this.usedButtonHandler = this.usedButtonHandler.bind(this);
        this.validateForm = this.validateForm.bind(this);
        this.callApi = this.callApi.bind(this);
        this.changeHandler = this.changeHandler.bind(this);
        this.updateReviewApi = this.updateReviewApi.bind(this);
        this.validateUpdate = this.validateUpdate.bind(this);
        //this.generateTagString = this.generateTagString.bind(this);
    }

    componentDidMount()
    {
        if(this.state.edit)
        {
            // call this to initi
            this.openModal();
        }
    }

    // this function is called the pop-up first opens when editing a post
    // to set the appropriate unused buttons
    ununsedButtonInitializer()
    {
        let usedGoodArr = this.state.usedGoodButtons;
        let usedBadArr = this.state.usedBadButtons;
        let unusedArr = ['Acting', 'Jokes', 'Too short', 'Too long', 'Story', 'Theme'];
        usedGoodArr.forEach((button) => {
            unusedArr = this.removeButtonFromArray(unusedArr, button);
        });
        usedBadArr.forEach((button) => {
            unusedArr = this.removeButtonFromArray(unusedArr, button);
        });
        this.setState({
            unusedGoodButtons: unusedArr,
            unusedBadButtons: unusedArr
        })
    }


    // function to generate the tags as a string to pass to the serever
    generateTagString(tags)
    {
        // Simple POST request with a JSON body using fetch
        let tagString = "";
        let counter = 0;
        // get the number of buttons minus 1
        let tagCount = tags.length - 1;
        // while still buttons to get values for
        while(counter < tags.length)
        {
            if(counter == tagCount)
            {
                tagString = tagString + tags[counter];
            }
            else
            {
                tagString = tagString + tags[counter] + ",";
            }
            counter = counter + 1;
        }
        return tagString;
    }

    // function to generate star ratings when editing a post
    generateRatingStars(){
        let stars = [];
        let tempId = "star5" + this.state.id;
        if(this.state.rating == 5.0)
        {
            stars.push(<React.Fragment><input type="radio" id="star5" name="rating" value="5" form="form2" onClick={this.changeHandler} checked={true}/><label class="full" for="star5" title="Awesome - 5 stars"></label></React.Fragment>);
        }
        else
        {
            stars.push(<React.Fragment><input type="radio" id="star5" name="rating" value="5" form="form2" onClick={this.changeHandler}/><label class="full" for="star5" title="Awesome - 5 stars"></label></React.Fragment>);
        }
        tempId = "star4half" + this.state.id;
        if(this.state.rating == 4.50)
        {
            stars.push(<React.Fragment><input type="radio" id="star4half" name="rating" value="4.5" form="form2" onClick={this.changeHandler} checked={true}/><label class="half" for="star4half" title="Pretty good - 4.5 stars"></label></React.Fragment>);
        }
        else
        {
            stars.push(<React.Fragment><input type="radio" id="star4half" name="rating" value="4.5" form="form2" onClick={this.changeHandler}/><label class="half" for="star4half" title="Pretty good - 4.5 stars"></label></React.Fragment>);
        }
        tempId = "star4" + this.state.id;
        if(this.state.rating == 4.00)
        {
            stars.push(<React.Fragment><input type="radio" id="star4" name="rating" value="4" form="form2" onClick={this.changeHandler} checked={true}/><label class = "full" for="star4" title="Pretty good - 4 stars"></label></React.Fragment>);
        }
        else
        {
            stars.push(<React.Fragment><input type="radio" id="star4" name="rating" value="4" form="form2" onClick={this.changeHandler}/><label class = "full" for="star4" title="Pretty good - 4 stars"></label></React.Fragment>);
        }
        tempId = "star3half" + this.state.id;
        if(this.state.rating == 3.50)
        {
            stars.push(<React.Fragment><input type="radio" id="star3half" name="rating" value="3.5" form="form2" onClick={this.changeHandler} checked={true}/><label class="half" for="star3half" title="Meh - 3.5 stars"></label></React.Fragment>);
        }
        else
        {
            stars.push(<React.Fragment><input type="radio" id="star3half" name="rating" value="3.5" form="form2" onClick={this.changeHandler}/><label class="half" for="star3half" title="Meh - 3.5 stars"></label></React.Fragment>);
        }
        tempId = "star3" + this.state.id;
        if(this.state.rating == 3.00)
        {
            stars.push(<React.Fragment><input type="radio" id="star3" name="rating" value="3" form="form2" onClick={this.changeHandler} checked={true}/><label class = "full" for="star3" title="Meh - 3 stars"></label></React.Fragment>);
        }
        else
        {
            stars.push(<React.Fragment><input type="radio" id="star3" name="rating" value="3" form="form2" onClick={this.changeHandler}/><label class = "full" for="star3" title="Meh - 3 stars"></label></React.Fragment>);
        }
        tempId = "star2half" + this.state.id;
        if(this.state.rating == 2.50)
        {
            stars.push(<React.Fragment><input type="radio" id="star2half" name="rating" value="2.5" form="form2" onClick={this.changeHandler} checked={true}/><label class="half" for="star2half" title="Kinda bad - 2.5 stars"></label></React.Fragment>);
        }
        else
        {
            stars.push(<React.Fragment><input type="radio" id="star2half" name="rating" value="2.5" form="form2" onClick={this.changeHandler}/><label class="half" for="star2half" title="Kinda bad - 2.5 stars"></label></React.Fragment>);
        }
        tempId = "star2" + this.state.id;
        if(this.state.rating == 2.00)
        {
            stars.push(<React.Fragment><input type="radio" id="star2" name="rating" value="2" form="form2" onClick={this.changeHandler} checked={true}/><label class = "full" for="star2" title="Kinda bad - 2 stars"></label></React.Fragment>);
        }
        else
        {
            stars.push(<React.Fragment><input type="radio" id="star2" name="rating" value="2" form="form2" onClick={this.changeHandler}/><label class = "full" for="star2" title="Kinda bad - 2 stars"></label></React.Fragment>);
        }
        tempId = "star1half" + this.state.id;
        if(this.state.rating == 1.50)
        {
            stars.push(<React.Fragment><input type="radio" id="star1half" name="rating" value="1.5" form="form2" onClick={this.changeHandler} checked={true}/><label class="half" for="star1half" title="Meh - 1.5 stars"></label></React.Fragment>);
        }
        else
        {
            stars.push(<React.Fragment><input type="radio" id="star1half" name="rating" value="1.5" form="form2" onClick={this.changeHandler}/><label class="half" for="star1half" title="Meh - 1.5 stars"></label></React.Fragment>);
        }
        tempId = "star1half" + this.state.id;
        if(this.state.rating == 1.00)
        {
            stars.push(<React.Fragment><input type="radio" id="star1" name="rating" value="1" form="form2" onClick={this.changeHandler} checked={true}/><label class = "full" for="star1" title="Sucks big time - 1 star"></label></React.Fragment>);
        }
        else
        {
            stars.push(<React.Fragment><input type="radio" id="star1" name="rating" value="1" form="form2" onClick={this.changeHandler}/><label class = "full" for="star1" title="Sucks big time - 1 star"></label></React.Fragment>);
        }
        tempId = "starhalf" + this.state.id;
        if(this.state.rating == 0.50)
        {
            stars.push(<React.Fragment><input type="radio" id="starhalf" name="rating" value="0.5" form="form2" onClick={this.changeHandler} checked={true}/><label class="half" for="starhalf" title="Don't waste your time - 0.5 stars"></label></React.Fragment>);
        }
        else
        {
            stars.push(<React.Fragment><input type="radio" id="starhalf" name="rating" value="0.5" form="form2" onClick={this.changeHandler}/><label class="half" for="starhalf" title="Don't waste your time - 0.5 stars"></label></React.Fragment>);
        }
        return stars;
    }

    closeModal()
    {
        // if editing, call the parent function from moviePost to not use the popup anymore
        if(this.state.edit)
        {
            this.props.removeFunction("openEdit",false);
        }
        else
        {
            this.props.removeFunction();
        }
        if(!this.state.edit)
        {
            this.setState({
                open: false,
                title: "",
                rating: "",
                usedGoodButtons: [],
                usedBadButtons: [],
                unusedGoodButtons: ['Acting', 'Jokes', 'Too short', 'Too long', 'Story', 'Theme'],
                unusedBadButtons: ['Acting', 'Jokes', 'Too short', 'Too long', 'Story', 'Theme'],
                review: "",
            });
        }
    }

    // api call when first creating a review
    callApi()
    {
        // Simple POST request with a JSON body using fetch
        let goodString = this.generateTagString(this.state.usedGoodButtons);
        let badString = this.generateTagString(this.state.usedBadButtons);
        const requestOptions = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({
                title: this.state.title,
                rating: this.state.rating,
                good: goodString,
                bad: badString,
                review: this.state.review
            })
        };

        let status = 0;
        return fetch("http://localhost:9000/review", requestOptions)
            .then(res => {
                status = res.status;
                return res.text();
            }).then(result=> {
                return [status, result];
            });
    }

    // function to send update to server
    updateReviewApi()
    {
        // Simple POST request with a JSON body using fetch
        let goodString = this.generateTagString(this.state.usedGoodButtons);
        let badString = this.generateTagString(this.state.usedBadButtons);
        const requestOptions = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({
                title: this.state.title,
                rating: this.state.rating,
                good: goodString,
                bad: badString,
                review: this.state.review,
                reviewId: this.state.id
            })
        };

        let status = 0;
        return fetch("http://localhost:9000/review/update", requestOptions)
            .then(res => {
                status = res.status;
                return res.json();
            }).then(result=> {
                return [status, result];
            });
    }

    // function called sending request to update review to server
    async validateUpdate(event) {
        event.preventDefault();
        this.updateReviewApi().then(result => {
            let status = result[0];
            let response = result[1][0];
            let review = result[1][1][0];
            if(status === 201 && response === "Review successfully updated!")
            {
                console.log(review);
                this.props.successFunction(review.title, review.rating, review.review, review.goodTags, review.badTags);
                // need to be careful with this
                this.closeModal();
            }
            else if(status === 401 && response === "You are not logged in")
            {
                // redirect to login page...
                alert(response);
            }
            else if(status === 401 && response === "You cannot update antother users review")
            {
                alert(response);
            }
            else if(status === 404 && response === "Review id does not match any reviews")
            {
                alert(response);
            }
            else if(status === 404 && response === "Review updated but could not be found")
            {
                alert(response);
            }
            else
            {
                alert(response);
                alert("Some unexpected error occurred trying to update the review");
            }
        });
    }

    async validateForm(event) {
        event.preventDefault();
        this.callApi().then(result => {
            let status = result[0];
            let response = result[1];
            if(status === 201 && response === "Review successfully created!")
            {
                alert("Review successfully posted");
                this.closeModal();
            }
            else if(status === 401 && response === "You are not logged in")
            {
                // redirect to login page...
                alert("You are not logged in");
            }
            else
            {
                alert("Some unexpected error occurred trying to post the review");
            }
        });

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

    // function called when opening the pop up
    openModal() {
        this.setState({ open: true });
        // if editing, get the appropriate unused buttons based off of the buttons
        // already in use
        if(this.state.edit)
        {
            this.ununsedButtonInitializer();
        }
    }

    generateTitleInput()
    {
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
                    value={this.state.title}
                />
            </React.Fragment>);
        return titleInput;
    }

    generateReviewInput()
    {
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
                    value={this.state.review}
                />
            </React.Fragment>);
        return reviewInput;
    }

    generateInstructionTextGood()
    {
        let instructionTextGood = (
            <React.Fragment>
                    <div className={style.instructionText}>Select up to 5 of the options below</div>
            </React.Fragment>);
        if(this.state.usedGoodButtons.length > 0)
        {
            instructionTextGood = "";
        }
        return instructionTextGood;
    }

    generateInstructionTextBad()
    {
        let instructionTextBad = (
            <React.Fragment>
                <div className={style.halfTextContainer}>
                    <div className={style.instructionText}>Select up to 5 of the options below</div>
                </div>
            </React.Fragment>);
        if(this.state.usedBadButtons.length > 0)
        {
            instructionTextBad = "";
        }
        return instructionTextBad;
    }

    generateGoodButtons()
    {
        let unusedGoodButtonArr = [];
        let usedGoodButtonArr = [];
        let counter = 0;
        // generate the unused good buttons
        while(counter < this.state.unusedGoodButtons.length)
        {
            unusedGoodButtonArr.push(this.generateButtons(this.state.unusedGoodButtons[counter], "good", false, this.state.usedGoodButtons.length));
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
        return [unusedGoodButtonArr, usedGoodButtonArr];
    }

    generateBadButtons()
    {
        let counter = 0;
        let unusedBadButtonArr = [];
        let usedBadButtonArr = [];

        // generate the unused bad buttons
        while(counter < this.state.unusedBadButtons.length)
        {
            unusedBadButtonArr.push(this.generateButtons(this.state.unusedBadButtons[counter], "bad", false, this.state.usedBadButtons.length));
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
        return [unusedBadButtonArr, usedBadButtonArr];
    }

    generateSubmitButton()
    {
        let submitButton = "";
        if(this.state.edit)
        {
            submitButton = (
                <React.Fragment>
                    <button
                        form="form1"
                        value="create_account"
                        className="submitButton"
                        onClick={this.validateUpdate}
                    >Submit changes</button>
                </React.Fragment>);
        }
        else
        {
            submitButton = (
                <React.Fragment>
                    <button
                        form="form1"
                        value="create_account"
                        className="submitButton"
                        onClick={this.validateForm}
                    >POST YOUR REVIEW</button>
                </React.Fragment>);
        }
        return submitButton;
    }

    // function to generate all the html needed to render the popup
    generateHTML(titleInput, reviewInput, instructionTextGood, instructionTextBad, unusedGoodButtonArr, usedGoodButtonArr, unusedBadButtonArr, usedBadButtonArr, ratingStars, submitButton)
    {
        let html = (
                <React.Fragment>
                    <Popup
                        open={this.state.open}
                        onClose={this.closeModal}
                        closeOnDocumentClick
                        contentStyle={{ width: "40%"}}
                    >
                        <div className="modal">
                            {/* &times is the multiplication symbol (x) --> */}
                            <a className="close" onClick={this.closeModal}>&times;</a>
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
                                        {ratingStars}
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
                                {submitButton}
                            </div>
                        </div>
                    </Popup>
            </React.Fragment>);
        return html;
    }

    render() {
        let titleInput = this.generateTitleInput();
        let reviewInput = this.generateReviewInput();
        let instructionTextGood = this.generateInstructionTextGood();
        let instructionTextBad = this.generateInstructionTextBad();
        let goodButtonArrays = this.generateGoodButtons();
        let unusedGoodButtonArr = goodButtonArrays[0];
        let usedGoodButtonArr = goodButtonArrays[1];
        let badButtonArrays = this.generateBadButtons();
        let unusedBadButtonArr = badButtonArrays[0];
        let usedBadButtonArr = badButtonArrays[1];
        let ratingStars = this.generateRatingStars();
        let submitButton = this.generateSubmitButton();
        let html = this.generateHTML(titleInput, reviewInput, instructionTextGood, instructionTextBad, unusedGoodButtonArr, usedGoodButtonArr, unusedBadButtonArr, usedBadButtonArr, ratingStars, submitButton);

        if(this.state.edit)
        {
            return (
                <div>
                    {html}
                </div>
            );
        }
        else
        {
            return (
                <div>
                    {html}
                </div>
            );
        }
    }
}

export default ReviewPopUp;
