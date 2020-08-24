import React from 'react';
import Popup from 'reactjs-popup';
import FollowerDisplay from './FollowerDisplay.js';
import './css/forms.css';
import style from './css/UserListPopUp.module.css';

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
                followedUsers: [],
                notFollowedUsers: [],
                requester: "",
                // true if this list is on the loggedin users page
                currentUser: this.props.currentUser,
                // not currently used by may be used in the future if users can click a button
                // to follow usres in the list
                redirect: false,
                // the pop up can either be for Followers or Following
                type: this.props.type,
                loading: true
            };
        }
        else
        {
            this.state ={
                // indicates if the popup is visible on the screen or not
                open: true,
                username: this.props.username,
                followedUsers: [],
                notFollowedUsers: [],
                requester: "",
                // true if this list is on the loggedin users page
                currentUser: this.props.currentUser,
                // not currently used by may be used in the future if users can click a button
                // to follow usres in the list
                redirect: false,
                // this is Likes
                type: this.props.type,
                reviewId: this.props.reviewId,
                loading: true
            };
        }
        this.closeModal = this.closeModal.bind(this);
        this.changeHandler = this.changeHandler.bind(this);
        this.generateUserDisplay = this.generateUserDisplay.bind(this);
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
        if(status === 200)
        {
            this.setState({
                followedUsers: result[1][0],
                notFollowedUsers: result[1][1],
                requester: result[1][2],
                loading: false
            });
            let count = result[1][0].length + result[1][1].length;
            // this will update the profile header if the count of following
            // or followers has changed since loading originally
            // if this is for Likes on a post, this will update the like count
            // if it has changed since the page loaded
            this.props.changeFunction(count);
        }
        else
        {
            alert("Failed to get users for the popup");
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
    getUsers()
    {
        const requestOptions = {
            method: 'GET',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json'},
        };

        let url;
        if(this.state.type === "Followers")
        {
            url = "http://localhost:9000/profile/" + this.state.username + "/getfollowers";
        }
        else
        {
            url = "http://localhost:9000/profile/" + this.state.username + "/getfollowing";
        }
        let status = 0;
        return fetch(url, requestOptions)
            .then(res => {
                status = res.status;
                return res.json();
            }).then(result =>{
                return [status, result];
            });
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
    generateUserDisplay(value, title)
    {
        let usersArray = [];
        this.state.followedUsers.forEach((user) => {
            // path to users profile page
            let userHtml = (<FollowerDisplay user={user} following={true} requester={this.state.requester} currentUser={this.state.currentUser} username={this.state.username} updateFunction={this.props.updateFunction} updateFollowersFunction={this.props.updateFollowersFunction}/>);
            usersArray.push(userHtml);
        });
        this.state.notFollowedUsers.forEach((user) => {
            // path to users profile page
            let userHtml = (<FollowerDisplay user={user} following={false} requester={this.state.requester} currentUser={this.state.currentUser} username={this.state.username} updateFunction={this.props.updateFunction} updateFollowersFunction={this.props.updateFollowersFunction}/>);
            usersArray.push(userHtml);
        });
        return usersArray;

    }

    render() {
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
