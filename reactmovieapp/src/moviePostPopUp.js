import React from 'react';
import style from './css/MoviePost/moviePost.module.css';
import Popup from 'reactjs-popup';
import CommentController from './CommentController.js';
import CommentBox from './CommentBox.js';
import MoviePost from './moviePost.js';
import {Link} from 'react-router-dom';
import style2 from './css/MoviePost/moviePostPopUp.module.css';
import './css/MoviePost/moviePostPopUp.css';
import {generateMessageState} from './StaticFunctions/StateGeneratorFunctions.js';
// only used by popup
import Alert from './Alert.js';



class MoviePostPopUp extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            data: this.props.data,
            // boolean for whether or not this pop up is open
            open: this.props.data.openPopUp,
            // boolean for opening the edit pop up
            openEdit: false,
            // form id for the post
            form: this.props.data.form + "pop",
            // username for the user who posted the review
            username: this.props.data.username,
            // id of the review post
            id: this.props.data.id,
            // the logged in users username
            currentUser: this.props.data.currentUser,
            // boolean to tell commentController to update if new comment was just posted
            // by the current user
            newComment: false,
            removePost: false,
            messages: "",
            messageId: -1
        };

        this.closeModal = this.closeModal.bind(this);
        this.changeState = this.changeState.bind(this);
        this.updateComments = this.updateComments.bind(this);
        this.setMessage = this.setMessage.bind(this);
    }

    // called after component was updated
    componentDidUpdate()
    {
        // if there was a new comment on the last render, reset the boolean to false
        // so that the CommentController does not continuously try to get new comments
        if(this.state.newComment !== false)
        {
            // set the newComment boolean to false
            this.setState({
                newComment: false,
            });
        }
    }

    // called whenever the state is changed for optimization
    shouldComponentUpdate(nextProps, nextState){
        return true;
    }

    // called by the CommentBox component when a comment is posted
    // this will cause the component to rerender and update the props sent to
    // the CommentController component
    updateComments()
    {
        this.setState({
            newComment: true,
        });
    }

    // function to change the state of the component
    changeState(key, value)
    {
        this.setState({[key]: value});
    }

    // function called when closing the popup
    closeModal(messageState) {
        this.setState({
            open: false,
        });
        // optional message to display in parent
        if(messageState !== undefined)
        {
            console.log(messageState);
            this.props.setMessages(messageState);
        }
        this.props.removeFunction("openPopUp", false);
    }

    setMessage(messageState)
    {
        this.setState(generateMessageState(messageState, this.state.messageId));
    }

	render() {
        console.log(this.state);
        let commentArray = <CommentController
                                currentUser={this.state.currentUser}
                                reviewUser={this.state.username}
                                reviewId={this.state.id}
                                update={this.state.newComment}
                                updateLoggedIn={this.props.updateLoggedIn}
                                showLoginPopUp={this.props.showLoginPopUp}
                                removePost={this.props.removePost}
                                closeFunction={this.closeModal}
                                setMessages={this.setMessage}
                            />;
        let commentBox = <CommentBox
                            reviewId={this.state.id}
                            form={this.state.form}
                            updateCommentsFunction={this.updateComments}
                            updateLoggedIn={this.props.updateLoggedIn}
                            showLoginPopUp={this.props.showLoginPopUp}
                            removePost={this.props.removePost}
                            closeFunction={this.closeModal}
                        />;
        let moviePost = <MoviePost
                            data={this.state.data}
                            type={"popup"}
                            updateLiked={this.props.updateLiked}
                            closeFunction={this.closeModal}
                            updatePost={this.props.updatePost}
                            updatePopUpState={this.changeState}
                            removePost={this.props.removePost}
                            showLoginPopUp={this.props.showLoginPopUp}
                            updateLoggedIn={this.props.updateLoggedIn}
                            setMessages={this.setMessage}
                            updateFollowingFunction={this.props.updateFollowingFunction}
                            updateFollowersFunction={this.props.updateFollowersFunction}
                        />;
        if(this.state.removePost)
        {
            commentBox = "";
            commentArray = "";
        }
        return (
            <React.Fragment>
            <Popup
                open={this.state.open}
                closeOnDocumentClick
                onClose={() => {this.closeModal(undefined)}}
                className={"moviePostPopUp"}
            >
                <div className={style2.modal}>
                    {/* &times is the multiplication symbol (x) --> */}
                    <a className={style2.close} onClick={this.closeModal}>
                    &times;
                    </a>
                    <div className={style2.content}>
                        <div className={`${style.post} ${style2.postWidth}`}>
                            <Alert
                                messages={this.state.messages}
                                messageId={this.state.messageId}
                                style={{"text-align": "left"}}
                                symbolStyle={{"width": "5%", "margin-top": "0px"}}
                                messageBoxStyle={{width: "86%"}}
                                closeButtonStyle={{width: "5%", "margin-top": "0px"}}
                                timeout={0}
                            />
                            {moviePost}
                            {commentBox}
                            {commentArray}
                        </div>
                    </div>
                </div>
            </Popup>
            </React.Fragment>
        );
    }
}

export default MoviePostPopUp;
