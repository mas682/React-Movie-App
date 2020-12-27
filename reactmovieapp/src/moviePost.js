import React from 'react';
import style from './css/MoviePost/moviePost.module.css';
import style2 from './css/MoviePost/moviePostPopUp.module.css';
import {Link} from 'react-router-dom';
import MoviePostPopUp from './moviePostPopUp.js';
import UserListPopUp from './UserListPopUp.js';
import './css/MoviePost/moviePost.css';
import ReviewForm from './ReviewForm.js';
import Dropdown from 'react-bootstrap/Dropdown';
import {apiPostJsonRequest} from './StaticFunctions/ApiFunctions.js';
import {generateRatingStars} from './StaticFunctions/MovieHtmlFunctions.js';


class MoviePost extends React.Component {
    constructor(props) {
        super(props);
        if(this.props.type === "popup")
        {
            this.state = {
                // boolean for opening the edit pop up
                openEdit: false,
                // boolean to open popup to comment on post
                openPopUp: true,
                // boolean indicating if logged in user liked post
                liked: this.props.data.liked,
                // count of likes on post
                likeCount: this.props.data.likeCount,
                // title of post
                title: this.props.data.title,
                // post for the movie
                poster: this.props.data.poster,
                // form id for post
                form: this.props.data.form,
                // username for the user who posted the review
                username: this.props.data.username,
                // id of the review post
                id: this.props.data.id,
                rating: this.props.data.rating,
                usedGoodButtons: this.props.data.usedGoodButtons,
                usedBadButtons: this.props.data.usedBadButtons,
                review: this.props.data.review,
                fullReview: this.props.data.fullReview,
                time: this.props.data.time,
                // the logged in users username
                currentUser: this.props.data.currentUser,
                // used to show likes pop up
                displayLikes: false,
                // used as boolean as to whether or not to show remove post buttons when clicked
                removePost: false,
                type: "popup",
                // path to movies page
                moviePath: this.props.data.moviePath,
                props: this.props
            };
        }
        else
        {
            let moviePath = this.props.data.review.movie.title.replace(" ", "-");
            moviePath = "/movie/" + this.props.data.review.movie.id + "-" + moviePath;
            this.state = {
                // boolean for opening the edit pop up
                openEdit: false,
                // boolean to open popup to comment on post
                openPopUp: false,
                // boolean indicating if logged in user liked post
                liked: this.props.data.liked,
                // count of likes on post
                likeCount: this.props.data.review.likes.length,
                // title of post
                title: this.props.data.review.movie.title,
                poster: 'https://image.tmdb.org/t/p/w500' + this.props.data.review.movie.poster,
                movie: this.props.data.review.movie,
                // form id for post
                form: "form" + this.props.data.review.id,
                // username for the user who posted the review
                username: this.props.data.review.user.username,
                // id of the review post
                id: this.props.data.review.id,
                rating: this.props.data.review.rating,
                usedGoodButtons: MoviePost.getGoodButtons(this.props.data.review.goodTags),
                usedBadButtons: MoviePost.getBadButtons(this.props.data.review.badTags),
                // the review text
                review: this.props.data.review.review,
                fullReview: this.props.data.review,
                time: this.props.data.review.createdAt,
                // the logged in users username
                currentUser: this.props.currentUser,
                // used to show likes pop up
                displayLikes: false,
                // used as boolean as to whether or not to show remove post buttons when clicked
                removePost: false,
                type: "non-popup",
                moviePath: moviePath,
                props: this.props
            };
        }
        this.likeButtonHandler = this.likeButtonHandler.bind(this);
        this.updateState = this.updateState.bind(this);
        this.postLike = this.postLike.bind(this);
        this.removeLike = this.removeLike.bind(this);
        this.changeLikes = this.changeLikes.bind(this);
        this.changeState = this.changeState.bind(this);
        this.removePostHandler = this.removePostHandler.bind(this);
        this.removePost = this.removePost.bind(this);
        this.generateEditButtons = this.generateEditButtons.bind(this);
        this.generateLikedButton = this.generateLikedButton.bind(this);
        this.generateEditPopUp = this.generateEditPopUp.bind(this);
        this.generateLikeCount = this.generateLikeCount.bind(this);
        this.generateLikesPopUp = this.generateLikesPopUp.bind(this);
        this.generatePostPopUp = this.generatePostPopUp.bind(this);
        this.generatePostPopUpButton = this.generatePostPopUpButton.bind(this);
        this.updateLiked = this.updateLiked.bind(this);
        this.removeFunction = this.removeFunction.bind(this);
        this.removePostResultsHandler = this.removePostResultsHandler.bind(this);
    }

