import React from 'react';
import logo from './logo.svg';
import background from './images/background3.jpg';
import Routes from './Router.js'
import './App.css';


class MainBody extends React.Component {
    render() {
        return (
            <Routes />
        );
    }
}

class App extends React.Component {
    constructor(props)
    {
        super(props);
        this.state={apiResponse:""};
    }

    callApi()
    {
        fetch("http://localhost:9000/testAPI")
            .then(res => res.text())
            .then(res => this.setState({apiResponse:res}));
    }

    componentWillMount()
    {
        this.callApi();
    }
    render()
    {
        return (
            <div className="App">
                <div className="App-Header">
        			<li><h1 className="mainTitle" href="#">Logo</h1></li>
        			<li class="home">
        				<a class="homeButton" href="/">Home</a>
        			</li>
        			<li class="movieDropdown">
        				<button class="movieButton">Movies</button>
        				<div class="movieDropdownContent">
        					<a href="/movie">Top Rated</a>
        					<a href="/movie">Upcoming</a>
        					<a href="/movie">In Theaters</a>
        				</div>
        			</li>
        			<li class="showDropdown">
        				<button class="showButton">Shows</button>
        				<div class="showDropdownContent">
        					<a href="/">Top Rated</a>
        					<a href="/">Schedule</a>
        				</div>
        			</li>
        			<li class="profile">
        				<a class="profileButton" href="#">Profile</a>
        			</li>
        			<div class="searchBar">
        				<form>
        					<input type="text" placeholder=" Search" name="search"></input>
        				</form>
        			</div>
                </div>
                <main>
                    <MainBody/>
                    <p>{this.state.apiResponse}</p>
                </main>
            </div>
        );
    }
}

export default App;
