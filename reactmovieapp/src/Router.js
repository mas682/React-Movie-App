import React from 'react';
import {BrowserRouter as Router, Route, Redirect, Switch} from 'react-router-dom';
import SignUp from './SignUp.js'
import MainPage from'./MainPage.js'
import history from './History';


function Routes(){
    return (
        <Router history={history}>
            <Switch>
                <Route exact path="/" component = {MainPage}/>
                <Route exact path="/signup/" component={SignUp}/>
            </Switch>
        </Router>
    );
}

export default Routes;
