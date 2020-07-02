import React from 'react';
import history from './History'
import {Link } from 'react-router-dom';
import SignUpPopup from './SignUp.js';
import './css/forms.css';
import ReviewForm from './ReviewForm.js';


class Post extends React.Component {
	render() {
        return (
			<div className="post">
				<div className="postHeader">
					<p className="username">_theonenonly</p>
					<img src={require("./images/profile-pic.jpg")}/>
				</div>
				<div className="postImage">
					<img className="moviePoster" src={require("./images/The-Other-Guys-Poster.jpg")}/>
				</div>
				<div className="postStars">
					<span class="fa fa-star checked"></span>
					<span class="fa fa-star checked"></span>
					<span class="fa fa-star checked"></span>
					<span class="fa fa-star checked"></span>
					<span class="fa fa-star checked"></span>
				</div>
				<div className="postGoodBad">
					<h2>The Good</h2>
					<h2>The Bad</h2>
				</div>
				<div className="postGoodButtons">
					<div className="goodButtons">
						<button>good</button>
						<button>good</button>
						<button>good</button>
					</div>
					<div className="badButtons">
						<button>bad</button>
						<button>bad</button>
						<button>bad</button>
					</div>
				</div>
				<form className="review">
					<textarea className="reviewTextArea">Review</textarea>
				</form>
				<div className="socialButtonContainer">
					<div className="socialButtons">
						<button>Like</button>
						<button>Go to movie page</button>
						<button>Comment</button>
					</div>
				</div>
			</div>
        );
    }
}


// left off here, need to make main page a class so it can have props
class MainPage extends React.Component {

	constructor(props)
	{
		super(props);
		this.state={
			authenticated: props.authenticated
		};
		this.flipAuhtenticated = this.flipAuhtenticated.bind(this);
	}


	flipAuhtenticated(event)
	{
		this.props.setAuthenticated(!this.props.authenticated);
	}


	render()
	{
		let test = <p> authenticated3: true </p>;
		if(!this.props.authenticated)
		{
			test = <p> authenticated3: false </p>
		}
		let test2 = <p> authenticated4: true </p>
		if(!this.state.authenticated)
		{
			test2 = <p> authenticated4: false </p>
		}
		return (
			<div className="mainBodyContainer">
				<Post />
				<div className="mainBodyChild">
					{test}
					<p> state: {test2}</p>
					<Link to="/movie"><button className="testButton">Movie page</button></Link>
					<SignUpPopup />
					<ReviewForm />
					<button title = "Click to remove" id="goodButton" onClick={(e)=> this.flipAuhtenticated(e)}>flip</button>
				</div>
			</div>
		);
	}
}
/*
const MainPage = () => {
    return (
        <div className="mainBodyContainer">
			<Post />
            <div className="mainBodyChild">
                <Link to="/movie"><button className="testButton">Movie page</button></Link>
                <SignUpPopup />
                <ReviewForm />
            </div>
        </div>
    );
};
*/
export default MainPage;
