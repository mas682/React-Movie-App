import React from 'react';
import history from './History'
import {Link } from 'react-router-dom';
import SignUpPopup from './SignUp.js';
import ReviewForm from './ReviewForm.js'


const MainPage = () => {
    return (
        <div className="mainBodyContainer">
            <div className="post">
                <p>_theonenonly reviewed:</p>
				<hr className="divider"></hr>
				<img src={require("./images/The-Other-Guys-Poster.jpg")}/>
				<p className="theGood">The Good</p>
				<p className="theBad">The Bad</p>
            </div>
            <div className="mainBodyChild">
                <Link to="/movie"><button className="testButton">Movie page</button></Link>
                <SignUpPopup />
                <ReviewForm />
            </div>
        </div>
    );
};

export default MainPage;
