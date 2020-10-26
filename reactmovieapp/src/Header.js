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
        this.state = {
            reviewFormOpen: false,
            currentUser: this.props.currentUser,
            loggedIn: this.props.loggedIn,
            displaySignIn: this.props.showLoginPopUp,
            displaySignUp: false,
            redirect: false,
            causeRender: false
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
    }

    signUpRemoveFunction = () =>
    {
        this.setState({displaySignUp: false});
    }

    showSignUpForm()
    {
        this.setState({displaySignUp: true});
    }

    signInRemoveFunction = () =>
    {
        alert("Removing");
        this.setState({displaySignIn: false});
        this.props.removeLoginPopUp(false);
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
        this.setState({
            currentUser: nextProps.currentUser,
            loggedIn: nextProps.loggedIn,
            displaySignIn: nextProps.showLoginPopUp
        });
    }

    removeReviewForm = () =>
    {
        this.setState({reviewFormOpen: false});
    }

    generateReviewForm()
    {
        this.setState({reviewFormOpen: true});
    }

    logout()
    {
        document.cookie = "MovieAppCookie=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
        this.setState({currentUser: "", loggedIn: false, redirect: true});
    }

    shouldComponentUpdate(nextProps, nextState)
    {
        if(this.state.redirect === true && nextState.redirect === false)
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
            redirect = <Redirect to="/" />;
        }
        let reviewForm = "";
        if(this.state.reviewFormOpen)
        {
            reviewForm = <ReviewForm edit={false} removeFunction={this.removeReviewForm}/>;
        }
        let homePath = "/";
        if(this.state.currentUser !== "")
        {
            homePath = "/profile/" + this.state.currentUser + "/feed";
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
        							<Link to="/movie">Top Rated</Link>
        							<Link to="/upcoming">Upcoming</Link>
        							<Link to="/movie">In Theaters</Link>
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
        					         <SearchDropDown getSuggestions={this.getSearchSuggestions} multipleTypes={true} valueKeys={{Movies:"title", Users: "username"}} redirectPaths={{Movies: {path:"/movie/", key:"id"}, Users: {path:"/profile/",key:"username"}}}/>
                      </div>
                      <div className="searchIconBox">
                           <i class="fas fa-search searchIcon" />
                      </div>
        				</div>
                        {reviewForm}
        			</div>
    		);
        //  class={`fa fa-thumbs-up ${style.thumbsUp}`}
        }
        else
        {
            let signInForm = "";
            if(this.state.displaySignIn)
            {
                signInForm = <SignInPopup removeFunction={this.signInRemoveFunction} />
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
                            <Link class="profileButton" onClick={this.showSignInForm}>About</Link>
                        </div>
                        <div class="profile">
                            <Link class="profileButton" onClick={this.showSignInForm}>Login</Link>
                        </div>
                        <div class="profile">
                            <Link class="profileButton" onClick={this.showSignUpForm}>Sign Up</Link>
                        </div>
                    </div>
                    <div className="searchBar">
                        <form><input type="text" placeholder=" Search" name="search"></input></form>
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
