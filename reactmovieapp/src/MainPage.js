import React from 'react';
import history from './History'
import {Link, Redirect } from 'react-router-dom';
import SignUpPopup from './SignUp.js';
import './css/forms.css';
import ReviewForm from './ReviewForm.js';
import MoviePost from './moviePost.js';


// left off here, need to make main page a class so it can have props
class MainPage extends React.Component {

	constructor(props)
	{
		super(props);
		this.state={
			authenticated: false,
			redirect: false
		};

	}

	async componentDidMount()
	{
		// call the server to see if user logged in or not and wait for the response
		let result = await this.apiCall();
		// for testing
		console.log("STATUS: " + result[1]);
		console.log(result[0]);
		if(result[0] == "No user logged in")
		{
			this.setState({authenticated: false});
		}
		/*
		else if(result[0] == "User authenticated")
				redirect to landing??

		*/

	}

	flipAuhtenticated(event)
	{
		this.props.setAuthenticated(!this.props.authenticated);
		this.setState({redirect: true});
	}

	async apiCall()
	{
		let status = 500;
		// call server to see if user logged in or not
		return fetch("http://localhost:9000/")
			.then(res => {
				// get the response code
				status = res.status;
				// get the message returned
				return res.text().then(res => {return [res, status]});
			});
	}

	render()
	{
		// for testing
		let test = <p> authenticated3: true </p>;
		if(!this.props.authenticated)
		{
			test = <p> authenticated3: false </p>
		}
		let test2 = <p> authenticated to server: true </p>
		if(!this.state.authenticated)
		{
			test2 = <p> authenticated to server: false </p>
		}

		/*
			left off here:
			can now authenticate from home page
			still trying to decide if I want a global authentication or not
			but for any given page, you will probably have to contact server to get some data
			so may as well authenticate on each page...
			so global probably not needed
			kind of stuck until able to login
		*/
		// this if is just for testing how to redirect once a button clicked such as
		// signing up
		if(this.state.redirect)
		{
			return <Redirect to="/landing/" />;
		}
		/* uncomment when not testing
		else if(!this.state.authenticated)
		{
			return (
				<div className="mainBodyContainer">
					<div className="mainBodyChild">
						<p> You are not logged in yet! </p>
						{test2}
						<Link to="/movie"><button className="testButton">Movie page</button></Link>
						<SignUpPopup />
						<ReviewForm />
						<button title = "Click to remove" id="goodButton" onClick={(e)=> this.flipAuhtenticated(e)}>flip</button>
					</div>
				</div>
			);
		}
		*/
		else
		{
			return (
				<div className="mainBodyContainer">
					/*
						Going to format the review post and how it looks
						Make this reusable so that it can be used on a individual users page
						Or on a users timeline
					*/
					<MoviePost form="form1"/>
					<MoviePost form="form2"/>
					<div className="mainBodyChild">
						{test}
						{test2}
						<Link to="/movie"><button className="testButton">Movie page</button></Link>
						<SignUpPopup />
						<ReviewForm />
						<button title = "Click to remove" id="goodButton" onClick={(e)=> this.flipAuhtenticated(e)}>flip</button>
					</div>
				</div>
			);
		}
	}
}
export default MainPage;
