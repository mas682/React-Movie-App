import React from 'react';
import {BrowserRouter as Router, Route, Redirect, Switch} from 'react-router-dom';
import Movie from './MovieReview.js'
import Landing from './LandingPage.js'
import MainPage from'./MainPage.js'
import history from './History';


function Routes(){
    return (
        <Router history={history}>
            <Switch>
                <Route exact path="/" component={MainPage}/>
                <Route exact path="/movie/" component={Movie}/>
				<Route exact path="/landing/" component={Landing}/>
            </Switch>
        </Router>
    );
}

export default Routes;
