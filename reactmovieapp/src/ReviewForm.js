/* eslint-disable */ // need to ignore a warning when opening review form
import React from 'react';
import history from './History'
import { Link } from 'react-router-dom';
import Popup from 'reactjs-popup';
import style from './css/reviewform.module.css';
import SearchDropDown from './SearchDropDown.js';
import {apiGetJsonRequest, apiPostJsonRequest} from './StaticFunctions/ApiFunctions.js';
import {generateMessageState} from './StaticFunctions/StateGeneratorFunctions.js';
import Alert from './Alert.js';


class ReviewPopUp extends React.Component {
    constructor(props) {
        super(props);
        // state will have 2 scenarios, 1 for if a user is editing a existing post
        // anoter for if the user is creating a new post
        if(this.props.edit)
        {
            this.state = {
                // only true if editing the post
                edit: this.props.edit,
                open: false,
                title:this.props.data.title,
                movie: this.props.data.movie,
                user:this.props.data.user,
                form:this.props.data.form,
                username: this.props.data.username,
                id: this.props.data.id,
                rating: this.props.data.rating,
                usedGoodButtons: this.props.data.usedGoodButtons,
                usedBadButtons: this.props.data.usedBadButtons,
                review: this.props.data.review,
                editUpdate: false
            };
        }
        else
        {
            this.state = {
                edit: this.props.edit,
                open: true,
                // can remove this after search drop down implemented..
                title: "",
                movie: undefined,
                rating: "0",
                usedGoodButtons: [],
                usedBadButtons: [],
                review: "",
                goodTags: {},
                badTags: {},
                reviewRowCountMin: 6,
                reviewRowCount: 6,
                reviewMaxCharacters: 6000,
                lockGoodTags: false,
                lockBadTags: false,
                // set to undefined if passing multiple messages
                message: "",
                // if multiple messages to display at once, set this to an array of them
                messages: undefined,
                // if passing multiple messages set to true
                multipleMessages: undefined,
                messageId: -1,
                messageType: ""

            };
        }
        this.openModal = this.openModal.bind(this);
        this.closeModal = this.closeModal.bind(this);
        this.removeButtonHandler = this.removeButtonHandler.bind(this);
        this.sendReviewToServer = this.sendReviewToServer.bind(this);
        this.changeHandler = this.changeHandler.bind(this);
        this.updateReviewApi = this.updateReviewApi.bind(this);
        this.validateUpdate = this.validateUpdate.bind(this);
        this.getTitleSuggestions = this.getTitleSuggestions.bind(this);
        this.setMovie = this.setMovie.bind(this);
        this.generateMovieImage = this.generateMovieImage.bind(this);
        this.getTagSuggestions = this.getTagSuggestions.bind(this);
        this.setTags = this.setTags.bind(this);
        this.generateTagButtons = this.generateTagButtons.bind(this);
        this.reviewInputHandler = this.reviewInputHandler.bind(this);
    }

    componentDidMount()
    {
        if(this.state.edit)
        {
            // call this to initi
            this.openModal();
        }
    }

