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
			authenticated: null,
			username: "",
		}
	}

	async componentDidMount()
    {
        this.callApi().then(result =>{
            // set status to result[0]
            let status = result[0];
            // see if request succeeded
            if(status == 200 && result[1] !== "No user logged in")
            {
                this.setState({
                    authenticated: true,
					username: result[1],
					loaded: true
                });
				this.props.updateLoggedIn(result[1], true);
            }
            else
            {
				this.setState({authenticated: false});
				this.props.updateLoggedIn("", false);
            }
        });
    }
	// will eventually want some data returned other than just
	// verifying if logged in or not
	callApi()
	{
		const requestOptions = {
            method: 'GET',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json'},
        };

        let status = 0;
        return fetch("http://localhost:9000/", requestOptions)
            .then(res => {
                status = res.status;
                return res.text();
            }).then(result =>{
                return [status, result];
            });
	}


	render() {
		alert("rendering");
		if(this.state.authenticated === null)
		{
			return null;
		}
		else
		{
			if(this.state.authenticated)
			{
				let path = "/profile/" + this.state.username + "/feed";
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
