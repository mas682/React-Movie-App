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
            originalImage: undefined,
            originalImageData: undefined,
            croppedImage: undefined,
            croppedImageData: undefined,
            croppedDimensions: undefined
        };
        this.closeModal = this.closeModal.bind(this);
        this.changeHandler = this.changeHandler.bind(this);
        this.showLoginPopUp = this.showLoginPopUp.bind(this);
        this.generateEditDisplay = this.generateEditDisplay.bind(this);
        this.updateImage = this.updateImage.bind(this);
        this.sendApiRequest = this.sendApiRequest.bind(this);
        this.removeImage = this.removeImage.bind(this);
        this.setPictureResultsHandler = this.setPictureResultsHandler.bind(this);
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

    // function called by DragDropFile to update image
    updateImage(result)
    {
        if(result.type === "original")
        {
            this.setState({
                originalImage: result.image,
                originalImageData: result.imageData,
                messages: [],
                messageId: -1,
            });
        }
        else
        {
            this.setState({
                croppedImage: result.image,
                croppedImageData: result.imageData,
                messages: [],
                messageId: -1,
                croppedDimensions: result.croppedDimensions
            });
        }
    }

    // function called by DragDropFile
    removeImage()
    {
        this.setState({
            originalImage: undefined,
            originalImageData: undefined,
            croppedImage: undefined,
            croppedImageData: undefined,
            croppedDimensions: undefined
        });
    }

    sendApiRequest()
    {
        let data = new FormData();
        data.append('file', this.state.croppedImage);
        let params = data;
        console.log(params);
        let header = {};
        let url = "http://localhost:9000/profile/" + this.state.currentUser + "/set_picture";
        this.setState({
            awaitingResults: true,
            messageId: -1
        });
        apiPostJsonRequest(url, params, header, false).then((result) =>{
            let status = result[0];
            let message = result[1].message;
            let requester = result[1].requester;
            this.setPictureResultsHandler(status, message, requester, result);
        });
    }

    setPictureResultsHandler(status, message, requester, result)
    {
        if(status === 200)
        {
            // "User picture successfully updated"
            this.props.updateLoggedIn(requester);
            this.props.setMessages({
                messages: [{message: message, type: "success"}]
            });
            this.props.pictureUpdated(true);
            this.props.removeFunction();
        }
        else
        {
            this.props.updateLoggedIn(requester);
            if(status === 404)
            {
                // "The profile path sent to the server does not exist"
                // should just about never occur
                this.setState({
                    awaitingResults: false,
                    messages: [{message: message, type: "failure", timeout: 0}],
                    messageId: this.state.messageId + 1
                });
            }
            else if(status === 401)
            {
                if(message === "The user passed in the url does not match the requester")
                {
                    // close the pop up
                    this.props.removeFunction();
                    this.props.setMessages({messages:[{message: message, type: "failure"}]});
                }
                else
                {
                    this.setState({
                        awaitingResults: false
                    });
                    this.props.removeFunction();
                    this.props.showLoginPopUp(false);
                }
            }
            else if(status === 400)
            {
                // scenarios:
                // Invalid username found in the url
                // username in url cannot possibly be a username
                // "The provided file is too large(max size: 12MB)"
                // "The file could not be found in the request"
                // "Only 1 image can be sent in the request"
                // 'Invalid file type'
                //  'File name cannot be greater than 100 characters or less than 5 characters'
                // "The new profile picture could not be found in the request"
                    // file not found in request as not defined as file: image in reqeust
                this.setState({
                    awaitingResults: false,
                    messages: [{message: message, type: "failure", timeout: 0}],
                    messageId: this.state.messageId + 1
                });
            }
            else if(status === 500)
            {
                this.setState({
                    awaitingResults: false,
                    messages: [{message: message, type: "failure", timeout: 0}],
                    messageId: this.state.messageId + 1
                });
            }
            else
            {
                message = "A unexpected status code (" + status + ") was returned from the server";
                this.setState({
                    awaitingResults: false,
                    messages: [{message: message, type: "failure", timeout: 0}],
                    messageId: this.state.messageId + 1
                });
            }
        }
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
        if(this.state.croppedImage !== undefined)
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
        let content = (
            <React.Fragment>
                <div className="content">
                    <div className={style.mainContainer}>
                        <div className={style.inputContainer}>
                            <DragDropFile
                                setImage={this.updateImage}
                                removeImage={this.removeImage}
                                image={this.state.originalImage}
                                imageData={this.state.originalImageData}
                                croppedImageData={this.state.croppedImageData}
                                croppedDimensions={this.state.croppedDimensions}
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
