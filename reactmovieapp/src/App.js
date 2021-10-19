import React from 'react';
import Routes from './Router.js';
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
