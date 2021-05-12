import React from 'react';
import {Link, Redirect } from 'react-router-dom';
import './App.css';
import style from './css/SettingsForm/UserSettings.module.css';
import './css/forms.css';
import PasswordResetPopUp from './PasswordResetPopUp.js';
import DeleteAccountPopUp from './DeleteAccountPopUp.js';
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
            email: "",
            emailError: "",
            oldEmail: "",
            loading: true,
            redirect: false,
            editFirst: false,
            editLast: false,
            editUser: false,
            editEmail: false,
			displayPasswordResetPop: false,
			displayRemoveAccountPopUp: false,
			currentUser: this.props.currentUser,
			awaitingResults: false
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
	        this.callApi().then(result =>{
	            // set status to result[0]
	            let status = result[0];
	            // see if request succeeded
	            if(status == 200)
	            {
	                this.setState({
	                    firstName: result[1][0],
	                    lastName: result[1][1],
	                    username: result[1][2],
	                    email: result[1][3],
	                    loading: false
	                });
	            }
	            else
	            {
	                alert(result[1]);
	                this.setState({
	                    loading: false,
	                    redirect: true
	                });
	            }
	        });
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
				this.callApi(this.props.currentUser);
			}
		}
	}

    async validateForm(event)
    {
        event.preventDefault();
        let error = false;
        // checks to see if email in format string@string.string
        let validEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.state.email);
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

        // if lastName is empty
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
        if(!error)
        {
			let params = {
				username: this.state.username,
			    firstName: this.state.firstName,
			    lastName: this.state.lastName,
			    email: this.state.email,
			};
			let url = "http://localhost:9000/profile/" + this.state.currentUser + "/update";
			this.setState({
				awaitingResults: true
			});
			apiPostJsonRequest(url, params).then((result) =>{
				let status = result[0];
				let message = result[1].message;
				let requester = result[1].requester;
				this.updateUserResultsHandler(status, message, requester, result);
			});
        }
    }

	updateUserResultsHandler(status, message, requester, result)
	{
		let resultFound = true;
		if(status === 200)
		{
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
				emailError: "",
				oldEmail: "",
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
				this.setState({
					awaitingResults: false
				});
				this.props.updateLoggedIn(requester);
				// You are not logged in
				// tested
				if(message === "You are not logged in" || message === "Could not find the user to update")
				{
					this.props.showLoginPopUp();
				}
				// tested
				else if(message === "You cannot update another users information")
				{
					// "You cannot change information for another user"
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
				// The profile path sent to the server does not exist
				// tested
				if(message === "The profile path sent to the server does not exist")
				{
					this.setState({
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
				this.props.updateLoggedIn(requester);
			}
			else if(status === 400)
			{
				// all tested
				if(message === "Username must be between 6-20 characters")
				{
					this.setState({
						awaitingResults: false,
						usernameError: message
					});
				}
				else if(message === "The email provided is not a valid email address")
				{
					this.setState({
						awaitingResults: false,
						emailError: message
					});
				}
				else if(message === "First name must be between 1-20 characters")
				{
					this.setState({
						awaitingResults: false,
						firstNameError: message
					});
				}
				else if(message === "Last name must be between 1-20 characters")
				{
					this.setState({
						awaitingResults: false,
						lastNameError: message
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
				// tested
				if(message === "Username already in use")
				{
					this.setState({
						awaitingResults: false,
						usernameError: message
					});
				}
				else if(message === "Email already associated with a user")
				{
					this.setState({
						awaitingResults: false,
						emailError: message
					});
				}
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
				let output = "Some unexpected " + status + " code was returned by the server";
				this.props.setMessages({
					messages: [{type: "failure", message: output}],
					clearMessages: true
				});
				this.setState({
					awaitingResults: false
				});
			}
		}
	}

	removePasswordResetPopUp = () =>
	{
		this.setState({displayPasswordResetPop: false});
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
            // restore the old value
            this.setState({
                [type]:value,
                [newKey]: this.state[oldKey]
            });
        }
    }

	async callApi()
	{
		let url = "http://localhost:9000/getuserinfo";
		let result = await apiGetJsonRequest(url)
		return result;
	}

    // function to generate HTML for each section such as first name, last name, username, email
	// type is holds editFirst, editLast, etc.
	// value is the value for the input type
	// title is First Name, Last Name, etc.
	// oldKey is key to the state for the old value if the user decides not to update it
    generateInput(type, value, title, oldKey)
    {
        let result = "";
        // if this.state[type+"Error"]...
        if(this.state[type])
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
                            />
                        </div>
                    </React.Fragment>);
            }
        }
        else
        {
            result = (
                <React.Fragment>
                    <div className={style.sectionHeader}>
                        <h3 className={style.h3Header}>{title}</h3>
                        <button className={style.editText} onClick={() => {this.setEdit(type, value, oldKey)} }>Edit</button>
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
			return <PasswordResetPopUp currentUser={this.state.currentUser} removeFunction={this.removePasswordResetPopUp}/>;
		}
		return "";
	}

	generateDeleteAccountPopUp()
	{
		if(this.state.displayRemoveAccountPopUp)
		{
			return <DeleteAccountPopUp username={this.state.username} removeFunction={this.showRemoveAccountPopUp} updateLoggedIn={this.props.updateLoggedIn}/>;
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
        let firstInput = this.generateInput("editFirst", "firstName", "First Name", "oldFirst");
        let lastInput = this.generateInput("editLast", "lastName", "Last Name", "oldLast");
        let userInput = this.generateInput("editUser", "username", "username", "oldUser");
        let emailInput = this.generateInput("editEmail", "email", "Email", "oldEmail");
        let submitButton = "";
        if(this.state.editFirst || this.state.editLast || this.state.editUser || this.state.editEmail)
        {
            submitButton = (
                <React.Fragment>
                    <div className={style.submitButtonContainer}>
                        <button
                            form="form1"
                            value="submit_changes"
                            className="submitButton"
                            onClick={this.validateForm}
                            >Submit Changes
                        </button>
                    </div>
                </React.Fragment>
            );
        }
		let passwordPopUp = this.generatePasswordPopUp();
		let deleteAccountPopUp = this.generateDeleteAccountPopUp();

		return (
			<div className={style.mainBodyContainer}>
			        <div className={style.header}>
                        <h2>Settings</h2>
		            </div>
                    <form id="form1" onSubmit={this.validateForm} noValidate/>
                    {firstInput}
                    {lastInput}
                    {userInput}
                    {emailInput}
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
		    </div>
			);
	}
}
export default UserSettings;
