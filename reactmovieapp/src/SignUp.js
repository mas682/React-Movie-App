import React from 'react';
import history from './History'
import { Link } from 'react-router-dom';
import Popup from 'reactjs-popup';
import './css/signup.css';
import style from './css/signup.module.css';

// documentation for PopUp https://react-popup.elazizi.com/component-api/
class SignUpPopup extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            open: false,
            firstName: "",
            lastName: "",
            email: "",
            password: "",
            firstNameError: "",
            lastNameError: "",
            emailError: "",
            passwordError: ""
        };
        this.openModal = this.openModal.bind(this);
        this.closeModal = this.closeModal.bind(this);
        this.changeHandler = this.changeHandler.bind(this);
        this.validateForm = this.validateForm.bind(this);
        this.callApi = this.callApi.bind(this);
    }

    openModal() {
        this.setState({ open: true });
    }

    closeModal() {
        this.setState({
            open: false,
            firstName: "",
            lastName: "",
            email: "",
            password: "",
            firstNameError: "",
            lastNameError: "",
            emailError: "",
            passwordError: ""
        });
    }

    callApi()
    {
        // Simple POST request with a JSON body using fetch
        const requestOptions = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                firstName: this.state.firstName,
                lastName: this.state.lastName,
                email: this.state.email,
                password: this.state.password
            })
        };
        fetch("http://localhost:9000/signup", requestOptions)
            .then(res => res.text())
            .then(res => console.log(res));
    }

    validateForm(event) {
        event.preventDefault();
        // checks to see if email in format string@string.string
        let validEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.state.email);
        // if firstName is empty
        if(!this.state.firstName)
        {
            this.setState({"firstNameError": "First name is required"});
        }
        else
        {
            this.setState({"firstNameError": ""});
        }

        // if lastName is empty
        if(!this.state.lastName)
        {
            this.setState({"lastNameError": "Last name is required"});
        }
        else
        {
            this.setState({"lastNameError": ""});
        }

        // if lastName is empty
        if(!this.state.email)
        {
            this.setState({"emailError": "Email is required"});
        }
        else if(!this.state.email.includes("@") | !validEmail)
        {
            this.setState({"emailError": "You must enter a valid email address"});
        }
        else
        {
            this.setState({"emailError": ""});
        }

        // if password lenght < 8
        if(this.state.password.length < 8)
        {
            this.setState({"passwordError": "Your password must be at least 8 characters"});
        }
        else
        {
            this.setState({"passwordError": ""})
        }
        this.callApi();
    }

    changeHandler(event) {
        let name = event.target.name;
        let value = event.target.value;
        this.setState({[name]: value});
    }

    render() {
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
            <button className="button" onClick={this.openModal}>
                Sign Up Popup
            </button>
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
                        <div className={`inputFieldContainer`}>
                            {emailInput}
                        </div>
                        <div className={`inputFieldContainer`}>
                            {passwordInput}
                        </div>
                    </div>
                    <div className="actions">
                        <button
                            form="form1"
                            value="create_account"
                            className="submitButton"
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
