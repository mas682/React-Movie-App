import React from 'react';
import style from './css/MoviePost/moviePost.module.css';
import style2 from './css/MoviePost/moviePostPopUp.module.css'
import {Link} from 'react-router-dom';
import MoviePostPopUp from './moviePostPopUp.js';
import UserListPopUp from './UserListPopUp.js';
import './css/MoviePost/moviePost.css';
import ReviewForm from './ReviewForm.js';
import Dropdown from 'react-bootstrap/Dropdown'



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
                // userId for user who posted the review
                userId: this.props.data.userId,
                // title of post
                title: this.props.data.title,
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
                time: this.props.data.time,
                // the logged in users username
                currentUser: this.props.data.currentUser,
                // theusername of the user whose page this post is currently on
                usersPage: this.props.data.usersPage,
                // used to show likes pop up
                displayLikes: false,
                // used as boolean as to whether or not to show remove post buttons when clicked
                removePost: false,
                type: "popup"
            };
        }
        else
        {
            this.state = {
                // boolean for opening the edit pop up
                openEdit: false,
                // boolean to open popup to comment on post
                openPopUp: false,
                // boolean indicating if logged in user liked post
                liked: this.props.data.liked,
                // count of likes on post
                likeCount: this.props.data.review.likes.length,
                // userId for user who posted the review
                userId: this.props.data.review.userId,
                // title of post
                title: this.props.data.review.title,
                // form id for post
                form: "form" + this.props.data.review.id,
                // username for the user who posted the review
                username: this.props.data.review.user.username,
                // id of the review post
                id: this.props.data.review.id,
                rating: this.props.data.review.rating,
                /* no longer needed */
                //comments: this.props.data.review.comments,
                usedGoodButtons: this.getGoodButtons(this.props.data.review.goodTags),
                usedBadButtons: this.getBadButtons(this.props.data.review.badTags),
                review: this.props.data.review.review,
                time: this.props.data.review.createdAt,
                // the logged in users username
                currentUser: this.props.currentUser,
                // theusername of the user whose page this post is currently on
                usersPage: this.props.usersPage,
                // used to show likes pop up
                displayLikes: false,
                // used as boolean as to whether or not to show remove post buttons when clicked
                removePost: false,
                type: "non-popup"
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
        this.generateGoodButtons = this.generateGoodButtons.bind(this);
        this.generateBadButtons = this.generateBadButtons.bind(this);
        this.generateLikeCount = this.generateLikeCount.bind(this);
        this.generateLikesPopUp = this.generateLikesPopUp.bind(this);
        this.generatePostPopUp = this.generatePostPopUp.bind(this);
        this.generatePostPopUpButton = this.generatePostPopUpButton.bind(this);
        this.updateLiked = this.updateLiked.bind(this);
        this.removeFunction = this.removeFunction.bind(this);
    }

    /*
        this function is used to extract the good tags out of the props that are passed
        into the component and create an array with the values to put into the state
    */
    getGoodButtons(buttonArray)
    {
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
    getBadButtons(buttonArray)
    {
        let tempArr = [];
        buttonArray.forEach((tag) => {
            tempArr.push(tag.value);
            // should also remove button from unused array if the post belongs to the current user
        });
        return tempArr;
    }

    /*
        This function is used to generate the stars and set the appropriate ones to being colored or not
        based off of the rating passed in by the props to the state
    */
    generateRatingStars()
    {
        let stars = [];
        let tempId = "star5" + this.state.id;
        if(this.state.rating == 5.0)
        {
            stars.push(<React.Fragment><input type="radio" id={tempId} name={style.rating} value="5" form={this.state.form} checked={true}/><label class={style.full} for={tempId} title="Awesome - 5 stars"></label></React.Fragment>);
        }
        else
        {
            stars.push(<React.Fragment><input type="radio" id={tempId} name={style.rating} value="5" form={this.state.form}/><label class={style.full} for={tempId} title="Awesome - 5 stars"></label></React.Fragment>);
        }
        tempId = "star4half" + this.state.id;
        if(this.state.rating == 4.50)
        {
            stars.push(<React.Fragment><input type="radio" id={tempId} name={style.rating} value="4.5" form={this.state.form} checked={true}/><label class={style.half} for={tempId} title="Pretty good - 4.5 stars"></label></React.Fragment>);
        }
        else
        {
            stars.push(<React.Fragment><input type="radio" id={tempId} name={style.rating} value="4.5" form={this.state.form}/><label class={style.half} for={tempId} title="Pretty good - 4.5 stars"></label></React.Fragment>);
        }
        tempId = "star4" + this.state.id;
        if(this.state.rating == 4.00)
        {
            stars.push(<React.Fragment><input type="radio" id={tempId} name={style.rating} value="4" form={this.state.form} checked={true}/><label class = {style.full} for={tempId} title="Pretty good - 4 stars"></label></React.Fragment>);
        }
        else
        {
            stars.push(<React.Fragment><input type="radio" id={tempId} name={style.rating} value="4" form={this.state.form}/><label class = {style.full} for={tempId} title="Pretty good - 4 stars"></label></React.Fragment>);
        }
        tempId = "star3half" + this.state.id;
        if(this.state.rating == 3.50)
        {
            stars.push(<React.Fragment><input type="radio" id={tempId} name={style.rating} value="3.5" form={this.state.form} checked={true}/><label class={style.half} for={tempId} title="Meh - 3.5 stars"></label></React.Fragment>);
        }
        else
        {
            stars.push(<React.Fragment><input type="radio" id={tempId} name={style.rating} value="3.5" form={this.state.form}/><label class={style.half} for={tempId} title="Meh - 3.5 stars"></label></React.Fragment>);
        }
        tempId = "star3" + this.state.id;
        if(this.state.rating == 3.00)
        {
            stars.push(<React.Fragment><input type="radio" id={tempId} name={style.rating} value="3" form={this.state.form} checked={true}/><label class = {style.full} for={tempId} title="Meh - 3 stars"></label></React.Fragment>);
        }
        else
        {
            stars.push(<React.Fragment><input type="radio" id={tempId} name={style.rating} value="3" form={this.state.form}/><label class = {style.full} for={tempId} title="Meh - 3 stars"></label></React.Fragment>);
        }
        tempId = "star2half" + this.state.id;
        if(this.state.rating == 2.50)
        {
            stars.push(<React.Fragment><input type="radio" id={tempId} name={style.rating} value="2.5" form={this.state.form} checked={true}/><label class={style.half} for={tempId} title="Kinda bad - 2.5 stars"></label></React.Fragment>);
        }
        else
        {
            stars.push(<React.Fragment><input type="radio" id={tempId} name={style.rating} value="2.5" form={this.state.form}/><label class={style.half} for={tempId} title="Kinda bad - 2.5 stars"></label></React.Fragment>);
        }
        tempId = "star2" + this.state.id;
        if(this.state.rating == 2.00)
        {
            stars.push(<React.Fragment><input type="radio" id={tempId} name={style.rating} value="2" form={this.state.form} checked={true}/><label class = {style.full} for={tempId} title="Kinda bad - 2 stars"></label></React.Fragment>);
        }
        else
        {
            stars.push(<React.Fragment><input type="radio" id={tempId} name={style.rating} value="2" form={this.state.form}/><label class = {style.full} for={tempId} title="Kinda bad - 2 stars"></label></React.Fragment>);
        }
        tempId = "star1half" + this.state.id;
        if(this.state.rating == 1.50)
        {
            stars.push(<React.Fragment><input type="radio" id={tempId} name={style.rating} value="1.5" form={this.state.form} checked={true}/><label class={style.half} for={tempId} title="Meh - 1.5 stars"></label></React.Fragment>);
        }
        else
        {
            stars.push(<React.Fragment><input type="radio" id={tempId} name={style.rating} value="1.5" form={this.state.form}/><label class={style.half} for={tempId} title="Meh - 1.5 stars"></label></React.Fragment>);
        }
        tempId = "star1half" + this.state.id;
        if(this.state.rating == 1.00)
        {
            stars.push(<React.Fragment><input type="radio" id={tempId} name={style.rating} value="1" form={this.state.form} checked={true}/><label class = {style.full} for={tempId} title="Sucks big time - 1 star"></label></React.Fragment>);
        }
        else
        {
            stars.push(<React.Fragment><input type="radio" id={tempId} name={style.rating} value="1" form={this.state.form}/><label class = {style.full} for={tempId} title="Sucks big time - 1 star"></label></React.Fragment>);
        }
        tempId = "starhalf" + this.state.id;
        if(this.state.rating == 0.50)
        {
            stars.push(<React.Fragment><input type="radio" id={tempId} name={style.rating} value="0.5" form={this.state.form} checked={true}/><label class={style.half} for={tempId} title="Don't waste your time - 0.5 stars"></label></React.Fragment>);
        }
        else
        {
            stars.push(<React.Fragment><input type="radio" id={tempId} name={style.rating} value="0.5" form={this.state.form}/><label class={style.half} for={tempId} title="Don't waste your time - 0.5 stars"></label></React.Fragment>);
        }
        return stars;
    }


    // function to update the liked count and sets liked to true/false
    // based on the value of value
    updateLiked(count, value)
    {
        let newCount = this.state.likeCount + count;
        this.setState({
            liked: value,
            likeCount: newCount
        });
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
            alert("You are not logged in");
            return;
        }
        if(!this.state.liked)
        {
            let result = await this.postLike();
            let status = result[0];
            if(status === 200)
            {
                this.updateLiked(1, true);
                if(this.state.type === "popup")
                {
                    // if the post was liked through the popup, update the parent moviePost state
                    this.props.updateLiked(1, true);
                }
            }
            else
            {
                alert(result[1]);
            }
        }
        else
        {
            let result = await this.removeLike();
            let status = result[0];
            let count = this.state.likeCount - 1;
            if(status === 200)
            {
                let count = this.state.likeCount - 1;
                this.updateLiked(-1, false);
                if(this.state.type === "popup")
                {
                    // if the post was liked through the popup, update the parent moviePost state
                    this.props.updateLiked(-1, false);
                }
            }
            else
            {
                alert(result[1]);
            }
        }
    }

    // function to send request to server to remove like from a post
    removeLike()
    {
        // when removing, will need to update the list of users somehow...
        const requestOptions = {
            method: 'POST',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                reviewId: this.state.id
            })
        };

        let status = 0;
        return fetch("http://localhost:9000/review/removelike", requestOptions)
            .then(res => {
                status = res.status;
                return res.text();
            }).then(result =>{
                return [status, result];
            });
    }

    // function to send request to server to add a like to a post
    postLike()
    {
        const requestOptions = {
            method: 'POST',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                reviewId: this.state.id
            })
        };

        let status = 0;
        return fetch("http://localhost:9000/review/addlike", requestOptions)
            .then(res => {
                status = res.status;
                return res.text();
            }).then(result =>{
                return [status, result];
            });
    }

    componentDidMount() {
        // get external script to add comment icon
        const script = document.createElement("script");
        script.async = true;
        script.src = "https://kit.fontawesome.com/a076d05399.js";
        // For body
        document.body.appendChild(script);
    }

    // function used to update the movie post after edited
    // called by ReviewForm component when creator is editing their existing post
    updateState(titleUpdate, ratingUpdate, reviewUpdate, goodButtonUpdate, badButtonUpdate)
    {
        this.setState({
            title: titleUpdate,
            rating: ratingUpdate,
            review: reviewUpdate,
            usedGoodButtons: this.getGoodButtons(goodButtonUpdate),
            usedBadButtons: this.getGoodButtons(badButtonUpdate),
        });
        if(this.state.type === "popup")
        {
            this.props.updatePost(titleUpdate, ratingUpdate, reviewUpdate, goodButtonUpdate, badButtonUpdate);
        }
    }

    // function to change the state of the component
    changeState(key, value)
    {
        // if the comment button is clicked when already a pop up, close it
        if(key === "openPopUp" && this.state.type === "popup")
        {
            this.props.closeFunction();
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
    removeFunction()
    {
        this.setState({
            // set the id of the post to null
            id: null,
            // used as boolean as to whether or not to show remove post buttons when clicked
            removePost: false
        });
    }


    // function to handle deleting a post
    removePost()
    {
        const requestOptions = {
            method: 'POST',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                reviewId: this.state.id,
            })
        };
        let status = 0;
        fetch("http://localhost:9000/review/removepost", requestOptions)
            .then(res => {
                status = res.status;
                return res.text();
            }).then(result => {
                if(status == 200)
                {
                    this.removeFunction();
                    if(this.state.type === "popup")
                    {
                        // cause the parent to remove the post
                        this.props.removePost();
                        // close the popup
                        this.props.closeFunction();
                    }
                }
                else
                {
                    alert(result);
                    if(result === "You cannot remove another users post")
                    {
                        this.setState({
                            removePost: false
                        })
                    }
                }
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
        if(type == "good")
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
            popup = <ReviewForm data={this.state} edit={true} removeFunction={this.changeState} successFunction={this.updateState}/>;
        }
        return popup;
    }

    // function to generate the good buttons
    generateGoodButtons()
    {
        let goodButtonArray = [];
        let counter = 0;

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
            likesPopUp = <UserListPopUp reviewId={this.state.id} type="Likes" removeFunction={this.changeState} updateFunction={null} currentUser={false} changeFunction={this.changeLikes}/>;
        }
        return likesPopUp;
    }

    // function to generate the post pop up
    generatePostPopUp()
    {
        let postPopUp = "";
        if(this.state.openPopUp && this.state.type !== "popup")
        {
            postPopUp = <MoviePostPopUp data={this.state} removeFunction={this.changeState} updateLiked={this.updateLiked} updatePost={this.updateState} removePost={this.removeFunction}/>;
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
        let stars = this.generateRatingStars();
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
                <img className="moviePoster" src={require("./images/The-Other-Guys-Poster.jpg")}/>
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
            <div className={style.likeContainer}>
                {likeCount}
                {likesPopUp}
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
            console.log(html);
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
