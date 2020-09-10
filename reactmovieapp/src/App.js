import React from 'react';
import ReviewForm from './ReviewForm.js';
import Routes from './Router.js';
import MoviePost from './moviePost.js';
import Popup from 'reactjs-popup';
import Header from './Header.js';
import { Link, Redirect } from 'react-router-dom';
import history from './History'
import logo from './logo.svg';
import background from './images/background3.jpg';
import './css/forms.css';
import './App.css';
import './css/header.css';

class App extends React.Component {
    constructor(props)
    {
        super(props);
    }

    render()
    {
        return (
            <div className="App">
                <Routes />
            </div>
        );
    }
}

export default App;
