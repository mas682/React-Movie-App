import React from 'react';
import history from './History'
import {Link, Redirect } from 'react-router-dom';
import SignUpPopup from './SignUp.js';
import './css/forms.css';
import ReviewForm from './ReviewForm.js';
import MoviePost from './moviePost.js';
import MovieInfo from './MovieInfo.js'


// left off here, need to make main page a class so it can have props
class MainPage extends React.Component {

	constructor(props)
	{
		super(props);
		this.state={
			authenticated: false,
			redirect: false,
			posts: ""
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
		this.setState({posts:[{"user":{"username":"admin","email":"admin@email.com"},"id":1,"title":"Movie","rating":"2.50","review":"Sublimely funny, particularly in the first half-hour, with a gorgeous running gag about the band TLC and a fabulously moronic death scene for The Rock and Sam Jackson, who play a couple of hero-cops with a propensity for wrecking half the city in pursuit of small-time cannabis dealers.\nWahlberg is excellent - as unexpectedly good as Channing Tatum was in 21 Jump Street, though here the Max Payne and The Departed actor plays a coiled,perpetually furious bundle of resentment and frustration, ground down by the everyday humiliations that come with having accidentally shot Derek Jeter","updatedAt":"2020-07-12T05:36:29.436Z","goodTags":[{"id":1,"value":"Acting"},{"id":3,"value":"Too short"},{"id":2,"value":"Jokes"}],"badTags":[{"id":6,"value":"Theme"},{"id":4,"value":"Too long"},{"id":5,"value":"Story"}],"comments":[{"id":3,"value":"The scene where they talk about the lion and the tuna has to be my  favorite part.  Will Ferrell's face during the whole seen is too funny.","updatedAt":"2020-07-12T05:36:29.439Z","user":{"username":"admin","email":"admin@email.com"}},{"id":2,"value":"This is another comment to test the look of comments associated with this post.  I completely agree with you on this review but I would give it 5 stars.","updatedAt":"2020-07-12T05:36:29.438Z","user":{"username":"admin","email":"admin@email.com"}},{"id":1,"value":"This is the test comment for the 1st post","updatedAt":"2020-07-12T05:36:29.438Z","user":{"username":"admin","email":"admin@email.com"}}]},{"user":{"username":"admin","email":"admin@email.com"},"id":2,"title":"another movie","rating":"2.50","review":"","updatedAt":"2020-07-12T05:36:29.437Z","goodTags":[{"id":2,"value":"Jokes"}],"badTags":[],"comments":[]}]});

	}

	flipAuhtenticated(event)
	{
		this.props.setAuthenticated(!this.props.authenticated);
		this.setState({redirect: true});
	}

	// for testing api, will need to be moved!
	async getPosts()
	{
		let status = 500;
		// call server to get the posts
		return fetch("http://localhost:9000/")
			.then(res => {
				// get the response code
				status = res.status;
				// get the message returned
				return res.text().then(res => {
					this.setState({posts: res})
					return [res, status]
				});
			});
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
		let post1 = "";
		let post2 = "";
		if(this.state.posts[0] != undefined)
		{
			post1 = <MoviePost data={this.state.posts[0]} form="form1" />
			post2= <MoviePost data={this.state.posts[1]} form="form1" />
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
					{post1}
					{post2}
					<div className="mainBodyChild">
						{test}
						{test2}
						<Link to="/movie"><button className="testButton">Movie page</button></Link>
						<SignUpPopup />
						<ReviewForm edit={false}/>
						<button title = "Click to remove" id="goodButton" onClick={(e)=> this.flipAuhtenticated(e)}>flip</button>
						<MovieInfo/>
					</div>
				</div>
			);
		}
	}
}
export default MainPage;
