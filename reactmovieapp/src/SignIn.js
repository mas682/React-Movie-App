import React from 'react';
import Popup from 'reactjs-popup';
import { Link, Redirect } from 'react-router-dom';
import history from './History'
import style from './css/signin.module.css';
import './css/signin.css';


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
			redirect: false
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
        });
		// function passed by callling component to close the pop up
		this.props.removeFunction();
    }

	changeHandler(event) {
        let name = event.target.name;
        let value = event.target.value;
        this.setState({[name]: value});
    }

	callApi() {
		const requestOptions = {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			credentials: 'include',
			body: JSON.stringify({
				username: this.state.username,
				password: this.state.password
			})
		};

		let returnValue = 0;
		return fetch("http://localhost:9000/login", requestOptions)
			.then(res => {
				console.log(res);
				return res.json()
			});
	}

	validateForm(event) {
		event.preventDefault();
		let error = false;

		if(!this.state.username) {
			this.setState({"usernameError": "Username is required"});
			error = true;
		} else {
			this.setState({"usernameError": ""});
		}

		if(!this.state.password) {
			this.setState({"passwordError": "Password is required"});
			error = true;
		} else {
			this.setState({"passwordError": ""});
		}

		if(!error)
		{
			this.callApi().then(result => {
				let status = JSON.parse(result[0]);
				let user = JSON.parse(result[1]);
				alert(status);
				if(status.result == "created cookie")
				{
					alert("You have successfully logged in");
					this.setState({
						open: false,
						redirect: true,
						username: user.user
					});
					this.props.removeFunction();
				}
				else if(status.result == "You are already logged in")
				{
					this.closeModal();
				}
				else
				{
					alert(result);
					console.log(result);
					alert("Login failed");
				}
			});
		}
	}

    render() {
		// if the user successfully logged in
		if(!this.state.open && this.state.redirect)
		{
			let path = "/profile/" + this.state.username + "/feed";
			return <Redirect to={path} />
		}
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
						<div className="header">
							<h3 className="inlineH3">Sign In!</h3>
						</div>
						<div className="content">
							{/* This will eventually be a post form */}
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
