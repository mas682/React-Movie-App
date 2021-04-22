import React from 'react';
import { Redirect } from 'react-router-dom';
import Popup from 'reactjs-popup';
import './css/SetProfilePic/SetProfilePic.css';
import style from './css/SetProfilePic/SetProfilePic.module.css';
import {apiPostJsonRequest} from './StaticFunctions/ApiFunctions.js';
import Alert from './Alert.js';
import DragDropFile from './DragDropFile.js';

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
            imageData: undefined,
            cropping: false,
            editing: false
        };
        this.closeModal = this.closeModal.bind(this);
        this.changeHandler = this.changeHandler.bind(this);
        this.showLoginPopUp = this.showLoginPopUp.bind(this);
        this.generateEditDisplay = this.generateEditDisplay.bind(this);
        this.updateImage = this.updateImage.bind(this);
        this.sendApiRequest = this.sendApiRequest.bind(this);
        this.setCropping = this.setCropping.bind(this);
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
        console.log(result)
        this.setState({
            image: result.image,
            imageData: result.imageData,
            messages: [],
            messageId: -1,
            cropping: result.cropping,
            editing: result.cropping
        });
    }

    setCropping(cropping)
    {
        console.log(cropping);
        this.setState({
            cropping: cropping
        });
    }

    sendApiRequest()
    {
        let data = new FormData();
        data.append('file', this.state.image);
        let params = data;
        console.log(params);
        let header = { 'Content-Type': 'multipart/form-data'};
        header = {};
        let url = "http://localhost:9000/profile/" + this.state.currentUser + "/set_picture";
        this.setState({
            awaitingResults: true,
            messageId: -1
        });
        apiPostJsonRequest(url, params, header, false).then((result) =>{
            let status = result[0];
            let message = result[1].message;
            let requester = result[1].requester;
            //this.registrationResultsHandler(status, message, requester);
            alert(status);
            this.setState({
                awaitingResults: false
            });
        });
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
        let button = "";
        console.log(this.state.cropping);
        if(this.state.image !== undefined && !this.state.cropping)
        {
            button = (
                <div className="actions">
                    <div className={style.submitButtonContainer}>
                        <button
                            value="update_picture"
                            className="submitButton"
                            onClick={this.sendApiRequest}
                        >Upload Picture
                        </button>
                    </div>
                </div>
            );
        }
        else if(this.state.cropping)
        {
            button = (
                <div className="actions">
                    <div className={style.submitButtonContainer}>
                        <button
                            value="update_picture"
                            className="submitButton"
                        >Done Editing
                        </button>
                    </div>
                </div>
            );
        }
        let content = (
            <React.Fragment>
                <div className="content">
                    <div className={style.mainContainer}>
                        <div className={style.inputContainer}>
                            <DragDropFile
                                setImage={this.updateImage}
                                editing={this.state.editing}
                            />
                        </div>
                    </div>
                </div>
                {button}
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
            content = this.generateLoadingContent("Updating profile picture...");
        }
        else if(this.state.showSuccessPage)
        {
            // may want to just close it out and show an alert saying picture successfully
            // updated
            className = "verification";
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
                                symbolStyle={{"width": "8%", "margin-top": "2px"}}
                                messageBoxStyle={{width: "80%"}}
                                closeButtonStyle={{width: "8%", "margin-top": "2px"}}
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