    /*
        this function is used to extract the good tags out of the props that are passed
        into the component and create an array with the values to put into the state
    */
    static getGoodButtons(buttonArray)
    {
        if(buttonArray === undefined) return;
        let tempArr = [];
        buttonArray.forEach((tag) => {
            tempArr.push(tag.value);
            // should also remove button from unused array if the post belongs to the current user
        });
        return tempArr;
    }

    /*
        this function is used to extract the bad tags out of the props that are passed
        into the component and create an array with the values to put into the state
    */
    static getBadButtons(buttonArray)
    {
        if(buttonArray === undefined) return;
        let tempArr = [];
        buttonArray.forEach((tag) => {
            tempArr.push(tag.value);
            // should also remove button from unused array if the post belongs to the current user
        });
        return tempArr;
    }


    static getDerivedStateFromProps(nextProps, prevState)
    {
        // if there was a change in the props movie id or
        // if there was a change in the user logged in
        // using props for id because if you set the state to null to remove the post
        // it will not work correctly
        // may need to use props for currentUser too?
        if(prevState.type !== "popup")
        {
            if((prevState.props.data.review.id !== nextProps.data.review.id) || (prevState.props.currentUser !== nextProps.currentUser))
            {
                alert("New props received movie post");
                return MoviePost.newPropState(nextProps);
            }
            else
            {
                return null;
            }
        }
        else
        {
            if((prevState.props.data.id !== nextProps.data.id) || (prevState.props.currentUser !== nextProps.currentUser))
            {
                // need to fix newPropState..
                console.log(prevState.props);
                console.log(nextProps);
                alert("New props received pop up");
            }
            return null;
        }
    }

    shouldComponentUpdate() {
        return true;
    }

    static newPropState(props)
    {
        let moviePath = props.data.review.movie.title.replace(" ", "-");
        moviePath = "/movie/" + props.data.review.movie.id + "-" + moviePath;
        return {
            // boolean for opening the edit pop up
            openEdit: false,
            // boolean to open popup to comment on post
            openPopUp: false,
            // boolean indicating if logged in user liked post
            liked: props.data.liked,
            // count of likes on post
            likeCount: props.data.review.likes.length,
            // title of post
            title: props.data.review.movie.title,
            poster: 'https://image.tmdb.org/t/p/w500' + props.data.review.movie.poster,
            movie: props.data.review.movie,
            // form id for post
            form: "form" + props.data.review.id,
            // username for the user who posted the review
            username: props.data.review.user.username,
            // id of the review post
            id: props.data.review.id,
            rating: props.data.review.rating,
            usedGoodButtons: MoviePost.getGoodButtons(props.data.review.goodTags),
            usedBadButtons: MoviePost.getBadButtons(props.data.review.badTags),
            review: props.data.review.review,
            fullReview: props.data.review,
            time: props.data.review.createdAt,
            // the logged in users username
            currentUser: props.currentUser,
            // used to show likes pop up
            displayLikes: false,
            // used as boolean as to whether or not to show remove post buttons when clicked
            removePost: false,
            type: "non-popup",
            moviePath: moviePath,
            // storing the props as needed for getDerivedStateFromProps
            props: props
        };
    }

