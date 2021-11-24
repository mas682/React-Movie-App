import React from 'react';
import { Link, Redirect } from 'react-router-dom';
import Popup from 'reactjs-popup';
import './css/signup.css';
import style from './css/signup.module.css';
import {apiPostJsonRequest} from './StaticFunctions/ApiFunctions.js';
import Alert from './Alert.js';

// documentation for PopUp https://react-popup.elazizi.com/component-api/
class SignUpPopup extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            open: true,
            username: "",
            firstName: "",
            lastName: "",
            email: "",
            password: "",
            usernameError: "",
            firstNameError: "",
            lastNameError: "",
            emailError: "",
            passwordError: "",
            messages: [],
            messageId: -1,
            showResendInput: false,
            showVerificationPage: false,
            verificationCode: "",
            verificationError: "",
            awaitingResults: false,
            lockVerificationInput: false,
            resendingCode: false,
            created: false
        };

        this.closeModal = this.closeModal.bind(this);
        this.changeHandler = this.changeHandler.bind(this);
        this.validateRegistration = this.validateRegistration.bind(this);
        this.verificationResultsHandler = this.verificationResultsHandler.bind(this);
        this.showLoginPopUp = this.showLoginPopUp.bind(this);
        this.generateUserNameInput = this.generateUserNameInput.bind(this);
        this.generateFirstNameInput = this.generateFirstNameInput.bind(this);
        this.generateLastNameInput = this.generateLastNameInput.bind(this);
        this.generateEmailInput = this.generateEmailInput.bind(this);
        this.generatePasswordInput = this.generatePasswordInput.bind(this);
        this.generateCreateUserForm = this.generateCreateUserForm.bind(this);
        this.generateVerificationForm = this.generateVerificationForm.bind(this);
        this.generateVerificationInput = this.generateVerificationInput.bind(this);
        this.showResendInput = this.showResendInput.bind(this);
        this.validateVerification = this.validateVerification.bind(this);
        this.registrationResultsHandler = this.registrationResultsHandler.bind(this);
        this.resendVerificationCode = this.resendVerificationCode.bind(this);
    }

    closeModal() {
        this.setState({open: false});
        this.props.removeFunction();
    }

    showLoginPopUp() {
        this.props.showLoginPopUp();
        this.closeModal();
    }

    showResendInput() {
        this.setState({
            showResendInput: true
        });
    }

    // function called when CREATE AN ACCOUNT button is clicked
    // to validate that the fields are correct and handle sending
    // data to server
    async validateRegistration(event) {
        event.preventDefault();
        let error = false;
        // checks to see if email in format string@string.string
        let validEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.state.email);
        // if firstName is empty
        if(!this.state.firstName)
        {
            this.setState({firstNameError: "First name must be between 1-20 characters"});
            error = true;
        }
        else
        {
            this.setState({firstNameError: ""});
        }

        if(this.state.username.length < 6 || this.state.username.length > 20)
        {
            this.setState({usernameError: "Username must be between 6-20 characters"});
            error = true;
        }
        else
        {
            this.setState({usernameError: ""});
        }

        // if lastName is empty
        if(!this.state.lastName)
        {
            this.setState({lastNameError: "Last name must be between 1-20 characters"});
            error = true;
        }
        else
        {
            this.setState({lastNameError: ""});
        }

        if(this.state.email.length < 7 || this.state.email.length > 30)
        {
            this.setState({emailError: "The email provided is not a valid email address"});
            error = true;
        }
        else if(!this.state.email.includes("@") | !validEmail)
        {
            this.setState({emailError: "The email provided is not a valid email address"});
            error = true;
        }
        else
        {
            this.setState({emailError: ""});
        }

        // if password lenght < 8
        if(this.state.password.length < 6 || this.state.password.length > 15)
        {
            this.setState({passwordError: "Password must be between 6-15 characters"});
            error = true;
        }
        else
        {
            this.setState({passwordError: ""})
        }
        if(!error)
        {
            let params = {
                username: this.state.username,
                firstName: this.state.firstName,
                lastName: this.state.lastName,
                email: this.state.email,
                password: this.state.password
            };
            let url = "/signup/register";
            this.setState({
                awaitingResults: true,
                messageId: -1
            });
            apiPostJsonRequest(url, params).then((result)=>{
                let status = result[0];
                let message = result[1].message;
                let requester = result[1].requester;
                this.registrationResultsHandler(status, message, requester);
            });
        }
    }

    registrationResultsHandler(status, message, requester)
    {
        let resultFound = true;
        if(status === 201)
        {
            this.setState({
                showVerificationPage: true,
                awaitingResults: false
            });
            this.props.updateLoggedIn(requester);
        }
        else if(status === 401)
        {
            this.props.setMessages({
                messages: [{type: "info", message: "You are already logged in"}],
                clearMessages: true
            });
            this.props.updateLoggedIn(requester);
            this.closeModal();
        }
        else if(status === 409)
        {
            this.props.updateLoggedIn(requester);
            if(message === "Username is already in use")
            {
                this.setState({
                    usernameError: "This username is already in use",
                    emailError: "",
                    passwordError: "",
                    firstNameError: "",
                    lastNameError: "",
                    awaitingResults: false
                });
            }
            else if(message === "Email already associated with a user")
            {
                this.setState({
                    emailError: "This email address is already in use",
                    usernameError: "",
                    passwordError: "",
                    firstNameError: "",
                    lastNameError: "",
                    awaitingResults: false
                });
            }
            else
            {
                resultFound = false;
            }
        }
        else if(status === 400)
        {
            this.props.updateLoggedIn(requester);
            if(message === "Username must be between 6-20 characters")
            {
                this.setState({
                    usernameError: message,
                    emailError: "",
                    passwordError: "",
                    firstNameError: "",
                    lastNameError: "",
                    awaitingResults: false
                });
            }
            else if(message === "The email provided is not a valid email address")
            {
                this.setState({
                    emailError: message,
                    usernameError: "",
                    passwordError: "",
                    firstNameError: "",
                    lastNameError: "",
                    awaitingResults: false
                });
            }
            else if(message === "Password must be betweeen 6-15 characters")
            {
                this.setState({
                    emailError: "",
                    usernameError: "",
                    passwordError: message,
                    firstNameError: "",
                    lastNameError: "",
                    awaitingResults: false
                });
            }
            else if(message === "First name must be between 1-20 characters")
            {
                this.setState({
                    emailError: "",
                    usernameError: "",
                    passwordError: "",
                    firstNameError: message,
                    lastNameError: "",
                    awaitingResults: false
                });
            }
            else if(message === "Last name must be between 1-20 characters")
            {
                this.setState({
                    emailError: "",
                    usernameError: "",
                    passwordError: "",
                    firstNameError: "",
                    lastNameError: message,
                    awaitingResults: false
                });
            }
            else
            {
                resultFound = false;
            }
        }
        else if(status === 500)
        {
            this.setState({
                lastNameError: "",
                usernameError: "",
                emailError: "",
                passwordError: "",
                firstNameError: "",
                messageId: this.state.messageId + 1,
                messages: [{type: "failure", message: message, timeout: 0}],
                awaitingResults: false
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
                resendingCode: false,
                verificationError: ""
            });
            this.props.updateLoggedIn(requester);
        }
    }


    // function called when CREATE AN ACCOUNT button is clicked
    // to validate that the fields are correct and handle sending
    // data to server
    async validateVerification(event) {
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
                email: this.state.email,
                verificationCode: this.state.verificationCode
            };
            let url = "/signup/verify_account";
            this.setState({
                awaitingResults: true,
                messageId: -1
            });
            apiPostJsonRequest(url, params).then((result)=>{
                let status = result[0];
                let message = result[1].message;
                let requester = result[1].requester;
                this.verificationResultsHandler(status, message, requester, "creation");
            });
        }
    }

    async resendVerificationCode(event) {
        event.preventDefault();
        let error = false;
        if(!error)
        {
            let params = {
                email: this.state.email
            };
            let url = "/signup/resend_verification_code";
            this.setState({
                awaitingResults: true,
                messageId: -1,
                resendingCode: true
            });
            apiPostJsonRequest(url, params).then((result)=>{
                let status = result[0];
                let message = result[1].message;
                let requester = result[1].requester;
                this.verificationResultsHandler(status, message, requester, "resend");
            });
        }
    }

    verificationResultsHandler(status, message, requester, type)
    {
        let resultFound = true;
        if(status === 201)
        {
            if(type === "creation")
            {
                this.setState({created: true});
                this.props.setMessages({
                    messages: [{type: "success", message: "Account successfully created!"}],
                    clearMessages: true
                });
                this.props.updateLoggedIn(requester);
                this.closeModal();
            }
            else
            {
                this.setState({
                    messageId: this.state.messageId + 1,
                    messages: [{type: "info", message: message, timeout: 0}],
                    awaitingResults: false,
                    showVerificationPage: true,
                    showResendInput: false,
                    resendingCode: false,
                    lockVerificationInput: false,
                    verificationCode: ""
                });
            }
        }
        else if(status === 401)
        {
            if(message === "You are already logged in so you must have an account")
            {
                this.props.setMessages({
                    messages: [{type: "info", message: "You are already logged in"}],
                    clearMessages: true
                });
                this.closeModal();
            }
            else if(message === "Verification code is invalid.  The maximum of 3 verification attempts met for the current code")
            {
                let output ="The maximum of 3 verification attempts for the current code has been " +
                            "reached.  Either try to resend the code or try to sign up again.";
                this.setState({
                    messageId: this.state.messageId + 1,
                    messages: [{type: "failure", message: output, timeout: 0}],
                    verificationError: "Verification code is invalid",
                    awaitingResults: false,
                    resendingCode: false,
                    lockVerificationInput: true,
                    verificationCode: ""
                });
            }
            else if(message === "Verification code is invalid")
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
            this.props.updateLoggedIn(requester);
        }
        else if(status === 400)
        {
            this.props.updateLoggedIn(requester);
            if(message === "The email provided is not a valid email address")
            {
                this.setState({
                    emailError: message,
                    showVerificationPage: false,
                    awaitingResults: false,
                    resendingCode: false,
                    verificationCode: ""
                });
            }
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
            if(message === "Could not find a user with the provided email")
            {
                let output = "Could not find a user with the given email " +
                            "that has a valid active verification code.  Please try to sign up again.";
                this.setState({
                    messageId: this.state.messageId + 1,
                    messages: [{type: "failure", message: output, timeout: 0}],
                    awaitingResults: false,
                    resendingCode: false,
                    showVerificationPage: false,
                    password: "",
                    verificationCode: ""
                });
            }
            else if(message === "The user does not have a active verification code")
            {
                let output = message + ".  Please request another verification code be sent.";
                this.setState({
                    messageId: this.state.messageId + 1,
                    messages: [{type: "failure", message: output, timeout: 0}],
                    awaitingResults: false,
                    resendingCode: false,
                    verificationCode: ""
                });
            }
            else if(message === "Could not verify user as a maximum of 3 attempts have been attempted for the verification code.")
            {
                let output ="The maximum of 3 verification attempts for the current code has been " +
                            "reached.  Either try to resend the code or try to sign up again.";
                this.setState({
                    messageId: this.state.messageId + 1,
                    messages: [{type: "failure", message: output, timeout: 0}],
                    verificationError: "Verification code is invalid",
                    awaitingResults: false,
                    resendingCode: false,
                    lockVerificationInput: true,
                    verificationCode: ""
                });
            }
            else
            {
                resultFound = false;
            }
        }
        else if(status === 500)
        {
            this.setState({
                messageId: this.state.messageId + 1,
                messages: [{type: "failure", message: message, timeout: 0}],
                awaitingResults: false,
                resendingCode: false,
                verificationError: "",
                verificationCode: ""
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
            <React.Fragment>
                <label>
                    <h4 className={style.inputFieldH4} id="validLabel">Username</h4>
                </label>
                <input
                    type="text"
                    name="username"
                    form = "form1"
                    maxLength = {20}
                    className="inputFieldBoxLong validInputBox"
                    onChange={this.changeHandler}
                    value={this.state.username}
                />
            </React.Fragment>);
        if(this.state.usernameError)
        {
            usernameInput = (
                <React.Fragment>
                    <label>
                        <h4 className={`${style.inputFieldH4} errorLabel`}>Username</h4>
                    </label>
                    <input
                        type="text"
                        name="username"
                        form = "form1"
                        maxLength = {20}
                        className="inputFieldBoxLong inputBoxError"
                        onChange={this.changeHandler}
                        value={this.state.username}
                    />
                    <small className="errorTextSmall">{this.state.usernameError}</small>
                </React.Fragment>);
        }
        return usernameInput;
    }

    generateFirstNameInput()
    {
        let firstNameInput = (
            <React.Fragment>
                <label>
                    <h4 className={style.inputFieldH4}>First name</h4>
                </label>
                <input
                    type="text"
                    name="firstName"
                    form = "form1"
                    maxLength = {20}
                    className={`${style.inputFieldBoxShort} validInputBox`}
                    onChange={this.changeHandler}
                    value={this.state.firstName}
                />
            </React.Fragment>);
        if(this.state.firstNameError)
        {
            firstNameInput = (
            <React.Fragment>
                <label>
                    <h4 className={`${style.inputFieldH4} errorLabel`}>First name</h4>
                </label>
                <input
                    type="text"
                    name="firstName"
                    form = "form1"
                    maxLength = {20}
                    className={`${style.inputFieldBoxShort} inputBoxError`}
                    onChange={this.changeHandler}
                    value={this.state.firstName}
                />
                <small className="errorTextSmall">{this.state.firstNameError}</small>
            </React.Fragment>);
        }
        return firstNameInput;
    }

    generateLastNameInput()
    {
        let lastNameInput = (
            <React.Fragment>
                <label>
                    <h4 className={style.inputFieldH4} id="validLabel">Last name</h4>
                </label>
                <input
                    type="text"
                    name="lastName"
                    form = "form1"
                    maxLength = {20}
                    className={`${style.inputFieldBoxShort} validInputBox`}
                    onChange={this.changeHandler}
                    value={this.state.lastName}
                />
            </React.Fragment>);
        if(this.state.lastNameError)
        {
            lastNameInput = (
                <React.Fragment>
                    <label>
                        <h4 className={`${style.inputFieldH4} errorLabel`}>Last name</h4>
                    </label>
                    <input
                        type="text"
                        name="lastName"
                        form = "form1"
                        maxLength = {20}
                        className={`${style.inputFieldBoxShort} inputBoxError`}
                        onChange={this.changeHandler}
                        value={this.state.lastName}
                    />
                    <small className="errorTextSmall">{this.state.lastNameError}</small>
                </React.Fragment>);
        }
        return lastNameInput;
    }

    generateEmailInput()
    {
        let emailInput = (
            <React.Fragment>
                <label>
                    <h4 className={style.inputFieldH4} id="validLabel">Email</h4>
                </label>
                <input
                    type="text"
                    name="email"
                    form = "form1"
                    maxLength = {30}
                    className="inputFieldBoxLong validInputBox"
                    onChange={this.changeHandler}
                    value={this.state.email}
                />
            </React.Fragment>);
        if(this.state.emailError)
        {
            emailInput = (
                <React.Fragment>
                    <label>
                        <h4 className={`${style.inputFieldH4} errorLabel`}>Email</h4>
                    </label>
                    <input
                        type="text"
                        name="email"
                        form = "form1"
                        maxLength = {30}
                        className="inputFieldBoxLong inputBoxError"
                        onChange={this.changeHandler}
                        value={this.state.email}
                    />
                    <small className="errorTextSmall">{this.state.emailError}</small>
                </React.Fragment>);
        }
        return emailInput;
    }

    generatePasswordInput()
    {
        let passwordInput = (
            <React.Fragment>
                <label>
                    <h4 className={style.inputFieldH4} id = "validLabel">Password</h4>
                </label>
                <input
                    type="password"
                    name="password"
                    form = "form1"
                    maxLength = {15}
                    className="inputFieldBoxLong validInputBox"
                    onChange={this.changeHandler}
                    value={this.state.password}
                />
            </React.Fragment>);
        if(this.state.passwordError)
        {
            passwordInput = (
                <React.Fragment>
                    <label>
                        <h4 className={`${style.inputFieldH4} errorLabel`}>Password</h4>
                    </label>
                    <input
                        type="password"
                        name="password"
                        form = "form1"
                        maxLength = {15}
                        className="inputFieldBoxLong inputBoxError"
                        onChange={this.changeHandler}
                        value={this.state.password}
                    />
                    <small className="errorTextSmall">{this.state.passwordError}</small>
                </React.Fragment>);
        }
        return passwordInput;
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
                        autocomplete="off"
                        form = "form2"
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
                            autocomplete="off"
                            form = "form2"
                            maxLength = {6}
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

    generateCreateUserForm()
    {
        let usernameInput = this.generateUserNameInput();
        let firstNameInput = this.generateFirstNameInput();
        let lastNameInput = this.generateLastNameInput();
        let emailInput = this.generateEmailInput();
        let passwordInput = this.generatePasswordInput();

        return (
            <React.Fragment>
                <div className="content">
                    <form id="form1" onSubmit={this.validateRegistration} noValidate/>
                    <div className={style.nameContainer}>
                        {firstNameInput}
                        </div>
                    <div className={style.lastNameContainer}>
                        {lastNameInput}
                    </div>
                    <div className="inputFieldContainer">
                        {usernameInput}
                    </div>
                    <div className="inputFieldContainer">
                        {emailInput}
                    </div>
                    <div className="inputFieldContainer">
                        {passwordInput}
                    </div>
                </div>
                <div className={style.actions}>
                    <button
                        form="form1"
                        value="create_account"
                        className="submitButton"
                        onClick={this.validateRegistration}
                    >CREATE YOUR ACCOUNT
                    </button>
                </div>
                <div className={style.accountExistsText}>
                    <div>
                        <button className="logInLink" onClick={this.showLoginPopUp}>Already have an account? Log In Here!</button>
                    </div>
                    <div className={style.padding10}>
                        <button className="logInLink" onClick={this.showResendInput}>Resend Verification Code</button>
                    </div>
                </div>
            </React.Fragment>);
    }

    generateLoadingContent(message)
    {
        //if(this.state.awaitingResults)
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
                <div className={style.actions}>
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
        let content = (
            <React.Fragment>
                <div className="content">
                    <form id="form2" onSubmit={this.validateRegistration} noValidate/>
                    <div className={`${style.infoTextContainer} ${style.verificationTextMargins}`}>
                        Verification email sent to:<br/>
                        <div className={style.emailText}>
                            {this.state.email}
                        </div>
                    </div>
                    <div className={style.verificationContainer}>
                        {verificationInput}
                    </div>
                </div>
                <div className={style.actions}>
                    <div className={style.verificationButtonContainer}>
                        <button
                            form="form2"
                            value="create_account"
                            className="submitButton"
                            onClick={this.validateVerification}
                        >CREATE YOUR ACCOUNT
                        </button>
                    </div>
                    {resendButton}
                    <div className={style.verificationButtonContainer}>
                        Note: The account will be removed if not verified after so long
                    </div>
                </div>
            </React.Fragment>);
        return content;
    }

    generateResendInput()
    {
        let emailInput = (
            <React.Fragment>
                <div>
                    <h4 className={style.inputFieldH4} id="validLabel">Email:</h4>
                </div>
                <div className={style.verificationInputContainer}>
                    <input
                        type="text"
                        name="email"
                        form = "form2"
                        maxLength = {30}
                        className="inputFieldBoxLong validInputBox"
                        onChange={this.changeHandler}
                        value={this.state.email}
                    />
                </div>
            </React.Fragment>);
        if(this.state.emailError)
        {
            emailInput = (
                <React.Fragment>
                    <label>
                        <h4 className={style.inputFieldH4} id="validLabel">Email:</h4>
                    </label>
                    <div className={style.verificationInputContainer}>
                        <input
                            type="text"
                            name="email"
                            form = "form2"
                            maxLength = {30}
                            className="inputFieldBoxLong inputBoxError"
                            onChange={this.changeHandler}
                            value={this.state.email}
                        />
                        <small className="errorTextSmall">{this.state.emailError}</small>
                    </div>
                </React.Fragment>);
        }
        
        let content = (
            <React.Fragment>
                <div className="content">
                    <form id="form2" onSubmit={this.validateRegistration} noValidate/>
                    <div className={style.emailInputContainer}>
                        {emailInput}
                    </div>
                </div>
                <div className={style.actions}>
                    <div className={style.verificationButtonContainer}>
                        <button
                            form="form2"
                            value="create_account"
                            className="submitButton"
                            onClick={this.resendVerificationCode}
                        >RESEND VERIFICATION CODE
                        </button>
                    </div>
                    <div className={style.verificationButtonContainer}>
                        Note: The account will be removed if not verified after so long
                    </div>
                </div>
            </React.Fragment>);
        return content;
    }


    render() {
        let content;
        let className = "signUp";
        if(!this.state.showVerificationPage && !this.state.awaitingResults && this.state.showResendInput)
        {
            className = "verification";
            content = this.generateResendInput();
        }
        else if(!this.state.showVerificationPage && !this.state.awaitingResults)
        {
            content = this.generateCreateUserForm();
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
            content = this.generateLoadingContent("Creating account...");
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
                            <h3 className="inlineH3"> Sign Up! </h3>
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


export default SignUpPopup;
