import React from 'react';
import { Link, Redirect } from 'react-router-dom';
import Popup from 'reactjs-popup';
import style from './css/SettingsForm/UserSettings.module.css';
import './css/forms.css';
//import './css/signup.css';
import './css/SettingsForm/PasswordResetPopUp.css';
import {apiPostJsonRequest} from './StaticFunctions/ApiFunctions.js';

class PasswordResetPopUp extends React.Component {
    constructor(props) {
        super(props);
        this.state ={
            open: true,
            oldPassword: "",
            oldPasswordError: "",
            newPass: "",
            newPassError: "",
            newPass2: "",
            newPass2Error: "",
            redirect: false,
            currentUser: this.props.currentUser,
            awaitingResults: false
        };
        this.validateForm = this.validateForm.bind(this);
        this.closeModal = this.closeModal.bind(this);
        this.changeHandler = this.changeHandler.bind(this);
        this.updatePasswordResultsHandler = this.updatePasswordResultsHandler.bind(this);
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
        this.props.removeFunction();
    }

    async validateForm(event) {
        event.preventDefault();
        let error = false;
        // first check to make sure fields not empty
        if(!this.state.oldPassword || !this.state.newPass || !this.state.newPass2)
        {
            if(!this.state.oldPassword)
            {
                this.setState({oldPasswordError: "Your current password is required"});
                error = true;
            }
            else
            {
                this.setState({oldPasswordError: ""});
            }
            if(!this.state.newPass)
            {
                this.setState({newPassError: "You must enter a new password"});
                error = true;
            }
            else
            {
                this.setState({newPassError: ""});
            }

            if(!this.state.newPass2)
            {
                this.setState({newPass2Error: "You must enter the new password twice"});
                error = true;
            }
            else
            {
                this.setState({newPass2Error: ""});
            }
        }
        else
        {
            // boolean to override other checks
            let priority = false;
            if(this.state.newPass.length < 6 || this.state.newPass.length > 20)
            {
                this.setState({
                    newPassError: "Your password must be between 6-20 characters characters",
                    oldPasswordError: "",
                    newPass2Error: ""
                });
                error = true;
            }
            // see if new password is the same as the old one
            else if(this.state.newPass !== this.state.newPass2 && !priority)
            {
                this.setState({
                    newPass2Error: "This password does not match the new password",
                    newPassError: "",
                    oldPasswordError: ""
                });
                error = true;
            }
            else if(this.state.newPass === this.state.oldPassword && !priority)
            {
                this.setState({
                    newPassError: "You new password cannot be the same as the old password",
                    oldPasswordError: "",
                    newPass2Error: ""
                });
                error = true;
            }
            else
            {
                this.setState({
                    newPassError: "",
                    oldPasswordError: "",
                    newPass2Error: ""
                });
            }
        }

        if(!error)
        {
            let params = {
                    oldPassword: this.state.oldPassword,
                    newPass: this.state.newPass,
                    newPass2: this.state.newPass2
            };
            this.setState({
                awaitingResults: true
            });
            let url = "http://localhost:9000/profile/" + this.state.currentUser + "/update_password";
            apiPostJsonRequest(url, params).then((result) =>{
                let status = result[0];
                let message = result[1].message;
                let requester = result[1].requester;
                this.updatePasswordResultsHandler(status, message, requester);
            });
        }
    }

