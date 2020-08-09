import React from 'react';
import { Link, Redirect } from 'react-router-dom';
import Popup from 'reactjs-popup';
import './css/forms.css';
import style from './css/UserListPopUp.module.css';

class UserListPopUp extends React.Component {
    constructor(props) {
        super(props);
        this.state ={
            open: true,
            users: this.props.users,
            redirect: false,
            type: this.props.type
        };
        this.callApi = this.callApi.bind(this);
        this.closeModal = this.closeModal.bind(this);
        this.changeHandler = this.changeHandler.bind(this);
        this.generateUserDisplay = this.generateUserDisplay.bind(this);
    }

    callApi()
    {
        // Simple POST request with a JSON body using fetch
        const requestOptions = {
            method: 'POST',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                oldPassword: this.state.oldPassword,
                newPass: this.state.newPass,
                newPass2: this.state.newPass2
            })
        };

        let status = 0;
        let url = "http://localhost:9000/profile/" + this.state.username + "/update_password";
        return fetch(url, requestOptions)
            .then(res => {
                status = res.status;
                return res.text();
            }).then(result => {
                return [status, result];
            });
    }

    changeHandler(event) {
        let name = event.target.name;
        let value = event.target.value;
        this.setState({[name]: value});
    }

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
            let path = "/profile/" + user.username;
            let userHtml = (
                <React.Fragment>
                <div className={style.userNameContainer}>
                    <div className={style.userImageBox}>
                        <img className={style.profilePic} src={require("./images/profile-pic.jpg")}/>
                    </div>
                    <div className={style.usernameBox}>
                        <Link to={path}>{user.username}</Link>
                    </div>
                    <div className ={style.followBox}>
                        follow button
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
        // if the user could not be authenticated, redirect to home page
        if(this.state.redirect)
        {
            return <Redirect to="/" />;
        }

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
