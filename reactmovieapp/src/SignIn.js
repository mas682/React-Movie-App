import React from 'react';
import Popup from 'reactjs-popup';
import { Link } from 'react-router-dom';
import history from './History'
import style from './css/signin.module.css';
import './css/signin.css';


//documentation for PopUp https://react-popup.elazizi.com/component-api/
class SignInPopup extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			open: false,
			username: "",
			password: "",
			usernameError: "",
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
			username: "",
			password: "",
			usernameError: "",
			passwordError: ""
        });
    }

	changeHandler(event) {
        let name = event.target.name;
        let value = event.target.value;
        this.setState({[name]: value});
    }

	callApi() {
		const requestOptions = {
			method: 'POST',
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
				return res.text()
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
				if(result == "created cookie")
				{
					alert(result);
					alert("You have successfully logged in");
					this.setState({open: false});
				}
				else
				{
					console.log(result);
					alert("Login failed");
				}
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
				<button className="button" onClick={this.openModal}>
					Already a Member? Sign In!
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
								value="create_account"
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
