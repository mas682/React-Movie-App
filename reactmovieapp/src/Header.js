import React from 'react';
import ReviewForm from './ReviewForm.js';
import { Link, Redirect, withRouter } from 'react-router-dom';
import history from './History'
import logo from './logo.svg';
import background from './images/background3.jpg';
import './App.css';
import './css/header.css';
import SignInPopup from './SignIn.js';
import SignUpPopup from './SignUp.js';
import SearchDropDown from './SearchDropDown.js';

class Header extends React.Component {
    constructor(props){
        super(props);
        console.log(props);
        this.state = {
            reviewFormOpen: false,
            currentUser: this.props.currentUser,
            loggedIn: this.props.loggedIn,
            displaySignIn: this.props.showLoginPopUp,
            displaySignUp: false,
            redirect: false,
            redirectOnLogin: this.props.redirectOnLogin,
            // used to cause a redirect to a users profile page when they post a
            // new review
            redirectToProfile: false
        };
        this.generateReviewForm = this.generateReviewForm.bind(this);
        this.removeReviewForm = this.removeReviewForm.bind(this);
        this.updateNewState = this.updateNewState.bind(this);
        this.signInRemoveFunction = this.signInRemoveFunction.bind(this);
        this.showSignInForm = this.showSignInForm.bind(this);
        this.showSignUpForm = this.showSignUpForm.bind(this);
        this.signUpRemoveFunction = this.signUpRemoveFunction.bind(this);
        this.logout = this.logout.bind(this);
        this.getSearchSuggestions = this.getSearchSuggestions.bind(this);
        this.reviewSuccessFunction = this.reviewSuccessFunction.bind(this);
    }

    signUpRemoveFunction = () =>
    {
        this.setState({displaySignUp: false});
    }

    showSignUpForm()
    {
        this.setState({displaySignUp: true});
    }

    signInRemoveFunction = (username) =>
    {
        let user = "";
        if(username !== undefined)
        {
            user = username;
        }
        this.props.removeLoginPopUp(user);
        this.setState({displaySignIn: false});
    }

    showSignInForm()
    {
        this.setState({displaySignIn: true});
    }

    componentWillReceiveProps(nextProps) {
        if(this.state.currentUser !== nextProps.currentUser || this.state.loggedIn !== nextProps.loggedIn || nextProps.showLoginPopUp) {
            this.updateNewState(nextProps);
        }
    }

    updateNewState(nextProps)
    {
        let reviewFormOpen = (nextProps.showLoginPopUp) ? false : this.state.showLoginPopUp;
        let redirect = false;
        console.log(this.state);
        console.log(nextProps);
        /*
        left off here...
        need to get this working so that it redirects on login
        issue may be in users feed page?
        actually issue is on landing page, does not receive props...
        */
        if(nextProps.redirectOnLogin && (this.state.currentUser !== nextProps.currentUser))
        {
            redirect = true;
        }
        this.setState({
            currentUser: nextProps.currentUser,
            loggedIn: nextProps.loggedIn,
            displaySignIn: nextProps.showLoginPopUp,
            redirectOnLogin: nextProps.redirectOnLogin,
            reviewFormOpen: reviewFormOpen
        });
    }

    // function called when review successfully posted
    reviewSuccessFunction()
    {
        let path = "/profile/" + this.state.currentUser;
        // if already on the users profile page
        if(path === this.props.location.pathname)
        {
            // flip the swith to cause a rerender
            this.props.setNewReviewFlag();
            this.setState({
                reviewFormOpen: false,
            });
        }
        else
        {
            this.setState({
                redirectToProfile: true,
                reviewFormOpen: false
            });
        }
    }

    removeReviewForm = () =>
    {
        this.setState({reviewFormOpen: false});
    }

    generateReviewForm()
    {
        if(this.state.currentUser === "")
        {
            this.props.showLoginPopUpFunction(true);
            return;
        }
        this.setState({reviewFormOpen: true});
    }

    logout()
    {
        document.cookie = "MovieAppCookie=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
        this.setState({currentUser: "", loggedIn: false});
        this.props.updateLoggedIn("");
        // clear the messages being displayed..
        this.props.setMessages({
            message: undefined,
            clearMessages: true
        });
    }

    shouldComponentUpdate(nextProps, nextState)
    {
        if(this.state.redirect === true && nextState.redirect === false)
        {
            return false;
        }
        else if(this.state.redirectToProfile === true && nextState.redirectToProfile === false)
        {
            return false;
        }
        // could optimize this more..
        return true ;
    }

    componentDidUpdate()
    {
        if(this.state.redirect)
        {
            this.setState({redirect: false});
        }
        else if(this.state.redirectToProfile)
        {
            this.setState({redirectToProfile: false});
        }
    }

    // function to get suggestions for search bar
    // for now, just getting users
    // will eventually get users and movies..
    getSearchSuggestions(value)
    {
      // Simple POST request with a JSON body using fetch
      const requestOptions = {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
      };

      let status = 0;
      let url = "http://localhost:9000/search/query_all/?value=" + value;
      return fetch(url, requestOptions)
          .then(res => {
              status = res.status;
              if(status === 200)
              {
                  return res.json();
              }
              else
              {
                  return res.text();
              }
          }).then(result=> {
              if(status !== 200)
              {
                return {};
              }
              else
              {
                  return result;
              }
          });
    }

