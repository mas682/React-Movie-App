/* eslint-disable */ // need to ignore a warning when opening review form
import React from 'react';
import history from './History'
import { Link } from 'react-router-dom';
import Popup from 'reactjs-popup';
import style from './css/ReviewForm/reviewform.module.css';
import './css/ReviewForm/ReviewForm.css';
import SearchDropDown from './SearchDropDown.js';
import {apiGetJsonRequest, apiPostJsonRequest} from './StaticFunctions/ApiFunctions.js';
import Alert from './Alert.js';


class ReviewPopUp extends React.Component {
    constructor(props) {
        super(props);
        // state will have 2 scenarios, 1 for if a user is editing a existing post
        // anoter for if the user is creating a new post
        if(this.props.edit)
        {
            console.log(this.props);
            let goodTags = this.getTags(this.props.data.fullReview.goodTags);
            let badTags = this.getTags(this.props.data.fullReview.badTags);
            this.state = {
                // only true if editing the post
                edit: this.props.edit,
                open: true,
                title:this.props.data.title,
                movie: this.props.data.movie,
                // the loggedin users username
                currentUser:this.props.data.currentUser,
                form:this.props.data.form,
                // username for the user who posted the reveiw
                username: this.props.data.username,
                // id of the review post
                id: this.props.data.id,
                rating: this.props.data.rating,
                // the optional review text
                review: this.props.data.review,
                // a {} containing {value: id, value: id, ...} for each of the tags
                goodTags: goodTags,
                badTags: badTags,
                // for the review input field
                reviewRowCountMin: 6,
                reviewRowCount: 6,
                reviewMaxCharacters: 6000,
                // booleans to lock tag entry if 5 entered already
                lockGoodTags: Object.keys(goodTags).length === 5,
                lockBadTags: Object.keys(badTags).length === 5,
                messages:  [],
                messageId: -1
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
                review: "",
                goodTags: {},
                badTags: {},
                reviewRowCountMin: 6,
                reviewRowCount: 6,
                reviewMaxCharacters: 6000,
                lockGoodTags: false,
                lockBadTags: false,
                // if multiple messages to display at once, set this to an array of them
                messages: [],
                messageId: -1

            };
        }
        this.closeModal = this.closeModal.bind(this);
        this.removeButtonHandler = this.removeButtonHandler.bind(this);
        this.sendReviewToServer = this.sendReviewToServer.bind(this);
        this.changeHandler = this.changeHandler.bind(this);
        this.updateReviewApi = this.updateReviewApi.bind(this);
        this.getTitleSuggestions = this.getTitleSuggestions.bind(this);
        this.setMovie = this.setMovie.bind(this);
        this.generateMovieImage = this.generateMovieImage.bind(this);
        this.getTagSuggestions = this.getTagSuggestions.bind(this);
        this.setTags = this.setTags.bind(this);
        this.generateTagButtons = this.generateTagButtons.bind(this);
        this.reviewInputHandler = this.reviewInputHandler.bind(this);
        this.getTags = this.getTags.bind(this);
        this.reviewApiResultsHandler = this.reviewApiResultsHandler.bind(this);
    }

    componentDidMount()
    {

    }

    // used when editing a review to generate the goodTag and badTag state objects
    getTags(tagArray)
    {
        console.log(tagArray);
        let tags = {};
        for(let tag of tagArray)
        {
            tags[tag.value] = {value: tag.value, id: tag.id};
        }
        return tags;
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

        this.setState({
            open: false,
        });
    }

    // api call when creating a review
    async sendReviewToServer()
    {
        event.preventDefault();
        if(this.state.movie === undefined)
        {
            this.setState({
                messages: [{message: "You must select a movie from the dropdown list", type: "warning"}],
                messageId: this.state.messageId + 1
            })
            return;
        }
        // Simple POST request with a JSON body using fetch
        let goodTags = this.getTagsForApi(this.state.goodTags);
        let badTags = this.getTagsForApi(this.state.badTags);
        let url = "https://localhost:9000/review";
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
        this.reviewApiResultsHandler(status, message, requester, result, "create");
    }

