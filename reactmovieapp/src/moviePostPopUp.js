import React from 'react';
import style from './css/MoviePost/moviePost.module.css';
import Popup from 'reactjs-popup';
import UserListPopUp from './UserListPopUp.js';
import ReviewForm from './ReviewForm.js';
import CommentController from './CommentController.js';
import CommentBox from './CommentBox.js';
import {Link} from 'react-router-dom';
import style2 from './css/MoviePost/moviePostPopUp.module.css'



class MoviePostPopUp extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            // boolean for whether or not this pop up is open
            open: this.props.data.openPopUp,
            // boolean for opening the edit pop up
            openEdit: false,
            // boolean indicating if logged in user liked post
            liked: this.props.data.liked,
            // count of likes on post
            likeCount: this.props.data.likeCount,
            // userId for user who posted the review
            userId: this.props.data.user,
            // title of post
            title: this.props.data.title,
            // form id for the post
            form: this.props.data.form + "pop",
            // username for the user who posted the review
            username: this.props.data.username,
            // id of the review post
            id: this.props.data.id,
            rating: this.props.data.rating,
            comments: this.props.data.comments,
            usedGoodButtons: this.props.data.usedGoodButtons,
            usedBadButtons: this.props.data.usedBadButtons,
            unusedGoodButtons: ['Acting', 'Jokes', 'Too short', 'Too long', 'Story', 'Theme'],
            unusedBadButtons: ['Acting', 'Jokes', 'Too short', 'Too long', 'Story', 'Theme'],
            review: this.props.data.review,
            time: this.props.data.time,
            // the logged in users username
            currentUser: this.props.data.currentUser,
            displayLikes: false,
            // boolean to tell commentController to update if new comment was just posted
            // by the current user
            newComment: false
        };

        this.closeModal = this.closeModal.bind(this);
        this.generateGoodButtons = this.generateGoodButtons.bind(this);
        this.generateBadButtons = this.generateBadButtons.bind(this);
        this.generateComments = this.generateComments.bind(this);
        this.changeHandler = this.changeHandler.bind(this);
        this.likeButtonHandler = this.likeButtonHandler.bind(this);
        this.changeState = this.changeState.bind(this);
        this.generateEditPopUp = this.generateEditPopUp.bind(this);
        this.postLike = this.postLike.bind(this);
        this.removeLike = this.removeLike.bind(this);
        this.changeLikes = this.changeLikes.bind(this);
        this.generateLikeCount = this.generateLikeCount.bind(this);
        this.generateLikesPopUp = this.generateLikesPopUp.bind(this);
        this.updateComments = this.updateComments.bind(this);
    }

    // called after component was updated
    componentDidUpdate()
    {
        // if there was a new comment on the last render, reset the boolean to false
        // this will cause shouldComponentUpdate to be called which will return false
        if(this.state.newComment !== false)
        {
            // set the newComment boolean to false
            this.changeState("newComment", false);
        }
    }

    // called whenever the state is changed for optimization
    shouldComponentUpdate(nextProps, nextState){
        // if the state change was the newComment being switched from true to false,
        // do not rerender
        if(this.state.newComment === true && nextState.newComment === false)
        {
            return false;
        }
        return true;
    }

    // called by the CommentBox component when a comment is posted
    // this will cause the component to rerender and update the props sent to
    // the CommentController component
    updateComments(newComments, user)
    {
        this.setState({
            currentUser: user,
            newComment: true,
            comments: newComments
        });
    }

    // function to change the state of the component
    changeState(key, value)
    {
        this.setState({[key]: value});
    }

    // function called when closing the popup
    closeModal() {
        this.setState({
            open: false,
        });
        this.props.removeFunction("openPopUp", false);
    }

    // used to update the state for the title, review, and the rating
    changeHandler(event) {
        let name = event.target.name;
        let value = event.target.value;
        this.setState({[name]: value});
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

    // function to change the likeCount of the post
    changeLikes(count)
    {
        if(count !== this.state.likeCount)
        {
            this.setState({likeCount: count});
        }
    }

    componentDidMount() {
        // get external script to add comment icon
        const script = document.createElement("script");
        script.async = true;
        script.src = "https://kit.fontawesome.com/a076d05399.js";
        // For body
        document.body.appendChild(script);

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


    // This function is used to geneate the good/bad buttons with the appropriate values in the HTML
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

    // function to generate the comments that were related to the post
    generateComments()
    {
        return <CommentController currentUser={this.state.currentUser} reviewId={this.state.id} update={this.state.newComment} comments={this.state.comments}/>;
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

    generateEditPopUp()
    {
        let popup = "";
        let editButton = "";
        if(this.state.username === this.state.currentUser)
        {
            editButton = <button className={`${style.postButton}`} onClick={() => {this.changeState("openEdit", true)}}>Edit post</button>;
            if(this.state.openEdit)
            {
                popup = <ReviewForm data={this.state} edit={true} removeFunction={this.changeState} successFunction={this.updateState}/>;
            }
        }
        return [editButton, popup];
    }

    generateLikeCount()
    {
        let likeCount = <React.Fragment><button className={style.likesCountButton}onClick={(e)=> this.changeState("displayLikes", true)}><i class={`fa fa-thumbs-up ${style.likeCountThumb}`}/> {this.state.likeCount}</button></React.Fragment>;
        if(this.state.likeCount === 0)
        {
            likeCount = "";
        }
        return likeCount;
    }

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


	render() {
        let stars = this.generateRatingStars();
        let likedButton = this.generateLikedButton();
        let goodButtonArray = this.generateGoodButtons();
        let badButtonArray = this.generateBadButtons();
        let commentArray = this.generateComments();
        let profilePath = "/profile/" + this.state.username;
        let editPopUpElements = this.generateEditPopUp();
        let editButton = editPopUpElements[0];
        let editPopUp = editPopUpElements[1];
        let likeCount = this.generateLikeCount();
        let likesPopUp = this.generateLikesPopUp();
        let commentBox = <CommentBox reviewId={this.state.id} form={this.state.form} updateCommentsFunction={this.updateComments}/>

        return (
            <React.Fragment>
            <Popup
                open={this.state.open}
                closeOnDocumentClick
                onClose={this.closeModal}
                contentStyle={{ width: "45%"}}
            >
                <div className={style2.modal}>
                    {/* &times is the multiplication symbol (x) --> */}
                    <a className={style2.close} onClick={this.closeModal}>
                    &times;
                    </a>
                    <div className={style2.content}>
                        <div className={`${style.post} ${style2.postWidth}`}>
                            <div className="postHeader">
                                <Link to={profilePath}><p className="username">{this.state.username}</p></Link>
                                <img src={require("./images/profile-pic.jpg")}/>
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
                                    <button className={`${style.postButton} blueButton`}><i class={`far fa-comment ${style.commentIcon}`}/> Comment</button>
                                    {editButton}
                                    {editPopUp}
                                </div>
                            </div>
                            {commentBox}
                            {commentArray}
                        </div>
                    </div>
                    <div className={style2.actions}>
                    </div>
                </div>
            </Popup>
            </React.Fragment>
        );
    }
}

export default MoviePostPopUp;