    // function to update the liked count and sets liked to true/false
    // based on the value of value
    // used by popup to update parents like button
    updateLiked(count, value)
    {
        let newCount = this.state.likeCount + count;
        this.setState({
            liked: value,
            likeCount: newCount
        });
    }

    // function to change the likeCount of the post
    changeLikes(count)
    {
        if(count !== this.state.likeCount)
        {
            this.setState({likeCount: count});
        }
    }

    // function to send request to server to remove like from a post
    removeLike()
    {
        let url = "http://localhost:9000/review/removelike";
        let params = {reviewId: this.state.id};
        return apiPostJsonRequest(url, params);
    }

    // function to send request to server to add a like to a post
    postLike()
    {
        let url = "http://localhost:9000/review/addlike";
        let params = {reviewId: this.state.id};
        return apiPostJsonRequest(url, params);
    }

    /*
        This sets the state of the post to liked or not depending on if
        it is currently liked or not when clicked
        Will need to add handling to update database when clicked so the database
        can keep track of which posts are liked by who
    */
    async likeButtonHandler(event)
    {
        event.preventDefault();
        if(!this.state.currentUser)
        {
            // passed false so that it does not redirect
            this.props.showLoginPopUp(false);
            return;
        }
        if(!this.state.liked)
        {
            let result = await this.postLike();
            let status = result[0];
            let message = result[1].message;
            let user = result[1].requester;
            this.likedResultsHandler(status, message, user);
        }
        else
        {
            let result = await this.removeLike();
            let status = result[0];
            let message = result[1].message;
            let user = result[1].requester;
            this.removeLikeResultsHandler(status, message, user);
        }
    }

    likedResultsHandler(status, message, user)
    {
        if(status === 200)
        {
            let newCount = this.state.likeCount + 1;
            this.setState({
                currentUser: user,
                liked: true,
                likeCount: newCount
            });
            if(this.state.type === "popup")
            {
                // if the post was liked through the popup, update the parent moviePost state
                this.props.updateLiked(1, true);
            }
            this.props.updateLoggedIn(user);
            this.props.setMessages({messages: [{message: message, type: "success"}]});
        }
        else
        {
            this.props.updateLoggedIn(user);
            if(status === 400)
            {
                // review id invalid such as not provided, or invalid format
                // or you already liked the post
                if(message === "Post already liked")
                {
                    let newCount = this.state.likeCount + 1;
                    this.setState({
                        currentUser: user,
                        liked: true,
                        likeCount: newCount
                    });
                    this.props.setMessages({messages: [{message: message, type: "info"}]});
                    if(this.state.type === "popup")
                    {
                        this.props.updateLiked(-1, false);
                    }
                }
                else
                {
                    this.setState({
                        currentUser: user,
                    });
                    this.props.setMessages({messages: [{message: message, type: "failure"}]});
                }
            }
            else if(status === 401)
            {
                // not logged in
                this.props.showLoginPopUp(false);
                //if not logged in, this shouldn't have been visible..so remove it
                if(this.state.type === "popup")
                {
                    this.props.closeFunction();
                }
            }
            else if(status === 404)
            {
                // review not found on server
                this.removeFunction({messages: [{message: message, type: "failure"}]});
            }
            else
            {
                this.setState({
                    currentUser: user,
                });
                this.props.setMessages({messages: [{message: message, type: "failure"}]});
            }
        }
    }