    // function to send update to server
    async updateReviewApi()
    {
        event.preventDefault();
        if(this.state.movie === undefined)
        {
            this.setState({
                messages: [{message: "You must select a movie from the dropdown list", type: "warning"}],
                messageId: this.state.messageId + 1
            })
            return;
        }
        // Simple POST request with a JSON body using fetch
        let goodTags = this.getTagsForApi(this.state.goodTags);
        let badTags = this.getTagsForApi(this.state.badTags);
        let url = "https://localhost:9000/review/update";
        let params = {
            rating: this.state.rating,
            goodTags: goodTags.ids,
            goodTagStrings: goodTags.strings,
            badTags: badTags.ids,
            badTagStrings: badTags.strings,
            review: this.state.review,
            reviewId: this.state.id
        };

        let result = await apiPostJsonRequest(url, params);
        let status = result[0];
        let message = result[1].message;
        let requester = result[1].requester;
        this.reviewApiResultsHandler(status, message, requester, result, "update");
    }


    // function to handle result of review creation or update
    reviewApiResultsHandler(status, message, requester, result, type)
    {
        if(status === 201)
        {
            this.props.updateLoggedIn(requester);
            let errorMessages = result[1].errors;
            let messages = [{message: message, type: "success"}];
            let messageCount = this.state.messageId + 1;
            for(let error of errorMessages)
            {
                messages.push({message: error, type: "warning"});
                messageCount = messageCount + 1;
            }
            if(type === "update")
            {
                console.log(result[1].review);
                if(result[1].review === undefined)
                {
                    messages.push({message: "Could not find the review after it was updated", type: "warning"});
                }
                this.props.successFunction(result[1].review);
            }
            else
            {
                // redirect to users profile page on new creation
                this.props.successFunction();
            }

            this.props.setMessages({messages: messages});
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
                // something formatted incorrectly or a review for that movie already exists
                // for the user
                let movie = (message === "The movie ID is invalid") ? undefined : this.state.movie;
                this.props.updateLoggedIn(requester);
                this.setState({
                    messages: [{message: message, type: "failure"}],
                    messageId: this.state.messageId + 1,
                    movie: movie
                });
            }
            else if(status === 404)
            {
                this.props.updateLoggedIn(requester);
                if(message === "Movie associated with the review does not exist")
                {
                    // if the user changed the movie from the original movie, it could still exist if the new movie was deleted
                    // if the old movie was deleted, the review should no longer exist
                    // this should catch when the user tried to change the movie and it no longer exists
                    if(type === "update" && this.props.movie.id !== this.state.movie.id)
                    {
                        this.props.removeReview();
                        this.props.setMessages({messages: [{message: message, type: "failure"}]});
                    }
                    else
                    {
                        this.setState({
                            messages: [{message: message, type: "failure"}],
                            messageId: this.state.messageId + 1,
                            movie: undefined
                        });
                    }
                }
                else if(message === "Review could not be found when associating tags with the review")
                {
                    if(type === "update")
                    {
                        this.props.setMessages({messages: [{message: message, type: "failure"}]});
                        // remove the review
                        this.props.removeReview();
                    }
                    else
                    {
                        this.setState({
                            messages: [{message: message, type: "failure"}],
                            messageId: this.state.messageId + 1
                        });
                    }
                }
                else if(message === "Review could not be found" && type === "update")
                {
                    // should remove the review...
                    // occurs when updating
                    this.props.setMessages({messages: [{message: message, type: "failure"}]});
                    // remove the review
                    this.props.removeReview();
                }
                else
                {
                    // reivew api path does not exist...should never happen
                    this.setState({
                        messages: [{message: message, type: "warning"}],
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
                    messages: [{message: message, type: "failure"}],
                    messageId: this.state.messageId + 1
                });
            }
        }
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

    // called by SearchDropDown to set the movie that was selected
    setMovie(value)
    {
        this.setState({
          movie: value
        });
    }

    // function to get the movie title suggestions based off of a
    // substring that the user has already entered
    async getTitleSuggestions(value)
    {
        if(value.length < 1)
        {
            return {};
        }
        let url = "https://localhost:9000/movie/get_movie_titles/?title=" + value;
        let result = await apiGetJsonRequest(url);
        let status = result[0];
        let message = result[1].message;
        let requester = result[1].requester;
        if(status === 200 && requester !== "")
        {
            return {Movies: result[1].movies};
        }
        else
        {
            if(status === 404 && requester !== "")
            {
                // send a empty object as no movies match the value
                return {};
            }
            else if(requester === "")
            {
                // if the user is not logged in, the review creation pop up should not be open
                this.props.showLoginPopUp(false);
            }
        }
    }



    // function to get a tag suggesion based off the substring that the user has entered
    async getTagSuggestions(value)
    {
        if(value.length < 1)
        {
            return {};
        }
        let url = "https://localhost:9000/movie/get_movie_tags/?tag=" + value;
        let result = await apiGetJsonRequest(url);
        let status = result[0];
        let message = result[1].message;
        let requester = result[1].requester;
        if(status === 200 && requester !== "")
        {
            return {tags: result[1].tags};
        }
        else
        {
            if(status === 404 && requester !== "")
            {
                // send a empty object as no tag matches the value
                return {};
            }
            else if(requester === "")
            {
                // if the user is not logged in, the review creation pop up should not be open
                this.props.showLoginPopUp(false);
            }
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
            let tag = value;
            if(typeof(value) !== "string")
            {
                tag = value.value;
            }
            this.setState({
                messages: [{message: "You have already selected the tag: " + tag, type: "info"}],
                messageId: this.state.messageId + 1
            })
        }
        if(type === "good")
        {
            this.setState({
                goodTags: tempObj
            });
        }
        else
        {
            this.setState({
                badTags: tempObj
            });
        }
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
                            form={"MovieTitle"}
                            locked={this.state.edit}
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
                    form={"MovieTitle"}
                />
            </React.Fragment>
        );
    }

