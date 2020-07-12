import React from 'react';
import style from './css/MoviePost/moviePost.module.css';
import Popup from 'reactjs-popup';
import './css/MoviePost/moviePostPopUp.css';
import style2 from './css/MoviePost/moviePostPopUp.module.css'



class MoviePostPopUp extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            open: false,
            liked: this.props.data.liked,
            user: this.props.data.user,
            title: this.props.data.title,
            form: this.props.data.form + "pop",
            rating: this.props.data.rating,
            comments: this.props.data.comments,
            usedGoodButtons: this.props.data.usedGoodButtons,
            usedBadButtons: this.props.data.usedBadButtons,
            unusedGoodButtons: ['Acting', 'Jokes', 'Too short', 'Too long', 'Story', 'Theme'],
            unusedBadButtons: ['Acting', 'Jokes', 'Too short', 'Too long', 'Story', 'Theme'],
            review: this.props.data.review
        };
        this.openModal = this.openModal.bind(this);
        this.closeModal = this.closeModal.bind(this);
        //this.generateButtons = this.generateButtons.bind(this);
        //this.usedButtonHandler = this.usedButtonHandler.bind(this);
        //this.validateForm = this.validateForm.bind(this);
        //this.callApi = this.callApi.bind(this);
        //this.changeHandler = this.changeHandler.bind(this);
        //this.generateTagString = this.generateTagString.bind(this);
        this.likeButtonHandler = this.likeButtonHandler.bind(this);
    }

    openModal() {
        this.setState({ open: true });
    }

    closeModal() {
        this.setState({
            open: false,
        });
    }

    /*
        This function is used to generate the stars and set the appropriate ones to being colored or not
        based off of the rating passed in by the props to the state
    */
    generateRatingStars()
    {
        let stars = [];
        if(this.state.rating == 5.0)
        {
            stars.push(<React.Fragment><input type="radio" id="star5" name={style.rating} value="5" form={this.state.form} checked/><label class={style.full} for="star5" title="Awesome - 5 stars"></label></React.Fragment>);
        }
        else
        {
            stars.push(<React.Fragment><input type="radio" id="star5" name={style.rating} value="5" form={this.state.form}/><label class={style.full} for="star5" title="Awesome - 5 stars"></label></React.Fragment>);
        }
        if(this.state.rating == 4.50)
        {
            stars.push(<React.Fragment><input type="radio" id="star4half" name={style.rating} value="4.5" form={this.state.form} checked/><label class={style.half} for="star4half" title="Pretty good - 4.5 stars"></label></React.Fragment>);
        }
        else
        {
            stars.push(<React.Fragment><input type="radio" id="star4half" name={style.rating} value="4.5" form={this.state.form}/><label class={style.half} for="star4half" title="Pretty good - 4.5 stars"></label></React.Fragment>);
        }
        if(this.state.rating == 4.00)
        {
            stars.push(<React.Fragment><input type="radio" id="star4" name={style.rating} value="4" form={this.state.form} checked/><label class = {style.full} for="star4" title="Pretty good - 4 stars"></label></React.Fragment>);
        }
        else
        {
            stars.push(<React.Fragment><input type="radio" id="star4" name={style.rating} value="4" form={this.state.form}/><label class = {style.full} for="star4" title="Pretty good - 4 stars"></label></React.Fragment>);
        }
        if(this.state.rating == 3.50)
        {
            stars.push(<React.Fragment><input type="radio" id="star3half" name={style.rating} value="3.5" form={this.state.form} checked/><label class={style.half} for="star3half" title="Meh - 3.5 stars"></label></React.Fragment>);
        }
        else
        {
            stars.push(<React.Fragment><input type="radio" id="star3half" name={style.rating} value="3.5" form={this.state.form}/><label class={style.half} for="star3half" title="Meh - 3.5 stars"></label></React.Fragment>);
        }
        if(this.state.rating == 3.00)
        {
            stars.push(<React.Fragment><input type="radio" id="star3" name={style.rating} value="3" form={this.state.form} checked/><label class = {style.full} for="star3" title="Meh - 3 stars"></label></React.Fragment>);
        }
        else
        {
            stars.push(<React.Fragment><input type="radio" id="star3" name={style.rating} value="3" form={this.state.form}/><label class = {style.full} for="star3" title="Meh - 3 stars"></label></React.Fragment>);
        }
        if(this.state.rating == 2.50)
        {
            stars.push(<React.Fragment><input type="radio" id="star2half" name={style.rating} value="2.5" form={this.state.form} checked/><label class={style.half} for="star2half" title="Kinda bad - 2.5 stars"></label></React.Fragment>);
        }
        else
        {
            stars.push(<React.Fragment><input type="radio" id="star2half" name={style.rating} value="2.5" form={this.state.form}/><label class={style.half} for="star2half" title="Kinda bad - 2.5 stars"></label></React.Fragment>);
        }

        if(this.state.rating == 2.00)
        {
            stars.push(<React.Fragment><input type="radio" id="star2" name={style.rating} value="2" form={this.state.form} checked/><label class = {style.full} for="star2" title="Kinda bad - 2 stars"></label></React.Fragment>);
        }
        else
        {
            stars.push(<React.Fragment><input type="radio" id="star2" name={style.rating} value="2" form={this.state.form}/><label class = {style.full} for="star2" title="Kinda bad - 2 stars"></label></React.Fragment>);
        }
        if(this.state.rating == 1.50)
        {
            stars.push(<React.Fragment><input type="radio" id="star1half" name={style.rating} value="1.5" form={this.state.form} checked/><label class={style.half} for="star1half" title="Meh - 1.5 stars"></label></React.Fragment>);
        }
        else
        {
            stars.push(<React.Fragment><input type="radio" id="star1half" name={style.rating} value="1.5" form={this.state.form}/><label class={style.half} for="star1half" title="Meh - 1.5 stars"></label></React.Fragment>);
        }
        if(this.state.rating == 1.00)
        {
            stars.push(<React.Fragment><input type="radio" id="star1" name={style.rating} value="1" form={this.state.form} checked/><label class = {style.full} for="star1" title="Sucks big time - 1 star"></label></React.Fragment>);
        }
        else
        {
            stars.push(<React.Fragment><input type="radio" id="star1" name={style.rating} value="1" form={this.state.form}/><label class = {style.full} for="star1" title="Sucks big time - 1 star"></label></React.Fragment>);
        }
        if(this.state.rating == 0.50)
        {
            stars.push(<React.Fragment><input type="radio" id="starhalf" name={style.rating} value="0.5" form={this.state.form} checked/><label class={style.half} for="starhalf" title="Don't waste your time - 0.5 stars"></label></React.Fragment>);
        }
        else
        {
            stars.push(<React.Fragment><input type="radio" id="starhalf" name={style.rating} value="0.5" form={this.state.form}/><label class={style.half} for="starhalf" title="Don't waste your time - 0.5 stars"></label></React.Fragment>);
        }
        return stars;
    }

    /*
        This sets the state of the post to liked or not depending on if
        it is currently liked or not when clicked
        Will need to add handling to update database when clicked so the database
        can keep track of which posts are liked by who
    */
    likeButtonHandler(event)
    {
        if(!this.state.liked)
        {
            this.setState({liked: true});
        }
        else
        {
            this.setState({liked: false});
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

    generateComments(value)
    {
        return <React.Fragment>
                        <div className={style2.commentContainer}>
                            <div className={style2.userNameBox}>
                                <div>{value.user.username}</div>
                            </div>
                            <div className={style2.commentBox}>
                                <div>{value.value}</div>
                            </div>
                        </div>
                    </React.Fragment>
    }

	render() {

        /*  to do in any order:
            1. make comment button pull up a scrollable pop up showing all the comments with a input box at the bottom to add
               your comment
            2. will then have to set up database to store comments
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
        // reset counter
        counter = this.state.comments.length -1;
        let commentArray = [];
        while(counter > -1)
        {
            commentArray.push(this.generateComments(this.state.comments[counter]));
            counter = counter -1;
        }

        /*
            left off here fixing stars formatting
            will need a unique form id for each review
            could just take id of review from database and append to form name
        */
        //<button className={`${style.postButton}`} onClick={this.openModal}><i class={`far fa-comment ${style.commentIcon}`}/> Comment</button>
        return (
            <React.Fragment>
            <button className={`${style.postButton}`} onClick={this.openModal}><i class={`far fa-comment ${style.commentIcon}`}/> Comment</button>
            <Popup
                open={this.state.open}
                closeOnDocumentClick
                onClose={this.closeModal}
            >
                <div className={style2.modal}>
                    {/* &times is the multiplication symbol (x) --> */}
                    <a className={style2.close} onClick={this.closeModal}>
                    &times;
                    </a>
                    <div className={style2.content}>
                        <div className={`${style.post} ${style2.postWidth}`}>
                            <div className="postHeader">
                                <p className="username">_theonenonly</p>
                                <img src={require("./images/profile-pic.jpg")}/>
                            </div>
                            <div className="postImage">
                                <img className="moviePoster" src={require("./images/The-Other-Guys-Poster.jpg")}/>
                            </div>
                            <form id={this.props.form} />
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
                            <div className="socialButtonContainer">
                                <div className="socialButtons">
                                    {likedButton}
                                    <button className={`${style.postButton}`}>Go to movie page</button>
                                    <button className={`${style.postButton} blueButton`}><i class={`far fa-comment ${style.commentIcon}`}/> Comment</button>
                                </div>
                            </div>
                            <div>
                                <textarea
                                    type="text"
                                    name="comment"
                                    form = {this.state.form}
                                    className={`inputFieldBoxLong`}
                                    onChange={this.changeHandler}
                                    rows="3"
                                    placeholder="Add a comment"
                                />
                            </div>
                            <div className="commentSubmitContainer">
                                <button className={`${style.postButton} ${style2.commentButton}`}>Post Comment</button>
                            </div>
                            <div className={style2.commentsContainer}>
                                {commentArray}
                            </div>

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
