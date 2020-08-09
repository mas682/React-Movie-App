import React from 'react';
import { Link, Redirect } from 'react-router-dom';
import Popup from 'reactjs-popup';
import './css/forms.css';
import style from './css/UserListPopUp.module.css';

class UserListPopUp extends React.Component {
    constructor(props) {
        super(props);
        this.state ={
            // indicates if the popup is visible on the screen or not
            open: true,
            // an array of users
            users: this.props.users,
            // not currently used by may be used in the future if users can click a button
            // to follow usres in the list
            redirect: false,
            // the pop up can either be for Followers or Following
            type: this.props.type
        };
        this.closeModal = this.closeModal.bind(this);
        this.changeHandler = this.changeHandler.bind(this);
        this.generateUserDisplay = this.generateUserDisplay.bind(this);
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
        this.state.users.forEach((user) => {
            // path to users profile page
            let path = "/profile/" + user.username;
            let userHtml = (
                <React.Fragment>
                <div className={style.userNameContainer}>
                    <div className={style.userImageBox}>
                        <Link to={path}><img className={style.profilePic} src={require("./images/profile-pic.jpg")}/></Link>
                    </div>
                    <div className={style.usernameBox}>
                        <Link to={path} className={style.userLink}>{user.username}</Link>
                    </div>
                    <div className ={style.followBox}>
                        <button> follow button </button>
                    </div>
                </div>
                </React.Fragment>
            );
            usersArray.push(userHtml);
            usersArray.push(userHtml);
            usersArray.push(userHtml);
            usersArray.push(userHtml);
            usersArray.push(userHtml);
            usersArray.push(userHtml);
            usersArray.push(userHtml);
            usersArray.push(userHtml);
            usersArray.push(userHtml);
            usersArray.push(userHtml);
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
