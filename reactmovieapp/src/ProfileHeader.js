import React from 'react';
// should get rid of this eventually
import { withRouter } from "react-router-dom";
import UserListPopUp from './UserListPopUp.js';
import style5 from './css/userProfile.module.css';
import './css/forms.css'
import {apiGetJsonRequest, apiPostTextRequest} from './StaticFunctions/ApiFunctions.js';


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
            loggedInUser: ""
        }
        this.removePopUp = this.removePopUp.bind(this);
        this.updateFollowerCount = this.updateFollowerCount.bind(this);
        this.updateFollowingCount = this.updateFollowingCount.bind(this);
        this.changeFollowedCount = this.changeFollowedCount.bind(this);
        this.changeFollowingCount = this.changeFollowingCount.bind(this);
        this.updatePostCount = this.updatePostCount.bind(this);
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


    // this gets called when the component is changing from user to another
    // such as when clicking on a users link when the userProfile page is already
    // up
    componentWillReceiveProps(nextProps) {
       if(this.props.username !== nextProps.username) {
           this.getData(nextProps.username);
           return;
       }
       // if the post count is updated, rerender the header
       if(this.props.postCount !== nextProps.postCount)
       {
           this.updatePostCount(nextProps.postCount);
       }
       if(nextProps.updateFollowingCount === 1 || nextProps.updateFollowingCount === -1)
       {
           this.updateFollowingCount(nextProps.updateFollowingCount);
       }
       if(nextProps.updateFollowerCount === 1 || nextProps.updateFollowerCount === -1)
       {
           this.updateFollowerCount(nextProps.updateFollowerCount);
       }

    }

    // function to update the post count when the props are updated
    updatePostCount(count)
    {
        this.setState({postCount: count});
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
                    following: result[1][2],
                    followerCount: result[1][3],
                    followingCount: result[1][4],
                    displayFollowers: false,
                    displayFollowed: false,
                    loading: false,
                    loggedInUser: result[1][5]
                });
                if(result[1][1] !== "")
                {
                    this.props.updateLoggedIn(result[1][5], true);
                }
                else
                {
                    this.props.updateLoggedIn(result[1][5], false);
                }
            }
            else
            {
                alert("request for user profile failed");
            }
        });
    }

    async componentDidMount()
    {
        this.getData(this.state.username);
    }


// next deal with unfollowing users, make sure everything working as expected

    followHandler()
    {
        if(!this.state.loggedInUser)
        {
            this.props.showLoginPopUp(true);
            return;
        }
        // if here, no reason to try to follow a user you already follow
        if(this.state.following)
        {
            return;
        }
        // will have to update the state to indicate you are now following the user
        // call api
        const requestOptions = {
            method: 'POST',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json'},
            body: JSON.stringify({
                id: this.state.id
            })
        };

        let status = 0;
        let url = "http://localhost:9000/profile/" + this.state.username + "/follow";
        fetch(url, requestOptions)
            .then(res => {
                status = res.status;
                return res.text();
            }).then(result =>{
                if(status === 200 && result === "User successfully followed")
                {
                    let value = this.state.followerCount + 1;
                    this.setState({
                        following: true,
                        followerCount: value
                    });
                }
                else if(status === 401 && result === "Unable to verify requester")
                {
                    alert("You must login to follow this user");
                }
                else if(status === 404 && result === "Unable to find user to follow")
                {
                    alert("The user to follow could not be found");
                }
                else if(status === 404 && result === "User cannot follow themself")
                {
                    alert(result);
                }
                else if(status === 406 && result === "You already follow the user")
                {
                    alert(result);
                }
                else
                {
                    alert(result);
                    alert("Some unknown error occurred when trying to follow the user");
                    this.setState({following: false});
                }
                //return [status, result];
                // update button to indicate now following user
                // may want to send updated friends list to user eventually
                // if fails, do a alert
            });
    }

    unfollowHandler()
    {
        if(!this.state.loggedInUser)
        {
            this.props.showLoginPopUp(true);
            return;
        }
        // if here, no use trying to unfollow a user you do not already follow
        if(!this.state.following)
        {
            return;
        }
        // will have to update the state to indicate you are now following the user
        // call api
        let parameters = {id: this.state.id};
        let url = "http://localhost:9000/profile/" + this.state.username + "/unfollow";
        apiPostTextRequest(url, parameters).then(result =>{
                let status = result[0];
                let message = result[1];
                if(status === 200 && message === "User successfully unfollowed")
                {
                    let value = this.state.followerCount - 1;
                    this.setState({
                        following: false,
                        followerCount: value
                    });
                }
                else if(status === 401 && message === "Unable to verify requester")
                {
                    alert("You must login to follow this user");
                }
                else if(status === 404 && message === "Unable to find user to unfollow")
                {
                    alert("The user to unfollow could not be found");
                }
                else if(status === 404 && message === "User cannot unfollow themself")
                {
                    alert(message);
                }
                else if(status === 404 && message === "The id passed in the request does not match the user")
                {
                    alert(message);
                }
                else if(status === 406 && message === "You already do not follow the user or the user does not exist")
                {
                    alert(message);
                }
                else
                {
                    alert(message);
                    alert("Some unknown error occurred when trying to unfollow the user");
                    this.setState({following: false});
                }
            });
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

        // used to generate users followers/following lists
        let popup = "";
        if(this.state.displayFollowers)
        {
            popup = <UserListPopUp username={this.state.username} type="Followers" removeFunction={this.removePopUp} updateFunction={this.updateFollowerCount} currentUser={this.state.currentUser} changeFunction={this.changeFollowedCount}/>;
        }
        if(this.state.displayFollowed)
        {
            popup = <UserListPopUp username={this.state.username} type="Following" removeFunction={this.removePopUp} updateFunction={this.updateFollowingCount} currentUser={this.state.currentUser} changeFunction={this.changeFollowingCount}/>;
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
                followButton = <button className={`${style5.followButton} ${style5.followColor}`} onClick={(e)=> this.unfollowHandler(e)}>Follow</button>;
            }
            else
            {
                followButton = <button className={`${style5.followButton} ${style5.notFollowingColor}`} onClick={(e)=> this.followHandler(e)}>Follow</button>;
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