    removeLikeResultsHandler(status, message, user)
    {
        if(status === 200)
        {
            let newCount = this.state.likeCount - 1;
            this.setState({
                currentUser: user,
                liked: false,
                likeCount: newCount
            });
            if(this.state.type === "popup")
            {
                // if the post was liked through the popup, update the parent moviePost state
                this.props.updateLiked(-1, false);
            }
            this.props.updateLoggedIn(user);
            this.props.setMessages({messages: [{message: message, type: "success"}]});
        }
        else
        {
            this.props.updateLoggedIn(user);
            if(status === 400)
            {
                // review id invalid such as not provided, or invalid format
                // or you already do not like the post
                if(message === "Post already not liked")
                {
                    let newCount = this.state.likeCount - 1;
                    this.setState({
                        currentUser: user,
                        liked: false,
                        likeCount: newCount
                    });
                    this.props.setMessages({messages: [{message: message, type: "info"}]});
                    if(this.state.type === "popup")
                    {
                        this.props.updateLiked(-1, false);
                    }
                }
                else
                {
                    this.setState({
                        currentUser: user
                    });
                    this.props.setMessages({messages: [{message: message, type: "warning"}]});

                }
                this.props.updateLoggedIn(user);
            }
            else if(status === 401)
            {
                // not logged in
                this.props.showLoginPopUp(false);
                // if not logged in, this should not be up so remove it
                if(this.state.type === "popup")
                {
                    this.props.closeFunction();
                }
            }
            else if(status === 404)
            {
                // review could not be found
                this.removeFunction({messages: [{message: message, type: "failure"}]});
            }
            else
            {
                this.props.setMessages({messages: [{message: message, type: "failure"}]});
                this.setState({
                    currentUser: user
                });
            }
        }
    }

    // function used to update the movie post after edited
    // called by ReviewForm component when creator is editing their existing post
    updateState(reviewResult)
    {
        reviewResult = undefined;
        if(reviewResult === undefined)
        {
            // may want to use this?
            // this.removeFunction({messages: [{message: message, type: "success"}]});
            this.removeFunction();
            return;
        }
        console.log("Updated review: ");
        console.log(reviewResult);
        let moviePath = reviewResult.review.movie.title.replace(" ", "-");
        this.setState({
            // boolean for opening the edit pop up
            openEdit: false,
            // boolean indicating if logged in user liked post
            liked: reviewResult.liked,
            // count of likes on post
            likeCount: reviewResult.review.likes.length,
            // title of post
            title: reviewResult.review.movie.title,
            poster: 'https://image.tmdb.org/t/p/w500' + reviewResult.review.movie.poster,
            movie: reviewResult.review.movie,
            rating: reviewResult.review.rating,
            usedGoodButtons: MoviePost.getGoodButtons(reviewResult.review.goodTags),
            usedBadButtons: MoviePost.getBadButtons(reviewResult.review.badTags),
            review: reviewResult.review.review,
            fullReview: reviewResult.review,
            time: reviewResult.review.createdAt,
            moviePath: moviePath
        });
        /*
        if(this.state.type === "popup")
        {
            this.props.updatePost(titleUpdate, ratingUpdate, reviewUpdate, goodButtonUpdate, badButtonUpdate);
        }
        */
    }

    // function to change the state of the component
    changeState(key, value)
    {
        // if the comment button is clicked when already a pop up, close it
        if(key === "openPopUp" && this.state.type === "popup")
        {
            this.props.closeFunction();
        }
        if(key === "displayLikes" && this.state.currentUser === "")
        {
            this.props.showLoginPopUp(false);
            return;
        }
        if(key === "openPopUp" && this.state.currentUser === "")
        {
            this.props.showLoginPopUp(false);
            return;
        }
        this.setState({[key]: value});
    }

    // funciton to set removePost to true/false depending
    // on the current state
    removePostHandler(event)
    {
        let key = event.target.value;
        let value = !this.state[key];
        this.setState({[key]: value});
        if(this.state.type === "popup")
        {
            this.props.updatePopUpState("removePost", value);
        }
    }

    // function to remove the post when remove clicked by user
    // will also be called by popup when necessary
    removeFunction(messageState)
    {
        this.setState({
            // set the id of the post to null
            id: null,
            // used as boolean as to whether or not to show remove post buttons when clicked
            removePost: false
        });
        if(this.state.type === "popup")
        {
            // cause the parent to remove the post
            this.props.removePost();
            // close the popup, passing the message along
            this.props.closeFunction(messageState);
        }
        else
        {
            // if there is a message
            if(messageState !== undefined)
            {
                this.props.setMessages(messageState);
            }
        }
    }

