import React from 'react';
import './css/forms.css';
import { Link, Redirect } from 'react-router-dom';
import style from './css/UserListPopUp.module.css';
import {apiPostJsonRequest} from './StaticFunctions/ApiFunctions.js';

class FollowerDisplay extends React.Component {
    constructor(props) {
        super(props);
        this.state ={
            user: this.props.user,
            following: this.props.following,
            // holds the name of the logged in user
            loggedInUser: this.props.loggedInUser,
            // users whose page the likes are on if on a likes page
            username: this.props.username,
            redirectToHome: false,
            type: this.props.type
        };
        this.generateFollowButton = this.generateFollowButton.bind(this);
        this.followHandler = this.followHandler.bind(this);
        this.followResultsHandler = this.followResultsHandler.bind(this);
        this.unfollowResultsHandler = this.unfollowResultsHandler.bind(this);

    }

    // function to handle following or unfollowing a user
    followHandler(e,type)
    {
        e.preventDefault();
        if(!this.state.loggedInUser)
        {
            this.props.showLoginPopUp(false);
            this.props.closeModal();
            return;
        }
        let parameters = {};
        let url;
        if(type === "follow")
        {
            url = "http://localhost:9000/profile/" + this.state.user.username + "/follow";
        }
        else if(type === "unfollow")
        {
            url = "http://localhost:9000/profile/" + this.state.user.username + "/unfollow";
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
        if(status === 200)
        {
            // user successfully followed
            this.setState({
                following: true,
                loggedInUser: loggedInUser
            });

            // if this is the current user, update their following count
            if(loggedInUser === this.state.username)
            {
                this.props.updateFollowingFunction(1);
            }
            // if the clicked on username to follow is the user whose page we are on
            // update their follower count
            else if(this.state.user.username === this.state.username)
            {
                this.props.updateFollowersFunction(1);
            }
            this.props.showMessage({messages: [{message: message, type: "success"}]});
        }
        else if(status === 401)
        {
            this.props.showLoginPopUp(false);
            this.props.closeModal();
        }
        else if(status === 404 && message === "Unable to find user to follow")
        {
            // set the user to null as they were not found
            this.setState({
                loggedInUser: loggedInUser,
                user: null
            });
            this.props.showMessage({messages: [{message: message, type: "failure"}]});

        }
        else if(status === 400 && message === "User cannot follow themself")
        {
            this.setState({
                loggedInUser: loggedInUser
            });
            this.props.showMessage({messages: [{message: message, type: "warning"}]});

        }
        else if(status === 400 && message === "You already follow the user")
        {
            this.setState({
                following: true,
                loggedInUser: loggedInUser
            });
            this.props.showMessage({messages: [{message: message, type: "info"}]});

        }
        else if(status === 400 && message === "Username to follow is invalid")
        {
            this.setState({
                loggedInUser: loggedInUser
            });
            this.props.showMessage({messages: [{message: message, type: "failure"}]});
        }
        else
        {
            this.setState({
                loggedInUser: loggedInUser
            });
            this.props.showMessage({messages: [{message: message, type: "failure"}]});

        }
    }

    unfollowResultsHandler(status, message, loggedInUser)
    {
        // user successfully unfollowed
        if(status === 200)
        {
            this.setState({
                following: false,
                loggedInUser: loggedInUser
            });
            if(loggedInUser === this.state.username)
            {
                this.props.updateFollowingFunction(-1);
            }
            // if the clicked on username to follow is the user whose page we are on
            // update their follower count
            // should only occur from likes post as users who are on their own page cannot follow
            // themself
            else if(this.state.user.username === this.state.username)
            {
                console.log(this.props);
                this.props.updateFollowersFunction(-1);
            }
            this.props.showMessage({messages: [{message: message, type: "success"}]});

        }
        else if(status === 401)
        {
            this.props.showLoginPopUp(false);
            this.props.closeModal();
        }
        else if(status === 404 && message === "Unable to find user to unfollow")
        {
            // set the user to null as they were not found
            this.setState({
                loggedInUser: loggedInUser,
                user: null
            });
            this.props.showMessage({messages: [{message: message, type: "failure"}]});
            // just setting user to null so no long displayed
        }
        else if(status === 400 && message === "User cannot unfollow themself")
        {
            this.setState({
                loggedInUser: loggedInUser
            });
            this.props.showMessage({messages: [{message: message, type: "warning"}]});

        }
        else if(status === 400 && message === "You already do not follow the user")
        {
            this.setState({
                following: false,
                loggedInUser: loggedInUser
            });
            this.props.showMessage({messages: [{message: message, type: "info"}]});

        }
        else if(status === 400 && message === "Username to unfollow is invalid")
        {
            this.setState({
                loggedInUser: loggedInUser
            });
            this.props.showMessage({messages: [{message: message, type: "failure"}]});

        }
        else
        {
            this.setState({
                loggedInUser: loggedInUser
            });
            this.props.showMessage({messages: [{message: message, type: "failure"}]});
        }
    }

    generateFollowButton()
    {
        if(this.state.loggedInUser === this.state.user.username)
        {
            return "";
        }
        else if(this.state.following)
        {
            return (<button className={`${style.followButton} ${style.followColor}`} onClick={(e)=> this.followHandler(e, "unfollow")}>Following</button>);
        }
        else
        {
            return (<button className={`${style.followButton} ${style.notFollowingColor}`} onClick={(e)=> this.followHandler(e, "follow")}>Follow</button>);
        }
    }

    render() {
        if(this.state.redirectToHome)
        {
            return <Redirect to={"/"} />;
        }
        if(this.state.user === null)
        {
            return null;
        }

        let followButton = this.generateFollowButton();
        let path = "/profile/" + this.state.user.username;

        return (
            <div className={style.userNameContainer}>
                <div className={style.userImageBox}>
                    <Link to={path}><img className={style.profilePic} src={require("./images/profile-pic.jpg")}/></Link>
                </div>
                <div className={style.usernameBox}>
                    <Link to={path} className={style.userLink}>{this.state.user.username}</Link>
                </div>
                <div className ={style.followBox}>
                    {followButton}
                </div>
            </div>
        );
    }

}

export default FollowerDisplay;
