import React from 'react';
import ReviewForm from './ReviewForm.js';
import Routes from './Router.js';
import MoviePost from './moviePost.js';
import Popup from 'reactjs-popup';
import { Link, Redirect } from 'react-router-dom';
import history from './History'
import logo from './logo.svg';
import background from './images/background3.jpg';
import style from './css/reviewform.module.css';
import './css/forms.css';
import './App.css';
import './css/header.css';
import './css/reviewform.css';


class MainBody extends React.Component {

    render() {
        return (
            <Routes authenticated = {this.props.authenticated} setAuthenticated = {this.props.setAuthenticated}/>
        );
    }
}

class Header extends React.Component {
	render() {
		return (
			<div className="App-Header">
				<div className="logo">
					<h1 href="#">Logo</h1>
				</div>
				<div className="navButtons">
					<div class="home"><a class="homeButton" href="/">Home</a></div>
					<div class="movieDropdown">
						<button class="movieButton">Movies</button>
						<div class="movieDropdownContent">
							<a href="/movie">Top Rated</a>
							<a href="/movie">Upcoming</a>
							<a href="/movie">In Theaters</a>
						</div>
					</div>
					<div class="mainBodyChild"><ReviewForm/></div>
					<div class="showDropdown">
						<button class="showButton">Shows</button>
						<div class="showDropdownContent">
							<a href="/">Top Rated</a>
							<a href="/">Schedule</a>
						</div>
					</div>
					<div class="profile">
						<a class="profileButton" href="#">Profile</a>
					</div>
				</div>
				<div className="searchBar">
					<form><input type="text" placeholder=" Search" name="search"></input></form>
				</div>
			</div>
		);
	}
}

class App extends React.Component {
    constructor(props)
    {
        super(props);
        this.state={
            authenticated: true,
            checked: false
        };

    }

    callApi()
    {
        /*fetch("http://localhost:9000/testAPI")
            .then(res => res.text())
            .then(res => this.setState({apiResponse:res}));
        */
        if(!this.state.checked)
        {
            this.setState({checked: true});
            //alert("setting checked");
        }
    }

    componentWillMount()
    {
        //this.callApi();
    }

    setAuthenticated = (auth) =>
    {
        this.setState({authenticated: auth});
    }

    render()
    {
        return (
            <div className="App">
                <Header/>
                <main>
                    <MainBody authenticated = {this.state.authenticated} setAuthenticated = {this.setAuthenticated}/>
                </main>
            </div>
        );
    }
}

export default App;