    // function to handle deleting a post
    async removePost()
    {
        let url = "http://localhost:9000/review/removepost";
        let params = {reviewId: this.state.id};
        let result = await apiPostJsonRequest(url, params);
        let status = result[0];
        let message = result[1].message;
        let requester = result[1].requester;
        this.removePostResultsHandler(status, message, requester);
    }

    removePostResultsHandler(status, message, user)
    {
        if(status === 200)
        {
            this.removeFunction({messages: [{message: message, type: "success"}]});
            this.props.updateLoggedIn(user);
        }
        else
        {
            if(status === 400)
            {
                console.log(this.props);
                // bad format to movie id
                this.props.updateLoggedIn(user);
                this.props.setMessages({messages: [{message: message, type: "failure"}]});
            }
            else if(status === 404)
            {
                // review not found so remove it
                this.removeFunction({messages: [{message: message, type: "info"}]});
                this.props.updateLoggedIn(user);
                if(this.state.type === "popup")
                {
                    // cause the parent to remove the post
                    this.props.removePost();
                    // close the popup
                    this.props.closeFunction();
                }
            }
            else if(status === 401)
            {
                if(message === "You cannot remove another users post")
                {
                    this.props.updateLoggedIn(user);
                    this.props.setMessages({messages: [{message: message, type: "failure"}]});
                    // may want to use the remove post handler instead..?
                    this.setState({
                        removePost: false
                    });
                }
                else
                {
                    // not logged in
                    this.setState({
                        removePost: false
                    });
                    this.props.updateLoggedIn(user);
                    // if this is a private page, may want to do something else
                    // but since all pages public for now, this is fine
                    this.props.showLoginPopUp(false);
                }
            }
            else
            {
                this.props.setMessages({messages: [{message: message, type: "failure"}]});
                this.props.updateLoggedIn(user);
            }
        }
    }

    /*
        This function is used to generate the appropriate liked button based off of
        the value of the liked field in the state
    */
    generateLikedButton()
    {
        if(this.state.liked)
        {
            // turn the liked button to blue
            return <button className={`${style.postButton} blueButton`} onClick={(e)=> this.likeButtonHandler(e)}><i class={`fa fa-thumbs-up ${style.thumbsUp}`}/> Like</button>;
        }
        return <button className={`${style.postButton}`} onClick={(e)=> this.likeButtonHandler(e)}><i class={`fa fa-thumbs-up ${style.thumbsUp}`}/> Like</button>;
    }

    //This function is used to geneate the good/bad buttons with the appropriate values in the HTML
    generateGoodBadButton(value, type)
    {
        if(type === "good")
        {
            return <button value={value} title = "Click to remove" className={`${style.formButton} ${style.goodButton} ${style.unclickableButton}`} id="goodButton" onClick={(e)=> this.usedButtonHandler(e)}>{value}</button>;
        }
        else
        {
            return <button value={value} className={`${style.formButton} ${style.badButton} ${style.unclickableButton}`} title = "Click to remove" id="badButton" onClick={(e)=> this.usedButtonHandler(e)}>{value}</button>;
        }
    }

    //Function to generate the buttons to allow you to delete/edit a post
    generateEditButtons()
    {
        let buttons = null;
        if(this.state.currentUser === this.state.username)
        {
            buttons =(<React.Fragment>
                <Dropdown.Item as="button" className={style2.dropDownButton} onClick={() => {this.changeState("openEdit", true)}}>Edit Post</Dropdown.Item>
                <Dropdown.Item as="button" value ="removePost" className={style2.dropDownButton} onClick={this.removePostHandler}>Remove Post</Dropdown.Item>
            </React.Fragment>);
        }
        else
        {
            buttons = (<Dropdown.Item as="button" className={style2.dropDownButton}>Report</Dropdown.Item>);
        }
        return buttons;
    }

