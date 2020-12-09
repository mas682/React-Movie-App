import React from 'react';
import {BrowserRouter as Router, Route, Redirect, Switch, history} from 'react-router-dom';
import Movie from './MovieReview.js';
import MovieInfo from './MovieInfo.js';
import Landing from './LandingPage.js';
import MainPage from'./MainPage.js';
import UserProfile from './userProfile.js';
import UserFeed from './userFeed.js';
import UserSettings from'./UserSettings.js';
import MovieInfoPage from'./MovieInfoPage.js';
import Header from './Header.js';
import MovieFilterPage from './MovieFilterPages.js';
import {apiGetJsonRequest} from './StaticFunctions/ApiFunctions.js';

class Routes extends React.Component
{
    constructor(props) {
        super(props);
        this.state = ({
            currentUser: "",
            loggedIn: null,
            displayLogin: false,
            redirect: true
        });
        this.updateLoggedIn = this.updateLoggedIn.bind(this);
        this.showLoginPopUp = this.showLoginPopUp.bind(this);
        this.removeLoginPopUp = this.removeLoginPopUp.bind(this);
    }

    shouldComponentUpdate(nextProps, nextState)
    {
        // if the displayLogin was reset to false, do not cause a rerender
        if(this.state.displayLogin === true && nextState.displayLogin === false)
        {
            // if login display closed but user logged in
            if(this.state.currentUser !== nextState.currentUser)
            {
                return true;
            }
            return false;
        }
        return true;
    }

    showLoginPopUp(redirect)
    {
        // if the login pop up is not already visible
        if(!this.state.displayLogin)
        {
            if(redirect === undefined)
            {
                redirect = true;
            }
            // if displaying login, user must not be logged in
            this.setState({
                // need to change this to true..
                displayLogin: true,
                redirect: redirect,
                currentUser: "",
                loggedIn: false
            });
        }
    }

    removeLoginPopUp(username)
    {
        if(this.state.displayLogin)
        {
            if(username === undefined)
            {
                username = "";
            }
            let loggedIn = false;
            if(username !== "")
            {
                loggedIn = true;
            }
            this.setState({
                displayLogin: false,
                currentUser: username,
                loggedIn: loggedIn
            });
        }
    }

    updateLoggedIn(username)
    {
        let loggedIn = false;
        if(username !== "")
        {
            loggedIn = true;
        }
        // do not cause rerender if state not changing
        //alert("Update loggedin: " + this.state.currentUser + " " + username + " loggedin: " + this.state.loggedIn + " " + loggedIn);
        if(this.state.currentUser === username && this.state.loggedIn === loggedIn)
        {
            return;
        }
        else
        {
            this.setState({
                currentUser: username,
                loggedIn: loggedIn
            });
        }
    }

    async componentDidMount()
    {
        // on mount, see who is logged in as the app doesn't know at this point
        let result = await apiGetJsonRequest("http://localhost:9000/login/authenticate");
        let requester = result[1].requester;
        this.updateLoggedIn(requester);
    }

    render()
    {
        //<Route exact path="/movie" render={(props)=> <MovieInfoPage {...props} updateLoggedIn={this.updateLoggedIn} />} />

        console.log("username in router " + this.state.currentUser);
        //alert("Router: " + this.state.currentUser);
        return (<React.Fragment>
            <Router>
                <Header currentUser={this.state.currentUser} loggedIn={this.state.loggedIn} updateLoggedIn={this.updateLoggedIn} redirectOnLogin={this.state.redirect} showLoginPopUp={this.state.displayLogin} removeLoginPopUp={this.removeLoginPopUp}/>
                <main>
                    <Switch>
                        <Route exact path="/" render={(props)=> <Landing {...props} updateLoggedIn={this.updateLoggedIn} showLoginPopUp={this.showLoginPopUp}/>}/>
                        <Route exact path="/watch_list" render={(props)=> <MovieFilterPage {...props} type="My Watch List" updateLoggedIn={this.updateLoggedIn} showLoginPopUp={this.showLoginPopUp} currentUser={this.state.currentUser}/>}/>
                        <Route exact path="/watched_list" render={(props)=> <MovieFilterPage {...props} type="My Watched Movies" updateLoggedIn={this.updateLoggedIn} showLoginPopUp={this.showLoginPopUp} currentUser={this.state.currentUser}/>}/>
                        <Route exact path="/upcoming" render={(props)=> <MovieFilterPage {...props} type="Upcoming Movies" updateLoggedIn={this.updateLoggedIn} showLoginPopUp={this.showLoginPopUp} currentUser={this.state.currentUser}/>}/>
                        <Route exact path="/new_releases" render={(props)=> <MovieFilterPage {...props} type="New Releases" updateLoggedIn={this.updateLoggedIn} showLoginPopUp={this.showLoginPopUp} currentUser={this.state.currentUser}/>}/>
                        <Route exact path="/profile/:id" render={()=> <UserProfile updateLoggedIn={this.updateLoggedIn} showLoginPopUp={this.showLoginPopUp} removeLoginPopUp={this.removeLoginPopUp} currentUser={this.state.currentUser}/> } />
                        <Route exact path="/profile/:id/feed" render={()=> <UserFeed updateLoggedIn={this.updateLoggedIn} showLoginPopUp={this.showLoginPopUp}/> } />
                        <Route exact path="/settings" render={()=> <UserSettings updateLoggedIn={this.updateLoggedIn}/>} />
                        <Route exact path="/movie/:id" render={(props)=> <MovieInfoPage {...props} updateLoggedIn={this.updateLoggedIn} showLoginPopUp={this.showLoginPopUp} currentUser={this.state.currentUser}/>} />
                    </Switch>
                </main>
            </Router>
        </React.Fragment>);
    }
}

export default Routes;
