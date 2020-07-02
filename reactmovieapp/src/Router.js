import React from 'react';
import {BrowserRouter as Router, Route, Redirect, Switch} from 'react-router-dom';
import Movie from './MovieReview.js'
import Landing from './LandingPage.js'
import MainPage from'./MainPage.js'
import history from './History';

class Routes extends React.Component
{
    constructor(props) {
        super(props);
    }

    render()
    {
        let test = <p> authenticated2: true </p>;
        if(!this.props.authenticated)
        {
            test = <p> authenticated2: false </p>
        }
        return (
            <Router history={history}>
                {test}
                <Switch>
                    <Route exact path="/" render={(props)=> <MainPage {...props} authenticated={this.props.authenticated} setAuthenticated={this.props.setAuthenticated}/>}/>
                    <Route exact path="/movie/" render={(props)=> <Movie {...props}/>}/>
    				<Route exact path="/landing/" render={(props)=> <Landing {...props}/>}/>
                </Switch>
            </Router>
        );
    }
}

export default Routes;