    // Function to generate the pop up to edit a post
    generateEditPopUp()
    {
        let popup = "";
        if(this.state.openEdit)
        {
            popup = <ReviewForm
                        data={this.state}
                        edit={true}
                        removeFunction={this.changeState}
                        removeReview={this.removeFunction}
                        successFunction={this.updateState}
                        updateLoggedIn={this.props.updateLoggedIn}
                        showLoginPopUp={this.props.showLoginPopUp}
                        setMessages={this.props.setMessages}
                        loggedInUser={this.state.currentUser}
                    />;
        }
        return popup;
    }

    // function to generate the good buttons
    generateGoodButtons()
    {
        let goodButtonArray = [];
        let counter = 0;
        if(this.state.usedGoodButtons === undefined) return;
        // generate the used good buttons
        while(counter < this.state.usedGoodButtons.length)
        {
            goodButtonArray.push(this.generateGoodBadButton(this.state.usedGoodButtons[counter], "good"));
            counter = counter + 1;
        }
        return goodButtonArray;
    }

    // function to generate the bad buttons
    generateBadButtons()
    {
        let badButtonArray = [];
        let counter = 0;
        if(this.state.usedGoodButtons === undefined) return;

        while(counter < this.state.usedBadButtons.length)
        {
            badButtonArray.push(this.generateGoodBadButton(this.state.usedBadButtons[counter], "bad"));
            counter = counter + 1;
        }
        return badButtonArray;
    }

    // function to generate button for like count on post
    generateLikeCount()
    {
        let likeCount = <React.Fragment><button className={style.likesCountButton}onClick={(e)=> this.changeState("displayLikes", true)}><i class={`fa fa-thumbs-up ${style.likeCountThumb}`}/> {this.state.likeCount}</button></React.Fragment>;
        if(this.state.likeCount === 0)
        {
            likeCount = "";
        }
        return likeCount;
    }

    // function to generate pop up if likes button clicked
    generateLikesPopUp()
    {
        let likesPopUp = "";
        if(this.state.displayLikes)
        {
            // currentUser is false as we do not want the updateFunction called here
            // the updateFunction is used to only update the profile headers follower/following count
            likesPopUp = <UserListPopUp
                            reviewId={this.state.id}
                            type="Likes"
                            removeFunction={this.changeState}
                            updateFunction={null}
                            loggedInUser={this.state.currentUser}
                            changeFunction={this.changeLikes}
                            updateLoggedIn={this.props.updateLoggedIn}
                            showLoginPopUp={this.props.showLoginPopUp}
                            setMessages={this.props.setMessages}
                            removePost={this.removeFunction}
                        />;
        }
        return likesPopUp;
    }

    // function to generate the post pop up
    generatePostPopUp()
    {
        let postPopUp = "";
        if(this.state.openPopUp && this.state.type !== "popup")
        {
            postPopUp = <MoviePostPopUp
                            data={this.state}
                            removeFunction={this.changeState}
                            updateLiked={this.updateLiked}
                            updatePost={this.updateState}
                            removePost={this.removeFunction}
                            updateLoggedIn={this.props.updateLoggedIn}
                            showLoginPopUp={this.props.showLoginPopUp}
                            setMessages={this.props.setMessages}
                        />;
        }
        return postPopUp;
    }

    // function to create the comment button on the post
    generatePostPopUpButton()
    {
        if(!this.state.openPopUp)
        {
            return (<button className={`${style.postButton}`} onClick={() => this.changeState("openPopUp", true)}><i class={`far fa-comment ${style.commentIcon}`}/> Comment</button>);
        }
        else
        {
            return (<button className={`${style.postButton} blueButton`} onClick={() => this.changeState("openPopUp", false)}><i class={`far fa-comment ${style.commentIcon}`}/> Comment</button>);
        }
    }


