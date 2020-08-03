import React from 'react';
import {BrowserRouter as Router, Route, Redirect, Switch, useParams} from 'react-router-dom';
import Movie from './MovieReview.js'
import Landing from './LandingPage.js'
import MainPage from'./MainPage.js'
import UserProfile from './userProfile.js'
import UserFeed from './userFeed.js'
import UserSettings from'./UserSettings.js'
import history from './History';

class Routes extends React.Component
{
    constructor(props) {
        super(props);
    }

    render()
    {
        return (
            <Router history={history}>
                <Switch>
                    <Route exact path="/" render={(props)=> <Landing {...props}/>}/>
                    <Route exact path="/movie/" render={(props)=> <Movie {...props}/>}/>
                    <Route exact path="/profile/:id" render={()=> <UserProfile /> } />
                    <Route exact path="/profile/:id/feed" render={()=> <UserFeed /> } />
                    <Route exact path="/settings" render={()=> <UserSettings />} />
                </Switch>
            </Router>
        );
    }
}

export default Routes;
