import React from 'react';
import logo from './logo.svg';
import background from './images/background3.jpg';
import Routes from './Router.js'
import './App.css';
import'./css/header.css';


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
					<div class="add"><a class="addButton" href="/">+</a></div>
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
            authenticated: true
        };
    }

    callApi()
    {
        fetch("http://localhost:9000/testAPI")
            .then(res => res.text())
            .then(res => this.setState({apiResponse:res}));
    }

    componentWillMount()
    {
    }

    setAuthenticated = (auth) =>
    {
        this.setState({authenticated: auth});
    }

    render()
    {
        let test = <p> authenticated: true </p>;
        if(!this.state.authenticated)
        {
            test = <p> authenticated: false </p>
        }

        return (
            <div className="App">
                <Header/>
                <main>
                    <MainBody authenticated = {this.state.authenticated} setAuthenticated = {this.setAuthenticated}/>
                    {test}
                    <p>{this.state.apiResponse}</p>
                </main>
            </div>
        );
    }
}

export default App;
