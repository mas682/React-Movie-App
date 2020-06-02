import React from 'react';
import logo from './logo.svg';
import background from './images/background3.jpg';
import Routes from './Router.js'
import './App.css';

class MainBody extends React.Component {

    buttonClicked = () => {
        this.props.history.push('/signup/')
    }

    render() {
        return (
            <div className="mainBodyContainer">
                <div className="mainBodyChild">
                    <Routes />
                </div>
            </div>
        );
    }
}


function App() {
  return (
    <div className="App">
        <header className = "App-Header">
            <h1 class="mainTitle"> Movie App </h1>
        </header>
        <main>
            <MainBody/>
        </main>
    </div>
  );
}

export default App;
