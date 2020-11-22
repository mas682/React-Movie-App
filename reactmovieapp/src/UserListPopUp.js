import React from 'react';
import Popup from 'reactjs-popup';
import FollowerDisplay from './FollowerDisplay.js';
import {Redirect, withRouter} from 'react-router-dom';
import './css/forms.css';
import style from './css/UserListPopUp.module.css';
import {apiGetJsonRequest, apiPostJsonRequest} from './StaticFunctions/ApiFunctions.js';

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
                redirectToHome: false
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
                redirect: false,
                // this is Likes
                type: this.props.type,
                reviewId: this.props.reviewId,
                loading: true,
                redirectToHome: false
            };
        }
        this.closeModal = this.closeModal.bind(this);
        this.changeHandler = this.changeHandler.bind(this);
        this.generateUserDisplay = this.generateUserDisplay.bind(this);
        this.getUsers = this.getUsers.bind(this);
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
            console.log(result);
        }
        let status = result[0];
        let message = result[1][0];
        let user = result[1][1];
        if(status === 200)
        {
            this.setState({
                users: result[1][2],
                loggedInUser: user,
                loading: false
            });
            this.props.updateLoggedIn(user);
            // this will update the profile header if the count of following
            // or followers has changed since loading originally
            // if this is for Likes on a post, this will update the like count
            // if it has changed since the page loaded
            this.props.changeFunction(result[1][2].length);
        }
        else
        {
            alert(message);
            if(status === 401)
            {
                // not logged in so show login pop up and close this pop up
                this.closeModal();
                this.props.showLoginPopUp(false);
            }
            else if(status === 400)
            {
                // username not in correct format
                // redirect to home?..or just say request failed
                this.setState({
                    redirectToHome: true,
                    loading: false
                });
            }
            else if(status === 404)
            {
                // user could not be found
                // redirect to home or 404 page?
                this.setState({
                    redirectToHome: true,
                    loading: false
                });
                this.props.updateLoggedIn("");
            }
            else
            {
                alert(message);
                alert("Failed to get users for the popup");
            }
        }
    }

    // function to call the api to get the users who liked the post
    getLikes()
    {
        const requestOptions = {
            method: 'POST',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json'},
            body: JSON.stringify({
                reviewId: this.state.reviewId
            })
        };

        let status = 0;
        return fetch("http://localhost:9000/review/getlikes", requestOptions)
            .then(res => {
                status = res.status;
                return res.json();
            }).then(result =>{
                return [status, result];
            });
    }

    // function to call the api to get the users to display
    async getUsers()
    {
        let url;
        if(this.state.type === "Followers")
        {
            url = "http://localhost:9000/profile/" + this.state.username + "/getfollowers";
        }
        else
        {
            url = "http://localhost:9000/profile/" + this.state.username + "/getfollowing";
        }
        let result = await apiGetJsonRequest(url)
            .then(result => {
                return result;
            });
        return result;
    }


    // will eventually be used when users are able to follow users from the list
    // by clicking a button
    changeHandler(event) {
        let name = event.target.name;
        let value = event.target.value;
        this.setState({[name]: value});
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
                                updateFunction={this.props.updateFunction}
                                updateFollowersFunction={this.props.updateFollowersFunction}
                                updateLoggedIn={this.props.updateLoggedIn}
                                showLoginPopUp={this.props.showLoginPopUp}
                                closeModal={this.closeModal}
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
                                updateFunction={this.props.updateFunction}
                                updateFollowersFunction={this.props.updateFollowersFunction}
                                showLoginPopUp={this.props.showLoginPopUp}
                                updateLoggedIn={this.props.updateLoggedIn}
                                closeModal={this.closeModal}
                            />);
                notFollowedUsers.push(userHtml);
            }
        });
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
                >
                <div className={style.modal}>
                    {/* &times is the multiplication symbol (x) --> */}
                    <button className={style.close} onClick={this.closeModal}>
                    &times;
                    </button>
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
