import React from 'react';
import {Link, Redirect } from 'react-router-dom';
import './App.css';
import style from './css/SettingsForm/UserSettings.module.css';
import './css/forms.css';
import PasswordResetPopUp from './PasswordResetPopUp.js';
import DeleteAccountPopUp from './DeleteAccountPopUp.js';
import PasswordValidationPopUp from './PasswordValidationPopUp.js';
import {apiPostJsonRequest, apiGetJsonRequest} from './StaticFunctions/ApiFunctions.js';


// left off here, need to make main page a class so it can have props
class UserSettings extends React.Component {

	constructor(props)
	{
		super(props);
        this.state = {
            firstName: "",
            oldFirst:"",
            firstNameError: "",
            lastName: "",
            oldLast: "",
            lastNameError: "",
            username: "",
            oldUser: "",
            usernameError: "",
			// email change will be done in the future
            email: "",
            //emailError: "",
            //oldEmail: "",
            loading: true,
            redirect: false,
            editFirst: false,
            editLast: false,
            editUser: false,
            //editEmail: false,
			displayPasswordResetPop: false,
			displayRemoveAccountPopUp: false,
			displayPasswordValidationPopUp: false,
			currentUser: this.props.currentUser,
			awaitingResults: false,
			loadingError: false
        };
        this.setEdit = this.setEdit.bind(this);
        this.generateInput = this.generateInput.bind(this);
        this.changeHandler = this.changeHandler.bind(this);
        this.callApi = this.callApi.bind(this);
        this.validateForm = this.validateForm.bind(this);
		this.showPasswordResetPopUp = this.showPasswordResetPopUp.bind(this);
		this.removePasswordResetPopUp = this.removePasswordResetPopUp.bind(this);
		this.showRemoveAccountPopUp = this.showRemoveAccountPopUp.bind(this);
		this.generatePasswordPopUp = this.generatePasswordPopUp.bind(this);
		this.updateUserResultsHandler = this.updateUserResultsHandler.bind(this);
		this.getUserInfoResultsHandler = this.getUserInfoResultsHandler.bind(this);

		this.generatePasswordValidationPopUp = this.generatePasswordValidationPopUp.bind(this);
		this.showPasswordValidationPopUp = this.showPasswordValidationPopUp.bind(this);
	}

	async componentDidMount()
	{
		// clear the messages on mount
		this.props.setMessages({
			messages: undefined,
			clearMessages: true
		});
		if(this.state.currentUser === "")
		{
			this.setState({
				loading: false,
				redirect: true
			});
		}
		else
		{
	        this.callApi();
		}
	}

	componentDidUpdate(prevProps, prevState)
	{
		if(!this.state.loading && (this.props.currentUser !== prevProps.currentUser))
		{
			// if the user logged out, redirect to landing page
			if(this.props.currentUser === "")
			{
				this.setState({
					redirect: true
				});
			}
			else
			{
				this.setState({
					currentUser: this.props.currentUser
				});
				this.callApi();
			}
		}
	}

    async validateForm(event)
    {
        event.preventDefault();
        let error = false;
        // checks to see if email in format string@string.string
        //let validEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.state.email);
        // if firstName is empty
        if(!this.state.firstName || this.state.firstName.length < 1 || this.state.firstName.length > 20)
        {
            this.setState({firstNameError: "First name must be between 1-20 characters"});
            error = true;
        }
        else
        {
            this.setState({firstNameError: ""});
        }

        if(!this.state.username || this.state.username.length < 6 || this.state.username.length > 20)
        {
            this.setState({usernameError: "Username must be between 6-20 characters"});
            error = true;
        }
        else
        {
            this.setState({usernameError: ""});
        }

        // if lastName is empty
        if(!this.state.lastName || this.state.lastName.length < 1 || this.state.lastName.lenght > 20)
        {
            this.setState({lastNameError: "Last name must be between 1-20 characters"});
            error = true;
        }
        else
        {
            this.setState({lastNameError: ""});
        }

		/*
        // if email is empty
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
		*/
        if(!error)
        {
			this.setState({
				awaitingResults: true,
				// prompt user for password
				displayPasswordValidationPopUp: true
			});
        }
    }

