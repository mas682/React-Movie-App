import React from 'react';
import Popup from 'reactjs-popup';
import FollowerDisplay from './FollowerDisplay.js';
import {Redirect, withRouter} from 'react-router-dom';
import './css/forms.css';
import './css/UserListPopUp.css';
import style from './css/UserListPopUp.module.css';
import {apiGetJsonRequest, apiPostJsonRequest} from './StaticFunctions/ApiFunctions.js';
import Alert from './Alert.js';
import {generateMessageState} from './StaticFunctions/StateGeneratorFunctions.js';

class UserListPopUp extends React.Component {
    constructor(props) {
        super(props);
        // if the type is Following or Followers
        if(this.props.type !== "Likes")
        {
            this.state ={
                // indicates if the popup is visible on the screen or not
                open: true,
                // the user whose page the likes are being shown on
                username: this.props.username,
                users: [],
                loggedInUser: this.props.loggedInUser,
                // the pop up can either be for Followers or Following
                type: this.props.type,
                loading: true,
                redirectToHome: false,
                messages: "",
                messageId: 0
            };
        }
        else
        {
            this.state ={
                // indicates if the popup is visible on the screen or not
                open: true,
                // username of user whose page this belongs to
                username: this.props.username,
                users: [],
                loggedInUser: this.props.loggedInUser,
                // this is Likes
                type: this.props.type,
                reviewId: this.props.reviewId,
                loading: true,
                redirectToHome: false,
                messages: "",
                messageId: 0
            };
        }
        this.closeModal = this.closeModal.bind(this);
        this.changeHandler = this.changeHandler.bind(this);
        this.generateUserDisplay = this.generateUserDisplay.bind(this);
        this.getUsers = this.getUsers.bind(this);
        this.getLikesResultsHandler = this.getLikesResultsHandler.bind(this);
        this.showMessage = this.showMessage.bind(this);
    }

    // load the data in here
    async componentDidMount()
    {
        let result;
        if(this.state.type === "Likes")
        {
            result = await this.getLikes();
        }
        else
        {
            result = await this.getUsers();
        }
        let status = result[0];
        let message = result[1].message;
        let user = result[1].requester;
        if(this.state.type === "Likes")
        {
            this.getLikesResultsHandler(status, message, user, result);
        }
        else
        {
            this.getUsersResultsHandler(status, message, user, result);
        }
    }

    // function to call the api to get the users to display
    async getUsers()
    {
        let url;
        if(this.state.type === "Followers")
        {
            url = "/profile/" + this.state.username + "/getfollowers";
        }
        else
        {
            url = "/profile/" + this.state.username + "/getfollowing";
        }
        let result = await apiGetJsonRequest(url)
            .then(result => {
                return result;
            });
        return result;
    }

    // function to call the api to get the users who liked the post
    async getLikes()
    {
        let url = "/review/getlikes";
        let params = {reviewId: this.state.reviewId};
        return await apiPostJsonRequest(url, params);
    }

    getUsersResultsHandler(status, message, user, result)
    {
        if(status === 200)
        {
            let messageId = this.state.messageId + 1;
            this.setState({
                users: result[1].users,
                loggedInUser: user,
                loading: false
            });
            this.props.updateLoggedIn(user);
            // this will update the profile header if the count of following
            // or followers has changed since loading originally
            // if this is for Likes on a post, this will update the like count
            // if it has changed since the page loaded
            this.props.changeFunction(result[1].users.length);
        }
        else
        {
            this.props.updateLoggedIn(user);
            if(status === 401)
            {
                // not logged in so show login pop up and close this pop up
                this.closeModal();
                this.props.showLoginPopUp(false);
            }
            else if(status === 400)
            {
                // username not in correct format
                this.props.showErrorPage(message);
                this.closeModal();
            }
            else if(status === 404)
            {
                // user could not be found for followers could not be found
                this.props.showErrorPage(message);
                this.closeModal();
            }
            else
            {
                this.props.showErrorPage(message);
                this.closeModal();
            }
        }
    }