    updatePasswordResultsHandler(status, message, requester)
    {
        let resultFound = true;
        if(status === 200)
        {
            this.props.updateLoggedIn(requester);
            this.closeModal();
        }
        else
        {
            if(status === 400)
            {
                // New password is identical to the previous one sent by the user
                // Username must be between 6-20 characters
                // Password must be betweeen 6-15 characters
                // New password must be betweeen 6-15 characters
                if(message === "New password must be betweeen 6-15 characters")
                {
                    this.setState({
                        newPassError: message,
                        oldPasswordError: "",
                        newPass2Error: ""
                    });
                }
                else if(message === "New password is identical to the previous one sent by the user")
                {
                    this.setState({
                        newPassError: "You new password cannot be the same as the old password",
                        oldPasswordError: "",
                        newPass2Error: ""
                    });
                }
                else
                {
                    resultFound = false;
                }
            }
            else if(status === 401)
            {
                if(message === "Password incorred")
                {
                    this.setState({
                        newPassError: "",
                        oldPasswordError: "Your password is incorrect",
                        newPass2Error: ""
                    });
                }
                else
                {
                    resultFound = false;
                }
                // The user passed in the url does not match the cookie
                // Password incorrect
                // "Password incorrect. User account is currently locked due to too many failed password attempts"
                // "You are not logged in"
            }
            else if(status === 404)
            {
                // Could not find the user to update
                // "The profile path sent to the server does not exist"
                if(message === "Could not find the user to update")
                {

                }
                else
                {
                    resultFound = false;
                }
            }
            else if(status === 500)
            {
                // "A unknown error occurred trying to update the users password"
            }
            else
            {
                resultFound = false;
            }
            if(!resultFound)
            {
                let output = "Some unexpected " + status + " code was returned by the server";
                this.props.setMessages({
                    messages: [{type: "failure", message: output}],
                    clearMessages: true
                });
                this.setState({
                    awaitingResults: false
                });
            }
        }
    }

    // function to generate HTML for each section such as first name, last name, username, email
    generateInput(value, title)
    {
        let result = "";
        let errorType = value + "Error";
        if(this.state[errorType])
        {
            // fix the css using the forms.css file
            result = (
                <React.Fragment>
                    <div className={style.sectionHeader}>
                        <h3 className={`${style.h3Header} errorLabel`}>{title}</h3>
                    </div>
                    <div className={style.inputFieldContainer}>
                        <input
                            type="password"
                            name={value}
                            form="form3"
                            value={this.state[value]}
                            className={`${style.inputFieldBoxLong} inputBoxError`}
                            onChange={this.changeHandler}
                            maxlength={20}
                        />
                    </div>
                    <div className={style.errorTextContainer}>
                        <small className="errorTextSmall">{this.state[errorType]}</small>
                    </div>
                </React.Fragment>);
        }
        else
        {
            result = (
                <React.Fragment>
                    <div className={style.sectionHeader}>
                        <h3 className={style.h3Header}>{title}</h3>
                    </div>
                    <div className={style.inputFieldContainer}>
                        <input
                            type="password"
                            name={value}
                            form="form3"
                            value={this.state[value]}
                            className={`${style.inputFieldBoxLong} validInputBox`}
                            onChange={this.changeHandler}
                            maxlength={20}
                        />
                    </div>
                </React.Fragment>);
        }
        return result;
    }

    render() {
        // if the user could not be authenticated, redirect to home page
        if(this.state.redirect)
        {
            return <Redirect to="/" />;
        }

        let oldPassInput = this.generateInput("oldPassword", "Current Password:");
        let newPassInput = this.generateInput("newPass", "New Password:");
        let newPass2Input = this.generateInput("newPass2", "Repeat new password:");

        return (
            <div>
                <Popup
                    open={this.state.open}
                    closeOnDocumentClick
                    onClose={this.closeModal}
                    className={"passwordReset"}
                >
                <div className="modal">
                    {/* &times is the multiplication symbol (x) --> */}
                    <button className="close" onClick={this.closeModal}>
                    &times;
                    </button>
                    <div className="header">
                        <h3 className="inlineH3"> Change Password </h3>
                    </div>
                    <div className="content">
                        <form id="form3" onSubmit={this.validateForm} noValidate/>
                        {oldPassInput}
                        {newPassInput}
                        {newPass2Input}
                    </div>
                    <div className="actions">
                        <button
                            form="form3"
                            value="update_password"
                            className="submitButton"
                            onClick={this.validateForm}
                        >Update password</button>
                    </div>

                </div>
                </Popup>
            </div>
        );
    }

}

export default PasswordResetPopUp;
