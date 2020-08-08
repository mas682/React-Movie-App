import React from 'react';
import { Link, Redirect } from 'react-router-dom';
import Popup from 'reactjs-popup';
import './css/signup.css';
import style from './css/signup.module.css';

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
            redirect: false
        };

        this.closeModal = this.closeModal.bind(this);
        this.changeHandler = this.changeHandler.bind(this);
        this.validateForm = this.validateForm.bind(this);
        this.callApi = this.callApi.bind(this);
    }

    closeModal() {
        this.setState({
            open: false,
        });
        // function that is passed in by the calling component that
        // sets some state in the other component when this is closed,
        // such as whether or not the pop up should be open
        this.props.removeFunction();
    }

    callApi()
    {
        // Simple POST request with a JSON body using fetch
        const requestOptions = {
            method: 'POST',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                username: this.state.username,
                firstName: this.state.firstName,
                lastName: this.state.lastName,
                email: this.state.email,
                password: this.state.password
            })
        };

        let status = 0;
        return fetch("http://localhost:9000/signup", requestOptions)
            .then(res => {
                status = res.status;
                return res.text();
            }).then(result => {
                return [status, result];
            });
    }

    // function called when CREATE AN ACCOUNT button is clicked
    // to validate that the fields are correct and handle sending
    // data to server
    validateForm(event) {
        event.preventDefault();
        let error = false;
        // checks to see if email in format string@string.string
        let validEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.state.email);
        // if firstName is empty
        if(!this.state.firstName)
        {
            this.setState({"firstNameError": "First name is required"});
            error = true;
        }
        else
        {
            this.setState({"firstNameError": ""});
        }

        if(!this.state.username)
        {
            this.setState({"usernameError": "Username is required"});
            error = true;
        }
        else if(this.state.username < 8)
        {
            this.setState({"usernameError": "Username must be at least 8 characters"});
            error = true;
        }
        else
        {
            this.setState({"usernameError": ""});
        }

        // if lastName is empty
        if(!this.state.lastName)
        {
            this.setState({"lastNameError": "Last name is required"});
            error = true;
        }
        else
        {
            this.setState({"lastNameError": ""});
        }

        // if lastName is empty
        if(!this.state.email)
        {
            this.setState({"emailError": "Email is required"});
            error = true;
        }
        else if(!this.state.email.includes("@") | !validEmail)
        {
            this.setState({"emailError": "You must enter a valid email address"});
            error = true;
        }
        else
        {
            this.setState({"emailError": ""});
        }

        // if password lenght < 8
        if(this.state.password.length < 8)
        {
            this.setState({"passwordError": "Your password must be at least 8 characters"});
            error = true;
        }
        else
        {
            this.setState({"passwordError": ""})
        }
        if(!error)
        {
            this.callApi().then(result => {
                let status = result[0];
                let response = result[1];
                if(status === 201 && response === "User has been created")
                {
                    // redirect to either homepage
                    alert("User successfully created");
                    this.closeModal();
                    // set the state to redirect so render will redirect to landing on success
                    this.setState({redirect: true});
                }
                else if(status === 403 && response === "You are already logged in")
                {
                    // redirect to home page?
                    alert("You are already logged in!");
                }
                else if(status === 409 && response === "username already in use")
                {
                    this.setState({"usernameError": "This username is already in use"});
                }
                else if(status === 409 && response === "email already in use")
                {
                    this.setState({"emailError": "This email address is already in use"});
                }
                else if(status === 500 && response === "sometihgn went wrong creating the user")
                {
                    alert("Something went wrong creating the account.  Please contact a admin");
                }
                else
                {
                    alert("Something unexpected happened when trying to create the account");
                }
            });
        }
    }

    changeHandler(event) {
        let name = event.target.name;
        let value = event.target.value;
        this.setState({[name]: value});
    }

    render() {
        if(!this.state.open && this.state.redirect)
        {
            return <Redirect to="/" />;
        }

        let usernameInput =  (
            <React.Fragment>
                <label>
                    <h4 className={style.inputFieldH4} id="validLabel">Username</h4>
                </label>
                <input
                    type="text"
                    name="username"
                    form = "form1"
                    className="inputFieldBoxLong validInputBox"
                    onChange={this.changeHandler}
                />
            </React.Fragment>);

        let firstNameInput = (
            <React.Fragment>
                <label>
                    <h4 className={style.inputFieldH4}>First name</h4>
                </label>
                <input
                    type="text"
                    name="firstName"
                    form = "form1"
                    className={`${style.inputFieldBoxShort} validInputBox`}
                    onChange={this.changeHandler}
                />
            </React.Fragment>);
        let lastNameInput = (
            <React.Fragment>
                <label>
                    <h4 className={style.inputFieldH4} id="validLabel">Last name</h4>
                </label>
                <input
                    type="text"
                    name="lastName"
                    form = "form1"
                    className={`${style.inputFieldBoxShort} validInputBox`}
                    onChange={this.changeHandler}
                />
            </React.Fragment>);

        let emailInput = (
            <React.Fragment>
                <label>
                    <h4 className={style.inputFieldH4} id="validLabel">Email</h4>
                </label>
                <input
                    type="text"
                    name="email"
                    form = "form1"
                    className="inputFieldBoxLong validInputBox"
                    onChange={this.changeHandler}
                />
            </React.Fragment>);

        let passwordInput = (
            <React.Fragment>
                <label>
                    <h4 className={style.inputFieldH4} id = "validLabel">Password</h4>
                </label>
                <input
                    type="password"
                    name="password"
                    form = "form1"
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
                        className="inputFieldBoxLong inputBoxError"
                        onChange={this.changeHandler}
                    />
                    <small className="errorTextSmall">{this.state.usernameError}</small>
                </React.Fragment>);
            }

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
                    className={`${style.inputFieldBoxShort} inputBoxError`}
                    onChange={this.changeHandler}
                />
                <small className="errorTextSmall">{this.state.firstNameError}</small>
            </React.Fragment>);
        }

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
                        className={`${style.inputFieldBoxShort} inputBoxError`}
                        onChange={this.changeHandler}
                    />
                    <small className="errorTextSmall">{this.state.lastNameError}</small>
                </React.Fragment>);
        }

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
                        className="inputFieldBoxLong inputBoxError"
                        onChange={this.changeHandler}
                    />
                    <small className="errorTextSmall">{this.state.emailError}</small>
                </React.Fragment>);
        }

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
                        className="inputFieldBoxLong inputBoxError"
                        onChange={this.changeHandler}
                    />
                    <small className="errorTextSmall">{this.state.passwordError}</small>
                </React.Fragment>);
        }

    return (
        <div>
            <Popup
                open={this.state.open}
                closeOnDocumentClick
                onClose={this.closeModal}
            >
                <div className="modal">
                    {/* &times is the multiplication symbol (x) --> */}
                    <a className="close" onClick={this.closeModal}>
                    &times;
                    </a>
                    <div className="header">
                        <h3 className="inlineH3"> Sign Up! </h3>
                    </div>
                    <div className="content">
                        {/* This will eventually be a post form */}
                        <form id="form1" onSubmit={this.validateForm} noValidate/>
                        <div className={style.nameContainer}>
                            {firstNameInput}
                        </div>
                        <div className={style.nameContainer}>
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
                        >CREATE YOUR ACCOUNT</button>
                    </div>
                    <div className={style.accountExistsText}>
                        Already have an account? <a className="logInLink" href="">Log In Here</a>
                    </div>
                </div>
            </Popup>
        </div>
        );
    }
}


export default SignUpPopup;
