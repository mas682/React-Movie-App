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
            // used to cause a redirect to a users profile page when they post a
            // new review
            redirectToProfile: false,
            showDropdown: false,
            showSearchDropDown: false
        };
        this.generateReviewForm = this.generateReviewForm.bind(this);
        this.removeReviewForm = this.removeReviewForm.bind(this);
        this.signInRemoveFunction = this.signInRemoveFunction.bind(this);
        this.showSignUpForm = this.showSignUpForm.bind(this);
        this.signUpRemoveFunction = this.signUpRemoveFunction.bind(this);
        this.logout = this.logout.bind(this);
        this.getSearchSuggestions = this.getSearchSuggestions.bind(this);
        this.reviewSuccessFunction = this.reviewSuccessFunction.bind(this);

        this.menuClickHandler = this.menuClickHandler.bind(this);
        this.windowResizeEventHandler = this.windowResizeEventHandler.bind(this);
        this.showMovieOptionsEventHandler = this.showMovieOptionsEventHandler.bind(this);
        this.searchClickHandler = this.searchClickHandler.bind(this);
    }

    signUpRemoveFunction = (username) =>
    {
        this.setState({displaySignUp: false});
    }

    showSignUpForm()
    {
        this.setState({displaySignUp: true});
    }

    showMovieOptionsEventHandler()
    {
        let element = document.getElementById("movieOptions");
        let icon = document.getElementById("movieIcon");
        if(element.style.height === "200px")
        {
            element.style.height = "0px";
            icon.style.transform = "";
        }
        else
        {
            element.style.height = "200px";
            icon.style.transform = "rotate(180deg)";
        }
    }

    menuClickHandler()
    {
        if(!this.state.showDropdown)
        {
            this.setState({
                showDropdown: true
            });
            let elm = document.querySelector("main");
            elm.style.position = "fixed";
        }
        else
        {
            this.setState({
                showDropdown: false
            });
            let element = document.querySelector("main");
            element.style.removeProperty("position");
        }
    }

    searchClickHandler()
    {
        if(!this.state.showSearchDropDown)
        {
            this.setState({
                showSearchDropDown: true
            });
            let elm = document.querySelector("main");
            elm.style.position = "fixed";
        }
        else
        {
            this.setState({
                showSearchDropDown: false
            });
            let element = document.querySelector("main");
            element.style.removeProperty("position");
        }
    }

    windowResizeEventHandler(event)
    {
        //console.log(event);
        if(event.target.innerWidth < 600)
        {

        }
        if(event.target.innerWidth >= 600)
        {
            if(this.state.showDropdown)
            {
                this.setState({showDropdown: false});
            }
            let element = document.querySelector("main");
            if(element.style.position === "fixed")
            {
                element.style.removeProperty("position");
            }
        }
    }

    componentDidMount()
    {
        window.addEventListener('resize', this.windowResizeEventHandler);
    }

    signInRemoveFunction = (username) =>
    {
        let user = "";
        if(username !== undefined)
        {
            user = username;
            if(username !== "")
            {
                this.props.setMessages({
                    messages: [{type: "success", message: "You successfully logged in!"}],
                    clearMessages: true
                });
            }
        }
        this.props.removeLoginPopUp(user);
        this.setState({displaySignIn: false});
    }

    // update the state if new props came in with a different profile
    // or a different user logged in
    static getDerivedStateFromProps(nextProps, prevState)
    {
        if(nextProps.currentUser !== prevState.currentUser || nextProps.loggedIn !== prevState.loggedIn || nextProps.showLoginPopUp)
        {
            return Header.updateNewState(nextProps, prevState);
        }
        else
        {
            return null;
        }
    }
    static updateNewState(nextProps, prevState)
    {
        let reviewFormOpen = (nextProps.showLoginPopUp) ? false :prevState.showLoginPopUp;
        return {
            currentUser: nextProps.currentUser,
            loggedIn: nextProps.loggedIn,
            displaySignIn: nextProps.showLoginPopUp,
            reviewFormOpen: reviewFormOpen
        };
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
            this.props.showLoginPopUpFunction();
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
        if(this.state.redirectToProfile === true && nextState.redirectToProfile === false)
        {
            return false;
        }
        // could optimize this more..
        return true ;
    }

    componentDidUpdate()
    {
        if(this.state.redirectToProfile)
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
        if(this.state.redirectToProfile)
        {
            let path = "/profile/" + this.state.currentUser;
            if(this.state.currentUser !== "")
            {
                redirect = <Redirect to={{pathname: path, state: {newReview: true}}}/>;
            }
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
        					<div class="profileDropdown">
                                <button class="profileButton">Profile</button>
                                <div class="profileDropdownContent">
                                    <Link class="profileButton" to="/feed">My Feed</Link>
                                    <Link class="profileButton" to={profilePath}>My Profile</Link>
                                </div>
        					</div>
                            <div class="home">
                                <Link to="/settings" class="homeButton">Settings</Link>
                            </div>
                            <div class="home">
                                <Link to="#" class="homeButton" onClick={this.logout}>Logout</Link>
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
                signInForm = <SignInPopup
                                showSignUpForm={this.showSignUpForm}
                                removeFunction={this.signInRemoveFunction}
                            />
            }
            let signUpForm = "";
            if(this.state.displaySignUp)
            {
                signUpForm = <SignUpPopup
                                removeFunction={this.signUpRemoveFunction}
                                updateLoggedIn={this.props.updateLoggedIn}
                                setMessages={this.props.setMessages}
                                showLoginPopUp={this.props.showLoginPopUpFunction}
                            />
            }
            let menuIcon = (
                <div className="menuIconContainer" onClick={this.menuClickHandler}>
                    <div className="topBar menuIcon"></div>
                    <div className="middleBar menuIcon"></div>
                    <div className="bottomBar menuIcon"></div>
                </div>
            );

            let dropDownContent = "";
            if(this.state.showSearchDropDown)
            {
                dropDownContent = (
                    <div className="dropDownContent">
                    <div className="searchBar">
                        <div className="searchInputBox">
                            <SearchDropDown
                                allowNoSuggestion={true}
                                getSuggestions={this.getSearchSuggestions}
                                multipleTypes={true} valueKeys={{Movies:"title", Users: "username"}}
                                redirectPaths={{Movies: {path:"/movie/", key:"id"}, Users: {path:"/profile/",key:"username"}}}
                                inputBoxStyle={{"margin-top":"0px", "border-radius":"0px", "width":"100%"}}
                                dropDownContentStyle={{"width":"100%", "border-radius": "0px", "background":"#333"}}
                                suggestionStyle={{"color":"white", "font-size": "1.25em"}}
                                keyStyle={{"font-size":"1.25em", "color":"red"}}
                            />
                        </div>
                    </div>
                    </div>
                );
            }
            if(this.state.showDropdown)
            {
                menuIcon = (
                    <div className="menuIconContainer" onClick={this.menuClickHandler}>
                        <i class="fas fa-times menuCloseIcon"/>
                    </div>
                );
                dropDownContent = (
                    <div className="dropDownContent">
                        <div className = "dropDownContainer">
                            <div className = "dropDownItem" onClick={this.menuClickHandler}>
                                <div className = "pageName">
                                    <Link class="pageLink" to={homePath}>Home</Link>
                                </div>
                                <div className = "iconContainer">
                                </div>
                            </div>
                            <div className = "dropDownItem">
                                <div className = "pageName">
                                    Movies
                                </div>
                                <div className = "iconContainer" id="movieIcon">
                                    <button onClick={this.showMovieOptionsEventHandler}><i class="fa fa-angle-down" aria-hidden="true"></i></button>
                                </div>
                            </div>
                            <div className="optionsContainer" id="movieOptions">
                                <div className = "innerDropDownItem" onClick={this.menuClickHandler}>
                                    <Link className= "pageLink" to="/movie">
                                        <div className="pageName">
                                            Top Rated
                                        </div>
                                    </Link>
                                </div>
                                <div className = "innerDropDownItem" onClick={this.menuClickHandler}>
                                    <Link className= "pageLink" to="/upcoming">
                                        <div className="pageName">
                                            Upcoming
                                        </div>
                                    </Link>
                                </div>
                                <div className = "innerDropDownItem" onClick={this.menuClickHandler}>
                                    <Link className= "pageLink" to="/movie">
                                        <div className="pageName">
                                            In Theaters
                                        </div>
                                    </Link>
                                </div>
                                <div className = "innerDropDownItem" onClick={this.menuClickHandler}>
                                    <Link className= "pageLink" to="/new_releases">
                                        <div className="pageName">
                                            New Releases
                                        </div>
                                    </Link>
                                </div>
                            </div>
                            <div className = "dropDownItem">
                                <div className = "pageName">
                                    Shows
                                </div>
                                <div className = "iconContainer">
                                    <button><i class="fa fa-angle-down" aria-hidden="true"></i></button>
                                </div>
                            </div>
                            <div className = "dropDownItem">
                                <div className = "pageName">
                                    About
                                </div>
                                <div className = "iconContainer">
                                </div>
                            </div>
                            <div className = "dropDownItem" onClick={() => {this.props.showLoginPopUpFunction(); this.menuClickHandler();}}>
                                <div className = "pageName">
                                    Login
                                </div>
                            </div>
                            <div className = "dropDownItem" onClick={()=> {this.showSignUpForm(); this.menuClickHandler();}}>
                                <div className = "pageName">
                                    Sign Up
                                </div>
                            </div>
                        </div>
                    </div>
                );
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
                        <div class="home">
                            <Link class="homeButton" onClick={() => {this.props.showLoginPopUpFunction()}}>About</Link>
                        </div>
                        <div class="home">
                            <Link class="homeButton" onClick={() => {this.props.showLoginPopUpFunction()}}>Login</Link>
                        </div>
                        <div class="home">
                            <Link class="homeButton" onClick={this.showSignUpForm}>Sign Up</Link>
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
                    </div>
                    <i class="fas fa-search searchIcon" onClick={this.searchClickHandler}/>
                    {menuIcon}
                    {dropDownContent}
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
