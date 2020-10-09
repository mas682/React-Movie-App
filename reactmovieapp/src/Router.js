import React from 'react';
import {BrowserRouter as Router, Route, Redirect, Switch, useParams} from 'react-router-dom';
import Movie from './MovieReview.js';
import MovieInfo from './MovieInfo.js';
import Landing from './LandingPage.js';
import MainPage from'./MainPage.js';
import UserProfile from './userProfile.js';
import UserFeed from './userFeed.js';
import UserSettings from'./UserSettings.js';
import MovieInfoPage from'./MovieInfoPage.js';
import history from './History';
import Header from './Header.js';

class Routes extends React.Component
{
    constructor(props) {
        super(props);
        this.state = ({
            currentUser: "",
            loggedIn: null,
            displayLogin: false
        });
        this.updateLoggedIn = this.updateLoggedIn.bind(this);
        this.showLoginPopUp = this.showLoginPopUp.bind(this);
    }

    shouldComponentUpdate(nextProps, nextState)
    {
        // if the displayLogin was reset to false, do not cause a rerender
        if(this.state.displayLogin === true && nextState.displayLogin === false)
        {
            return false;
        }
        return true;
    }

    showLoginPopUp(value)
    {
        this.setState({displayLogin: value});
    }

    updateLoggedIn(username, signedIn)
    {
        // do not cause rerender if state not changing
        if(this.state.currentUser === username && this.state.loggedIn === signedIn)
        {
            return;
        }
        else
        {
            this.setState({
                currentUser: username,
                loggedIn: signedIn
            });
        }
    }

    render()
    {
        //alert("rendering router");
        //<Route exact path="/movie" render={(props)=> <MovieInfoPage {...props} updateLoggedIn={this.updateLoggedIn} />} />

        console.log("username in router " + this.state.currentUser);
        return (<React.Fragment>

            <Router history={history}>
                <Header currentUser={this.state.currentUser} loggedIn={this.state.loggedIn} showLoginPopUp={this.state.displayLogin} removeLoginPopUp={this.showLoginPopUp}/>
                <main>
                    <Switch>
                        <Route exact path="/" render={(props)=> <Landing {...props} updateLoggedIn={this.updateLoggedIn} showLoginPopUp={this.showLoginPopUp}/>}/>
                        <Route exact path="/upcoming/" render={(props)=> <Movie {...props} updateLoggedIn={this.updateLoggedIn}/>}/>
    					          <Route exact path="/movieInfo/" render={(props)=> <MovieInfoPage {...props} updateLoggedIn={this.updateLoggedIn}/>}/>
                        <Route exact path="/profile/:id" render={()=> <UserProfile updateLoggedIn={this.updateLoggedIn} showLoginPopUp={this.showLoginPopUp}/> } />
                        <Route exact path="/profile/:id/feed" render={()=> <UserFeed updateLoggedIn={this.updateLoggedIn}/> } />
                        <Route exact path="/settings" render={()=> <UserSettings updateLoggedIn={this.updateLoggedIn}/>} />
                        <Route exact path="/movie" render={(props)=> <MovieInfoPage {...props} updateLoggedIn={this.updateLoggedIn} />} />
                    </Switch>
                </main>
            </Router>
        </React.Fragment>);
    }
}

export default Routes;