    // function to generate the arrays of tags to send to the server
    // generates 2 arrays, 1 for the tags that have ID's
    // another for the tags that are just string values
    getTagsForApi(tags)
    {
        let values = Object.keys(tags);
        let tagIds = [];
        let tagStrings = [];
        values.forEach((key) => {
            let tag = tags[key];
            if(typeof(tag) === "string")
            {
                tagStrings.push(tag);
            }
            // the type is a int as it is the id
            else
            {
                tagIds.push(tag);
            }
        });
        return {ids: tagIds, strings: tagStrings}
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
                review: "",
                goodTags: {},
                badTags: {}
            });
        }
    }

    // api call when first creating a review
    async sendReviewToServer()
    {
        event.preventDefault();
        if(this.state.messageId === -1 || this.state.messageId === 5)
        {
            this.setState({
                message: undefined,
                messageId: 2,
                messages: [{type: "success", message: "Success 1"}, {type: "warning", message: "warning1"}, {type: "failure", message: "failure1"}, {type: "warning", message: "warning2"}]
            });
        }
        else
        {
            this.setState({
                messageId: this.state.messageId + 1,
                messages: [{type: "success", message: "Single message"}]
            });
        }
        return;
        if(this.state.movie === undefined)
        {
            this.setState({
                message: "You must select a movie",
                messageType: "warning",
                messageId: this.state.messageId + 1
            })
            return;
        }
        // Simple POST request with a JSON body using fetch
        let goodTags = this.getTagsForApi(this.state.goodTags);
        let badTags = this.getTagsForApi(this.state.badTags);
        let url = "http://localhost:9000/review";
        let params = {
            movie: this.state.movie.id,
            rating: this.state.rating,
            goodTags: goodTags.ids,
            goodTagStrings: goodTags.strings,
            badTags: badTags.ids,
            badTagStrings: badTags.strings,
            review: this.state.review
        };

        let result = await apiPostJsonRequest(url, params);
        let status = result[0];
        let message = result[1].message;
        let requester = result[1].requester;
        this.reviewCreationResultsHandler(status, message, requester, result);
    }

    reviewCreationResultsHandler(status, message, requester, result)
    {
        if(status === 201)
        {
            this.props.updateLoggedIn(requester);
            let errorMessages = result[1].errors;
            if(errorMessages.length > 0)
            {
                console.log(errorMessages);
            }
            // if there are error messages, want to display those somewhere?
            // otherwise, simply show review successfully created
            // pass it down to parent? with id so it knows new message?
            this.setState({
                message: message,
                messageType: "success",
                messageId: this.state.messageId + 1
            });
            // call generateMessageState??
            // redirect to users page and show review popup?
        }
        else
        {
            if(status === 401)
            {
                // 3 scenarios: not logged in, when creating review, user not found,
                // and when creating tag associations user not found
                // do not need to call updateLoggedIn as this will update it
                this.props.showLoginPopUp(false);
            }
            else if(status === 400)
            {
                // something formatted incorrectly
                let movie = (message === "The movie ID is invalid") ? undefined : this.state.movie;
                this.props.updateLoggedIn(requester);
                this.setState({
                    message: message,
                    messageType: "failure",
                    messageId: this.state.messageId + 1,
                    movie: movie
                });
            }
            else if(status === 404)
            {
                this.props.updateLoggedIn(requester);
                if(message === "Movie associated with the review does not exist")
                {
                    // review should not exist at this point but double check
                    let movie = (message === "Movie associated with the review does not exist") ? undefined : this.state.movie;
                    this.setState({
                        message: message,
                        messageType: "failure",
                        messageId: this.state.messageId + 1,
                        movie: movie
                    });
                }
                else if(message === "Review could not be found when associating tags with the review")
                {
                    this.setState({
                        message: message,
                        messageType: "failure",
                        messageId: this.state.messageId + 1
                    });
                }
            }
            else if(status === 500)
            {
                // some unknown error occurred when creating review
                // show message
                this.props.updateLoggedIn(requester);
                this.setState({
                    message: message,
                    messageType: "failure",
                    messageId: this.state.messageId + 1
                });
            }
        }
    }

    // function to send update to server
    updateReviewApi()
    {
        // Simple POST request with a JSON body using fetch
        let goodTags = this.getTagsForApi(this.state.goodTags);
        let badTags = this.getTagsForApi(this.state.badTags);
        const requestOptions = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({
                movie: this.state.title,
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

    // used to update the state for the title, review, and the rating
    changeHandler(event) {
        let name = event.target.name;
        let value = event.target.value;
        this.setState({[name]: value});
    }

    // function to handle the review input field when it changes
    reviewInputHandler(event) {
        // get current row count
        let rowCount = event.target.rows;
        // reset rows to default value
        event.target.rows = this.state.reviewRowCountMin;
        // get row height
        let rowHeight = ((event.target.clientHeight) / this.state.reviewRowCountMin);
        // scrollHeight is the total height
        let numberRows = (event.target.scrollHeight / rowHeight);
        let value = event.target.value;
        this.setState({
            review: value,
            reviewRowCount: Math.ceil(numberRows)
        });
        event.target.rows = Math.ceil(numberRows);
    }

    // function to remove the tag buttons on click
    removeButtonHandler(event)
    {
        // if the button clicked was a good button
        if(event.target.id == "goodButton")
        {
            let goodTags = {...this.state.goodTags};
            delete goodTags[event.target.value];
            let locked = (goodTags.length === 5) ? true : false;
            this.setState({
                goodTags: goodTags,
                lockGoodTags: locked
            });
        }
        else
        {
            let badTags = {...this.state.badTags};
            delete badTags[event.target.value];
            let locked = (badTags.length === 5) ? true : false;
            this.setState({
                badTags: badTags,
                lockBadTags: locked
            });
        }
    }

    // function called when opening the pop up
    openModal() {
        this.setState({ open: true });
        // if editing, get the appropriate unused buttons based off of the buttons
        // already in use
        if(this.state.edit)
        {
        }
    }

    // called by SearchDropDown to set the movie that was selected
    setMovie(value)
    {
        console.log(value);
        this.setState({
          movie: value
        });
    }

    // function to get the movie title suggestions based off of a
    // substring that the user has already entered
    getTitleSuggestions(value)
    {
      // Simple POST request with a JSON body using fetch
      const requestOptions = {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
      };

      let status = 0;
      let url = "http://localhost:9000/movie/get_movie_titles/?title=" + value;
      return fetch(url, requestOptions)
          .then(res => {
              status = res.status;
              if(status === 200)
              {
                  return res.json();
              }
              else
              {
                  return res.text();
              }
          }).then(result=> {
              // if suggestions could not be found
              if(status !== 200)
              {
                return {};
              }
              else
              {
                  return result;
              }
          });
    }

    // function to get a tag suggesion based off the substring that the user has entered
    async getTagSuggestions(value)
    {
        let url = "http://localhost:9000/movie/get_movie_tags/?tag=" + value;
        let result = await apiGetJsonRequest(url);
        console.log(result);
        if(result[0] === 200)
        {
            console.log(result[1].tags);
            return {tags: result[1].tags};
        }
        else
        {
            return {};
        }
    }

    // function to pass to SerachDropDown as the updateFunction that recieves the value
    // the user selected as a tag
    // the value is either a object which is the tag itself, or a string which is the
    // value for the tag
    // the type is passed by this component
    setTags(type, value)
    {
        let tempObj = (type === "good") ? {...this.state.goodTags} : {...this.state.badTags};
        let tagCount = Object.keys(tempObj).length;
        let newCount;
        if(tagCount === 5)
        {
            // this should never occur but a safeguard
            alert("At max number of tags...remove one");
            return;
        }
        if(typeof(value) === "string")
        {
            // only doing this to prevent string from replacing object id
            if(!tempObj.hasOwnProperty(value))
            {
                tempObj[value] = value;
            }
            // will need to be careful in the case that the key is already in there
            // as not a error really but don't want to add again
            newCount = Object.keys(tempObj).length;
        }
        else
        {
            tempObj[value.value] = { id: value.id, value: value.value };
            newCount = Object.keys(tempObj).length;
        }
        if(tagCount === newCount)
        {
            // tag either updated existing tag
            // or tag did nothing as it already exists
            // so new tag not added..
            // probably want to update still as the value could of changed but
            // display a warning/error message
        }
        if(type === "good")
        {
            // this will be removed eventually...
            let usedGoodButtons = Object.keys(tempObj);
            console.log(tempObj);
            this.setState({
                goodTags: tempObj
            });
        }
        else
        {
            // this will be removed eventually..
            let usedGoodButtons = Object.keys(tempObj);
            this.setState({
                badTags: tempObj
            });
        }
        console.log(newCount);
        if(newCount === 5)
        {
            if(type === "good")
            {
                this.setState({lockGoodTags: true});
            }
            else
            {
                this.setState({lockBadTags: true});
            }
        }
    }

    generateTitleInput()
    {
        if(this.state.edit)
        {
            let value = "";
            if(this.state.movie !== undefined)
            {
                value = this.state.movie.title;
            }
            return (
                <React.Fragment>
                    <div className={style.titleInputContainer}>
                        <label>
                            <h4 className={style.h4NoMargin}>Movie Title</h4>
                        </label>
                        <SearchDropDown
                            getSuggestions={this.getTitleSuggestions}
                            valueKeys={{Movies:"title"}}
                            updateFunction={this.setMovie}
                            value={value}
                            updateOnChange={true}
                            allowNoSuggestion={false}
                            clearOnSubmit={false}
                        />
                    </div>
                </React.Fragment>
            );
        }
        return (
            <React.Fragment>
                <label>
                    <h4 className={style.h4NoMargin}>Movie Title</h4>
                </label>
                <SearchDropDown
                    getSuggestions={this.getTitleSuggestions}
                    valueKeys={{Movies:"title"}}
                    updateFunction={this.setMovie}
                    updateOnChange={true}
                    allowNoSuggestion={false}
                    clearOnSubmit={false}
                />
            </React.Fragment>
        );
    }

    generateMovieImage()
    {
        if(this.state.movie !== undefined)
        {
            let path = 'https://image.tmdb.org/t/p/w500' + this.state.movie.poster;
            return (
              <div className = {`${style.centeredMaxWidthContainer} ${style.containerMarginBottom10}`}>
                  <img className={style.moviePoster} src={path}/>
              </div>
            );
        }
        return null;
    }

    generateReviewInput()
    {
        console.log("Rows in input generator: " + this.state.numberRows);
        let infoMessage = "";
        if(this.state.review.length === this.state.reviewMaxCharacters)
        {
            infoMessage = "* Review at maximum allowed length";
        }
        let reviewInput = (
            <React.Fragment>
                <label>
                    <h4 className={style.h4NoMargin}>Optional Review</h4>
                </label>
                <textarea
                    id="reviewInput"
                    type="text"
                    name="review"
                    form = "form2"
                    rows={this.state.reviewRowCount}
                    className={`inputFieldBoxLong ${style.reviewInputField}`}
                    onChange={this.reviewInputHandler}
                    maxLength={this.state.reviewMaxCharacters}
                    value={this.state.review}
                />
                {infoMessage}
            </React.Fragment>);
        return reviewInput;
    }

    generateTagButtons(type)
    {
        let counter = 0;
        let buttonArray = [];
        let values = (type === "good") ? Object.keys(this.state.goodTags) : Object.keys(this.state.badTags);

        // generate the tag buttons
        while(counter < values.length)
        {
            let button;
            let value = values[counter];
            if(type == "good")
            {
                button = (<button value={value} title = "Click to remove" className={`${style.formButton} ${style.goodButton}`} id="goodButton" onClick={(e)=> this.removeButtonHandler(e)}>{value}</button>);
            }
            else
            {
                button = <button value={value} className={`${style.formButton} ${style.badButton}`} title = "Click to remove" id="badButton" onClick={(e)=> this.removeButtonHandler(e)}>{value}</button>;
            }
            buttonArray.push(button);
            counter = counter + 1;
        }
        return buttonArray;
    }

    generateSubmitButton()
    {
        let submitButton = "";
        if(this.state.edit)
        {
            submitButton = (
                <React.Fragment>
                    <button
                        form="form2"
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
                        form="form2"
                        value="create_account"
                        className="submitButton"
                        onClick={this.sendReviewToServer}
                    >POST YOUR REVIEW</button>
                </React.Fragment>);
        }
        return submitButton;
    }

    // function to generate all the html needed to render the popup
    generateHTML(titleInput, reviewInput, usedGoodButtonArr, usedBadButtonArr, ratingStars, submitButton, moviePoster)
    {
        console.log(this.state);
        let html = (
                <React.Fragment>
                    <Popup
                        open={this.state.open}
                        onClose={this.closeModal}
                        closeOnDocumentClick
                        contentStyle={{ width: "40%"}}
                    >
                        <div className={style.modal}>
                            {/* &times is the multiplication symbol (x) --> */}
                            <a className={style.close} onClick={this.closeModal}>&times;</a>
                            <div className={style.header}>
                                <h3 className ="inlineH3"> Movie Review </h3>
                            </div>
                            <div className={style.content}>
                                <Alert
                                    message={this.state.message}
                                    type={this.state.messageType}
                                    messageId={this.state.messageId}
                                    multipleMessages={true}
                                    messages={this.state.messages}
                                    timeout={0}
                                    innerContainerStyle={{"z-index": "2"}}
                                    symbolStyle={{"width": "5%", "margin-top": "3px"}}
                                    messageBoxStyle={{width: "86%"}}
                                    closeButtonStyle={{width: "5%", "margin-top": "3px"}}
                                />
                                {/* This will eventually be a post form */}
                                <form id="form2" onSubmit={this.sendReviewToServer} noValidate/>
                                <div className = "inputFieldContainer">
                                    {titleInput}
                                </div>
                                {moviePoster}
                                <div className = {`${style.centeredMaxWidthContainer} ${style.containerMarginBottom10}`}>
                                    <h4 className={style.h4NoMargin}>Rating</h4>
                                </div>
                                <div className = {`${style.centeredMaxWidthContainer} ${style.containerMarginBottom10}`}>
                                    <fieldset class="rating">
                                        {ratingStars}
                                    </fieldset>
                                </div>
                                <div className={style.proConContainer}>
                                    <div className={style.centeredMaxWidthContainer}>
                                        <h4 className={style.h4NoMargin}>The Good</h4>
                                    </div>
                                    <div className={`${style.centeredMaxWidthContainer} ${style.buttonContainer} ${style.marginTopBottom10}`}>
                                        <div className={style.tagInputContainer}>
                                            <SearchDropDown
                                                getSuggestions={this.getTagSuggestions}
                                                valueKeys={{tags:"value"}}
                                                updateFunction={(value) => {this.setTags("good", value)}}
                                                updateOnChange={false}
                                                allowNoSuggestion={true}
                                                value={""}
                                                maxLength={20}
                                                placeHolder={"Enter up to 5 tags"}
                                                clearOnSubmit={true}
                                                locked={this.state.lockGoodTags}
                                                lockedMessage={"5 tags are selected"}
                                            />
                                        </div>
                                    </div>
                                    <div className={`${style.centeredMaxWidthContainer} ${style.buttonContainer} ${style.usedButtonContainerHeight}`}>
                                        {usedGoodButtonArr}
                                    </div>
                                </div>
                                <div className={style.proConContainer}>
                                    <div className={style.centeredMaxWidthContainer}>
                                        <h4 className={style.h4NoMargin}>The Bad</h4>
                                    </div>
                                    <div className={`${style.centeredMaxWidthContainer} ${style.buttonContainer} ${style.marginTopBottom10}`}>
                                        <div className={style.tagInputContainer}>
                                            <SearchDropDown
                                                getSuggestions={this.getTagSuggestions}
                                                valueKeys={{tags:"value"}}
                                                updateFunction={(value) => {this.setTags("bad", value)}}
                                                updateOnChange={false}
                                                allowNoSuggestion={true}
                                                value={""}
                                                maxLength={20}
                                                placeHolder={"Enter up to 5 tags"}
                                                locked = {this.state.lockBadTags}
                                                lockedMessage = {"5 tags are selected"}
                                                clearOnSubmit={true}
                                            />
                                        </div>
                                    </div>
                                    <div className={`${style.centeredMaxWidthContainer} ${style.buttonContainer} ${style.usedButtonContainerHeight}`}>
                                        {usedBadButtonArr}
                                    </div>
                                </div>
                                <div className = "inputFieldContainer">
                                    {reviewInput}
                                </div>
                                <div className={style.submitButtonContainer}>
                                    {submitButton}
                                </div>
                            </div>
                        </div>
                    </Popup>
            </React.Fragment>);
        return html;
    }

    render() {
        let titleInput = this.generateTitleInput();
        let moviePoster = this.generateMovieImage();
        let reviewInput = this.generateReviewInput();
        let usedGoodButtonArr = this.generateTagButtons("good");
        let usedBadButtonArr = this.generateTagButtons("bad");
        let ratingStars = this.generateRatingStars();
        let submitButton = this.generateSubmitButton();
        let html = this.generateHTML(titleInput, reviewInput, usedGoodButtonArr, usedBadButtonArr, ratingStars, submitButton, moviePoster);

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
