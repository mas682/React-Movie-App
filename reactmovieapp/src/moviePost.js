import React from 'react';
import style from './css/MoviePost/moviePost.module.css';
import {Link} from 'react-router-dom';
import MoviePostPopUp from './moviePostPopUp.js';
import './css/MoviePost/moviePost.css';
import ReviewForm from './ReviewForm.js';



class MoviePost extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            open: false,
            openEdit: false,
            openPopUp: false,
            liked: this.props.data.liked,
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
            currentUser: this.props.user,
            editUpdate: true
        };
        this.likeButtonHandler = this.likeButtonHandler.bind(this);
        this.generateEditPopUp = this.generateEditPopUp.bind(this);
        this.removeEditPopUp = this.removeEditPopUp.bind(this);
        this.generatePopUp = this.generatePopUp.bind(this);
        this.removePopUp = this.removePopUp.bind(this);
        this.updateState = this.updateState.bind(this);
        this.postLike = this.postLike.bind(this);
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
            if(status === 200)
            {
                this.setState({liked: true});
            }
            alert(result[1]);
        }
        else
        {
            this.setState({liked: false});
        }
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

    generateEditPopUp()
    {
        this.setState({openEdit: true});
    }

    generatePopUp()
    {
        this.setState({openPopUp: true});
    }

    removePopUp()
    {
        this.setState({openPopUp: false});
    }

    removeEditPopUp()
    {
        this.setState({openEdit: false});
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

	render() {

        /*  to do in any order:
            1. make comment button pull up a scrollable pop up showing all the comments with a input box at the bottom to add
               your comment
                - somewhat done
                - need to add comments to database
                    -done
                - need to show comments associated with post
                    - in progress
            2. will then have to set up database to store comments
                - need to be able to get a username and their profile pic when
                  getting the comments for a post, need to figure this out
                    - done but need to get profile pics in there
                - need to add timestamp to comments and make usernames clickable
            3. have to redirect to a movies page on go to movie page button push
            4. set up call to api to retrieve data for post(actually may want to pass this data into the post or a index of which post to use?)
            5. set up editing if this is the current users post
            6. make user name a hyperlink to the users profile
            7. will need to handle logic on individual pages of determining which posts to get(specific user, your friends, etc.)
            8. may want option to make posts public/private
        */
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
        let editButton = "";
        let popup = "";
        if(this.state.username === this.state.currentUser)
        {
            //editButton = <ReviewForm data={this.state} edit={true} />;
            editButton = <button className={`${style.postButton}`} onClick={this.generateEditPopUp}>Edit post</button>;
            if(this.state.openEdit)
            {
                popup = <ReviewForm data={this.state} edit={true} removeFunction={this.removeEditPopUp} successFunction={this.updateState}/>;
            }
        }


        // left off here
        // making it so pop up can be opened programatically instead of only on click
        let popupButton = <button className={`${style.postButton}`} onClick={this.generatePopUp}><i class={`far fa-comment ${style.commentIcon}`}/> Comment</button>;
        let postPopUp = "";
        if(this.state.openPopUp)
        {
            postPopUp = <MoviePostPopUp data={this.state} removeFunction={this.removePopUp}/>;
        }

        /*
            left off here fixing stars formatting
            will need a unique form id for each review
            could just take id of review from database and append to form name
        */
        return (
			<div className={`${style.post} ${style.postShadow}`}>
				  <div className="postHeader">
					    <Link to={profilePath}><p className="username">{this.state.username}</p></Link>
					    <img src={require("./images/profile-pic.jpg")}/>
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
				<div className="socialButtonContainer">
				    <div className="socialButtons">
                            {likedButton}
						    <button className={`${style.postButton}`}>Go to movie page</button>
                            {popupButton}
                            {postPopUp}
                            {editButton}
                            {popup}
					</div>
				</div>
			</div>
        );
    }
}

export default MoviePost;
