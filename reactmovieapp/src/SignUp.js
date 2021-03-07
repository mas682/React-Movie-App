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
            showVerificationPage: false,
            verificationCode: "",
            verificationError: "",
            verificationAttemps: 0,
            awaitingResults: false
        };

        this.closeModal = this.closeModal.bind(this);
        this.changeHandler = this.changeHandler.bind(this);
        this.validateForm = this.validateForm.bind(this);
        this.signUpResultsHandler = this.signUpResultsHandler.bind(this);
        this.showLoginPopUp = this.showLoginPopUp.bind(this);
        this.generateUserNameInput = this.generateUserNameInput.bind(this);
        this.generateFirstNameInput = this.generateFirstNameInput.bind(this);
        this.generateLastNameInput = this.generateLastNameInput.bind(this);
        this.generateEmailInput = this.generateEmailInput.bind(this);
        this.generatePasswordInput = this.generatePasswordInput.bind(this);
        this.generateCreateUserForm = this.generateCreateUserForm.bind(this);
        this.generateVerificationForm = this.generateVerificationForm.bind(this);
        this.generateVerificationInput = this.generateVerificationInput.bind(this);

        this.validateVerification = this.validateVerification.bind(this);
        this.authenticateResultsHandler = this.authenticateResultsHandler.bind(this);
        this.resendVerificationCode = this.resendVerificationCode.bind(this);
    }

    closeModal() {
        this.setState({open: false});
        // function that is passed in by the calling component that
        // sets some state in the other component when this is closed,
        // such as whether or not the pop up should be open
        this.props.removeFunction();
    }

    showLoginPopUp() {
        this.props.showLoginPopUp();
        this.closeModal();
    }

    // function called when CREATE AN ACCOUNT button is clicked
    // to validate that the fields are correct and handle sending
    // data to server
    async validateForm(event) {
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
                //firstName: this.state.firstName,
                //lastName: this.state.lastName,
                email: this.state.email,
                //password: this.state.password
            };
            // temporarily using authenticat
            // let url = "http://localhost:9000/signup/create_account";
            let url = "http://localhost:9000/signup/authenticate";
            /*let result = await apiPostJsonRequest(url, params);
            let status = result[0];
            let message = result[1].message;
            let requester = result[1].requester;
            this.authenticateResultsHandler(status, message, requester);
            */
            this.setState({awaitingResults: true});
            apiPostJsonRequest(url, params).then((result)=>{
                let status = result[0];
                let message = result[1].message;
                let requester = result[1].requester;
                this.authenticateResultsHandler(status, message, requester);
            });
        }
    }

    authenticateResultsHandler(status, message, requester)
    {
        if(status === 201)
        {
            this.setState({
                showVerificationPage: true,
                awaitingResults: false
            });
            this.props.updateLoggedIn(requester);
            // set the state to redirect so render will redirect to landing on success
            // actually want to redirect to a page to customize profile....
            // this.setState({redirect: true});
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
            if(message === "Username already exists")
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
            else
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
                messages: [{type: "failure", message: message}],
                awaitingResults: false
            });
            this.props.updateLoggedIn(requester);
        }
        else
        {
            this.setState({
                lastNameError: "",
                usernameError: "",
                emailError: "",
                passwordError: "",
                firstNameError: "",
                messageId: this.state.messageId + 1,
                messages: [{type: "failure", message: "An unexpected error occurred on the server when trying to create the account"}],
                awaitingResults: false
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
                firstName: this.state.firstName,
                lastName: this.state.lastName,
                email: this.state.email,
                password: this.state.password,
                verificationCode: this.state.verificationCode
            };
            // temporarily using authenticat
            let url = "http://localhost:9000/signup/create_account";
            //let url = "http://localhost:9000/signup/authenticate";
            /*
            let result = await apiPostJsonRequest(url, params);
            let status = result[0];
            let message = result[1].message;
            let requester = result[1].requester;
            this.signUpResultsHandler(status, message, requester);
            */
            this.setState({awaitingResults: true});
            apiPostJsonRequest(url, params).then((result)=>{
                let status = result[0];
                let message = result[1].message;
                let requester = result[1].requester;
                this.signUpResultsHandler(status, message, requester, "creation");
            });
        }
    }

    async resendVerificationCode(event) {
        event.preventDefault();
        let error = false;

        if(!error)
        {
            let params = {
                username: this.state.username,
                email: this.state.email,
            };
            let url = "http://localhost:9000/signup/resend_verification_code";
            this.setState({awaitingResults: true});
            apiPostJsonRequest(url, params).then((result)=>{
                let status = result[0];
                let message = result[1].message;
                let requester = result[1].requester;
                this.signUpResultsHandler(status, message, requester, "resend");
            });
        }
    }

    signUpResultsHandler(status, message, requester, type)
    {
        if(status === 201)
        {
            if(type === "creation")
            {
                // redirect to either homepage
                this.props.setMessages({
                    messages: [{type: "success", message: "Account successfully created!"}],
                    clearMessages: true
                });
                this.props.updateLoggedIn(requester);
                this.closeModal();
                // set the state to redirect so render will redirect to landing on success
                // actually want to redirect to a page to customize profile....
                // this.setState({redirect: true});
            }
            else
            {
                alert("Passcode resent")
                this.setState({
                    usernameError: "",
                    emailError: "",
                    passwordError: "",
                    firstNameError: "",
                    lastNameError: "",
                    awaitingResults: false
                });
            }
        }
        else if(status === 401)
        {
            alert(message);
            if(message === "You are already logged in so you must have an account")
            {
                this.props.setMessages({
                    messages: [{type: "info", message: "You are already logged in"}],
                    clearMessages: true
                });
                this.closeModal();
            }
            else
            {
                this.setState({
                    awaitingResults: false
                })
            }
            this.props.updateLoggedIn(requester);
        }
        else if(status === 409)
        {
            alert(message);
            this.props.updateLoggedIn(requester);
            if(message === "Username already exists")
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
            else
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
        }
        else if(status === 400)
        {
            alert(message);
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
                    passwordError: message,
                    usernameError: "",
                    emailError: "",
                    firstNameError: "",
                    lastNameError: "",
                    awaitingResults: false
                });
            }
            else if(message === "First name must be between 1-20 characters")
            {
                this.setState({
                    firstNameError: message,
                    usernameError: "",
                    emailError: "",
                    passwordError: "",
                    lastNameError: "",
                    awaitingResults: false
                });
            }
            else if(message === "Last name must be between 1-20 characters")
            {
                this.setState({
                    lastNameError: message,
                    usernameError: "",
                    emailError: "",
                    passwordError: "",
                    firstNameError: "",
                    awaitingResults: false
                });
            }
        }
        else if(status === 404)
        {
            alert(message);
            this.setState({
                lastNameError: "",
                usernameError: "",
                emailError: "",
                passwordError: "",
                firstNameError: "",
                awaitingResults: false
            });
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
                messages: [{type: "failure", message: message}],
                awaitingResults: false
            });
            this.props.updateLoggedIn(requester);
        }
        else
        {
            this.setState({
                lastNameError: "",
                usernameError: "",
                emailError: "",
                passwordError: "",
                firstNameError: "",
                messageId: this.state.messageId + 1,
                messages: [{type: "failure", message: "An unexpected error occurred on the server when trying to create the account"}],
                awaitingResults: false
            });
            this.props.updateLoggedIn(requester);
        }
    }

    changeHandler(event) {
        let name = event.target.name;
        let value = event.target.value;
        this.setState({[name]: value});
    }

    /*
    need to fix login link at bottom in here to bring up login pop up
    also need to do the same for the login side where there is a button for
    the to sign up..
    */

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
                        form = "form2"
                        maxLength = {6}
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
                    <form id="form1" onSubmit={this.validateForm} noValidate/>
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
                <div className="actions">
                    <button
                        form="form1"
                        value="create_account"
                        className="submitButton"
                        onClick={this.validateForm}
                    >CREATE YOUR ACCOUNT
                    </button>
                </div>
                <div className={style.accountExistsText}>
                    <button className="logInLink" onClick={this.showLoginPopUp}>Already have an account? Log In Here!</button>
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
                <div className="actions">
                    <div className={style.verificationButtonContainer}>
                        Close the pop up to cancel account creation
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
        let content = (
            <React.Fragment>
                <div className="content">
                    <form id="form1" onSubmit={this.validateForm} noValidate/>
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
                <div className="actions">
                    <div className={style.verificationButtonContainer}>
                        <button
                            form="form1"
                            value="create_account"
                            className="submitButton"
                            onClick={this.validateVerification}
                        >CREATE YOUR ACCOUNT
                        </button>
                    </div>
                    <div className={style.verificationButtonContainer}>
                        <button
                            form="form1"
                            value="create_account"
                            className="submitButton"
                            onClick={this.resendVerificationCode}
                        >Resend Verification Code
                        </button>
                    </div>
                    <div className={style.verificationButtonContainer}>
                        Close the pop up to cancel account creation
                    </div>
                </div>
            </React.Fragment>);
        return content;
    }


    render() {
        let content;
        let className = "signUp";
        if(!this.state.showVerificationPage && !this.state.awaitingResults)
        {
            content = this.generateCreateUserForm();
        }
        else if(!this.state.showVerificationPage && this.state.awaitingResults)
        {
            className = "verification";
            content = this.generateLoadingContent("Processing request...");
        }
        else if(this.state.showVerificationPage && !this.state.awaitingResults)
        {
            className = "verification";
            content = this.generateVerificationForm();
        }
        else if(this.state.showVerificationPage && this.state.awaitingResults)
        {
            className = "verification";
            content = this.generateLoadingContent("Creating account...");
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
                        <Alert
                            messages={this.state.messages}
                            messageId={this.state.messageId}
                            innerContainerStyle={{"z-index": "2", "font-size": "1.25em"}}
                            symbolStyle={{"width": "5%", "margin-top": "3px"}}
                            messageBoxStyle={{width: "86%"}}
                            closeButtonStyle={{width: "5%", "margin-top": "3px"}}
                            />
                        <div className="header">
                            <h3 className="inlineH3"> Sign Up! </h3>
                        </div>
                        {content}
                    </div>
                </Popup>
            </div>
        );
    }
}


export default SignUpPopup;
