import React from 'react';
import style from './css/moviePost.module.css';



class MoviePost extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            open: false,
            title: "",
            rating: "",
            usedGoodButtons: [],
            usedBadButtons: [],
            unusedGoodButtons: ['Acting', 'Jokes', 'Too short', 'Too long', 'Story', 'Theme'],
            unusedBadButtons: ['Acting', 'Jokes', 'Too short', 'Too long', 'Story', 'Theme'],
            review: ""
        };
        //this.openModal = this.openModal.bind(this);
        //this.closeModal = this.closeModal.bind(this);
        //this.generateButtons = this.generateButtons.bind(this);
        //this.usedButtonHandler = this.usedButtonHandler.bind(this);
        //this.validateForm = this.validateForm.bind(this);
        //this.callApi = this.callApi.bind(this);
        //this.changeHandler = this.changeHandler.bind(this);
        //this.generateTagString = this.generateTagString.bind(this);
    }

    componentDidMount() {
        // get external script to add comment icon
        const script = document.createElement("script");
        script.async = true;
        script.src = "https://kit.fontawesome.com/a076d05399.js";
        // For body
        document.body.appendChild(script);
    }

	render() {

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
                            <button value={value} title = "Click to remove" className={`${style.formButton} ${style.goodButton} ${style.unclickableButton}`} id="goodButton" onClick={(e)=> this.usedButtonHandler(e)}>{value}</button>
                            <button value={value} title = "Click to remove" className={`${style.formButton} ${style.goodButton} ${style.unclickableButton}`} id="goodButton" onClick={(e)=> this.usedButtonHandler(e)}>{value}</button>
                            <button value={value} title = "Click to remove" className={`${style.formButton} ${style.goodButton} ${style.unclickableButton}`} id="goodButton" onClick={(e)=> this.usedButtonHandler(e)}>{value}</button>
                            <button value={value} title = "Click to remove" className={`${style.formButton} ${style.goodButton} ${style.unclickableButton}`} id="goodButton" onClick={(e)=> this.usedButtonHandler(e)}>{value}</button>
                            <button value={value} title = "Click to remove" className={`${style.formButton} ${style.goodButton} ${style.unclickableButton}`} id="goodButton" onClick={(e)=> this.usedButtonHandler(e)}>{value}</button>
                            <button value={value} title = "Click to remove" className={`${style.formButton} ${style.goodButton} ${style.unclickableButton}`} id="goodButton" onClick={(e)=> this.usedButtonHandler(e)}>{value}</button>
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
                        <button className={`${style.postButton} ${style.likeButtonSelected}`}><i class={`fa fa-thumbs-up ${style.thumbsUpSelected}`}/> Like</button>
						<button className={`${style.postButton}`}>Go to movie page</button>
						<button className={`${style.postButton}`}><i class={`far fa-comment ${style.commentIcon}`}/> Comment</button>
					</div>
				</div>
			</div>
        );
    }
}

export default MoviePost;
