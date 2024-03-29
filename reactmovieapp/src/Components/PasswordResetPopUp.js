import React from 'react';
import { Redirect } from 'react-router-dom';
import Popup from 'reactjs-popup';
import style from '../css/SettingsForm/UserSettings.module.css';
import '../css/forms.css';
import '../css/SettingsForm/PasswordResetPopUp.css';
import {apiPostJsonRequest} from '../StaticFunctions/ApiFunctions.js';
import Alert from './Alert.js';
import {generateInput}  from '../StaticFunctions/ReusableHtmlFunctions.js';

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
            awaitingResults: false,
            messages: "",
            messageId: -1
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
            let regex = new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[-#!\$@%\^&*\(\)_+\|~=\`\{\}\\[\\]:\"`;'<>\?,\./\\\\])(?=.{10,30})");
            if(!regex.test(this.state.oldPassword))
            {
                this.setState({
                    newPassError: "",
                    oldPasswordError: "Password must be between 10-30 characters, contain at least 1 lowercase character, at least 1 uppercase character," + 
                    "at least 1 number, and at least 1 special character",
                    newPass2Error: ""
                });
                error = true;
            }
            else if(!regex.test(this.state.newPass))
            {
                this.setState({
                    newPassError: "Password must be between 10-30 characters, contain at least 1 lowercase character, at least 1 uppercase character," + 
                    "at least 1 number, and at least 1 special character",
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
                    newPass: this.state.newPass
            };
            this.setState({
                awaitingResults: true,
                messageId: -1
            });
            let url = "/profile/" + this.state.currentUser + "/update_password";
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
            this.props.setMessages({
                messages: [{type: "success", message: message}],
                clearMessages: true
            });
            this.props.updateLoggedIn(requester);
            this.closeModal();
        }
        else
        {
            if(status === 400)
            {
                this.props.updateLoggedIn(requester);
                if(message.startsWith("New password must be between 10-30 characters"))
                {
                    this.setState({
                        newPassError: message,
                        oldPasswordError: "",
                        newPass2Error: "",
                        awaitingResults: false
                    });
                }
                else if(message === "New password is identical to the previous one sent by the user")
                {
                    this.setState({
                        newPassError: "Your new password cannot be the same as the old password",
                        oldPasswordError: "",
                        newPass2Error: "",
                        awaitingResults: false
                    });
                }
                else if(message === "Username must be between 6-20 characters")
                {
                    this.setState({
                        messages: [{type: "failure", message: message}],
                        messageId: this.state.messageId + 1,
                        awaitingResults: false
                    });
                }
                else if(message.startsWith("Password must be between 10-30 characters"))
                {
                    this.setState({
                        newPassError: "",
                        oldPasswordError: message,
                        newPass2Error: "",
                        awaitingResults: false
                    });
                }
                else
                {
                    resultFound = false;
                }
            }
            else if(status === 401)
            {
                if(message === "Password incorrect")
                {
                    this.props.updateLoggedIn(requester);
                    this.setState({
                        newPassError: "",
                        oldPasswordError: "Your password is incorrect",
                        newPass2Error: "",
                        awaitingResults: false
                    });
                }
                else if(message === "The user passed in the url does not match the cookie")
                {
                    this.props.updateLoggedIn(requester);
                    this.setState({
                        messages: [{type: "failure", message: message}],
                        messageId: this.state.messageId + 1,
                        awaitingResults: false
                    });
                }
                else if(message === "You are not logged in")
                {
                    // should cause a redirect to the home page
                    this.props.updateLoggedIn(requester);
                }
                else if(message.startsWith("Password incorrect. User account") || 
                    message.startsWith("Users account is currently suspended") || 
                    message.startsWith("Users password is currently locked"))
                {
                    this.props.updateLoggedIn(requester);
                    this.setState({
                        awaitingResults: false
                    });
                    this.props.setMessages({
                        messages: [{type: "failure", message: message}],
                        clearMessages: true
                    });
                    this.closeModal();
                }
                else
                {
                    this.props.updateLoggedIn(requester);
                    resultFound = false;
                }
            }
            else if(status === 404)
            {
                if(message === "Could not find the user to update")
                {
                    // this should cause a redirect to the home page
                    this.props.updateLoggedIn(requester);
                    this.props.setMessages({
                        messages: [{type: "failure", message: message}],
                        clearMessages: true
                    });
                }
                else if(message === "The profile path sent to the server does not exist" || message === "Could not find the user to update")
                {
                    this.props.updateLoggedIn(requester);
                    this.setState({
                        messages: [{type: "failure", message: message}],
                        messageId: this.state.messageId + 1,
                        awaitingResults: false
                    });
                }
                else
                {
                    this.props.updateLoggedIn(requester);
                    resultFound = false;
                }
            }
            else if(status === 500)
            {
                this.props.updateLoggedIn(requester);
                // "A unknown error occurred trying to update the users password"
                this.setState({
                    messages: [{type: "failure", message: message}],
                    messageId: this.state.messageId + 1,
                    awaitingResults: false
                });
            }
            else
            {
                resultFound = false;
                this.props.updateLoggedIn(requester);
            }
            if(!resultFound)
            {
                let output = "Some unexpected " + status + " code was returned by the server.  Message: " + message;
                this.setState({
                    messages: [{type: "failure", message: output, timeout: 0}],
                    messageId: this.state.messageId + 1,
                    awaitingResults: false
                });
            }
        }
    }

    render() {
        // if the user could not be authenticated, redirect to home page
        if(this.state.redirect)
        {
            return <Redirect to="/" />;
        }

        let config = {
            label: "Current Password:",
            type: "password",
            name: "oldPassword",
            form: "form3",
            value: this.state.oldPassword,
            changeHandler: this.changeHandler,
            maxLength: 20,
            error: this.state.oldPasswordError
        };
        let oldPassInput = generateInput(config, style);
        config.errorKey = "newPassError";
        config.label = "New Password:";
        config.name= "newPass";
        config.value = this.state.newPass;
        config.error = this.state.newPassError;
        let newPassInput = generateInput(config, style);
        config.errorKey = "newPass2Error";
        config.label = "Repeat New Password:";
        config.name= "newPass2";
        config.value = this.state.newPass2;
        config.error = this.state.newPass2Error;
        let newPass2Input = generateInput(config, style);
        

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
                    <Alert
                        messages={this.state.messages}
                        messageId={this.state.messageId}
                        innerContainerStyle={{"z-index": "2", "font-size": "1.25em", "width":"90%", "margin-left":"5%", "margin-right":"5%", "padding-top": "10px"}}
                        symbolStyle={{"width": "8%", "margin-top": "4px"}}
                        messageBoxStyle={{width: "80%"}}
                        closeButtonStyle={{width: "8%", "margin-top": "4px"}}
                        outterContainerStyle={{position: "inherit"}}
                        style={{"margin-bottom":"5px"}}
                    />
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