    generateMovieImage()
    {
        if(this.state.movie !== undefined)
        {
            if(this.state.movie.poster === null)
            {
                return (
                  <div className = {`${style.outterMovieImageContainer}`}>
                      <div className={style.innerMovieImageContainer}>
                          <div className={style.emptyMoviePoster}>
                              <div>
                                  No image to display
                              </div>
                          </div>
                      </div>
                  </div>
                );
            }
            else
            {
                let path = 'https://image.tmdb.org/t/p/w500' + this.state.movie.poster;
                return (
                  <div className = {`${style.outterMovieImageContainer}`}>
                      <div className={style.innerMovieImageContainer}>
                          <img className={style.moviePoster} src={path}/>
                      </div>
                  </div>
                );

            }
        }
        return null;
    }

    generateReviewInput()
    {
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
                        onClick={this.updateReviewApi}
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
        let html = (
                <React.Fragment>
                    <Popup
                        open={this.state.open}
                        onClose={this.closeModal}
                        closeOnDocumentClick
                        className={"reviewForm"}
                    >
                        <div className={style.modal}>
                            {/* &times is the multiplication symbol (x) --> */}
                            <a className={style.close} onClick={this.closeModal}>&times;</a>
                            <div className={style.header}>
                                <h3 className ="inlineH3"> Movie Review </h3>
                            </div>
                            <div className={style.content}>
                                <Alert
                                    messages={this.state.messages}
                                    messageId={this.state.messageId}
                                    innerContainerStyle={{"z-index": "2", "font-size": "1.25em"}}
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
                                    <fieldset className={`rating ${style.ratingStars}`}>
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
                                                form={"GoodTags"}
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
                                                form={"BadTags"}
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
