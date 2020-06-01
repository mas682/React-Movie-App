import React from 'react';
import logo from './logo.svg';
import background from './images/background3.jpg';
import './App.css';

class MainBody extends React.Component {

    render() {
        return (
            <div className="mainBodyContainer">
                <div className="testButton">
                    Next Page
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
