import React from 'react';
import Routes from './Router.js'
import ReviewForm from './ReviewForm.js';
import SignUpPopup from './SignUp.js';
import SignInPopup from './SignIn.js';
import Popup from 'reactjs-popup';
import Header from './App.js'
import { Link } from 'react-router-dom';
import logo from './logo.svg';
import background1 from './images/Tenet-Wallpaper.jpg';
//import background2 from './images/The-Other-Guys-Wallpaper.jpg';
//import background3 from './images/A-Quiet-Place-2-Wallpaper.jpg';
import style from './css/reviewform.module.css';
import history from './History'
import './css/forms.css';
import './App.css';
import './css/header.css';
import './css/reviewform.css';
import './css/landingpage.css';


class Landing extends React.Component {
	render() {
		return (
			<div className="landingPage">
				<h1>
					Really Interesting Title To Draw Users In!
				</h1>
				<h2>
					Above are a few examples of how the random paragraph generator can be beneficial. The best way to see if this random paragraph picker will be useful for your intended purposes is to give it a try. Generate a number of paragraphs to see if they are beneficial to your current project.
				</h2>
				<SignUpPopup />
				<SignInPopup />
			</div>
		);
	}
}


export default Landing;