import React from 'react';
import history from './History'
import {Link } from 'react-router-dom';
import SignUpPopup from './SignUp.js';
import ReviewForm from './ReviewForm.js'


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

export default MainPage;
