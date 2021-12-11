import React from 'react';
import Popup from 'reactjs-popup';
import style from '../css/SettingsForm/UserSettings.module.css';
import '../css/forms.css';
import '../css/SettingsForm/PasswordValidationPopUp.css';
import {apiPostJsonRequest} from '../StaticFunctions/ApiFunctions.js';
import Alert from './Alert.js';

class PasswordValidationPopUp extends React.Component {
    constructor(props) {
        super(props);
        this.state ={
            open: true,
            password: "",
            passwordError: "",
            currentUser: this.props.currentUser,
            awaitingResults: false,
            messages: "",
            messageId: -1,
            // data to send
            username: this.props.username,
            firstName: this.props.firstName,
            lastName: this.props.lastName
        };
        this.validateForm = this.validateForm.bind(this);
        this.closeModal = this.closeModal.bind(this);
        this.changeHandler = this.changeHandler.bind(this);
        this.updateInfoResultsHandler = this.updateInfoResultsHandler.bind(this);
    }

    changeHandler(event) {
        let name = event.target.name;
        let value = event.target.value;
        this.setState({[name]: value});
    }

    closeModal() {
        this.setState({
            open: false,
        });
        this.props.removeFunction();
    }

    async validateForm(event) {
        event.preventDefault();
        let error = false;
        let regex = new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[-#!\$@%\^&*\(\)_+\|~=\`\{\}\\[\\]:\"`;'<>\?,\./\\\\])(?=.{10,30})");
        if(!this.state.password || !regex.test(this.state.password))
        {
            this.setState({
                passwordError: "Password must be between 10-30 characters, contain at least 1 lowercase character, at least 1 uppercase character," + 
                "at least 1 number, and at least 1 special character"
            });
            error = true;
        }
        else
        {
            this.setState({
                passwordError: ""
            });
        }

        if(!error)
        {
            let params = {
                    password: this.state.password,
                    username: this.state.username,
                    firstName: this.state.firstName,
                    lastName: this.state.lastName
            };
            this.setState({
                awaitingResults: true,
                messageId: -1
            });
            let url = "/profile/" + this.state.currentUser + "/update";
            apiPostJsonRequest(url, params).then((result) =>{
                let status = result[0];
                let message = result[1].message;
                let requester = result[1].requester;
                this.updateInfoResultsHandler(status, message, requester, result);
            });
        }
    }

    updateInfoResultsHandler(status, message, requester, result)
    {
        let resultFound = true;
        if(status === 200)
        {
            this.props.setMessages({
                messages: [{type: "success", message: message}],
                clearMessages: true
            });
            // pass result to parent
            this.props.updateUserResultsHandler(status, message, requester, result);
            this.props.updateLoggedIn(requester);
            this.closeModal();
        }
        else
        {
            if(status === 400)
            {
                this.props.updateLoggedIn(requester);
                if(message.startsWith("Password must be between 10-30 characters"))
                {
                    this.setState({
                        passwordError: message,
                        awaitingResults: false
                    });
                }
                else
                {
                    resultFound = false;
                }
            }
            else if(status === 401)
            {
                if(message === "Password incorrect")
                {
                    this.props.updateLoggedIn(requester);
                    this.setState({
                        passwordError: message,
                        awaitingResults: false
                    });
                }
                else
                {
                    this.props.updateLoggedIn(requester);
                    resultFound = false;
                }
            }
            else
            {
                resultFound = false;
                this.props.updateLoggedIn(requester);
            }
            if(!resultFound)
            {
                // pass result to parent
                this.props.updateUserResultsHandler(status, message, requester, result);
            }
        }
    }

    // function to generate HTML for each section such as first name, last name, username, email
    generateInput(value, title)
    {
        let result = "";
        let errorType = value + "Error";
        if(this.state[errorType])
        {
            // fix the css using the forms.css file
            result = (
                <React.Fragment>
                    <div className={style.sectionHeader}>
                        <h3 className={`${style.h3Header} errorLabel`}>{title}</h3>
                    </div>
                    <div className={style.inputFieldContainer}>
                        <input
                            type="password"
                            name={value}
                            form="form3"
                            value={this.state[value]}
                            className={`${style.inputFieldBoxLong} inputBoxError`}
                            onChange={this.changeHandler}
                            maxlength={20}
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
                    </div>
                    <div className={style.inputFieldContainer}>
                        <input
                            type="password"
                            name={value}
                            form="form3"
                            value={this.state[value]}
                            className={`${style.inputFieldBoxLong} validInputBox`}
                            onChange={this.changeHandler}
                            maxlength={20}
                        />
                    </div>
                </React.Fragment>);
        }
        return result;
    }

    render() {
        let passwordInput = this.generateInput("password", "Enter Your Password:");

        return (
            <div>
                <Popup
                    open={this.state.open}
                    closeOnDocumentClick
                    className={"passwordValidation"}
                >
                <div className="modal">
                    {/* &times is the multiplication symbol (x) --> */}
                    <button className="close" onClick={this.closeModal}>
                    &times;
                    </button>
                    <Alert
                        messages={this.state.messages}
                        messageId={this.state.messageId}
                        innerContainerStyle={{"z-index": "2", "font-size": "1.25em", "width":"90%", "margin-left":"5%", "margin-right":"5%", "padding-top": "10px"}}
                        symbolStyle={{"width": "8%", "margin-top": "4px"}}
                        messageBoxStyle={{width: "80%"}}
                        closeButtonStyle={{width: "8%", "margin-top": "4px"}}
                        outterContainerStyle={{position: "inherit"}}
                        style={{"margin-bottom":"5px"}}
                    />
                    <div className="header">
                        <h3 className="inlineH3"> Change Password </h3>
                    </div>
                    <div className="content">
                        <form id="form3" onSubmit={this.validateForm} noValidate/>
                        {passwordInput}
                    </div>
                    <div className="actions">
                        <button
                            form="form3"
                            value="update_info"
                            className="submitButton"
                            onClick={this.validateForm}
                        >Update password</button>
                    </div>

                </div>
                </Popup>
            </div>
        );
    }

}

export default PasswordValidationPopUp;
