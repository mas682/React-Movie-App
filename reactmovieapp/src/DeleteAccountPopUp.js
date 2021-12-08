import React from 'react';
import { Link, Redirect } from 'react-router-dom';
import Popup from 'reactjs-popup';
import style from './css/SettingsForm/UserSettings.module.css';
import './css/forms.css';
import {apiPostJsonRequest} from './StaticFunctions/ApiFunctions.js';
import Alert from './Alert.js';
import './css/SettingsForm/DeleteAccountPopUp.css';


class DeleteAccountPopUp extends React.Component {
    constructor(props) {
        super(props);
        this.state ={
            open: true,
            username: props.username,
            password: "",
            passwordError: "",
            messages: "",
            messageId: -1
        };
        this.callApi = this.callApi.bind(this);
        this.validateForm = this.validateForm.bind(this);
        this.closeModal = this.closeModal.bind(this);
        this.changeHandler = this.changeHandler.bind(this);
        this.apiResultsHandler = this.apiResultsHandler.bind(this);
    }

    async callApi()
    {
        let parameters = {
            password: this.state.password
        };
        let url = "/profile/" + this.state.username + "/delete_user";
        let result = await apiPostJsonRequest(url, parameters);
        let status = result[0];
        let message = result[1].message;
        let requester = result[1].requester;
        this.apiResultsHandler(status, message, requester);
    }

    apiResultsHandler(status, message, requester)
    {
        if(status === 200)
        {
            this.props.updateLoggedIn(requester);
            this.closeModal();
        }
        else
        {
            this.props.updateLoggedIn(requester);
            if(status === 401)
            {
                if(message.startsWith("Requesting users account is currently suspended"))
                {
                    this.props.setMessages({
                        messages: [{type: "failure", message: message}],
                        clearMessages: true
                    });
                }
                else if(message.startsWith("Requesting users password is currently locked"))
                {
                    this.setState({
                        messages: [{type: "failure", message: message}],
                        messageId: this.state.messageId + 1
                    });
                }
                else if(message !== "You are not logged in")
                {
                    // you are logged in, but the password provided in incorrect
                    this.setState({
                        messages: [{type: "failure", message: message}],
                        messageId: this.state.messageId + 1
                    });
                }
                else
                {
                    this.props.setMessages({
                        messages: [{type: "failure", message: message}],
                        clearMessages: true
                    });
                }
            }
            else if(status === 400)
            {
                if(message.startsWith("Password must be between 10-30 characters"))
                {
                    this.setState({
                        passwordError: message
                    });
                }
                else
                {
                    // username in url not correct
                    // display alert with message as username to remove is invalid
                    this.setState({
                        messages: [{type: "failure", message: message}],
                        messageId: this.state.messageId + 1
                    });
                }
            }
            else if(status === 404)
            {
                if(message === "Could not find the requesting users account")
                {
                    this.props.setMessages({
                        messages: [{type: "failure", message: message}],
                        clearMessages: true
                    });
                }
                else
                {
                    this.setState({
                        messages: [{type: "failure", message: message}],
                        messageId: this.state.messageId + 1
                    });
                }
            }
            else
            {
                this.setState({
                    messages: [{type: "failure", message: message}],
                    messageId: this.state.messageId + 1
                });
            }
        }
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
        if(!this.state.password)
        {
            if(!this.state.password)
            {
                this.setState({passwordError: "Your password is required"});
                error = true;
            }
            else
            {
                this.setState({passwordError: ""});
            }
        }
        else
        {
            // boolean to override other checks
            let priority = false;
            let regex = new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[-#!\$@%\^&*\(\)_+\|~=\`\{\}\\[\\]:\"`;'<>\?,\./\\\\])(?=.{10,30})");
            if(!regex.test(this.state.password))
            {
                this.setState({
                    passwordError: "Password must be between 10-30 characters, contain at least 1 lowercase character, at least 1 uppercase character," + 
                    "at least 1 number, and at least 1 special character"
                });
                error = true;
            }
            else
            {
                this.setState({
                    passwordError: "",
                });
            }
        }
        if(!error)
        {
            let updateResult = await this.callApi();
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
                            form="form2"
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
                            form="form2"
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

        let passwordInput = this.generateInput("password", "Enter password:");

        return (
            <div>
                <Popup
                    open={this.state.open}
                    closeOnDocumentClick
                    onClose={this.closeModal}
                    className={"deleteAccount"}
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
                        <h3 className="inlineH3"> Delete account </h3>
                    </div>
                    <div className="content">
                        <form id="form2" onSubmit={this.validateForm} noValidate/>
                        {passwordInput}
                    </div>
                    <div className="actions">
                        <button
                            form="form2"
                            value="remove_account"
                            className={`${style.submitButton} ${style.submitButtonColor}`}
                            onClick={this.validateForm}
                        >Delete Account</button>
                    </div>

                </div>
                </Popup>
            </div>
        );
    }

}

export default DeleteAccountPopUp;
