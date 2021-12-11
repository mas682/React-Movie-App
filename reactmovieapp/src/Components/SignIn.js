import React from 'react';
import Popup from 'reactjs-popup';
import style from '../css/SignIn/signin.module.css';
import '../css/SignIn/signin.css';
import {apiPostJsonRequest} from '../StaticFunctions/ApiFunctions.js';
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
			messageId: -1,
			awaitingResults: false,
			// boolean for if the token should be persistent or not
			rememberUser: false
		};
		this.openModal = this.openModal.bind(this);
		this.closeModal = this.closeModal.bind(this);
		this.changeHandler = this.changeHandler.bind(this);
		this.validateForm = this.validateForm.bind(this);
		this.loginResultsHandler = this.loginResultsHandler.bind(this);
		this.showSignUpForm = this.showSignUpForm.bind(this);
		this.showForgotPassword = this.showForgotPassword.bind(this);
		this.generateLoadingContent = this.generateLoadingContent.bind(this);
		this.genereateLoginForm = this.genereateLoginForm.bind(this);
		this.rememberUserHandler = this.rememberUserHandler.bind(this);
	}

	openModal() {
		this.setState({ open: true });
	}

	closeModal() {
        this.setState({open: false});
		// function passed by callling component to close the pop up
		this.props.removeFunction();
    }

	showSignUpForm()
	{
		this.props.showSignUpForm();
		this.closeModal();
	}

	showForgotPassword()
	{
		this.props.showForgotPassword();
		this.closeModal();
	}

	rememberUserHandler(event)
	{
		this.setState({rememberUser: event.target.checked});
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

		let regex = new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[-#!\$@%\^&*\(\)_+\|~=\`\{\}\\[\\]:\"`;'<>\?,\./\\\\])(?=.{10,30})");
		if(!this.state.password) {
			this.setState({passwordError: "Password is required"});
			error = true;
		}
		else if(!regex.test(this.state.password))
		{
			this.setState({
				passwordError: "Password must be between 10-30 characters, contain at least 1 lowercase character, at least 1 uppercase character," + 
				"at least 1 number, and at least 1 special character"
			});
			error = true;
		}
		else {
			this.setState({passwordError: ""});
		}

		if(!error)
		{
			let params = {
				username: this.state.username,
				password: this.state.password,
				stayLoggedIn: this.state.rememberUser
			};
			this.setState({
				awaitingResults: true,
				messageId: -1
			});
			let url = "/login/authenticate";
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
				this.setState({
					awaitingResults: false,
					usernameError: message
				});
			}
			else if(message.startsWith("Password must be between 10-30 characters"))
			{
				this.setState({
					awaitingResults: false,
					passwordError: message
				});
			}
			else if(message === "Stay logged in must be either true or false")
			{
				this.setState({
					awaitingResults: false,
					messageId: this.state.messageId + 1,
					messages: [{type: "failure", message: message}]
				});
			}

		}
		else if(status === 404)
		{
			// user does not exist
			this.setState({
				usernameError: message,
				awaitingResults: false
			});
		}
		else if(status === 401)
		{
			if(message === "Incorrect password.  User account is currently locked due to too many login attempts")
			{
				this.setState({
					passwordError: "Incorrect password",
					awaitingResults: false,
					messageId: this.state.messageId + 1,
					messages: [{type: "failure", message: "User account is currently locked due to too many login attempts.  Reset your password using forgot password"}]
				});
			}
			else if(message.startsWith("Users account is currently locked"))
			{
				this.setState({
					awaitingResults: false,
					messageId: this.state.messageId + 1,
					messages: [{type: "failure", message: "User account is currently locked due to too many login attempts.  Reset your password using forgot password"}]
				});
			}
			else if(message.startsWith("Users account is currently suspended"))
			{
				this.setState({
					awaitingResults: false,
					messageId: this.state.messageId + 1,
					messages: [{type: "failure", message: "User account is currently locked due to too many login attempts.  Reset your password using forgot password"}]
				});
			}
			else
			{
				// incorrect password
				this.setState({
					passwordError: message,
					awaitingResults: false
				});
			}
		}
		else if(status === 500)
		{
			this.setState({
				awaitingResults: false,
				messageId: this.state.messageId + 1,
				messages: [{type: "failure", message: message}]
			});
		}
		else
		{
			this.setState({
				awaitingResults: false,
				messageId: this.state.messageId + 1,
				messages: [{type: "failure", message: "An unexpected error occurred on the server"}]
			});
		}
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
			</React.Fragment>
		);
		return content;
	}

	genereateLoginForm()
	{
		let usernameInput =  (
			<React.Fragment>
				<label>
					<h4 className={style.inputFieldH4} id="validLabel">Username or Email</h4>
				</label>
				<input
					type="text"
					name="username"
					form = "form1"
					value={this.state.username}
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
						value={this.state.username}
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
			<React.Fragment>
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
						<input className="checkbox" type="checkbox" onClick={this.rememberUserHandler}></input>
					</label>
					<div className={style.forgotText}><button className="logInLink" onClick={this.showForgotPassword}>Forgot Password?</button></div>
				</div>
				<div className="newHere">
					<div className={style.forgotText}><button className="logInLink" onClick={this.showSignUpForm}>New Here? Sign Up!</button></div>
				</div>
			</React.Fragment>
		);
	}

    render() {

		let content = "";
		if(this.state.awaitingResults)
		{
			content = this.generateLoadingContent("Verifying login");
		}
		else
		{
			content = this.genereateLoginForm();
		}
		return (
			<div>
				<Popup
					open={this.state.open}
					closeOnDocumentClick
					onClose={this.closeModal}
					className={"signIn"}
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
						{content}
					</div>
				</Popup>
			</div>
		);
    }
}


export default SignInPopup;
