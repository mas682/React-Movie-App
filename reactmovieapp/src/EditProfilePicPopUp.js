import React from 'react';
import { Link, Redirect } from 'react-router-dom';
import Popup from 'reactjs-popup';
import './css/SetProfilePic/SetProfilePic.css';
import style from './css/SetProfilePic/SetProfilePic.module.css';
import {apiPostJsonRequest} from './StaticFunctions/ApiFunctions.js';
import Alert from './Alert.js';
import DragDropFile from './DragDropFile.js';

// documentation for PopUp https://react-popup.elazizi.com/component-api/
class EditProfilePicPopUp extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            open: true,
            messages: [],
            messageId: -1,
            showSuccessPage: false,
            awaitingResults: false,
            currentUser: props.currentUser,
            image: undefined,
            imageData: undefined
        };

        this.closeModal = this.closeModal.bind(this);
        this.changeHandler = this.changeHandler.bind(this);
        this.showLoginPopUp = this.showLoginPopUp.bind(this);
        this.generateEditDisplay = this.generateEditDisplay.bind(this);
        this.generateVerificationInput = this.generateVerificationInput.bind(this);
        this.updateImage = this.updateImage.bind(this);
//        this.sendVerification = this.sendVerification.bind(this);
    }

    closeModal() {
        this.props.removeFunction();
    }

    showLoginPopUp() {
        this.props.showLoginPopUp();
        this.closeModal();
    }

    changeHandler(event) {
        let name = event.target.name;
        let value = event.target.value;
        this.setState({[name]: value});
    }

    updateImage(result)
    {
        this.setState({
            image: result.image,
            imageData: result.imageData
        });
    }


    generateVerificationInput()
    {
        let verificationInput =  (
            <React.Fragment>
                <label>
                    <h4 className={style.inputFieldH4} id="validLabel">Profile pic:</h4>
                </label>
                <div className={style.verificationInputContainer}>
                    <DragDropFile setImage={this.updateImage}/>
                </div>
            </React.Fragment>);
        if(this.state.verificationError)
        {
            verificationInput = (
                <React.Fragment>
                    <label>
                        <h4 className={`${style.inputFieldH4} errorLabel`}>Verification Code:</h4>
                    </label>
                    <div className={style.verificationInputContainer}>
                        <input
                            type="text"
                            name="verificationCode"
                            form = "form2"
                            maxLength = {6}
                            autocomplete="off"
                            disabled={this.state.lockVerificationInput}
                            className={`inputFieldBoxLong inputBoxError ${style.verificationInput}`}
                            onChange={this.changeHandler}
                        />
                    </div>
                    <small className="errorTextSmall">{this.state.verificationError}</small>
                </React.Fragment>);
        }
        return verificationInput;
    }


    generateLoadingContent(message)
    {
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

    generateEditDisplay()
    {
        let verificationInput = this.generateVerificationInput();
        // add text saying email sent to...
        let content = (
            <React.Fragment>
                <div className="content">
                    <form id="form2" onSubmit={this.requestVerificationCode} noValidate/>
                    <div className={style.verificationContainer}>
                        {verificationInput}
                    </div>
                </div>
                <div className="actions">
                    <div className={style.verificationButtonContainer}>
                        <button
                            form="form2"
                            value="create_account"
                            className="submitButton"
                            onClick={this.sendVerification}
                        >VERIFY ACCOUNT
                        </button>
                    </div>
                </div>
            </React.Fragment>);
        return content;
    }


    render() {
        let content;
        let className = "profilePicPopup";
        if(!this.state.showSuccessPage && !this.state.awaitingResults)
        {
            content = this.generateEditDisplay();
        }
        else if(!this.state.showSuccessPage && this.state.awaitingResults)
        {
            content = this.generateLoadingContent("Processing request...");
        }
        else if(this.state.showSuccessPage)
        {
            className = "verification";
            content = this.generateVerificationForm();
        }


        return (
            <div>
                <Popup
                    open={this.state.open}
                    closeOnDocumentClick
                    onClose={this.closeModal}
                    className={className}
                    >
                    <div className="modal">
                        {/* &times is the multiplication symbol (x) --> */}
                        <a className="close" onClick={this.closeModal}>
                        &times;
                        </a>
                        <div className="header">
                            <h3 className="inlineH3"> Set Profile Picture</h3>
                        </div>
                        <div className={style.alertContent}>
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
                        </div>
                        {content}
                    </div>
                </Popup>
            </div>
        );
    }
}


export default EditProfilePicPopUp;
