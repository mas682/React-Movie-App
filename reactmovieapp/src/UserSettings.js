import React from 'react';
import {Link, Redirect } from 'react-router-dom';
import './App.css';
import style from './css/SettingsForm/UserSettings.module.css';
import './css/forms.css';
import PasswordResetPopUp from './PasswordResetPopUp.js';
import DeleteAccountPopUp from './DeleteAccountPopUp.js';


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
            userName: "",
            oldUser: "",
            userNameError: "",
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
			currentUser: this.props.currentUser
        };
        this.setEdit = this.setEdit.bind(this);
        this.generateInput = this.generateInput.bind(this);
        this.changeHandler = this.changeHandler.bind(this);
        this.callApi = this.callApi.bind(this);
        this.validateForm = this.validateForm.bind(this);
        this.sendData = this.sendData.bind(this);
		this.showPasswordResetPopUp = this.showPasswordResetPopUp.bind(this);
		this.removePasswordResetPopUp = this.removePasswordResetPopUp.bind(this);
		this.showRemoveAccountPopUp = this.showRemoveAccountPopUp.bind(this);
		this.generatePasswordPopUp = this.generatePasswordPopUp.bind(this);
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
	                    userName: result[1][2],
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
        if(!this.state.firstName)
        {
            this.setState({"firstNameError": "First name is required"});
            error = true;
        }
        else
        {
            this.setState({"firstNameError": ""});
        }

        if(!this.state.userName)
        {
            this.setState({"userNameError": "Username is required"});
            error = true;
        }
        else if(this.state.userName < 8)
        {
            this.setState({"userNameError": "Username must be at least 8 characters"});
            error = true;
        }
        else
        {
            this.setState({"userNameError": ""});
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
        if(!error)
        {
            let updatedResult = await this.sendData();
            if(updatedResult[0] === 200)
            {
                this.setState({
                    firstName: updatedResult[1][2],
                    oldFirst:"",
                    firstNameError: "",
                    lastName: updatedResult[1][3],
                    oldLast: "",
                    lastNameError: "",
                    userName: updatedResult[1][0],
                    oldUser: "",
                    userNameError: "",
                    email: updatedResult[1][1],
                    emailError: "",
                    oldEmail: "",
                    editFirst: false,
                    editLast: false,
                    editUser: false,
                    editEmail: false
                });
            }
            else
            {
                // request failed for some reason
                alert(updatedResult[1][0]);
            }
        }
    }

	removePasswordResetPopUp = () =>
	{
		this.setState({displayPasswordResetPop: false});
	}

	showPasswordResetPopUp()
	{
		this.setState({displayPasswordResetPop: true});
	}

	showRemoveAccountPopUp()
	{
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

    sendData()
    {
        console.log(this.state);
        // Simple POST request with a JSON body using fetch
        const requestOptions = {
            method: 'POST',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                username: this.state.userName,
                firstName: this.state.firstName,
                lastName: this.state.lastName,
                email: this.state.email,
            })
        };

        let url = "";
        if(this.state.oldUser)
        {
            url = "http://localhost:9000/profile/" + this.state.oldUser + "/update";
        }
        else
        {
            url = "http://localhost:9000/profile/" + this.state.userName + "/update";
        }

        let status = 0;
        return fetch(url, requestOptions)
            .then(res => {
                status = res.status;
                return res.json();
            }).then(result => {
                return [status, result];
            });
    }

	async callApi()
	{
        const requestOptions = {
            method: 'GET',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json'},
        };

        let status = 0;
        return fetch("http://localhost:9000/getuserinfo", requestOptions)
            .then(res => {
                status = res.status;
				if(status === 200)
				{
					return res.json();
				}
                return res.text();
            }).then(result =>{
                return [status, result];
            });
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
			return <PasswordResetPopUp username={this.state.username} removeFunction={this.removePasswordResetPopUp}/>;
		}
		return "";
	}

	generateDeleteAccountPopUp()
	{
		if(this.state.displayRemoveAccountPopUp)
		{
			return <DeleteAccountPopUp username={this.state.userName} removeFunction={this.showRemoveAccountPopUp} updateLoggedIn={this.props.updateLoggedIn}/>;
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
        let userInput = this.generateInput("editUser", "userName", "Username", "oldUser");
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
							value="submit_changes"
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
