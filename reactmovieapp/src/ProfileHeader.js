import React from 'react';
// should get rid of this eventually
import {Link, Redirect, withRouter} from 'react-router-dom';
import UserListPopUp from './UserListPopUp.js';
import style5 from './css/userProfile.module.css';
import './css/forms.css'
import {apiGetJsonRequest, apiPostJsonRequest} from './StaticFunctions/ApiFunctions.js';


class ProfileHeader extends React.Component {
    constructor(props)
    {
        super(props)
        this.state ={
            // name of user whose profile this belongs to
            username: this.props.username,
            id: -1,
            // if this is the current user, set to true
            // if this is someone else, set to appropriate value
            following: false,
            followerCount: 0,
            followingCount: 0,
            displayFollowers: false,
            displayFollowed: false,
            postCount: this.props.postCount,
            loading: true,
            loggedInUser: this.props.currentUser,
            redirect: false
        };
        this.removePopUp = this.removePopUp.bind(this);
        this.updateFollowerCount = this.updateFollowerCount.bind(this);
        this.updateFollowingCount = this.updateFollowingCount.bind(this);
        this.changeFollowedCount = this.changeFollowedCount.bind(this);
        this.changeFollowingCount = this.changeFollowingCount.bind(this);
        //this.updatePostCount = this.updatePostCount.bind(this);
        this.followHandler = this.followHandler.bind(this);
        this.unfollowResultsHandler = this.unfollowResultsHandler.bind(this);
        this.followResultsHandler = this.followResultsHandler.bind(this);
    }

    // function to change the followed count to the passed in value if it is not equal
    // to the current state
    // called only when userlist popup generated as it gets a updated count of users
    changeFollowedCount(value)
    {
        if(value !== this.state.followerCount)
        {
            this.setState({followerCount: value});
        }
    }

    // function to change the following count to the passed in value if it is not equal
    // to the current state
    // called only when userlist popup generated as it gets a updated count of users
    changeFollowingCount(value)
    {
        if(value !== this.state.followingCount)
        {
            this.setState({followingCount: value});
        }
    }

    // function used to increment/decrement followed count when a user is on
    // their own page
    updateFollowerCount(value)
    {
        let count = this.state.followerCount + value;
        this.setState({followerCount: count});
    }

    // function used to increment/decrement following count when a user is on
    // their own page
    updateFollowingCount(value)
    {
        let count = this.state.followingCount + value;
        this.setState({followingCount: count});
    }

    static getDerivedStateFromProps(nextProps, prevState)
    {
        if(prevState.postCount !== nextProps.postCount)
        {
            return {postCount: nextProps.postCount};
        }
        else if(nextProps.updateFollowingCount !== 0)
        {
            let count = prevState.followingCount + nextProps.updateFollowingCount;
            return {followingCount: count};
        }
        else if(nextProps.updateFollowerCount !== 0)
        {
            let count = prevState.followerCount + nextProps.updateFollowerCount;
            return {followerCount: count};
        }
        else
        {
            return null;
        }
    }

    componentDidUpdate(prevProps, prevState)
    {
        // if the changing from one users profile page to another
        if(!prevState.loading && (this.props.username !== prevProps.username))
        {
            this.getData(this.props.username);
        }
        // when the logged in user changes, do this
        else if(!prevState.loading && (this.props.currentUser !== prevProps.currentUser))
        {
            this.getData(this.props.username);
        }
    }

