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
            // this will be set by the api call
            currentUser: false,
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
        if(this.props.username !== prevState.username)
        {
            this.getData(this.props.username);
        }
        // when the logged in user changes, do this
        else if(this.props.currentUser !== prevState.loggedInUser)
        {
            this.getData(this.props.username);
        }
    }

    // function to handle getting data from api
    getData = (username) => {
        let url = "http://localhost:9000/profile/" + username + "/user_info";
        apiGetJsonRequest(url).then(result =>{
            // set status to result[0]
            let status = result[0];
            // see if request succeeded
            if(status === 200)
            {
                this.setState({
                    username: username,
                    // get the users id from the response
                    id: result[1][0],
                    currentUser: result[1][1],
                    //following: result[1][2],
                    following: true,
                    followerCount: result[1][3],
                    followingCount: result[1][4],
                    displayFollowers: false,
                    displayFollowed: false,
                    loading: false,
                    loggedInUser: result[1][5]
                });
                this.props.updateLoggedIn(result[1][5]);
            }
            else
            {
                alert(result[1][0]);
                this.props.redirectToHome();
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
            this.props.showLoginPopUp(true);
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
                let message = result[1][0];
                let loggedInUser = result[1][1];
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
        if(status === 200)
        {
            // user successfully followed
            let value = this.state.followerCount + 1;
            this.setState({
                following: true,
                followerCount: value,
                loggedInUser: loggedInUser
            });
        }
        else if(status === 401)
        {
            alert(message);
            this.setState({
                loggedInUser: ""
            });
            // will probably need to reload whole page in this case to determine if
            // reroute or not..
            this.props.showLoginPopUp(true, false);
        }
        else if(status === 404 && message === "Unable to find user to follow")
        {
            alert(message);
            this.setState({
                loggedInUser: loggedInUser,
                redirect: true
            });
            // cause a page reload and then force to home/404 page
            // redirect to home or 404 page
        }
        else if(status === 400 && message === "User cannot follow themself")
        {
            alert(message);
            this.setState({
                currentUser: true,
                loggedInUser: loggedInUser
            });
        }
        else if(status === 400 && message === "You already follow the user")
        {
            alert(message);
            this.setState({
                following: true,
                loggedInUser: loggedInUser
            });
        }
        else
        {
            alert("Some unknown error occurred when trying to follow the user");
        }
    }

    unfollowResultsHandler(status, message, loggedInUser)
    {
        // user successfully unfollowed
        if(status === 200)
        {
            let value = this.state.followerCount - 1;
            this.setState({
                following: false,
                followerCount: value,
                loggedInUser: loggedInUser
            });
        }
        else if(status === 401)
        {
            alert("You must login to follow this user");
            this.setState({
                loggedInUser: loggedInUser
            });
            // will probably need to reload whole page in this case to determine if
            // reroute or not..
            this.props.showLoginPopUp(true, false);
        }
        else if(status === 404 && message === "Unable to find user to unfollow")
        {
            alert(message);
            this.setState({
                loggedInUser: loggedInUser,
                redirect: true
            });
        }
        else if(status === 400 && message === "User cannot unfollow themself")
        {
            alert(message);
            this.setState({
                currentUser: true,
                loggedInUser: loggedInUser
            });
        }
        else if(status === 400 && message === "You already do not follow the user")
        {
            alert(message);
            this.setState({
                following: false,
                loggedInUser
            });
        }
        else
        {
            alert("Some unknown error occurred when trying to unfollow the user");
        }
    }

    // update state to set boolean to display followers or following
    generatePopUp(event, type) {
        event.preventDefault();
        if(!this.state.loggedInUser)
        {
            this.props.showLoginPopUp(true);
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
                        currentUser={this.state.currentUser}
                        changeFunction={this.changeFollowedCount}
                    />;
        }
        if(this.state.displayFollowed)
        {
            popup = <UserListPopUp
                        username={this.state.username}
                        type="Following" removeFunction={this.removePopUp}
                        updateFunction={this.updateFollowingCount}
                        currentUser={this.state.currentUser}
                        changeFunction={this.changeFollowingCount}
                    />;
        }
        let followerDisplay = this.generateFollowerDisplay();
        let followButton = "";
        if(this.state.currentUser)
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
