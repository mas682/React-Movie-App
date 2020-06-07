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


function App() {
  return (
    <div className="App">
        <div className="App-Header">
			<li><h1 className="mainTitle" href="#">Logo</h1></li>
			<li><a className="homeButton" href="/">Home</a></li>
			<li><a href="#">...</a></li>
			<li><a href="#">...</a></li>
			<li><a href="#">...</a></li>
			<li><a href="#">...</a></li>
			<div class="searchBar">
				<form>
					<input type="text" placeholder=" Search" name="search"></input>
				</form>
			</div>
        </div>
        <main>
            <MainBody/>
        </main>
    </div>
  );
}

export default App;