    // function to handle getting data from api
    getData = async (username) => {
        //alert("Get data header");
        // note: this will get called twice if going from address bar as this the first props
        // will come in saying the logged in user is "" even if you are logged in
        // second time around have the correct username and send the request again
        // possible solution: have router send out a request when it first mounts?
        let url = "http://localhost:9000/profile/" + username + "/user_info";
        await apiGetJsonRequest(url).then(result =>{
            // set status to result[0]
            let status = result[0];
            let message = result[1].message;
            let loggedInUser = result[1].requester;
            // see if request succeeded
            if(status === 200)
            {
                console.log("profile header data received");
                this.setState({
                    username: username,
                    // get the users id from the response
                    id: result[1].userID,
                    following: result[1].following,
                    followerCount: result[1].followerCount,
                    followingCount: result[1].followingCount,
                    displayFollowers: false,
                    displayFollowed: false,
                    loading: false,
                    loggedInUser: loggedInUser
                });
                this.props.updateLoggedIn(loggedInUser);
                this.props.setMessage({
                    message: message,
                    messageType: "success"
                });
            }
            else
            {
                this.props.updateLoggedIn(loggedInUser);
                if(status === 404)
                {
                    this.setState({
                        loading: false,
                        loggedInUser: loggedInUser
                    });
                    this.props.showErrorPage(message);
                }
                else if(status === 400)
                {
                    // request not understood due to invalid username format
                    this.setState({
                        loading: false,
                        loggedInUser: loggedInUser
                    });
                    this.props.showErrorPage(message);
                }
                else
                {
                    this.setState({
                        loading: false,
                        loggedInUser: loggedInUser
                    });
                    this.props.showErrorPage(message);
                }
            }
        });
    }

    async componentDidMount()
    {
        this.getData(this.state.username);
    }

    // function to handle following or unfollowing a user
    followHandler(e,type)
    {
        e.preventDefault();
        if(!this.state.loggedInUser)
        {
            this.props.showLoginPopUp(false);
            return;
        }
        let parameters = {};
        let url;
        if(type === "follow")
        {
            url = "http://localhost:9000/profile/" + this.state.username + "/follow";
        }
        else if(type === "unfollow")
        {
            url = "http://localhost:9000/profile/" + this.state.username + "/unfollow";
        }
        else
        {
            return;
        }
        apiPostJsonRequest(url, parameters)
            .then(result =>{
                let status = result[0];
                let message = result[1].message;
                let loggedInUser = result[1].requester;
                this.props.updateLoggedIn(loggedInUser);
                if(type === "follow")
                {
                    this.followResultsHandler(status, message, loggedInUser);
                }
                else
                {
                    this.unfollowResultsHandler(status, message, loggedInUser);
                }
            });
    }

    followResultsHandler(status, message, loggedInUser)
    {
        this.props.updateLoggedIn(loggedInUser);
        if(status === 200)
        {
            // user successfully followed
            let value = this.state.followerCount + 1;
            this.setState({
                following: true,
                followerCount: value,
                loggedInUser: loggedInUser
            });
            this.props.setMessage({
                message: message,
                messageType: "success"
            });
        }
        else if(status === 401)
        {
            this.setState({
                loggedInUser: ""
            });
            this.props.showLoginPopUp(false);
        }
        else if(status === 404 && message === "Unable to find user to follow")
        {
            this.setState({
                loggedInUser: loggedInUser,
                redirect: true
            });
            // for now, just show error message
            // want to cause a full page rerender somehow..
            this.props.setMessage({
                message: message,
                messageType: "failure"
            });
        }
        else if(status === 400 && message === "User cannot follow themself")
        {
            this.setState({
                loggedInUser: loggedInUser
            });
            this.props.setMessage({
                message: message,
                messageType: "warning"
            });
        }
        else if(status === 400 && message === "You already follow the user")
        {
            this.setState({
                following: true,
                loggedInUser: loggedInUser
            });
            this.props.setMessage({
                message: message,
                messageType: "info"
            });
        }
        else
        {
            this.setState({
                loggedInUser: loggedInUser
            });
            this.props.setMessage({
                message: "Some unknown error occurred when trying to follow the user",
                messageType: "failure"
            });
        }
    }

    unfollowResultsHandler(status, message, loggedInUser)
    {
        this.props.updateLoggedIn(loggedInUser);
        // user successfully unfollowed
        if(status === 200)
        {
            let value = this.state.followerCount - 1;
            this.setState({
                following: false,
                followerCount: value,
                loggedInUser: loggedInUser
            });
            this.props.setMessage({
                message: message,
                messageType: "success"
            });
        }
        else if(status === 401)
        {
            this.setState({
                loggedInUser: loggedInUser
            });
            this.props.showLoginPopUp(false);
        }
        else if(status === 404 && message === "Unable to find user to unfollow")
        {
            this.setState({
                loggedInUser: loggedInUser,
                redirect: true
            });
            this.props.setMessage({
                message: message,
                messageType: "failure"
            });
        }
        else if(status === 400 && message === "User cannot unfollow themself")
        {
            this.setState({
                loggedInUser: loggedInUser
            });
            this.props.setMessage({
                message: message,
                messageType: "warning"
            });
        }
        else if(status === 400 && message === "You already do not follow the user")
        {
            this.setState({
                following: false,
                loggedInUser: loggedInUser
            });
            this.props.setMessage({
                message: message,
                messageType: "info"
            });
        }
        else
        {
            this.setState({
                loggedInUser: loggedInUser
            });
            this.props.setMessage({
                message: "Some unknown error occurred when trying to unfollow the user",
                messageType: "failure"
            });
        }
    }

