import React from 'react';
import Popup from 'reactjs-popup';
import FollowerDisplay from './FollowerDisplay.js';
import './css/forms.css';
import style from './css/UserListPopUp.module.css';

class UserListPopUp extends React.Component {
    constructor(props) {
        super(props);
        this.state ={
            // indicates if the popup is visible on the screen or not
            open: true,
            username: this.props.username,
            followedUsers: [],
            notFollowedUsers: [],
            requester: "",
            // not currently used by may be used in the future if users can click a button
            // to follow usres in the list
            redirect: false,
            // the pop up can either be for Followers or Following
            type: this.props.type,
            loading: true
        };
        this.closeModal = this.closeModal.bind(this);
        this.changeHandler = this.changeHandler.bind(this);
        this.generateUserDisplay = this.generateUserDisplay.bind(this);
    }

    // load the data in here
    async componentDidMount()
    {
        let result = await this.getUsers();
        let status = result[0];
        if(status === 200)
        {
            this.setState({
                followedUsers: result[1][0],
                notFollowedUsers: result[1][1],
                requester: result[1][2],
                loading: false
            });
        }
        else
        {
            alert("Failed to get users for the popup");
        }
    }

    // function to get call the api to get the users to display
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
        this.props.removeFunction(this.state.type);
    }


    // function to generate HTML for each section such as first name, last name, username, email
    generateUserDisplay(value, title)
    {
        let usersArray = [];
        this.state.followedUsers.forEach((user) => {
            // path to users profile page
            let userHtml = (<FollowerDisplay user={user} following={true} requester={this.state.requester} />);
            usersArray.push(userHtml);
        });
        this.state.notFollowedUsers.forEach((user) => {
            // path to users profile page
            let userHtml = (<FollowerDisplay user={user} following={false} requester={this.state.requester} />);
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
