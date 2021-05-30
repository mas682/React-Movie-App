import React from 'react';
import {BrowserRouter as Router, Route, Redirect, Switch} from 'react-router-dom';
import Landing from './LandingPage.js';
import MainPage from'./MainPage.js';
import UserProfile from './userProfile.js';
import UserFeed from './userFeed.js';
import UserSettings from'./UserSettings.js';
import MovieInfoPage from'./MovieInfoPage.js';
import Header from './Header.js';
import MovieFilterPage from './MovieFilterPages.js';
import SearchPage from './SearchPages.js';
import {apiGetJsonRequest} from './StaticFunctions/ApiFunctions.js';
import Alert from './Alert.js';
import {generateMessageState} from './StaticFunctions/StateGeneratorFunctions.js';
import {getErrorDisplay} from './StaticFunctions/ErrorHtmlFunctions.js';

class Routes extends React.Component
{
    constructor(props) {
        super(props);
        this.state = ({
            currentUser: "",
            loggedIn: null,
            displayLogin: false,
            messages: [],
            messageId: -1,
            clearMessages: false,
            newReview: false,
            loading: true
        });
        this.updateLoggedIn = this.updateLoggedIn.bind(this);
        this.showLoginPopUp = this.showLoginPopUp.bind(this);
        this.removeLoginPopUp = this.removeLoginPopUp.bind(this);
        this.setMessages = this.setMessages.bind(this);
        this.setNewReviewFlag = this.setNewReviewFlag.bind(this);
    }

    shouldComponentUpdate(nextProps, nextState)
    {
        return true;
    }

    showLoginPopUp()
    {
        // if the login pop up is not already visible
        if(!this.state.displayLogin)
        {
            // if displaying login, user must not be logged in
            this.setState({
                displayLogin: true,
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
            // make the cookie invalid if the user was signed out
            if(username === "")
            {
                //document.cookie = "MovieAppCookie=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
            }
            this.setState({
                currentUser: username,
                loggedIn: loggedIn
            });
        }
    }

    setMessages(messageState)
    {
        let state = {...messageState};
        if(state.messages !== undefined)
        {
            let messageCount = this.state.messageId + state.messages.length;
            state.messageId = messageCount;
        }
        else if(state.clearMessages !== undefined)
        {
            // if messages was undefined and clearMessages set to true, reset id to clear all messages
            if(state.clearMessages)
            {
                state.messageId = -1;
            }
        }
        else
        {
            return;
        }
        if(state.clearMessages === undefined)
        {
            state.clearMessages = false;
        }
        // will have to do some error handling around swithcing pages..
        // need to deal with clearMessages....
        // preferably in the generateMessageState function
        this.setState(state);
    }

    setNewReviewFlag()
    {
        this.setState({
            newReview: !this.state.newReview
        });
    }

    async componentDidMount()
    {
        // on mount, see who is logged in as the app doesn't know at this point
        let result = await apiGetJsonRequest("http://localhost:9000/login/authenticate");
        let requester = result[1].requester;
        this.updateLoggedIn(requester);
        this.setState({
            loading: false
        });
    }

    render()
    {
        //<Route exact path="/movie" render={(props)=> <MovieInfoPage {...props} updateLoggedIn={this.updateLoggedIn} />} />
        if(this.state.loading)
        {
            return null;
        }
        console.log("username in router " + this.state.currentUser);
        //alert("Router: " + this.state.currentUser);
        return (<React.Fragment>
            <Router>
                <Header
                    currentUser={this.state.currentUser}
                    loggedIn={this.state.loggedIn}
                    updateLoggedIn={this.updateLoggedIn}
                    showLoginPopUp={this.state.displayLogin}
                    showLoginPopUpFunction={this.showLoginPopUp}
                    removeLoginPopUp={this.removeLoginPopUp}
                    setMessages={this.setMessages}
                    setNewReviewFlag={this.setNewReviewFlag}
                />
                <main id = "main">
                    <Alert
                        messages={this.state.messages}
                        messageId={this.state.messageId}
                        clearMessages={this.state.clearMessages}
                        timeout={0}
                    />
                    <Switch>
                        <Route exact path="/" render={(props)=> <Landing {...props} updateLoggedIn={this.updateLoggedIn} showLoginPopUp={this.showLoginPopUp} currentUser={this.state.currentUser} setMessages={this.setMessages}/>}/>
                        <Route exact path="/watch_list" render={(props)=> <MovieFilterPage {...props} type="My Watch List" updateLoggedIn={this.updateLoggedIn} showLoginPopUp={this.showLoginPopUp} currentUser={this.state.currentUser} setMessages={this.setMessages}/>}/>
                        <Route exact path="/watched_list" render={(props)=> <MovieFilterPage {...props} type="My Watched Movies" updateLoggedIn={this.updateLoggedIn} showLoginPopUp={this.showLoginPopUp} currentUser={this.state.currentUser} setMessages={this.setMessages}/>}/>
                        <Route exact path="/upcoming" render={(props)=> <MovieFilterPage {...props} type="Upcoming Movies" updateLoggedIn={this.updateLoggedIn} showLoginPopUp={this.showLoginPopUp} currentUser={this.state.currentUser} setMessages={this.setMessages}/>}/>
                        <Route exact path="/new_releases" render={(props)=> <MovieFilterPage {...props} type="New Releases" updateLoggedIn={this.updateLoggedIn} showLoginPopUp={this.showLoginPopUp} currentUser={this.state.currentUser} setMessages={this.setMessages}/>}/>
                        <Route exact path="/profile/:id" render={(props)=> <UserProfile {...props} updateLoggedIn={this.updateLoggedIn} showLoginPopUp={this.showLoginPopUp} removeLoginPopUp={this.removeLoginPopUp} currentUser={this.state.currentUser} setMessages={this.setMessages} newReview={this.state.newReview}/> } />
                        <Route exact path="/feed" render={()=> <UserFeed updateLoggedIn={this.updateLoggedIn} showLoginPopUp={this.showLoginPopUp} currentUser={this.state.currentUser} setMessages={this.setMessages}/> } />
                        <Route exact path="/settings" render={()=> <UserSettings updateLoggedIn={this.updateLoggedIn} setMessages={this.setMessages} currentUser={this.state.currentUser} showLoginPopUp={this.showLoginPopUp}/>} />
                        <Route exact path="/movie/:id" render={(props)=> <MovieInfoPage {...props} updateLoggedIn={this.updateLoggedIn} showLoginPopUp={this.showLoginPopUp} currentUser={this.state.currentUser} setMessages={this.setMessages}/>} />
                        <Route exact path="/search" render={(props)=> <SearchPage {...props} updateLoggedIn={this.updateLoggedIn} showLoginPopUp={this.showLoginPopUp} currentUser={this.state.currentUser} setMessages={this.setMessages}/>} />
                        <Route render={()=>getErrorDisplay("The requested page does not exist")} />
                    </Switch>
                </main>
            </Router>
        </React.Fragment>);
    }
}

export default Routes;