    generateHTML()
    {
        let editButtons = this.generateEditButtons();
        let stars = generateRatingStars(style, this.state.id, this.state.rating);
        let likedButton = this.generateLikedButton();
        let editPopup = this.generateEditPopUp();
        let goodButtonArray = this.generateGoodButtons();
        let badButtonArray = this.generateBadButtons();
        let likeCount = this.generateLikeCount();
        let likesPopUp = this.generateLikesPopUp();
        let postPopUp = this.generatePostPopUp();
        let popUpButton = this.generatePostPopUpButton();
        let profilePath = "/profile/" + this.state.username;
        return(<React.Fragment>
            <div className={style.postHeader}>
                <div className={style.reviewerContainer}>
                    <Link to={profilePath}><p className="username">{this.state.username}</p></Link>
                </div>
                <div className={style.userImageContainer}>
                    <div>
                        <img className={style.userImage} src={require("./images/profile-pic.jpg")}/>
                    </div>
                </div>
                <Dropdown className={style2.editButtonContainer} drop="left">
                    <Dropdown.Toggle variant="success" id="dropdown-basic" className={style2.editButtons}>
                        &#10247;
                    </Dropdown.Toggle>
                    <Dropdown.Menu>
                        {editButtons}
                    </Dropdown.Menu>
                </Dropdown>
            </div>
            <div>
                <h3>{this.state.title}</h3>
            </div>
            <div className="postImage">
                <Link to={this.state.moviePath}><img className={style.moviePoster} src={this.state.poster}/></Link>
            </div>
            <form id={this.state.form} />
            <div className="centeredMaxWidthContainer">
                <fieldset class={style.rating}>
                    {stars}
                </fieldset>
            </div>
            <div className="centeredMaxWidthContainer">
                <div className="proConContainter">
                    <div className="centeredMaxWidthContainer">
                        <h4 className="h4NoMargin">The Good</h4>
                    </div>
                    <div className={`"centeredMaxWidthContainer" ${style.buttonContainer} ${style.usedButtonContainerHeight}`}>
                        {goodButtonArray}
                    </div>
                </div>
                <div className="proConContainter">
                    <div className="centeredMaxWidthContainer">
                        <h4 className="h4NoMargin">The Bad</h4>
                    </div>
                    <div className={`"centeredMaxWidthContainer" ${style.buttonContainer} ${style.usedButtonContainerHeight}`}>
                        {badButtonArray}
                    </div>
                </div>
            </div>
            <div className={style.review}>
                {this.state.review}
            </div>
            <div className={style.timestampContainer}>
                {this.state.time}
            </div>
            <div className={style.reactionContainer}>
                <div className={style.likeContainer}>
                    {likeCount}
                    {likesPopUp}
                </div>
            </div>
            <div className="socialButtonContainer">
                <div className="socialButtons">
                    {likedButton}
                    <button className={`${style.postButton}`}>Go to movie page</button>
                    {popUpButton}
                    {postPopUp}
                    {editPopup}
                </div>
            </div>
        </React.Fragment>);
    }


	render() {
        if(this.state.id === null)
        {
            return null;
        }
        else if(this.state.removePost)
        {
            return (
                <div className={`${style.post} ${style.postShadow}`}>
                    <div className={style2.removalText}>
                        Are you sure you want to remove the post?
                    </div>
                    <div className={style2.removeContainer}>
                        <button value="removePost" className={`${style.postButton}`} onClick={this.removePostHandler}>Cancel</button>
                        <button className={`${style.postButton} ${style2.cancelButton}`} onClick={this.removePost}>Remove</button>
                    </div>
                </div>
            )
        }
        else
        {
            let html = this.generateHTML();
            if(this.state.type !== "popup")
            {
                return (
                    <div className={`${style.post} ${style.postShadow}`}>
                        {html}
			        </div>
                );
            }
            else
            {
                return html;
            }
      }
    }
}

export default MoviePost;
