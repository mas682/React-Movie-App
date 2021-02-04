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
            showSearchDropDown: false,
            redirectToSearch: false,
            searchParameters: {}
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
        this.showMovieOptionsEventHandler = this.showMovieOptionsEventHandler.bind(this);
        this.searchClickHandler = this.searchClickHandler.bind(this);
        this.generateMovieOptions = this.generateMovieOptions.bind(this);
        this.generateProfileButton = this.generateProfileButton.bind(this);
        this.showProfileOptionsEventHandler = this.showProfileOptionsEventHandler.bind(this);
        this.removeMovieDropDown = this.removeMovieDropDown.bind(this);
        this.removeShoWDropDown = this.removeShoWDropDown.bind(this);
        this.removeProfileDropDown = this.removeProfileDropDown.bind(this);
        this.showShowOptionsEventHandler = this.showShowOptionsEventHandler.bind(this);
        this.generateSettingsButton = this.generateSettingsButton.bind(this);
        this.generateLogoutButton = this.generateLogoutButton.bind(this);
        this.generatePostReviewButton = this.generatePostReviewButton.bind(this);
        this.generateSearchClickURL = this.generateSearchClickURL.bind(this);
        this.searchEnterHandler = this.searchEnterHandler.bind(this);
        this.searchCloseHandler = this.searchCloseHandler.bind(this);
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
        let movieDropDownHeight = (this.state.loggedIn) ? "250px" : "200px";
        let movieDropDownContainer = document.getElementById("movieOptions");
        let movieIcon = document.getElementById("movieIcon");
        if(movieDropDownContainer.style.height === movieDropDownHeight)
        {
            movieDropDownContainer.style.height = "0px";
            movieIcon.style.transform = "";
        }
        else
        {
            // if the show options drop down is visible, remove
            this.removeShoWDropDown();
            // if the profile options drop down is visible, remove
            this.removeProfileDropDown();
            movieDropDownContainer.style.height = movieDropDownHeight;
            movieIcon.style.transform = "rotate(180deg)";
        }
    }

    showShowOptionsEventHandler()
    {
        let showDropDownContainer = document.getElementById("showOptions");
        let showIcon = document.getElementById("showIcon");
        if(showDropDownContainer.style.height === "100px")
        {
            showDropDownContainer.style.height = "0px";
            showIcon.style.transform = "";
        }
        else
        {
            // if the movie options drop down is visible, remove
            this.removeMovieDropDown();
            // if the profile options drop down is visible, remove
            this.removeProfileDropDown();
            showDropDownContainer.style.height = "100px";
            showIcon.style.transform = "rotate(180deg)";
        }
    }

    showProfileOptionsEventHandler()
    {
        let profileDropDownContainer = document.getElementById("profileOptions");
        let profileIcon = document.getElementById("profileIcon");
        if(profileDropDownContainer.style.height === "100px")
        {
            profileDropDownContainer.style.height = "0px";
            profileIcon.style.transform = "";
        }
        else
        {
            // if the movie options drop down is visible, remove
            this.removeMovieDropDown();
            // if the show options drop down is visible, remove
            this.removeShoWDropDown();
            profileDropDownContainer.style.height = "100px";
            profileIcon.style.transform = "rotate(180deg)";
        }
    }

    removeMovieDropDown()
    {
        // if the movie options drop down is visible, remove
        let movieDropDownContainer = document.getElementById("movieOptions");
        let movieDropDownHeight = (this.state.loggedIn) ? "250px" : "200px";
        if(movieDropDownContainer.style.height === movieDropDownHeight)
        {
            let movieIcon = document.getElementById("movieIcon");
            movieDropDownContainer.style.height = "0px";
            movieIcon.style.transform = "";
        }
    }

    removeShoWDropDown()
    {
        // if the show options drop down is visible, remove
        let showDropDownContainer = document.getElementById("showOptions");
        if(showDropDownContainer.style.height === "100px")
        {
            let showIcon = document.getElementById("showIcon");
            showDropDownContainer.style.height = "0px";
            showIcon.style.transform = "";
        }
    }

    removeProfileDropDown()
    {
        if(!this.state.loggedIn)
        {
            return;
        }
        // if the show options drop down is visible, remove
        let profileDropDownContainer = document.getElementById("profileOptions");
        if(profileDropDownContainer.style.height === "100px")
        {
            let profileIcon = document.getElementById("profileIcon");
            profileDropDownContainer.style.height = "0px";
            profileIcon.style.transform = "";
        }
    }


    menuClickHandler()
    {
        if(!this.state.showDropdown)
        {
            this.setState({
                showDropdown: true,
                showSearchDropDown: false
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


    // function called by SearchDropDown when enter pressed on the value
    // in the input box
    searchEnterHandler(value)
    {
        this.setState({
            redirectToSearch: true,
            searchParameters: this.generateSearchClickURL(value),
            showSearchDropDown: false
        });
        let element = document.querySelector("main");
        element.style.removeProperty("position");
    }

    searchClickHandler()
    {
        if(!this.state.showSearchDropDown)
        {
            this.setState({
                showSearchDropDown: true,
                showDropdown: false
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

    // function to close search drop down if showing full menu
    searchCloseHandler()
    {
        if(this.state.showSearchDropDown)
        {
            this.setState({
                showSearchDropDown: false
            });
            let element = document.querySelector("main");
            element.style.removeProperty("position");
        }
    }

    // function to generate the parameters to use in the link when the search
    // icon is clicked when the SearchDropDown is visible
    generateSearchClickURL(value)
    {
        // state is used if already on search page
        return {pathname: "/search", search: "?type=all&value=" + value, state: {newValue: true}};
    }

    componentDidMount()
    {

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
        this.setState({
            reviewFormOpen: true,
            showSearchDropDown: false,
            showDropdown: false
        });
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
        else if(this.state.redirectToSearch)
        {
            this.setState({
                redirectToSearch: false,
                searchParameters: {}
            });
        }
    }

    // function to get suggestions for search bar
    // for now, just getting users
    // will eventually get users and movies..
    getSearchSuggestions(value)
    {
        if(value.length < 1)
        {
            return {};
        }

          // Simple POST request with a JSON body using fetch
          const requestOptions = {
              method: 'GET',
              headers: { 'Content-Type': 'application/json' },
              credentials: 'include',
          };

          let status = 0;
          let url = "http://localhost:9000/search/query_all?value=" + value + "&max=10";
          return fetch(url, requestOptions)
              .then(async(res) => {
                  status = res.status;
                  if(status === 200)
                  {
                      let result = await res.json();
                      return {
                          Movies: result.Movies,
                          Users: result.Users
                      };
                      //return res.json();
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


    generateMovieOptions()
    {
        if(this.state.loggedIn)
        {
            return (
                <div className="optionsContainer" id="movieOptions">
                    <Link to="/watch_list" className = "innerDropDownItem" onClick={this.menuClickHandler}>
                        <div>
                            My Watch List
                        </div>
                    </Link>
                    <Link to="/watched_list" className = "innerDropDownItem" onClick={this.menuClickHandler}>
                        <div>
                            My Watched Movies
                        </div>
                    </Link>
                    <Link to="/movie" className = "innerDropDownItem" onClick={this.menuClickHandler}>
                        <div>
                            Top Rated
                        </div>
                    </Link>
                    <Link to="/upcoming" className = "innerDropDownItem" onClick={this.menuClickHandler}>
                        <div>
                            Upcoming
                        </div>
                    </Link>
                    <Link to="/new_releases" className = "innerDropDownItem" onClick={this.menuClickHandler}>
                        <div>
                            New Releases
                        </div>
                    </Link>
                </div>
            )
        }
        return (
            <div className="optionsContainer" id="movieOptions">
                <Link to="/movie" className = "innerDropDownItem" onClick={this.menuClickHandler}>
                    <div>
                        Top Rated
                    </div>
                </Link>
                <Link to="/upcoming" className = "innerDropDownItem" onClick={this.menuClickHandler}>
                    <div>
                        Upcoming
                    </div>
                </Link>
                <Link to="/movie" className = "innerDropDownItem" onClick={this.menuClickHandler}>
                    <div>
                        In Theaters
                    </div>
                </Link>
                <Link to="/new_releases" className = "innerDropDownItem" onClick={this.menuClickHandler}>
                    <div>
                        New Releases
                    </div>
                </Link>
            </div>
        )
    }

    generateProfileButton()
    {
        if(this.state.loggedIn)
        {
            let profilePath = "/profile/" + this.state.currentUser;
            return (
                <React.Fragment>
                    <div className = "dropDownItem" onClick={this.showProfileOptionsEventHandler}>
                        <div className = "pageName">
                            Profile
                        </div>
                        <div className = "iconContainer" id="profileIcon">
                            <button><i class="fa fa-angle-down" aria-hidden="true"></i></button>
                        </div>
                    </div>
                    <div className="optionsContainer" id="profileOptions">
                        <Link to="/feed" className = "innerDropDownItem" onClick={this.menuClickHandler}>
                            <div>
                                My Feed
                            </div>
                        </Link>
                        <Link to={profilePath} className = "innerDropDownItem" onClick={this.menuClickHandler}>
                            <div>
                                My Profile
                            </div>
                        </Link>
                    </div>
                </React.Fragment>
            );
        }

        return (
            <Link className = "dropDownItem"  to={"/about"} onClick={this.menuClickHandler}>
                <div className = "pageName">
                    About
                </div>
            </Link>
        );
    }

    generatePostReviewButton()
    {
        if(this.state.loggedIn)
        {
            return (
                <div className = "dropDownItem" onClick={() => {this.generateReviewForm(); this.menuClickHandler();}}>
                    <div className = "pageName">
                        Post Review
                    </div>
                </div>
            );
        }
        return (
            <div className = "dropDownItem" onClick={() => {this.props.showLoginPopUpFunction(); this.menuClickHandler();}}>
                <div className = "pageName">
                    Post Review
                </div>
            </div>
        )
    }

    generateSettingsButton()
    {
        if(this.state.loggedIn)
        {
            return (
                <Link className = "dropDownItem"  to={"/settings"} onClick={this.menuClickHandler}>
                    <div className = "pageName">
                        Settings
                    </div>
                </Link>
            );
        }
        return (
            <div className = "dropDownItem" onClick={() => {this.props.showLoginPopUpFunction(); this.menuClickHandler();}}>
                <div className = "pageName">
                    Login
                </div>
            </div>
        );
    }

    generateLogoutButton()
    {
        if(this.state.loggedIn)
        {
            return (
                <div className = "dropDownItem" onClick={this.logout}>
                    <div className = "pageName">
                        Logout
                    </div>
                </div>
            )
        }
        return (
            <div className = "dropDownItem" onClick={()=> {this.showSignUpForm(); this.menuClickHandler();}}>
                <div className = "pageName">
                    Sign Up
                </div>
            </div>
        );
    }

	render() {
        // if the state loggedIn state has not been set in the router yet,
        // do not render the header
        if(this.state.loggedIn === null) return null;

        let redirect = "";
        if(this.state.redirectToProfile)
        {
            let path = "/profile/" + this.state.currentUser;
            if(this.state.currentUser !== "")
            {
                redirect = <Redirect to={{pathname: path, state: {newReview: true}}}/>;
            }
        }
        let redirectToSearch = "";
        if(this.state.redirectToSearch)
        {
            redirectToSearch = <Redirect to={this.state.searchParameters}/>;
        }
        let homePath = (this.state.currentUser !== "") ? "/feed" : "/";

        let menuIcon = (
            <div className="menuIconContainer" onClick={this.menuClickHandler}>
                <div className="topBar menuIcon"></div>
                <div className="middleBar menuIcon"></div>
                <div className="bottomBar menuIcon"></div>
            </div>
        );
        let searchIcon = (<i class="fas fa-search searchIcon" onClick={this.searchClickHandler}/>);
        let addPostIcon = (<i class="fas fa-plus addPostIcon" onClick={this.generateReviewForm}/>);

        let dropDownContent = "";
        // show search bar
        if(this.state.showSearchDropDown)
        {
            searchIcon = (<i class="fas fa-times searchCloseIcon" onClick={this.searchClickHandler}/>);
            dropDownContent = (
                <div className="dropDownContent">
                    <div className="searchBar">
                        <SearchDropDown
                            allowNoSuggestion={true}
                            getSuggestions={this.getSearchSuggestions}
                            showSearchIcon={true}
                            generateSearchClickURL={this.generateSearchClickURL}
                            setValueOnKeyHover={true}
                            multipleTypes={true}
                            valueKeys={{Movies:"title", Users: "username"}}
                            redirectPaths={{Movies: {path:"/movie/", key:"id"}, Users: {path:"/profile/",key:"username"}}}
                            searchDropDownContainterStyle={{"display":"flex", "flex-flow":"column"}}
                            inputBoxStyle={{"border-radius":"0px"}}
                            dropDownContentStyle={{"border-radius": "0px", "background-color":"#333", "height":"93%", "position":"static"}}
                            keyStyle={{"font-size":"1.25em", "color":"red", "border-bottom":"1px solid gray"}}
                            suggestionStyle={{"color":"white", "font-size": "1em"}}
                            redirectHandler={this.searchClickHandler}
                            searchEnterHandler={this.searchEnterHandler}
                            form={"SearchBar"}
                        />
                    </div>
                </div>
            );
        }
        // show menu drop down
        if(this.state.showDropdown)
        {
            menuIcon = (
                <div className="menuIconContainer" onClick={this.menuClickHandler}>
                    <i class="fas fa-times menuCloseIcon"/>
                </div>
            );
            let movieOptions = this.generateMovieOptions();
            // if not logged in, returns about button
            let profileAboutButton = this.generateProfileButton();
            // either returns a settings button or login button
            let settingsLoginButton = this.generateSettingsButton();
            // either returns a logout button or sign up button
            let logoutSignUpButton = this.generateLogoutButton();
            // either shows the review post form or sign up form
            let postReviewButton = this.generatePostReviewButton();
            dropDownContent = (
                <div className="dropDownContent menuDropDownContent">
                    <Link className = "dropDownItem" to={homePath} onClick={this.menuClickHandler}>
                        <div className = "pageName">
                            Home
                        </div>
                    </Link>
                    <div className = "dropDownItem" onClick={this.showMovieOptionsEventHandler}>
                        <div className = "pageName">
                            Movies
                        </div>
                        <div className = "iconContainer" id="movieIcon">
                            <button><i class="fa fa-angle-down" aria-hidden="true"></i></button>
                        </div>
                    </div>
                    {movieOptions}
                    <div className = "dropDownItem" onClick={this.showShowOptionsEventHandler}>
                        <div className = "pageName">
                            Shows
                        </div>
                        <div className = "iconContainer" id="showIcon">
                            <button><i class="fa fa-angle-down" aria-hidden="true"></i></button>
                        </div>
                    </div>
                    <div className="optionsContainer" id="showOptions">
                        <Link to="/shows" className = "innerDropDownItem" onClick={this.menuClickHandler}>
                            <div>
                                Top Rated
                            </div>
                        </Link>
                        <Link to="/shows" className = "innerDropDownItem" onClick={this.menuClickHandler}>
                            <div>
                                Schedule
                            </div>
                        </Link>
                    </div>
                    {postReviewButton}
                    {profileAboutButton}
                    {settingsLoginButton}
                    {logoutSignUpButton}
                </div>
            );
        }

        if(this.state.loggedIn)
        {
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
                addPostIcon = (<i class="fas fa-plus addPostCloseIcon" onClick={this.generateReviewForm}/>);
            }
            let profilePath = "/profile/" + this.state.currentUser;
        		return (
        			<div className="App-Header">
        				<div className="logo">
        					<h1 href="#">Logo</h1>
        				</div>
        				<div className="navButtons">
                            <Link className="actionButton" to={homePath} onClick={this.searchCloseHandler}>
                                <div>Home</div>
                            </Link>
                            <div class="menuDropDownContainer">
                                <div className="menuText">
                                    Movies
                                </div>
                                <div class="menuDropContent">
                                    <Link to="/watch_list" onClick={this.searchCloseHandler}>My Watch List</Link>
                                    <Link to="/watched_list" onClick={this.searchCloseHandler}>My Watched Movies</Link>
                                    <Link to="/movie" onClick={this.searchCloseHandler}>Top Rated</Link>
                                    <Link to="/upcoming" onClick={this.searchCloseHandler}>Upcoming</Link>
                                    <Link to="/new_releases" onClick={this.searchCloseHandler}>New Releases</Link>
                                </div>
                            </div>
                            <div class="menuDropDownContainer">
                                <div className="menuText">
                                    Shows
                                </div>
                                <div class="menuDropContent">
                                    <Link to="/" onClick={this.searchCloseHandler}>Top Rated</Link>
                                    <Link to="/" onClick={this.searchCloseHandler}>Schedule</Link>
                                </div>
                            </div>
        					<button class="addButton" onClick={()=>{this.searchCloseHandler(); this.generateReviewForm();}}>+</button>
                            <div class="menuDropDownContainer">
                                <div className="menuText">
                                    Profile
                                </div>
                                <div class="menuDropContent">
                                    <Link to="/feed" onClick={this.searchCloseHandler}>My Feed</Link>
                                    <Link to={profilePath} onClick={this.searchCloseHandler}>My Profile</Link>
                                </div>
                            </div>
                            <Link className="actionButton" to={"/settings"} onClick={this.searchCloseHandler}>
                                <div>Settings</div>
                            </Link>
                            <button class="actionButton"  onClick={()=>{this.searchCloseHandler(); this.logout();}}>
                                <div>Logout</div>
                            </button>
        				</div>
                        {reviewForm}
                        {redirect}
                        {redirectToSearch}
                        {addPostIcon}
                        {searchIcon}
                        {menuIcon}
                        {dropDownContent}
        			</div>
    		);
        }
        // if not logged in
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
            return (
                <div className="App-Header">
                    <div className="logo">
                        <h1 href="#">Logo</h1>
                    </div>
                    <div className="navButtons">
                        <Link className="actionButton" to={homePath} onClick={this.searchCloseHandler}>
                            <div>Home</div>
                        </Link>
                        <div class="menuDropDownContainer">
                            <div className="menuText">
                                Movies
                            </div>
                            <div class="menuDropContent">
                                <Link to="/movie" onClick={this.searchCloseHandler}>Top Rated</Link>
                                <Link to="/upcoming" onClick={this.searchCloseHandler}>Upcoming</Link>
                                <Link to="/movie" onClick={this.searchCloseHandler}>In Theaters</Link>
                                <Link to="/new_releases" onClick={this.searchCloseHandler}>New Releases</Link>
                            </div>
                        </div>
                        <div class="menuDropDownContainer">
                            <div className="menuText">
                                Shows
                            </div>
                            <div class="menuDropContent">
                                <Link to="/" onClick={this.searchCloseHandler}>Top Rated</Link>
                                <Link to="/" onClick={this.searchCloseHandler}>Schedule</Link>
                            </div>
                        </div>
                        <button class="addButton" onClick={() => {this.searchCloseHandler(); this.generateReviewForm()}}>+</button>
                        <button class="actionButton"  onClick={()=>{this.searchCloseHandler(); this.props.showLoginPopUpFunction()}}>
                            <div>About</div>
                        </button>
                        <button class="actionButton"  onClick={()=>{this.searchCloseHandler(); this.props.showLoginPopUpFunction();}}>
                            <div>Login</div>
                        </button>
                        <button class="actionButton"  onClick={()=>{this.searchCloseHandler(); this.showSignUpForm()}}>
                            <div>Sign Up</div>
                        </button>
                    </div>
                    {addPostIcon}
                    {searchIcon}
                    {menuIcon}
                    {dropDownContent}
                    {signInForm}
                    {signUpForm}
                    {redirect}
                    {redirectToSearch}
                </div>
            );
        }
	}
}

export default withRouter(Header);
