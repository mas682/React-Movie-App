import React from 'react';
import history from './History'
import {Link } from 'react-router-dom';
import SignUpPopup from './SignUp.js';
import ReviewForm from './ReviewForm.js'


const MainPage = () => {
    return (
        <div className="mainBodyContainer">
            <div className="post">
                <header className="postHeader">
					<p>_theonenonly</p>
					<img src={require("./images/profile-pic.jpg")}/>
				</header>
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