	updateUserResultsHandler(status, message, requester, result)
	{
		let resultFound = true;
		console.log(status);
		if(status === 200)
		{
			console.log("200 Received");
			let user = result[1].user;
			this.setState({
				firstName: user.firstName,
				oldFirst:"",
				firstNameError: "",
				lastName: user.lastName,
				oldLast: "",
				lastNameError: "",
				username: user.username,
				oldUser: "",
				usernameError: "",
				email: user.email,
				//emailError: "",
				//oldEmail: "",
				editFirst: false,
				editLast: false,
				editUser: false,
				editEmail: false,
				awaitingResults: false
			});
			this.props.updateLoggedIn(requester);
		}
		else
		{
			if(status === 401)
			{
				this.props.updateLoggedIn(requester);
				// You are not logged in
				if(message === "You are not logged in")
				{
					this.setState({
						awaitingResults: false
					});
				}
				else if(message === "You cannot update another users information" || 
					message.startsWith("Users account is currently suspended") || 
					message.startsWith("Users password is currently locked out.  Please change your password via forgot password"))
				{
					this.setState({
						displayPasswordValidationPopUp: false,
						awaitingResults: false
					});
					this.props.setMessages({
						messages: [{type: "failure", message: message}],
						clearMessages: true
					});
				}
				else
				{
					resultFound = false;
				}
			}
			else if(status === 404)
			{
				if(message === "The profile path sent to the server does not exist" || message === "Could not find the user to update")
				{
					this.setState({
						awaitingResults: false,
						displayPasswordValidationPopUp: false
					});
					this.props.setMessages({
						messages: [{type: "failure", message: message}],
						clearMessages: true
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
				if(message === "Username must be between 6-20 characters")
				{
					this.setState({
						awaitingResults: false,
						usernameError: message,
						displayPasswordValidationPopUp: false
					});
				}
				/*
				else if(message === "The email provided is not a valid email address")
				{
					this.setState({
						awaitingResults: false,
						emailError: message
					});
				}
				*/
				else if(message === "First name must be between 1-20 characters")
				{
					this.setState({
						awaitingResults: false,
						firstNameError: message,
						displayPasswordValidationPopUp: false
					});
				}
				else if(message === "Last name must be between 1-20 characters")
				{
					this.setState({
						awaitingResults: false,
						lastNameError: message,
						displayPasswordValidationPopUp: false
					});
				}
				else
				{
						resultFound = false;
				}
				this.props.updateLoggedIn(requester);
			}
			else if(status === 409)
			{
				if(message === "Username is already in use")
				{
					this.setState({
						awaitingResults: false,
						usernameError: message,
						displayPasswordValidationPopUp: false
					});
				}
				/*
				else if(message === "Email already associated with a user")
				{
					this.setState({
						awaitingResults: false,
						emailError: message
					});
				}
				*/
				else
				{
					resultFound = false;
				}
				this.props.updateLoggedIn(requester);
			}
			else if(status === 500)
			{
				// "A unknown constraint error occurred trying to update the users information"
				// "A unknown error occurred trying to update the users info"
				this.setState({
					awaitingResults: false
				});
				this.props.updateLoggedIn(requester);
				this.props.setMessages({
					messages: [{type: "failure", message: message}],
					clearMessages: true
				});
			}
			else
			{
				resultFound = false;
				this.props.updateLoggedIn(requester);
			}
			if(!resultFound)
			{
				let output = "Some unexpected " + status + " code was returned by the server.  Message: " + message;
				this.props.setMessages({
					messages: [{type: "failure", message: output, timeout: 0}],
					clearMessages: true
				});
				this.setState({
					awaitingResults: false,
					displayPasswordValidationPopUp: false
				});
			}
		}
	}

	// function called after callApi function is called
	// handles get call to get user info
	getUserInfoResultsHandler(status, message, requester, result)
	{
		message = "The getUserInfo path sent to the server does not exist";
		if(status === 200)
		{
			let user = result[1].user;
			this.setState({
				firstName: user.firstName,
				lastName: user.lastName,
				username: user.username,
				email: user.email,
				loading: false
			});
			this.props.updateLoggedIn(requester);
		}
		else
		{
			if(status === 401)
			{
				// will cause redirect to home page
				this.props.updateLoggedIn(requester);
				this.props.showLoginPopUp();
			}
			else if(status === 404)
			{
				this.setState({
					loading: false,
					loadingError: true
				});
				this.props.setMessages({
					messages: [{type: "failure", message: message}],
					clearMessages: true
				});
				this.props.updateLoggedIn(requester);
			}
			else
			{
				this.setState({
					loading: false,
					loadingError: true
				});
				let output = "Some unexpected " + status + " code was returned by the server.  Message: " + message;
				this.props.setMessages({
					messages: [{type: "failure", message: output, timeout: 0}],
					clearMessages: true
				});
				this.props.updateLoggedIn(requester);
			}
		}
	}

	removePasswordResetPopUp = () =>
	{
		this.setState({displayPasswordResetPop: false});
	}

	showPasswordValidationPopUp()
	{
		this.setState({displayPasswordValidationPopUp: !this.state.displayPasswordValidationPopUp});
	}

	showPasswordResetPopUp(event)
	{
		event.preventDefault();
		this.setState({displayPasswordResetPop: true});
	}

	showRemoveAccountPopUp(event)
	{
		if(event !== undefined)
		{
			event.preventDefault();
		}
		this.setState({displayRemoveAccountPopUp: !this.state.displayRemoveAccountPopUp});
	}

    changeHandler(event) {
        let name = event.target.name;
        let value = event.target.value;
        this.setState({[name]: value});
    }

    setEdit(type, newKey, oldKey)
    {
        let currentValue = this.state[type];
        let value = false;
        if(!currentValue)
        {
            value = true;
            // save the old value in case the user cancels the edit
            this.setState({
                [type]:value,
                [oldKey]:this.state[newKey]
            });
        }
        else
        {
			let error =  newKey + "Error";
            // restore the old value
            this.setState({
                [type]:value,
                [newKey]: this.state[oldKey],
				[error]: ""
            });
        }
    }

	async callApi()
	{
		let url = "/getuserinfo";
		let result = await apiGetJsonRequest(url);
		let status = result[0];
		let message = result[1];
		let requester = result[1].requester;
		this.getUserInfoResultsHandler(status, message, requester, result);
	}

    // function to generate HTML for each section such as first name, last name, username, email
	// type is holds editFirst, editLast, etc.
	// value is the value for the input type
	// title is First Name, Last Name, etc.
	// oldKey is key to the state for the old value if the user decides not to update it
	// maxSize is the maax number of characters to be allowed in input box
    generateInput(type, value, title, oldKey, maxSize)
    {
        let result = "";
        // if this.state[type+"Error"]...
        if(this.state[type] && type !== "editEmail")
        {
            let errorType = value + "Error";
            if(this.state[errorType])
            {
                // fix the css using the forms.css file
                result = (
                    <React.Fragment>
                        <div className={style.sectionHeader}>
                            <h3 className={`${style.h3Header} errorLabel`}>{title}</h3>
                            <button className={style.editText} onClick={() => {this.setEdit(type, value, oldKey)} }>Cancel</button>
                        </div>
                        <div className={style.inputFieldContainer}>
                            <input
                                type="text"
                                name={value}
                                form="form1"
                                value={this.state[value]}
                                className={`${style.inputFieldBoxShort} inputBoxError`}
                                onChange={this.changeHandler}
								maxLength = {maxSize}
                            />
                        </div>
                        <div className={style.errorTextContainer}>
                            <small className="errorTextSmall">{this.state[errorType]}</small>
                        </div>
                    </React.Fragment>);
            }
            else
            {
                result = (
                    <React.Fragment>
                        <div className={style.sectionHeader}>
                            <h3 className={style.h3Header}>{title}</h3>
                            <button className={style.editText} onClick={() => {this.setEdit(type, value, oldKey)} }>Cancel</button>
                        </div>
                        <div className={style.inputFieldContainer}>
                            <input
                                type="text"
                                name={value}
                                form="form1"
                                value={this.state[value]}
                                className={`${style.inputFieldBoxShort} validInputBox`}
                                onChange={this.changeHandler}
								maxLength = {maxSize}
                            />
                        </div>
                    </React.Fragment>);
            }
        }
        else
        {
			let editButton = (<button className={style.editText} onClick={() => {this.setEdit(type, value, oldKey)} }>Edit</button>);
			if(type === "editEmail") editButton = "";
            result = (
                <React.Fragment>
                    <div className={style.sectionHeader}>
                        <h3 className={style.h3Header}>{title}</h3>
                        {editButton}
                    </div>
                    <div className={style.sectionText}>
                        {this.state[value]}
                    </div>
                </React.Fragment>);
        }
        return result;
    }

	generatePasswordPopUp()
	{
		if(this.state.displayPasswordResetPop)
		{
			return <PasswordResetPopUp
						currentUser={this.state.currentUser}
						removeFunction={this.removePasswordResetPopUp}
						updateLoggedIn={this.props.updateLoggedIn}
						showLoginPopUp={this.props.showLoginPopUp}
						setMessages={this.props.setMessages}
					/>;
		}
		return "";
	}

	generateDeleteAccountPopUp()
	{
		if(this.state.displayRemoveAccountPopUp)
		{
			return <DeleteAccountPopUp
						username={this.state.username}
						removeFunction={this.showRemoveAccountPopUp}
						updateLoggedIn={this.props.updateLoggedIn}
						setMessages={this.props.setMessages}
					/>;
		}
		return "";
	}


	generatePasswordValidationPopUp()
	{
		if(this.state.displayPasswordValidationPopUp)
		{
			return <PasswordValidationPopUp
				currentUser={this.state.currentUser}
				removeFunction={this.showPasswordValidationPopUp}
				updateLoggedIn={this.props.updateLoggedIn}
				showLoginPopUp={this.props.showLoginPopUp}
				setMessages={this.props.setMessages}
				updateUserResultsHandler={this.updateUserResultsHandler}
				username={this.state.username}
				firstName={this.state.firstName}
				lastName={this.state.lastName}
			/>;
		}
		return "";
	}


	render()
	{
        // if the server response was not received yet, display nothing
        if(this.state.loading)
        {
            return null;
        }
        // if the user could not be authenticated, redirect to home page
        if(this.state.redirect)
        {
			return <Redirect to={{pathname: "/", state: {displayLogin: true}}} />;
        }
		else if(this.state.loadingError)
		{
			// if the info was not loaded
			return (
				<div className={style.mainBodyContainer}>
						<div className={style.header}>
							<h2>Settings</h2>
						</div>
				</div>
			)
		}
		let userInput = this.generateInput("editUser", "username", "Username", "oldUser", 20);
		let emailInput = this.generateInput("editEmail", "email", "Email", "oldEmail", 30);
        let firstInput = this.generateInput("editFirst", "firstName", "First Name", "oldFirst", 20);
        let lastInput = this.generateInput("editLast", "lastName", "Last Name", "oldLast", 20);
        let submitButton = "";
		console.log(this.state);
        if(this.state.editFirst || this.state.editLast || this.state.editUser)
        {
            submitButton = (
                <React.Fragment>
                    <div className={style.submitButtonContainer}>
                        <button
                            form="form1"
                            value="submit_changes"
                            className={`submitButton ${style.submitButtonColor}`}
                            onClick={this.validateForm}
                            >Submit Changes
                        </button>
                    </div>
                </React.Fragment>
            );
        }
		let passwordPopUp = this.generatePasswordPopUp();
		let deleteAccountPopUp = this.generateDeleteAccountPopUp();
		let passwordValidationPopUp = this.generatePasswordValidationPopUp();

		return (
			<div className={style.mainBodyContainer}>
			        <div className={style.header}>
                        <h2>Settings</h2>
		            </div>
                    <form id="form1" onSubmit={this.validateForm} noValidate/>
					{emailInput}
					{userInput}
                    {firstInput}
                    {lastInput}
                    {submitButton}
					<div className={style.submitButtonContainer}>
						<button
							form="form1"
							value="show_password_change"
							className={`${style.submitButton} ${style.popupButton}`}
							onClick={this.showPasswordResetPopUp}
							>Change password
						</button>
					</div>
					<div className={style.submitButtonContainer}>
						<button
							form="form1"
							value="delete_account"
							className={`${style.submitButton} ${style.popupButton}`}
							onClick={this.showRemoveAccountPopUp}
							>Delete Account
						</button>
					</div>
					{passwordPopUp}
					{deleteAccountPopUp}
					{passwordValidationPopUp}
		    </div>
			);
	}
}
export default UserSettings;