	render() {
        // if the state loggedIn state has not been set in the router yet,
        // do not render the header
        if(this.state.loggedIn === null)
        {
            return null;
        }
        let redirect = "";
        if(this.state.redirect)
        {
            alert("redirecting");
            redirect = <Redirect to="/" />;
        }
        if(this.state.redirectToProfile)
        {
            let path = "/profile/" + this.state.currentUser;
            if(this.state.currentUser !== "")
            {
                redirect = <Redirect to={{pathname: path, state: {newReview: true}}}/>;
            }
        }
        if(this.state.redirectOnLogin)
        {

        }
        let reviewForm = "";
        if(this.state.reviewFormOpen)
        {
            reviewForm = <ReviewForm
                            edit={false}
                            removeFunction={this.removeReviewForm}
                            successFunction={this.reviewSuccessFunction}
                            showLoginPopUp={this.props.showLoginPopUpFunction}
                            updateLoggedIn={this.props.updateLoggedIn}
                            setMessages={this.props.setMessages}
                        />;
        }
        let homePath = "/";
        if(this.state.currentUser !== "")
        {
            homePath = "/feed";
        }
        if(this.state.loggedIn)
        {
            let profilePath = "/profile/" + this.state.currentUser;
        		return (
        			<div className="App-Header">
        				<div className="logo">
        					<h1 href="#">Logo</h1>
        				</div>
        				<div className="navButtons">
        					<div class="home"><Link class="homeButton" to={homePath}>Home</Link></div>
        					<div class="movieDropdown">
        						<button class="movieButton">Movies</button>
        						<div class="movieDropdownContent">
                                    <Link to="/watch_list">My Watch List</Link>
                                    <Link to="/watched_list">My Watched Movies</Link>
        							<Link to="/movie">Top Rated</Link>
        							<Link to="/upcoming">Upcoming</Link>
                                    <Link to="/new_releases">New Releases</Link>
        						</div>
        					</div>
                            <div class="showDropdown">
                                <button class="showButton">Shows</button>
                                <div class="showDropdownContent">
                                    <Link to="/">Top Rated</Link>
                                    <Link to="/">Schedule</Link>
                                </div>
                            </div>
        					<div class="add"><button class="addButton" onClick={this.generateReviewForm}>+</button></div>
        					<div class="profile">
        						<Link class="profileButton" to={profilePath}>Profile</Link>
        					</div>
                            <div class="profile">
                                <Link to="/settings" class="profileButton">Settings</Link>
                            </div>
                            <div class="profile">
                                <Link to="#" class="profileButton" onClick={this.logout}>Logout</Link>
                            </div>
        				</div>
        				<div className="searchBar">
                            <div className="searchInputBox">
        					    <SearchDropDown
                                    allowNoSuggestion={true}
                                    getSuggestions={this.getSearchSuggestions}
                                    multipleTypes={true} valueKeys={{Movies:"title", Users: "username"}}
                                    redirectPaths={{Movies: {path:"/movie/", key:"id"}, Users: {path:"/profile/",key:"username"}}}
                                />
                            </div>
                            <div className="searchIconBox">
                                <i class="fas fa-search searchIcon" />
                            </div>
        				</div>
                        {reviewForm}
                        {redirect}
        			</div>
    		);
        }
        else
        {
            let signInForm = "";
            if(this.state.displaySignIn)
            {
                let redirect = false;
                if(this.state.redirectOnLogin)
                {
                    redirect = true;
                }
                signInForm = <SignInPopup removeFunction={this.signInRemoveFunction} redirectOnLogin={redirect}/>
            }
            let signUpForm = "";
            if(this.state.displaySignUp)
            {
                signUpForm = <SignUpPopup removeFunction={this.signUpRemoveFunction}/>
            }
            return (
                <div className="App-Header">
                    <div className="logo">
                        <h1 href="#">Logo</h1>
                    </div>
                    <div className="navButtons">
                        <div class="home"><Link class="homeButton" to={homePath}>Home</Link></div>
                        <div class="movieDropdown">
                            <button class="movieButton">Movies</button>
                            <div class="movieDropdownContent">
                                <Link to="/movie">Top Rated</Link>
                                <Link to="/upcoming">Upcoming</Link>
                                <Link to="/movie">In Theaters</Link>
                                <Link to="/new_releases">New Releases</Link>
                            </div>
                        </div>
                        <div class="showDropdown">
                            <button class="showButton">Shows</button>
                            <div class="showDropdownContent">
                                <Link to="/">Top Rated</Link>
                                <Link to="/">Schedule</Link>
                            </div>
                        </div>
                        <div class="add"><button class="addButton" onClick={this.generateReviewForm}>+</button></div>
                        <div class="profile">
                            <Link class="profileButton" onClick={() => {this.props.showLoginPopUpFunction(false)}}>About</Link>
                        </div>
                        <div class="profile">
                            <Link class="profileButton" onClick={() => {this.props.showLoginPopUpFunction(true)}}>Login</Link>
                        </div>
                        <div class="profile">
                            <Link class="profileButton" onClick={this.showSignUpForm}>Sign Up</Link>
                        </div>
                    </div>
                    <div className="searchBar">
                        <div className="searchInputBox">
                            <SearchDropDown
                                allowNoSuggestion={true}
                                getSuggestions={this.getSearchSuggestions}
                                multipleTypes={true} valueKeys={{Movies:"title", Users: "username"}}
                                redirectPaths={{Movies: {path:"/movie/", key:"id"}, Users: {path:"/profile/",key:"username"}}}
                            />
                        </div>
                        <div className="searchIconBox">
                            <i class="fas fa-search searchIcon" />
                        </div>
                    </div>
                    {signInForm}
                    {reviewForm}
                    {signUpForm}
                    {redirect}
                </div>
            );
        }
	}
}

export default withRouter(Header);
