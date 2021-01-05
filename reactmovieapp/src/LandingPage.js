import React from 'react';
import SignUpPopup from './SignUp.js';
import SignInPopup from './SignIn.js';
import { Redirect } from 'react-router-dom';
import background1 from './images/Tenet-Wallpaper.jpg';
import './css/landingpage.css';


class Landing extends React.Component {
	constructor(props)
	{
		super(props);
		if(this.props.location.state !== undefined)
		{
			if(this.props.location.state.displayLogin)
			{
				this.props.showLoginPopUp(true);
			}
		}
		this.state = {
			loading: true,
			currentUser: this.props.currentUser,
		}
	}

	componentDidMount() {
		// clear the messages on mount
		this.props.setMessages({
			message: undefined,
			clearMessages: true
		});
		this.setState({
			loading: false
		});
	}

	static getDerivedStateFromProps(nextProps, prevState)
	{
		if(prevState.currentUser !== nextProps.currentUser)
		{
			return {currentUser: nextProps.currentUser};
		}
		else
		{
			return null;
		}
	}


	render() {
		if(this.state.loading)
		{
			return null;
		}
		else
		{
			// if logged in
			if(this.state.currentUser !== "")
			{
				let path = "/profile/" + this.state.currentUser + "/feed";
				return <Redirect to={path} />
			}
			return (
				<div className="landingPage">
					<h1 id="h1Landing">
						Really Interesting Title To Draw Users In!
					</h1>
					<h2 id = "h2Landing">
						Above are a few examples of how the random paragraph generator can be beneficial. The best way to see if this random paragraph picker will be useful for your intended purposes is to give it a try. Generate a number of paragraphs to see if they are beneficial to your current project.
					</h2>
					This product uses the TMDb API but is not endorsed or certified by TMDb.
				</div>
			);
		}
	}
}


export default Landing;
