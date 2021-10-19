import React from 'react';
import { Link, Redirect } from 'react-router-dom';
import Popup from 'reactjs-popup';
import './css/SignIn/ForgotPassword.css';
import style from './css/SignIn/ForgotPassword.module.css';
import {apiPostJsonRequest} from './StaticFunctions/ApiFunctions.js';
import Alert from './Alert.js';

// documentation for PopUp https://react-popup.elazizi.com/component-api/
class ForgotPasswordPopup extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            open: true,
            username: "",
            usernameError: "",
            messages: [],
            messageId: -1,
            showVerificationPage: false,
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
        this.generateUserNameInput = this.generateUserNameInput.bind(this);
        this.generateUserNameInputForm = this.generateUserNameInputForm.bind(this);
        this.generateVerificationForm = this.generateVerificationForm.bind(this);
        this.generateVerificationInput = this.generateVerificationInput.bind(this);

        this.sendVerification = this.sendVerification.bind(this);
        this.requestCodeResultsHandler = this.requestCodeResultsHandler.bind(this);
        this.resendVerificationCode = this.resendVerificationCode.bind(this);
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
            this.setState({created: true});
            this.props.setMessages({
                messages: [{type: "success", message: "User successfully authenticated!"}],
                clearMessages: true
            });
            this.props.updateLoggedIn(requester);
            this.closeModal();
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

    changeHandler(event) {
        let name = event.target.name;
        let value = event.target.value;
        this.setState({[name]: value});
    }

    generateUserNameInput()
    {
        let usernameInput =  (
                <div className={style.usernameInputContainer}>
                    <div className={style.inputLabel}>
                        <h4 className={style.inputFieldH4} id="validLabel">Username</h4>
                    </div>
                    <input
                        type="text"
                        name="username"
                        form = "form1"
                        maxLength = {30}
                        className={`inputFieldBoxLong validInputBox ${style.usernameInput}`}
                        onChange={this.changeHandler}
                        value={this.state.username}
                    />
                </div>);
        if(this.state.usernameError)
        {
            usernameInput = (
                <div className={style.usernameInputContainer}>
                    <div className={style.inputLabel}>
                        <h4 className={`${style.inputFieldH4} errorLabel`}>Username</h4>
                    </div>
                    <input
                        type="text"
                        name="username"
                        form = "form1"
                        maxLength = {30}
                        className={`inputFieldBoxLong inputBoxError ${style.usernameInput}`}
                        onChange={this.changeHandler}
                        value={this.state.username}
                    />
                    <small className={`errorTextSmall ${style.errorText}`}>{this.state.usernameError}</small>
                </div>);
        }
        return usernameInput;
    }

    generateVerificationInput()
    {
        let verificationInput =  (
            <React.Fragment>
                <label>
                    <h4 className={style.inputFieldH4} id="validLabel">Verification Code:</h4>
                </label>
                <div className={style.verificationInputContainer}>
                    <input
                        type="text"
                        name="verificationCode"
                        form = "form2"
                        autocomplete="off"
                        maxLength = {6}
                        disabled={this.state.lockVerificationInput}
                        className={`inputFieldBoxLong validInputBox ${style.verificationInput}`}
                        onChange={this.changeHandler}
                    />
                </div>
            </React.Fragment>);
        if(this.state.verificationError)
        {
            verificationInput = (
                <React.Fragment>
                    <label>
                        <h4 className={`${style.inputFieldH4} errorLabel`}>Verification Code:</h4>
                    </label>
                    <div className={style.verificationInputContainer}>
                        <input
                            type="text"
                            name="verificationCode"
                            form = "form2"
                            maxLength = {6}
                            autocomplete="off"
                            disabled={this.state.lockVerificationInput}
                            className={`inputFieldBoxLong inputBoxError ${style.verificationInput}`}
                            onChange={this.changeHandler}
                        />
                    </div>
                    <small className="errorTextSmall">{this.state.verificationError}</small>
                </React.Fragment>);
        }
        return verificationInput;
    }

    generateUserNameInputForm()
    {
        let usernameInput = this.generateUserNameInput();

        return (
            <React.Fragment>
                <div className="content">
                    <form id="form1" onSubmit={this.requestVerificationCode} noValidate/>
                    <div className="inputFieldContainer">
                        {usernameInput}
                    </div>
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
        let verificationInput = this.generateVerificationInput();
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


    render() {
        let content;
        let className = "forgotPass";
        if(!this.state.showVerificationPage && !this.state.awaitingResults)
        {
            content = this.generateUserNameInputForm();
        }
        else if(!this.state.showVerificationPage && this.state.awaitingResults)
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
