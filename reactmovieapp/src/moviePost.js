import React from 'react';
import style from './css/moviePost.module.css';



class MoviePost extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            open: false,
            liked: false,
            user: this.props.data.userId,
            title: this.props.data.title,
            rating: "",
            usedGoodButtons: this.getGoodButtons(),
            usedBadButtons: [],
            unusedGoodButtons: ['Acting', 'Jokes', 'Too short', 'Too long', 'Story', 'Theme'],
            unusedBadButtons: ['Acting', 'Jokes', 'Too short', 'Too long', 'Story', 'Theme'],
            review: ""
        };
        this.getGoodButtons();
        //this.openModal = this.openModal.bind(this);
        //this.closeModal = this.closeModal.bind(this);
        //this.generateButtons = this.generateButtons.bind(this);
        //this.usedButtonHandler = this.usedButtonHandler.bind(this);
        //this.validateForm = this.validateForm.bind(this);
        //this.callApi = this.callApi.bind(this);
        //this.changeHandler = this.changeHandler.bind(this);
        //this.generateTagString = this.generateTagString.bind(this);
        this.likeButtonHandler = this.likeButtonHandler.bind(this);
    }

    getGoodButtons()
    {
        let tempArr = [];
        this.props.data.goodTags.forEach((tag) => {
            tempArr.push(tag.value);
        });
        return tempArr;
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
            return <button className={`${style.postButton} ${style.likeButtonSelected}`} onClick={(e)=> this.likeButtonHandler(e)}><i class={`fa fa-thumbs-up ${style.thumbsUp}`}/> Like</button>;
        }
        return <button className={`${style.postButton}`} onClick={(e)=> this.likeButtonHandler(e)}><i class={`fa fa-thumbs-up ${style.thumbsUp}`}/> Like</button>;
    }

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
        let stars = "";
        if(this.props.form == "form1")
        {
            stars = (
                    <React.Fragment>
                       <input type="radio" id="star5" name={style.rating} value="5" form={this.props.form}/><label class={style.full} for="star5" title="Awesome - 5 stars"></label>
                       <input type="radio" id="star4half" name={style.rating} value="4.5" form={this.props.form}/><label class={style.half} for="star4half" title="Pretty good - 4.5 stars"></label>
                       <input type="radio" id="star4" name={style.rating} value="4" form={this.props.form}/><label class = {style.full} for="star4" title="Pretty good - 4 stars"></label>
                       <input type="radio" id="star3half" name={style.rating} value="3.5" form={this.props.form}/><label class={style.half} for="star3half" title="Meh - 3.5 stars"></label>
                       <input type="radio" id="star3" name={style.rating} value="3" form={this.props.form}/><label class = {style.full} for="star3" title="Meh - 3 stars"></label>
                       <input type="radio" id="star2half" name={style.rating} value="2.5" form={this.props.form}/><label class={style.half} for="star2half" title="Kinda bad - 2.5 stars"></label>
                       <input type="radio" id="star2" name={style.rating} value="2" form={this.props.form} checked/><label class = {style.full} for="star2" title="Kinda bad - 2 stars"></label>
                       <input type="radio" id="star1half" name={style.rating} value="1.5" form={this.props.form}/><label class={style.half} for="star1half" title="Meh - 1.5 stars"></label>
                       <input type="radio" id="star1" name={style.rating} value="1" form={this.props.form}/><label class = {style.full} for="star1" title="Sucks big time - 1 star"></label>
                       <input type="radio" id="starhalf" name={style.rating} value="0.5" form={this.props.form}/><label class={style.half} for="starhalf" title="Don't waste your time - 0.5 stars"></label>
                    </React.Fragment>);
        }
        else
        {
            stars = (
                    <React.Fragment>
                       <input type="radio" id="star5" name={style.rating} value="5" form={this.props.form}/><label class={style.full} for="star5" title="Awesome - 5 stars"></label>
                       <input type="radio" id="star4half" name={style.rating} value="4.5" form={this.props.form}/><label class={style.half} for="star4half" title="Pretty good - 4.5 stars"></label>
                       <input type="radio" id="star4" name={style.rating} value="4" form={this.props.form} checked/><label class = {style.full} for="star4" title="Pretty good - 4 stars"></label>
                       <input type="radio" id="star3half" name={style.rating} value="3.5" form={this.props.form}/><label class={style.half} for="star3half" title="Meh - 3.5 stars"></label>
                       <input type="radio" id="star3" name={style.rating} value="3" form={this.props.form}/><label class = {style.full} for="star3" title="Meh - 3 stars"></label>
                       <input type="radio" id="star2half" name={style.rating} value="2.5" form={this.props.form}/><label class={style.half} for="star2half" title="Kinda bad - 2.5 stars"></label>
                       <input type="radio" id="star2" name={style.rating} value="2" form={this.props.form}/><label class = {style.full} for="star2" title="Kinda bad - 2 stars"></label>
                       <input type="radio" id="star1half" name={style.rating} value="1.5" form={this.props.form}/><label class={style.half} for="star1half" title="Meh - 1.5 stars"></label>
                       <input type="radio" id="star1" name={style.rating} value="1" form={this.props.form}/><label class = {style.full} for="star1" title="Sucks big time - 1 star"></label>
                       <input type="radio" id="starhalf" name={style.rating} value="0.5" form={this.props.form}/><label class={style.half} for="starhalf" title="Don't waste your time - 0.5 stars"></label>
                    </React.Fragment>);
        }

        let value = "Test";
        let text = "Sublimely funny, particularly in the first half-hour, with a gorgeous running gag about the band TLC and a fabulously moronic death scene for The Rock and Sam Jackson, "
                    +"who play a couple of hero-cops with a propensity for wrecking half the city in pursuit of small-time cannabis dealers."
                    +"\nWahlberg is excellent - as unexpectedly good as Channing Tatum was in 21 Jump Street, though here the Max Payne and The Departed actor plays a coiled,"
                    +"perpetually furious bundle of resentment and frustration, ground down by the everyday humiliations that come with having accidentally shot Derek Jeter";
        let likedButton = this.generateLikedButton();
        // array to hold the good buttons
        let goodButtonArray = [];
        // counter for loop
        let counter = 0;
        // generate the used good buttons
        while(counter < this.state.usedGoodButtons.length)
        {
            goodButtonArray.push(this.generateGoodBadButton(this.state.usedGoodButtons[counter], "good"));
            counter = counter + 1;
        }

        /*
            left off here fixing stars formatting
            will need a unique form id for each review
            could just take id of review from database and append to form name
        */
        return (
			<div className="post">
				<div className="postHeader">
					<p className="username">_theonenonly</p>
					<img src={require("./images/profile-pic.jpg")}/>
				</div>
				<div className="postImage">
					<img className="moviePoster" src={require("./images/The-Other-Guys-Poster.jpg")}/>
				</div>
                <form id={this.props.form} />
				<div className={style.centeredMaxWidthContainer}>
                    <fieldset class={style.rating}>
                        {stars}
                    </fieldset>
				</div>
                <div className={style.centeredMaxWidthContainer}>
                    <div className={style.proConContainter}>
                        <div className={style.centeredMaxWidthContainer}>
                            <h4 className={style.h4NoMargin}>The Good</h4>
                        </div>
                        <div className={`${style.centeredMaxWidthContainer} ${style.buttonContainer} ${style.usedButtonContainerHeight}`}>
                            {goodButtonArray}
                        </div>
                    </div>
                    <div className={style.proConContainter}>
                        <div className={style.centeredMaxWidthContainer}>
                            <h4 className={style.h4NoMargin}>The Bad</h4>
                        </div>
                        <div className={`${style.centeredMaxWidthContainer} ${style.buttonContainer} ${style.usedButtonContainerHeight}`}>
                            <button value={value} className={`${style.formButton} ${style.badButton} ${style.unclickableButton}`} title = "Click to remove" id="badButton" onClick={(e)=> this.usedButtonHandler(e)}>{value}</button>
                            <button value={value} className={`${style.formButton} ${style.badButton} ${style.unclickableButton}`} title = "Click to remove" id="badButton" onClick={(e)=> this.usedButtonHandler(e)}>{value}</button>
                            <button value={value} className={`${style.formButton} ${style.badButton} ${style.unclickableButton}`} title = "Click to remove" id="badButton" onClick={(e)=> this.usedButtonHandler(e)}>{value}</button>
                        </div>
                    </div>
                </div>
                <div className={style.review}>
                    {text}
                </div>
				<div className="socialButtonContainer">
					<div className="socialButtons">
                        {likedButton}
						<button className={`${style.postButton}`}>Go to movie page</button>
						<button className={`${style.postButton}`}><i class={`far fa-comment ${style.commentIcon}`}/> Comment</button>
					</div>
				</div>
			</div>
        );
    }
}

export default MoviePost;
