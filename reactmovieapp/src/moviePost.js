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
            user: this.props.data.review.userId,
            // title of post
            title: this.props.data.review.title,
            // form id for post
            form: "form" + this.props.data.review.id,
            // username for the user who posted the review
            username: this.props.data.review.user.username,
            // id of the review post
            id: this.props.data.review.id,
            rating: this.props.data.review.rating,
            comments: this.props.data.review.comments,
            usedGoodButtons: this.getGoodButtons(this.props.data.review.goodTags),
            usedBadButtons: this.getBadButtons(this.props.data.review.badTags),
            unusedGoodButtons: ['Acting', 'Jokes', 'Too short', 'Too long', 'Story', 'Theme'],
            unusedBadButtons: ['Acting', 'Jokes', 'Too short', 'Too long', 'Story', 'Theme'],
            review: this.props.data.review.review,
            time: this.props.data.review.createdAt,
            // the logged in users username
            currentUser: this.props.currentUser,
            // theusername of the user whose page this post is currently on
            usersPage: this.props.usersPage,
            // used to show likes pop up
            displayLikes: false,
            // used as boolean as to whether or not to show remove post buttons when clicked
            removePost: false
        };
        this.likeButtonHandler = this.likeButtonHandler.bind(this);
        this.updateState = this.updateState.bind(this);
        this.postLike = this.postLike.bind(this);
        this.removeLike = this.removeLike.bind(this);
        this.changeLikes = this.changeLikes.bind(this);
        this.changeState = this.changeState.bind(this);
        this.removePostHandler = this.removePostHandler.bind(this);
        this.removePost = this.removePost.bind(this);
        this.generateEditButtons = this.generateEditButtons.bind(this);
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

    /*
        This sets the state of the post to liked or not depending on if
        it is currently liked or not when clicked
        Will need to add handling to update database when clicked so the database
        can keep track of which posts are liked by who
    */
    async likeButtonHandler(event)
    {
        event.preventDefault();
        if(!this.state.liked)
        {
            let result = await this.postLike();
            let status = result[0];
            let count = this.state.likeCount + 1;
            if(status === 200)
            {
                this.setState({
                    liked: true,
                    likeCount: count
                });
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
                this.setState({
                    liked: false,
                    likeCount: count
                });
            }
            else
            {
                alert(result[1]);
            }
        }
    }

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
    }

    // function to change the state of the component
    changeState(key, value)
    {
        this.setState({[key]: value});
    }

    // funciton to set removePost to true/false depending
    // on the current state
    removePostHandler(event)
    {
        let key = event.target.value;
        let value = !this.state[key];
        this.setState({[key]: value});
    }

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
                    this.setState({
                        // set the id of the post to null
                        id: null,
                        // used as boolean as to whether or not to show remove post buttons when clicked
                        removePost: false
                    });
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

    /*
        This function is used to geneate the good/bad buttons with the appropriate values in the HTML
    */
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

    commentHandler()
    {
        return <MoviePostPopUp data={this.state} />;
    }

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



	render() {
        if(this.state.id === null)
        {
            return null;
        }
        if(this.state.removePost)
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
        // generate the stars for the review
        let stars = this.generateRatingStars();
        let likedButton = this.generateLikedButton();
        // array to hold the good buttons
        let goodButtonArray = [];
        let badButtonArray = [];
        // counter for loop
        let counter = 0;
        let profilePath = "/profile/" + this.state.username;

        // generate the used good buttons
        while(counter < this.state.usedGoodButtons.length)
        {
            goodButtonArray.push(this.generateGoodBadButton(this.state.usedGoodButtons[counter], "good"));
            counter = counter + 1;
        }
        // reset counter
        counter = 0;
        while(counter < this.state.usedBadButtons.length)
        {
            badButtonArray.push(this.generateGoodBadButton(this.state.usedBadButtons[counter], "bad"));
            counter = counter + 1;
        }
        let popup = "";
        if(this.state.openEdit)
        {
            popup = <ReviewForm data={this.state} edit={true} removeFunction={this.changeState} successFunction={this.updateState}/>;
        }

        let popupButton = <button className={`${style.postButton}`} onClick={() => this.changeState("openPopUp", true)}><i class={`far fa-comment ${style.commentIcon}`}/> Comment</button>;
        let postPopUp = "";
        if(this.state.openPopUp)
        {
            postPopUp = <MoviePostPopUp data={this.state} removeFunction={this.changeState}/>;
        }

        let likeCount = <React.Fragment><button className={style.likesCountButton}onClick={(e)=> this.changeState("displayLikes", true)}><i class={`fa fa-thumbs-up ${style.likeCountThumb}`}/> {this.state.likeCount}</button></React.Fragment>;
        if(this.state.likeCount === 0)
        {
            likeCount = "";
        }

        let likesPopUp = "";
        if(this.state.displayLikes)
        {
            // currentUser is false as we do not want the updateFunction called here
            // the updateFunction is used to only update the profile headers follower/following count
            let currentUserBool = false;
            if(this.state.currentUser === this.state.username)
            {
                currentUserBool = true;
            }
            popup = <UserListPopUp reviewId={this.state.id} type="Likes" removeFunction={this.changeState} updateFunction={this.props.updateFunction} username={this.state.usersPage} currentUser={currentUserBool} changeFunction={this.changeLikes} updateFollowersFunction={this.props.updateFollowersFunction}/>;
        }

        let editButtons = this.generateEditButtons();

        return (
			<div className={`${style.post} ${style.postShadow}`}>
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
                </div>
				<div className="socialButtonContainer">
				    <div className="socialButtons">
                            {likedButton}
						    <button className={`${style.postButton}`}>Go to movie page</button>
                            {popupButton}
                            {postPopUp}
                            {popup}
					</div>
				</div>
			</div>
        );
    }
}

export default MoviePost;
