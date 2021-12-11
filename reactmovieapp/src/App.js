import React from 'react';
import Routes from './Components/Router.js';
import './css/forms.css';
import './css/App.css';
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