    // update state to set boolean to display followers or following
    generatePopUp(event, type) {
        event.preventDefault();
        if(!this.state.loggedInUser)
        {
            this.props.showLoginPopUp(false);
            return;
        }
        if(type === "followers")
        {
            this.setState({displayFollowers: true});
        }
        else if(type === "following")
        {
            this.setState({displayFollowed: true});
        }
    }

    removePopUp(type)
    {
        if(type === "Followers")
        {
            this.setState({displayFollowers: false});
        }
        else
        {
            this.setState({displayFollowed: false});
        }
    }

    generateFollowerDisplay()
    {
        let display = (
            <div className={style5.followersContainer}>
                <div className={style5.numberDisplay}>
                    <button className={style5.followersButton} onClick={(e)=> this.generatePopUp(e, "followers")}><h3 className={style5.socialHeader}>Followers</h3>
                    {this.state.followerCount}
                    </button>
                </div>
                <div className={style5.numberDisplay}>
                    <button className={style5.followersButton} onClick={(e)=> this.generatePopUp(e, "following")}><h3 className={style5.socialHeader}>Following</h3>
                    {this.state.followingCount}
                    </button>
                </div>
                <div className={style5.numberDisplay}>
                    <button className={style5.followersButton}><h3 className={style5.socialHeader}>Posts</h3>
                    {this.state.postCount}
                    </button>
                </div>
            </div>
        );
        return display;
    }

    render()
    {
        if(this.state.loading)
        {
            return null;
        }
        else if(this.state.redirect)
        {
            return <Redirect to={"/"} />;
        }

        // used to generate users followers/following lists
        let popup = "";
        if(this.state.displayFollowers)
        {
            popup = <UserListPopUp
                        username={this.state.username}
                        type="Followers"
                        removeFunction={this.removePopUp}
                        updateFunction={this.updateFollowingCount}
                        changeFunction={this.changeFollowedCount}
                        loggedInUser={this.state.loggedInUser}
                        updateLoggedIn={this.props.updateLoggedIn}
                        showLoginPopUp={this.props.showLoginPopUp}
                        setMessage={this.props.setMessage}
                        showErrorPage={this.props.showErrorPage}
                    />;
        }
        if(this.state.displayFollowed)
        {
            popup = <UserListPopUp
                        username={this.state.username}
                        type="Following"
                        removeFunction={this.removePopUp}
                        updateFunction={this.updateFollowingCount}
                        changeFunction={this.changeFollowingCount}
                        loggedInUser={this.state.loggedInUser}
                        updateLoggedIn={this.props.updateLoggedIn}
                        showLoginPopUp={this.props.showLoginPopUp}
                        setMessage={this.props.setMessage}
                        showErrorPage={this.props.showErrorPage}
                    />;
        }
        let followerDisplay = this.generateFollowerDisplay();
        let followButton = "";
        // if this header is for the logged in users page
        if(this.state.username === this.state.loggedInUser)
        {
            followButton = "";
        }
        else
        {
            if(this.state.following)
            {
                followButton = <button className={`${style5.followButton} ${style5.followColor}`} onClick={(e)=> this.followHandler(e, "unfollow")}>Follow</button>;
            }
            else
            {
                followButton = <button className={`${style5.followButton} ${style5.notFollowingColor}`} onClick={(e)=> this.followHandler(e, "follow")}>Follow</button>;
            }
        }

        return (
            <div className={style5.profileHeader}>
                <img className={style5.profilePic} src={require("./images/profile-pic.jpg")}/>
                <h3>{this.state.username}</h3>
                {followButton}
                {followerDisplay}
                {popup}
            </div>
        );
    }
}

// used withRouter to get the parameter from the query string in the url
export default ProfileHeader;
