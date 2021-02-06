import React, { Component } from 'react';
import {Link, Redirect, withRouter} from 'react-router-dom';
import style from './css/Users/UserDisplay.module.css'
import {apiPostJsonRequest} from './StaticFunctions/ApiFunctions.js';

class UserDisplay extends React.Component {
    constructor(props){
        super(props);
        let state = UserDisplay.generateDisplayState(this.props);
        this.state = state;

        this.pictureClickedHandler = this.pictureClickedHandler.bind(this);
        this.updateState = this.updateState.bind(this);
        this.followHandler = this.followHandler.bind(this);
        this.followResultsHandler = this.followResultsHandler.bind(this);
        this.unfollowResultsHandler = this.unfollowResultsHandler.bind(this);
    }


    static getDerivedStateFromProps(nextProps, prevState)
    {
        if(prevState.user.id !== nextProps.user.id)
        {
            // do not display the popup as there was a change in the user id
            return UserDisplay.generateDisplayState(nextProps, false);
        }
        else if(prevState.currentUser !== nextProps.currentUser)
        {
            let userPopup = false;
            if(prevState.userPopup)
            {
                userPopup = true;
            }
            // if the popup was open, leave it open
            return UserDisplay.generateDisplayState(nextProps, userPopup);
        }
        else
        {
            return null;
        }
    }

    shouldComponentUpdate(nextProps, nextState)
    {
        // if the user id changed
        if(this.state.user.id !== nextState.user.id)
        {
            return true;
        }
        // if the loggedin user chagned
        else if(this.state.currentUser !== nextState.currentUser)
        {
            return true;
        }
        // if the watchlist, watched, or moviepop up changed
        else if((this.state.following !== nextState.following))
        {
            return true;
        }
        // do not render if none of the above are true
        else
        {
            return false;
        }
    }

    // function to set the state for the user display
    // called on initialization and whenever new props come in
    static generateDisplayState(props, moviePopup)
    {
        //let following = checkMovieOnWatchList(props.movie, props.currentUser);
        let following = false;
        return {
            id: props.user.id,
            poster: props.user.picture,
            user: props.user,
            currentUser: props.currentUser,
            following: following,
            // may or may not be needed
            index: props.index,
            // may or may not be needed
            type: props.type,
            userPictureStyle: (props.userPictureStyle === undefined) ? {} : props.userPictureStyle
        };
    }

    pictureClickedHandler()
    {
        // just wrap the poster in a link to the users profile...
    }

    // function to handle following or unfollowing a user
    followHandler(e,type)
    {
        e.preventDefault();
        if(this.state.currentUser === "")
        {
            this.props.showLoginPopUp(false);
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
        this.props.updateLoggedIn(loggedInUser);
        if(status === 200)
        {
            this.setState({
                following: true,
                loggedInUser: loggedInUser
            });
            this.props.setMessages({
                messages: [{type: "success", message: message}]
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
            });
            // need to remove the user from the display and cause a rerender
            // or just make it so the display is kind of blocked out???

            // for now, just show error message
            // want to cause a full page rerender somehow..
            this.props.setMessages({
                messages: [{type: "failure", message: message}],
            });
        }
        else if(status === 400 && message === "User cannot follow themself")
        {
            this.setState({
                loggedInUser: loggedInUser
            });
            this.props.setMessages({
                messages: [{type: "warning", message: message}]
            });
        }
        else if(status === 400 && message === "You already follow the user")
        {
            this.setState({
                following: true,
                loggedInUser: loggedInUser
            });
            this.props.setMessages({
                messages: [{type: "info", message: message}],
            });
        }
        else
        {
            this.setState({
                loggedInUser: loggedInUser
            });
            this.props.setMessages({
                messages: [{type: "failure", message: "Some unknown error occurred when trying to follow the user"}]
            });
        }
    }

    unfollowResultsHandler(status, message, loggedInUser)
    {
        this.props.updateLoggedIn(loggedInUser);
        // user successfully unfollowed
        if(status === 200)
        {
            this.setState({
                following: false,
                loggedInUser: loggedInUser
            });
            this.props.setMessages({
                messages: [{type: "success", message: message}]
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
            });
            // see same scenario above
            this.props.setMessages({
                messages: [{type: "failure", message: message}]
            });
        }
        else if(status === 400 && message === "User cannot unfollow themself")
        {
            this.setState({
                loggedInUser: loggedInUser
            });
            this.props.setMessages({
                messages: [{type: "warning", message: message}]
            });
        }
        else if(status === 400 && message === "You already do not follow the user")
        {
            this.setState({
                following: false,
                loggedInUser: loggedInUser
            });
            this.props.setMessages({
                messages: [{type: "info", message: message}]
            });
        }
        else
        {
            this.setState({
                loggedInUser: loggedInUser
            });
            this.props.setMessages({
                messages: [{type: "failure", message: "Some unknown error occurred when trying to unfollow the user"}]
            });
        }
    }

    // function called by popup when user adds/removes a movie to their watchlist or watchedlist
    updateState(newState)
    {
        this.setState(newState);
    }

    render()
    {
        let posterPath = "";
        let followButton = <button className={`${style.followButton} ${style.notFollowingColor}`} onClick={(e)=> this.followHandler(e, "follow")}>Follow</button>
        if(this.state.following)
        {
            followButton = <button className={`${style.followButton} ${style.followColor}`} onClick={(e)=> this.followHandler(e, "unfollow")}>Following</button>;
        }


        let path = "/profile/" + this.state.user.username;
        return (
            <Link to={path} className={style.link}>
                <div className={style.main}>
                    <div className={style.userImageContainer} onClick={this.pictureClickedHandler}>
                        <img className={style.userImage} style={this.state.userPictureStyle} src={require("./images/profile-pic.jpg")}/>
                    </div>
                    <div className={style.bottomContainer} onClick={this.pictureClickedHandler}>
                        <div className={style.userDetailsContainer}>
                            <div className={style.userName}>
                                {this.state.user.username}
                            </div>
                            <div className={style.actualName}>
                                Matt Stropkey Stropkey
                            </div>
                        </div>
                        {followButton}
                    </div>
                </div>
            </Link>
        )
    }

}

export default withRouter(UserDisplay);
