import React from 'react';
import { Link, Redirect } from 'react-router-dom';
import Popup from 'reactjs-popup';
import './css/SignIn/ForgotPassword.css';
import style from './css/SignIn/ForgotPassword.module.css';
import {apiPostJsonRequest} from './StaticFunctions/ApiFunctions.js';
import Alert from './Alert.js';
import {generateInput} from './StaticFunctions/ReusableHtmlFunctions.js';

// documentation for PopUp https://react-popup.elazizi.com/component-api/
class ForgotPasswordPopup extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            open: true,
            username: "",
            usernameError: "",
            password: "",
            passwordError: "",
            password2: "",
            password2Error: "",
            messages: [],
            messageId: -1,
            showVerificationPage: false,
            showPasswordInput: false,
            verificationCode: "",
            verificationError: "",
            awaitingResults: false,
            lockVerificationInput: false,
            resends: 0,
            resendingCode: false,
            authenticated: false
        };

        this.closeModal = this.closeModal.bind(this);
        this.changeHandler = this.changeHandler.bind(this);
        this.requestVerificationCode = this.requestVerificationCode.bind(this);
        this.verificationResultsHandler = this.verificationResultsHandler.bind(this);
        this.showLoginPopUp = this.showLoginPopUp.bind(this);
        this.generateUserNameInputForm = this.generateUserNameInputForm.bind(this);
        this.generateVerificationForm = this.generateVerificationForm.bind(this);
        this.sendVerification = this.sendVerification.bind(this);
        this.requestCodeResultsHandler = this.requestCodeResultsHandler.bind(this);
        this.resendVerificationCode = this.resendVerificationCode.bind(this);
        this.generatePasswordInputForm = this.generatePasswordInputForm.bind(this);
        this.sendNewPassword = this.sendNewPassword.bind(this);
        this.updatePasswordResultsHandler = this.updatePasswordResultsHandler.bind(this);
    }

    closeModal() {
        this.props.removeFunction();
    }

    showLoginPopUp() {
        this.props.showLoginPopUp();
        this.closeModal();
    }

    // function called when CREATE AN ACCOUNT button is clicked
    // to validate that the fields are correct and handle sending
    // data to server
    async requestVerificationCode(event) {
        event.preventDefault();
        let error = false;
        // checks to see if email in format string@string.string
        let validEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.state.email);

        if(this.state.username.length < 6 || this.state.username.length > 30)
        {
            this.setState({usernameError: "Username or email must be between 6-30 characters"});
            error = true;
        }
        else if(this.state.username.length > 20)
        {
            let validEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.state.username);
            if(!validEmail || !this.state.username.includes("@"))
            {
                this.setState({usernameError: "If the entered value is an email, the email provided " +
                                " is not a valid email address.  Otherwise, the username cannot be "
                                + "more than 20 characters."});
                error = true;
            }
        }
        else
        {
            this.setState({usernameError: ""});
        }

        if(!error)
        {
            let params = {
                username: this.state.username
            };
            let url = "/login/forgot_password";
            this.setState({
                awaitingResults: true,
                messageId: -1
            });
            apiPostJsonRequest(url, params).then((result)=>{
                let status = result[0];
                let message = result[1].message;
                let requester = result[1].requester;
                this.requestCodeResultsHandler(status, message, requester, false);
            });
        }
    }

    async resendVerificationCode(event) {
        event.preventDefault();
        let error = false;
        if(!error)
        {
            let params = {
                username: this.state.username
            };
            let url = "/login/forgot_password";
            this.setState({
                awaitingResults: true,
                messageId: -1,
                resendingCode: true
            });
            apiPostJsonRequest(url, params).then((result)=>{
                let status = result[0];
                let message = result[1].message;
                let requester = result[1].requester;
                this.requestCodeResultsHandler(status, message, requester, true);
            });
        }
    }

    requestCodeResultsHandler(status, message, requester, resend)
    {
        let resultFound = true;
        if(status === 201)
        {
            let state = {
                showVerificationPage: true,
                awaitingResults: false,
                messages: [{type: "success", message: message, timeout: 5000}],
                messageId: this.state.messageId + 1,
                lockVerificationInput: false
            };
            if(resend)
            {
                state["messages"] = [{type: "success", message: message, timeout: 5000}];
                state["messageId"] = this.state.messageId + 1;
                state["resends"] = this.state.resends + 1;
                state["resendingCode"] = false;
            }
            this.setState(state);
            this.props.updateLoggedIn(requester);
        }
        else if(status === 401)
        {
            this.props.updateLoggedIn(requester);
            // tested
            // tested resend
            if(message === "User account tempoarily locked due to too many verification attempts")
            {
                this.props.setMessages({
                    messages: [{type: "failure", message: message}],
                    clearMessages: true
                });
                this.closeModal();
            }
            else if(message === "User already logged in")
            {
                this.props.setMessages({
                    messages: [{type: "info", message: "You are already logged in"}],
                    clearMessages: true
                });
                this.closeModal();
            }
            else
            {
                resultFound = false;
            }

        }
        else if(status === 400)
        {
            this.props.updateLoggedIn(requester);
            // tested
            // tested 2
            if(message === "Username or email address is invalid")
            {
                this.setState({
                    usernameError: message,
                    awaitingResults: false,
                    showVerificationPage: false,
                    resendingCode: false,
                    resends: 0
                });
            }
            else
            {
                resultFound = false;
            }
        }
        else if(status === 404)
        {
            this.props.updateLoggedIn(requester);
            // tested
            if(message === "The username or email provided does not exist")
            {
                this.setState({
                    usernameError: message,
                    awaitingResults: false,
                    showVerificationPage: false,
                    resends: 0,
                    resendingCode: false
                });
            }
            // tested
            else if(message === "The login path sent to the server does not exist")
            {
                console.log(message);
                this.props.setMessages({
                    messages: [{type: "failure", message: message}],
                    clearMessages: true
                });
                this.closeModal();
            }
            // tested
            // tested 2
            else
            {
                /*
                    "Could not send another verification code as the maximum number "
                     + "of codes to send out (3) has been met.  Another code can be sent "
                     + "within 10 minutes.";
                */
                if(resend)
                {
                    this.setState({
                        messages: [{type: "warning", message: message, timeout: 0}],
                        messageId: this.state.messageId + 1,
                        awaitingResults: false,
                        resends: 2,
                        resendingCode: false
                    });
                }
                else
                {
                    this.props.setMessages({
                        messages: [{type: "failure", message: message}],
                        clearMessages: true
                    });
                    this.closeModal();
                }
            }
        }
        else if(status === 500)
        {
            this.setState({
                usernameError: "",
                messageId: this.state.messageId + 1,
                messages: [{type: "failure", message: message, timeout: 0}],
                awaitingResults: false,
                resendingCode: false
            });
            this.props.updateLoggedIn(requester);
        }
        else
        {
            resultFound = false;
        }
        if(!resultFound)
        {
            let output = "Some unexpected " + status + " code was returned by the server";
            this.setState({
                messageId: this.state.messageId + 1,
                messages: [{type: "failure", message: output, timeout: 0}],
                awaitingResults: false,
                resendingCode: false
            });
            this.props.updateLoggedIn(requester);
        }
    }


    // function called when CREATE AN ACCOUNT button is clicked
    // to validate that the fields are correct and handle sending
    // data to server
    async sendVerification(event) {
        event.preventDefault();
        let error = false;
        if(this.state.lockVerificationInput)
        {
            return;
        }
        if(this.state.verificationCode.length < 6)
        {
            this.setState({verificationError: "The verification code must be 6 digits"});
            error = true;
        }
        else if(isNaN(this.state.verificationCode))
        {
            this.setState({verificationError: "The verification code is invalid"});
            error = true;
        }

        if(!error)
        {
            let params = {
                username: this.state.username,
                verificationCode: this.state.verificationCode
            };
            let url = "/login/validate_passcode";
            this.setState({
                awaitingResults: true,
                messageId: -1
            });
            apiPostJsonRequest(url, params).then((result)=>{
                let status = result[0];
                let message = result[1].message;
                let requester = result[1].requester;
                this.verificationResultsHandler(status, message, requester, "verification");
            });
        }
    }

    verificationResultsHandler(status, message, requester)
    {
        let resultFound = true;
        if(status === 200)
        {
            this.setState({
                showVerificationPage: false,
                awaitingResults: false,
                showPasswordInput: true
            });
        }
        else if(status === 401)
        {
            this.props.updateLoggedIn(requester);
            // tested
            if(message === "Verification code is invalid")
            {
                this.setState({
                    verificationError: message,
                    resendingCode: false,
                    awaitingResults: false,
                    verificationCode: ""
                });
            }
            // tested
            else if(message === "User account tempoarily locked due to too many verification attempts")
            {
                this.props.setMessages({
                    messages: [{type: "failure", message: message}],
                    clearMessages: true
                });
                this.closeModal();
            }
            else if(message === "User already logged in")
            {
                this.props.setMessages({
                    messages: [{type: "info", message: "You are already logged in"}],
                    clearMessages: true
                });
                this.closeModal();
            }
            // tested
            else if(message === "Verification code is invalid.  User account tempoarily locked due to too many verification attempts")
            {
                this.props.setMessages({
                    messages: [{type: "failure", message: message}],
                    clearMessages: true
                });
                this.closeModal();
            }
            // tested
            else if(message === "Verification code is invalid.  Verification code is no longer valid so user must "
                      + "request that a new verification code is sent out.")
            {
                let output = " Verification code is no longer valid so user must "
                            + "request that a new verification code is sent out."
                this.setState({
                    verificationError: "Verification code is invalid",
                    messages: [{type: "failure", message: output, timeout: 0}],
                    messageId: this.state.messageId + 1,
                    awaitingResults: false,
                    resendingCode: false,
                    lockVerificationInput: true,
                    verificationCode: ""
                });
            }
            // tested
            else if(message === "Verification code is invalid.  Verification code is no longer valid.  User may try to " +
                      "get a new verification code in 10 minutes as the limit of (3) codes have been sent out recently")
            {
                this.props.setMessages({
                    messages: [{type: "failure", message: message}],
                    clearMessages: true
                });
                this.closeModal();
            }
            else
            {
                resultFound = false;
            }

        }
        else if(status === 400)
        {
            this.props.updateLoggedIn(requester);
            // tested
            if(message === "Username or email address is invalid")
            {
                this.setState({
                    usernameError: message,
                    showVerificationPage: false,
                    awaitingResults: false,
                    resendingCode: false,
                    resends: 0,
                    verificationCode: ""
                });
            }
            // tested
            else if(message === "Verification code invalid")
            {
                this.setState({
                    verificationError: message,
                    awaitingResults: false,
                    resendingCode: false,
                    verificationCode: ""
                });
            }
            else
            {
                resultFound = false;
            }
        }
        else if(status === 404)
        {
            this.props.updateLoggedIn(requester);
            // tested both scenarios
            if(message === "Could not find a user with the given email and username that has a valid active verification code"
                || message === "The username or email provided does not exist")
            {
                this.setState({
                    messageId: this.state.messageId + 1,
                    messages: [{type: "failure", message: message, timeout: 0}],
                    awaitingResults: false,
                    resendingCode: false,
                    showVerificationPage: false,
                    resends: 0,
                    verificationCode: ""
                });
            }
            else
            {
                resultFound = false;
            }
        }
        else
        {
            resultFound = false;
        }
        if(!resultFound)
        {
            let output = "Some unexpected " + status + " code was returned by the server";
            this.setState({
                messageId: this.state.messageId + 1,
                messages: [{type: "failure", message: output, timeout: 0}],
                awaitingResults: false,
                resendingCode: false,
                verificationError: "",
                verificationCode: ""
            });
            this.props.updateLoggedIn(requester);
        }
    }

    async sendNewPassword(event) {
        event.preventDefault();
        let error = false;
        // first check to make sure fields not empty
        if(!this.state.password || !this.state.password2)
        {
            if(!this.state.password)
            {
                this.setState({passwordError: "You must enter a new password"});
                error = true;
            }
            else
            {
                this.setState({passwordError: ""});
            }

            if(!this.state.password2)
            {
                this.setState({password2Error: "You must enter the new password twice"});
                error = true;
            }
            else
            {
                this.setState({password2Error: ""});
            }
        }
        else
        {
            if(this.state.password.length < 6 || this.state.password.length > 15)
            {
                this.setState({
                    passwordError: "Your password must be between 6-15 characters characters",
                    password2Error: ""
                });
                error = true;
            }
            // see if new password is the same as the old one
            else if(this.state.password !== this.state.password2)
            {
                this.setState({
                    password2Error: "This password does not match the new password",
                    passwordError: "",
                });
                error = true;
            }
            else
            {
                this.setState({
                    passwordError: "",
                    password2Error: ""
                });
            }
        }

        if(!error)
        {
            let params = {
                password: this.state.password 
            };
            this.setState({
                awaitingResults: true,
                messageId: -1
            });
            let url = "/profile/" + this.state.username + "/reset_password";
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
            // requester will be who requested the change but not logged in at this point
            this.props.updateLoggedIn("");
            this.closeModal();
        }
        else
        {
            if(status === 400)
            {
                //this.props.updateLoggedIn(requester);
                // tested
                if(message === "New password must be betweeen 6-15 characters")
                {
                    this.setState({
                        passwordError: message,
                        password2Error: "",
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
                // tested
                if(message === "The user passed in the url does not match the cookie")
                {
                    this.props.setMessages({
                        messages: [{type: "failure", message: message}],
                        clearMessages: true
                    });
                    this.props.updateLoggedIn(requester);
                    this.closeModal();
                }
                // tested
                else if(message === "You are not logged in")
                {
                    this.props.setMessages({
                        messages: [{type: "failure", message: message}],
                        clearMessages: true
                    });
                    this.props.updateLoggedIn(requester);
                    this.closeModal();
                }
                else if(message === "You do not have permission to update a users password as the cookie is invalid")
                {
                    this.props.setMessages({
                        messages: [{type: "failure", message: message}],
                        clearMessages: true
                    });
                    this.props.updateLoggedIn(requester);
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
                // tested
                if(message === "Could not find the user to update")
                {
                    this.props.updateLoggedIn(requester);
                    this.props.setMessages({
                        messages: [{type: "failure", message: message}],
                        clearMessages: true
                    });
                    this.closeModal();
                }
                // tested
                else if(message === "The profile path sent to the server does not exist")
                {
                    this.props.updateLoggedIn(requester);
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
            else if(status === 500)
            {
                // somewhat tested in resetPassword function
                this.props.updateLoggedIn(requester);
                this.setState({
                    messages: [{type: "failure", message: message, timeout: 0}],
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
                let output = "Some unexpected " + status + " code was returned by the server";
                this.setState({
                    messages: [{type: "failure", message: output}],
                    messageId: this.state.messageId + 1,
                    awaitingResults: false
                });
            }
        }
    }

    changeHandler(event) {
        let name = event.target.name;
        let value = event.target.value;
        this.setState({[name]: value});
    }

    generateUserNameInputForm()
    {
        let config = {
            label: "Username",
            type: "text",
            name: "username",
            form: "form1",
            value: this.state.username,
            changeHandler: this.changeHandler,
            maxLength: 30,
            error: this.state.usernameError
        };
        let usernameInput = generateInput(config, style);

        return (
            <React.Fragment>
                <div className="content">
                    <form id="form1" onSubmit={this.requestVerificationCode} noValidate/>
                    {usernameInput}
                </div>
                <div className="actions">
                    <button
                        form="form1"
                        value="create_account"
                        className="submitButton"
                        onClick={this.requestVerificationCode}
                    >Send Verification Code
                    </button>
                </div>
            </React.Fragment>);
    }

    generateLoadingContent(message)
    {
        let content =  (
            <React.Fragment>
                <div className="content">
                    <div className={style.infoTextContainer}>
                        {message}<br/>
                    </div>
                    <div className={style.loadingContainer}>
                        <div className={style.loader}></div>
                    </div>
                </div>
            </React.Fragment>
        );
        return content;
    }

    generateVerificationForm()
    {
        let config = {
            label: "Verification Code:",
            type: "text",
            name: "verificationCode",
            form: "form2",
            value: this.state.verificationCode,
            changeHandler: this.changeHandler,
            maxLength: 6,
            autocomplete: "off",
            disabled: this.state.lockVerificationInput,
            error: this.state.verificationError,
            inputStyle: `${style.verificationInput}`,
            errorTextStyle: `${style.verificationErrorText}`
        };
        let verificationInput = generateInput(config, style);
        
        // add text saying email sent to...
        let resendButton = (
            <div className={style.verificationButtonContainer}>
                <button
                    form="form2"
                    value="create_account"
                    className="submitButton"
                    onClick={this.resendVerificationCode}
                >RESEND VERIFICATION CODE
                </button>
            </div>
        );
        if(this.state.resends >= 2)
        {
            resendButton = "";
        }
        let content = (
            <React.Fragment>
                <div className="content">
                    <form id="form2" onSubmit={this.requestVerificationCode} noValidate/>
                    <div className={style.verificationContainer}>
                        {verificationInput}
                    </div>
                </div>
                <div className="actions">
                    <div className={style.verificationButtonContainer}>
                        <button
                            form="form2"
                            value="create_account"
                            className="submitButton"
                            onClick={this.sendVerification}
                        >VERIFY ACCOUNT
                        </button>
                    </div>
                    {resendButton}
                </div>
            </React.Fragment>);
        return content;
    }

    generatePasswordInputForm()
    {
        let config = {
            label: "New Password:",
            type: "password",
            name: "password",
            form: "form3",
            value: this.state.password,
            changeHandler: this.changeHandler,
            maxLength: 20,
            error: this.state.passwordError
        };
        let passwordInput = generateInput(config, style);
        config.label = "Repeat New Password:";
        config.name = "password2";
        config.value = this.state.password2;
        config.error = this.state.password2Error;
        let passwordInput2 = generateInput(config, style);

        return (
            <React.Fragment>
                <div className="content">
                    <form id="form3" onSubmit={this.sendNewPassword} noValidate/>
                    {passwordInput}
                    {passwordInput2}
                </div>
                <div className="actions">
                    <button
                        form="form3"
                        value="update_password"
                        className="submitButton"
                        onClick={this.sendNewPassword}
                    >Update Password
                    </button>
                </div>
            </React.Fragment>);
    }


    render() {
        let content;
        let className = "forgotPass";
        if(!this.state.showVerificationPage && !this.state.awaitingResults && !this.state.showPasswordInput)
        {
            content = this.generateUserNameInputForm();
        }
        else if(!this.state.showPasswordInput && !this.state.showVerificationPage && this.state.awaitingResults)
        {
            className = "verification";
            content = this.generateLoadingContent("Processing request...");
        }
        else if(this.state.showVerificationPage && !this.state.awaitingResults && !this.state.resendingCode)
        {
            className = "verification";
            content = this.generateVerificationForm();
        }
        else if(this.state.showVerificationPage && this.state.awaitingResults && !this.state.resendingCode)
        {
            className = "verification";
            content = this.generateLoadingContent("Verifying code...");
        }
        else if(this.state.showVerificationPage && this.state.awaitingResults && this.state.resendingCode)
        {
            className = "verification";
            content = this.generateLoadingContent("Resending verification code...");
        }
        else if(this.state.showPasswordInput && !this.state.awaitingResults)
        {
            content = this.generatePasswordInputForm();
        }
        else if(this.state.showPasswordInput && this.state.awaitingResults)
        {
            content = this.generateLoadingContent("Updating password...");
        }

        return (
            <div>
                <Popup
                    open={this.state.open}
                    closeOnDocumentClick
                    onClose={this.closeModal}
                    className={className}
                    >
                    <div className="modal">
                        {/* &times is the multiplication symbol (x) --> */}
                        <a className="close" onClick={this.closeModal}>
                        &times;
                        </a>
                        <div className="header">
                            <h3 className="inlineH3"> Forgot Password </h3>
                        </div>
                        <div className={style.alertContent}>
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
                        </div>
                        {content}
                    </div>
                </Popup>
            </div>
        );
    }
}


export default ForgotPasswordPopup;
