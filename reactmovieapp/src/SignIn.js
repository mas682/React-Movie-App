import React from 'react';
import Popup from 'reactjs-popup';
import { Link, Redirect } from 'react-router-dom';
import history from './History'
import style from './css/signin.module.css';
import './css/signin.css';
import {apiPostJsonRequest} from './StaticFunctions/ApiFunctions.js';
import Alert from './Alert.js';


//documentation for PopUp https://react-popup.elazizi.com/component-api/
class SignInPopup extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			open: true,
			username: "",
			password: "",
			usernameError: "",
			passwordError: "",
			messages: [],
			messageId: -1
		};
		this.openModal = this.openModal.bind(this);
		this.closeModal = this.closeModal.bind(this);
		this.changeHandler = this.changeHandler.bind(this);
		this.validateForm = this.validateForm.bind(this);
		this.loginResultsHandler = this.loginResultsHandler.bind(this);
	}

	openModal() {
		this.setState({ open: true });
	}

	closeModal() {
        this.setState({open: false});
		// function passed by callling component to close the pop up
		this.props.removeFunction();
    }

	changeHandler(event) {
        let name = event.target.name;
        let value = event.target.value;
        this.setState({[name]: value});
    }

	async validateForm(event) {
		event.preventDefault();
		let error = false;

		if(!this.state.username) {
			this.setState({usernameError: "Username is required"});
			error = true;
		}
		else if(this.state.username.length < 6 || this.state.username.length > 30)
		{
			this.setState({usernameError: "Username or email must be between 6-30 characters"});
			error = true;
		}
		else {
			this.setState({usernameError: ""});
		}

		if(!this.state.password) {
			this.setState({passwordError: "Password is required"});
			error = true;
		}
		else if(this.state.password.length < 6 || this.state.password.length > 15)
		{
			this.setState({passwordError: "Password must be between 6-15 characters"});
			error = true;
		}
		else {
			this.setState({passwordError: ""});
		}

		if(!error)
		{
			let params = {
				username: this.state.username,
				password: this.state.password
			};
			let url = "http://localhost:9000/login";
			let result = await apiPostJsonRequest(url, params);
			let status = result[0];
			let message = result[1].message;
			let requester = result[1].requester;
			this.loginResultsHandler(status, message, requester);
		}
	}

	loginResultsHandler(status, message, requester)
	{
		// successfully logged in or already logged in
		if(status === 200)
		{
			this.props.removeFunction(requester);
			this.setState({open: false});
		}
		else if(status === 400)
		{
			if(message === "Username or email address is invalid")
			{
				this.setState({usernameError: message});
			}
			else if(message === "Password must be between 6-15 characters")
			{
				this.setState({passwordError: message});
			}

		}
		else if(status === 404)
		{
			// user does not exist
			this.setState({usernameError: message});
		}
		else if(status === 401)
		{
			// incorrect password
			this.setState({passwordError: message});
		}
		else
		{
			this.setState({
				messageId: this.state.messageId + 1,
				messages: [{type: "failure", message: "An unexpected error occurred on the server"}]
			});
		}
	}

    render() {
		let usernameInput =  (
            <React.Fragment>
                <label>
                    <h4 className={style.inputFieldH4} id="validLabel">Username or Email</h4>
                </label>
                <input
                    type="text"
                    name="username"
                    form = "form1"
                    className="inputFieldBoxLong validInputBox"
                    onChange={this.changeHandler}
                />
            </React.Fragment>
		);

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

		if(this.state.usernameError) {
			usernameInput = (
				<React.Fragment>
					<label>
						<h4 className={`${style.inputFieldH4} errorLabel`}>Username</h4>
					</label>
					<input
						type="text"
						name="username"
						form="form1"
						className="inputFieldBoxLong inputBoxError"
						onChange={this.changeHandler}
					/>
					<small className="errorTextSmall">{this.state.usernameError}</small>
				</React.Fragment>);
		}

		if(this.state.passwordError) {
			passwordInput = (
				<React.Fragment>
					<label>
						<h4 className={`${style.inputFieldH4} errorLabel`}>Password</h4>
					</label>
					<input
						type="password"
						name="password"
						form="form1"
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
					contentStyle={{ width: "35%"}}
				>
					<div className="modal">
						{/* &times is the multiplication symbol (x) --> */}
						<a className="close" onClick={this.closeModal}>
						&times;
						</a>
						<Alert
							messages={this.state.messages}
							messageId={this.state.messageId}
							timeout={0}
							innerContainerStyle={{"z-index": "2", "font-size": "1.25em"}}
							symbolStyle={{"width": "5%", "margin-top": "3px"}}
							messageBoxStyle={{width: "86%"}}
							closeButtonStyle={{width: "5%", "margin-top": "3px"}}
						/>
						<div className="header">
							<h3 className="inlineH3">Sign In!</h3>
						</div>
						<div className="content">
							<form id="form1" onSubmit={this.validateForm} noValidate/>
							<div className="inputFieldContainer">
								{usernameInput}
							</div>
							<div className="inputFieldContainer">
								{passwordInput}
							</div>
						</div>
						<div className="actions">
							<button
								form="form1"
								value="login_user"
								className="submitButton"
								onClick={this.validateForm}
							>SIGN IN</button>
						</div>
						<div className="rememberForgot">
							<label className={style.rememberText}>Remember Me
								<input className="checkbox" type="checkbox"></input>
							</label>
							<div className={style.forgotText}><a className="logInLink" href="">Forgot Password?</a></div>
						</div>
						<div className="newHere">
							<div className={style.forgotText}><a className="logInLink" href="">New Here? Sign Up!</a></div>
						</div>
					</div>
				</Popup>
			</div>
		);
    }
}


export default SignInPopup;
