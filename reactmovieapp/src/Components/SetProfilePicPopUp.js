import React from 'react';
import Popup from 'reactjs-popup';
import '../css/SetProfilePic/SetProfilePic.css';
import style from '../css/SetProfilePic/SetProfilePic.module.css';
import {apiPostJsonRequest, apiGetJsonRequest} from '../StaticFunctions/ApiFunctions.js';
import Alert from './Alert.js';

class SetProfilePicPopUp extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            open: true,
            messages: [],
            messageId: -1,
            loading: true,
            awaitingResults: false,
            currentUser: props.currentUser,
            images: [],
            currentPicture: -1,
            selectedPicture: -1,
            hoveredPicture: undefined,
            usersPictureURL: props.userPicture
        };
        this.closeModal = this.closeModal.bind(this);
        this.changeHandler = this.changeHandler.bind(this);
        this.generateEditDisplay = this.generateEditDisplay.bind(this);
        this.sendApiRequest = this.sendApiRequest.bind(this);
        this.apiResultsHandler = this.apiResultsHandler.bind(this);

        this.selectPicture = this.selectPicture.bind(this);
        this.generateImages = this.generateImages.bind(this);
        this.setHoveredImage = this.setHoveredImage.bind(this);
        this.removeHoveredImage = this.removeHoveredImage.bind(this);
        this.getDefaultPictures = this.getDefaultPictures.bind(this);
        this.getImagesResultsHandler = this.getImagesResultsHandler.bind(this);
    }

    componentDidMount() {
        // clear the messages on mount
        this.props.setMessages({
            messages: undefined,
            clearMessages: true
        });
        this.getDefaultPictures();
    }

    closeModal() {
        this.props.removeFunction();
    }

    changeHandler(event) {
        let name = event.target.name;
        let value = event.target.value;
        this.setState({[name]: value});
    }

    setHoveredImage(index)
    {
        this.setState({
            hoveredPicture: index
        });
    }

    removeHoveredImage()
    {
        this.setState({
            hoveredPicture: undefined
        });
    }

    selectPicture(event, value) {
        this.setState({
            selectedPicture: value
        });
    }

    getDefaultPictures()
    {
        let url = "/profile/" + this.state.currentUser + "/get_profile_pictures";
        apiGetJsonRequest(url).then((result)=>{
            let status = result[0];
            let message = result[1].message;
            let requester = result[1].requester;
            this.getImagesResultsHandler(status, message, requester, result);
        })
    }

    getImagesResultsHandler(status, message, requester, result)
    {
        if(status === 200)
        {
            let currentPicture = -1;
            for(let image of result[1].images)
            {
                let url = image.source + image.filename;
                if(url === this.state.usersPictureURL)
                {
                    currentPicture = image.id;
                }
            }
            this.props.updateLoggedIn(requester);
            this.setState({
                loading: false,
                images: result[1].images,
                currentPicture: currentPicture,
                selectedPicture: currentPicture
            });

        }
        else
        {
            this.props.updateLoggedIn(requester);
            if(status === 404)
            {
                // "The profile path sent to the server does not exist"
                // should just about never occur
                this.setState({
                    loading: false,
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
                        loading: false
                    });
                    this.props.removeFunction();
                    this.props.showLoginPopUp(false);
                }
            }
            else if(status === 400)
            {
                this.props.setMessages({messages:[{message: message, type: "failure"}]});
                this.props.removeFunction();
            }
            else if(status === 500)
            {
                this.setState({
                    loading: false,
                    messages: [{message: message, type: "failure", timeout: 0}],
                    messageId: this.state.messageId + 1
                });
            }
            else
            {
                message = "A unexpected status code (" + status + ") was returned from the server";
                this.setState({
                    loading: false,
                    messages: [{message: message, type: "failure", timeout: 0}],
                    messageId: this.state.messageId + 1
                });
            }
        }
    }

    sendApiRequest()
    {
        if(this.state.selectedPicture === this.state.currentPicture) return;
        let params = {
            picture: this.state.selectedPicture
        };

        let url = "/profile/" + this.state.currentUser + "/set_picture";
        this.setState({
            awaitingResults: true,
            messageId: -1
        });
        apiPostJsonRequest(url, params).then((result) =>{
            let status = result[0];
            let message = result[1].message;
            let requester = result[1].requester;
            this.apiResultsHandler(status, message, requester, result);
        });
    }

    // results handler used for both updating or removing picture
    apiResultsHandler(status, message, requester, result)
    {
        if(status === 200)
        {
            // "User picture successfully updated"
            this.props.updateLoggedIn(requester);
            this.props.setMessages({
                messages: [{message: message, type: "success"}]
            });
            this.setState({
                awaitingResults: false
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

    generateImages()
    {
        let output = [];
        let html = "";

        // need to change the url...
        let userPictureSrc = "https://movie-fanatics-bucket1.s3.amazonaws.com/UserPictures/default-pic-";
        for(let image of this.state.images)
        {
            let value = image.id;
            let picture = image.source + image.filename;
            if(this.state.hoveredPicture !== undefined && this.state.selectedPicture === value)
            {
                if(value === this.state.hoveredPicture)
                {
                    // if the hovered picture is this picture
                    html = (
                        <div
                            className={`${style.profilePictureContainer} ${style.selectedPicture}`}
                            onMouseEnter={() => {this.setHoveredImage(value)}}
                            onMouseLeave={()=>{this.removeHoveredImage()}}
                        >
                            <img className={`${style.profilePicture}`} src={picture} />
                        </div>
                    )
                }
                else
                {
                    html = (
                        <div
                            className={`${style.profilePictureContainer} ${style.selectedPictureNotHovered}`}
                            onMouseEnter={() => {this.setHoveredImage(value)}}
                            onMouseLeave={()=>{this.removeHoveredImage()}}
                        >
                            <img className={`${style.profilePicture}`} src={picture} />
                        </div>
                    );
                }
            }
            else
            {
                if(value === this.state.selectedPicture)
                {
                    // if the hovered picture is this picture
                    html = (
                        <div
                            className={`${style.profilePictureContainer} ${style.selectedPicture}`}
                            onMouseEnter={() => {this.setHoveredImage(value)}}
                            onMouseLeave={()=>{this.removeHoveredImage()}}
                        >
                            <img className={`${style.profilePicture}`} src={picture} />
                        </div>
                    )
                }
                else
                {
                    html = (
                        <div
                            className={`${style.profilePictureContainer}`}
                            onMouseEnter={() => {this.setHoveredImage(value)}}
                            onMouseLeave={()=>{this.removeHoveredImage()}}
                            onClick={(event)=>{this.selectPicture(event, image.id)}}
                        >
                            <img className={`${style.profilePicture}`} src={picture} />
                        </div>
                    )
                }
            }

            output.push(html);
        }

        return output;
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
        let button = (
            <button value="update_picture"
                className="submitButton"
                onClick={this.sendApiRequest}
            >Change Picture
            </button>
        );
        if(this.state.selectedPicture === this.state.currentPicture)
        {
            button = (
                <button value="update_picture"
                    className="submitButton"
                    onClick={this.sendApiRequest}
                    disabled
                >Change Picture
                </button>
            );
        }
        button = (
            <div className="actions">
                <div className={style.submitButtonContainer}>
                    {button}
                </div>
            </div>
        );
        let images = this.generateImages();
        let content = (
            <React.Fragment>
                <div className={style.content}>
                    <div className={style.mainContainer}>
                        <div className={style.inputContainer}>
                            <div className={style.selectionContainer}>
                                {images}
                            </div>
                        </div>
                        {button}
                    </div>
                </div>
            </React.Fragment>);
        return content;
    }


    render() {
        let content;
        let className = "profilePicPopup";
        if(this.state.loading)
        {
            content = this.generateLoadingContent("Loading profile picture options...");
        }
        else if(!this.state.awaitingResults)
        {
            content = this.generateEditDisplay();
        }
        else if(this.state.awaitingResults)
        {
            content = this.generateLoadingContent("Updating profile picture...");
        }


        let header = "Set Profile Picture";
        return (
            <div>
                <Popup
                    open={this.state.open}
                    closeOnDocumentClick
                    onClose={this.closeModal}
                    className={className}
                    >
                    <div className={style.modal}>
                        {/* &times is the multiplication symbol (x) --> */}
                        <a className={style.close} onClick={this.closeModal}>
                        &times;
                        </a>
                        <div className={style.header}>
                            <h3 className="inlineH3">{header}</h3>
                        </div>
                        <div className={style.alertContent}>
                            <Alert
                                messages={this.state.messages}
                                messageId={this.state.messageId}
                                innerContainerStyle={{"z-index": "2", "font-size": "1.0em", "width":"90%", "margin-left":"5%", "margin-right":"5%", "padding-top": "10px"}}
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


export default SetProfilePicPopUp;
