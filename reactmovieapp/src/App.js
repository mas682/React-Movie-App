import React from 'react';
import ReviewForm from './ReviewForm.js';
import Routes from './Router.js';
import MoviePost from './moviePost.js';
import Popup from 'reactjs-popup';
import { Link, Redirect } from 'react-router-dom';
import history from './History'
import logo from './logo.svg';
import background from './images/background3.jpg';
import './css/forms.css';
import './App.css';
import './css/header.css';
import './css/reviewform.css';


class MainBody extends React.Component {

    render() {
        return (
            <Routes />
        );
    }
}

class Header extends React.Component {
    constructor(props){
        super(props);
        this.state = {
            reviewFormOpen: false
        };
        this.generateReviewForm = this.generateReviewForm.bind(this);
        this.removeReviewForm = this.removeReviewForm.bind(this);
    }

    removeReviewForm = () =>
    {
        this.setState({reviewFormOpen: false});
    }

    generateReviewForm()
    {
        this.setState({reviewFormOpen: true});
    }

	render() {
        let reviewForm = "";
        if(this.state.reviewFormOpen)
        {
            reviewForm = <ReviewForm edit={false} removeFunction={this.removeReviewForm}/>;
        }
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
							<a href="/upcoming">Upcoming</a>
							<a href="/movie">In Theaters</a>
						</div>
					</div>
					<div class="add"><button class="addButton" onClick={this.generateReviewForm}>+</button></div>
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
                {reviewForm}
			</div>
		);
	}
}

class App extends React.Component {
    constructor(props)
    {
        super(props);
    }

    render()
    {
        return (
            <div className="App">
                <Header/>
                <main>
                    <MainBody/>
                </main>
            </div>
        );
    }
}

export default App;