    getLikesResultsHandler(status, message, user, result)
    {
        if(status === 200)
        {
            this.setState({
                users: result[1].users,
                loggedInUser: user,
                loading: false
            });
            this.props.updateLoggedIn(user);
            // if this is for Likes on a post, this will update the like count
            // if it has changed since the page loaded
            this.props.changeFunction(result[1].users.length);
            this.props.setMessages({messages: [{message: message, type: "success"}]});
        }
        else
        {
            this.props.updateLoggedIn(user);
            if(status === 401)
            {
                // not logged in so show login pop up and close this pop up
                this.closeModal();
                this.props.showLoginPopUp(false);
            }
            else if(status === 400)
            {
                // review id invalid or undefined
                // will want to do something to movie post such as indicating not correct
                this.setState({
                    loading: false,
                    loggedInUser: user
                });
                this.props.setMessages({messages: [{message: message, type: "failure"}]});
                this.closeModal();
            }
            else if(status === 404)
            {
                // review could not be found, same issue as above
                this.setState({
                    loading: false,
                    loggedInUser: user
                });
                this.props.removePost({messages: [{message: message, type: "failure"}]});
                this.closeModal();
            }
            else
            {
                this.setState({
                    loading: false
                });
                this.props.setMessages({messages: [{message: message, type: "failure"}]});
                this.closeModal();
            }
        }
    }


    // will eventually be used when users are able to follow users from the list
    // by clicking a button
    changeHandler(event) {
        let name = event.target.name;
        let value = event.target.value;
        this.setState({[name]: value});
    }

    showMessage(messageState)
    {
        this.setState(generateMessageState(messageState, this.state.messageId));
    }

    // function called when closing the popup
    // the props.removeFunction is a function passed in by the calling component that
    // is used to remove the popup from the calling components display
    closeModal() {
        this.setState({
            open: false,
        });
        if(this.state.type === "Likes")
        {
            this.props.removeFunction("displayLikes", false);
        }
        this.props.removeFunction(this.state.type);
    }


    // function to generate HTML for each section such as first name, last name, username, email
    generateUserDisplay()
    {
        let followedUsers = [];
        let notFollowedUsers = [];
        this.state.users.forEach((user) => {
            let userHtml;
            let following = false;
            // the if/else is used to sort the followed users so that they are shown first
            if(user.Followers.length > 0)
            {
                userHtml = (<FollowerDisplay
                                user={user}
                                following={true}
                                loggedInUser={this.state.loggedInUser}
                                username={this.state.username}
                                updateFollowingFunction={this.props.updateFollowingFunction}
                                updateFollowersFunction={this.props.updateFollowersFunction}
                                updateLoggedIn={this.props.updateLoggedIn}
                                showLoginPopUp={this.props.showLoginPopUp}
                                closeModal={this.closeModal}
                                type={this.state.type}
                                showMessage={this.showMessage}
                            />);
                followedUsers.push(userHtml);
            }
            else
            {
                userHtml = (<FollowerDisplay
                                user={user}
                                following={false}
                                loggedInUser={this.state.loggedInUser}
                                username={this.state.username}
                                updateFollowingFunction={this.props.updateFollowingFunction}
                                updateFollowersFunction={this.props.updateFollowersFunction}
                                showLoginPopUp={this.props.showLoginPopUp}
                                updateLoggedIn={this.props.updateLoggedIn}
                                closeModal={this.closeModal}
                                type={this.state.type}
                                showMessage={this.showMessage}
                            />);
                notFollowedUsers.push(userHtml);
            }
        });
        console.log(this.props);
        return followedUsers.concat(notFollowedUsers);

    }

    render() {
        if(this.state.loading)
        {
            return null;
        }
        if(this.state.redirectToHome)
        {
            return <Redirect to={"/"} />;
        }
        // get the html for the users
        let userDisplay = this.generateUserDisplay();

        return (
            <div>
                <Popup
                    open={this.state.open}
                    closeOnDocumentClick
                    onClose={this.closeModal}
                    contentStyle={{ width: "40%"}}
                    className={"UserListPopUp"}
                >
                <div className={style.modal}>
                    {/* &times is the multiplication symbol (x) --> */}
                    <button className={style.close} onClick={this.closeModal}>
                    &times;
                    </button>
                    <Alert
                        messages={this.state.messages}
                        messageId={this.state.messageId}
                        symbolStyle={{"width": "5%", "margin-top": "0px"}}
                        messageBoxStyle={{width: "86%"}}
                        closeButtonStyle={{width: "5%", "margin-top": "0px"}}
                    />
                    <div className={style.header}>
                        <h3 className="inlineH3"> {this.state.type} </h3>
                    </div>
                    <div className={style.content}>
                        {userDisplay}
                    </div>
                    <div className={style.actions}>
                    </div>
                </div>
                </Popup>
            </div>
        );
    }

}

export default UserListPopUp;
