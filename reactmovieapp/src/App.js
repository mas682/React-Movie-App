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
        <header className = "App-Header">
            <h1 className="mainTitle"> Movie App </h1>
        </header>
        <main>
            <MainBody/>
        </main>
    </div>
  );
}

export default App;
