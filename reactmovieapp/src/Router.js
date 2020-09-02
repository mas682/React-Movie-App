import React from 'react';
import {BrowserRouter as Router, Route, Redirect, Switch, useParams} from 'react-router-dom';
import Movie from './MovieReview.js'
import MovieInfo from './MovieInfo.js'
import Landing from './LandingPage.js'
import MainPage from'./MainPage.js'
import UserProfile from './userProfile.js'
import UserFeed from './userFeed.js'
import UserSettings from'./UserSettings.js'
import MovieInfoPage from'./MovieInfoPage.js'
import history from './History';
import Header from './Header.js';

class Routes extends React.Component
{
    constructor(props) {
        super(props);
        this.state = ({
            currentUser: "",
            loggedIn: null
        });
        this.updateLoggedIn = this.updateLoggedIn.bind(this);
    }

    updateLoggedIn(username, signedIn)
    {
        console.log("Username passed in to router: " + username + " current value " + this.state.currentUser);
        console.log("SignedIn value passed to router: " + signedIn + " current value " + this.state.loggedIn);
        // do not cause rerender if state not changing
        if(this.state.currentUser === username && this.state.loggedIn === signedIn)
        {
            console.log("Not rerendering from router");
            return;
        }
        else
        {
            console.log("Rerending in router");
            this.setState({
                currentUser: username,
                loggedIn: signedIn
            });
        }
    }

    render()
    {
        //alert("rendering router");
        console.log("username in router " + this.state.currentUser);
        return (<React.Fragment>

            <Router history={history}>
                <Header currentUser={this.state.currentUser} loggedIn={this.state.loggedIn}/>
                <main>
                    <Switch>
                        <Route exact path="/" render={(props)=> <Landing {...props} updateLoggedIn={this.updateLoggedIn}/>}/>
                        <Route exact path="/upcoming/" render={(props)=> <Movie {...props} updateLoggedIn={this.updateLoggedIn}/>}/>
    					<Route exact path="/movieInfo/" render={(props)=> <MovieInfoPage {...props} updateLoggedIn={this.updateLoggedIn}/>}/>
                        <Route exact path="/profile/:id" render={()=> <UserProfile updateLoggedIn={this.updateLoggedIn}/> } />
                        <Route exact path="/profile/:id/feed" render={()=> <UserFeed updateLoggedIn={this.updateLoggedIn}/> } />
                        <Route exact path="/settings" render={()=> <UserSettings updateLoggedIn={this.updateLoggedIn}/>} />
                    </Switch>
                </main>
            </Router>
        </React.Fragment>);
    }
}

export default Routes;
