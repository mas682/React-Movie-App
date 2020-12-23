import React from 'react';
import CommentDisplay from './CommentDisplay.js';
import {Link} from 'react-router-dom';
import style2 from './css/MoviePost/moviePostPopUp.module.css'
import {apiGetJsonRequest} from './StaticFunctions/ApiFunctions.js';


class CommentController extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            comments: [],
            // the logged in users username
            currentUser: this.props.currentUser,
            // username of user who posted the review
            reviewUser: this.props.reviewUser,
            // id of the review post
            reviewId: this.props.reviewId,
            intervalId: ""
        }
        this.getComments = this.getComments.bind(this);
        this.receiveCommentsResultHandler = this.receiveCommentsResultHandler.bind(this);
        this.generateComments = this.generateComments.bind(this);
        this.updateComments = this.updateComments.bind(this);
    }

    componentDidUpdate(prevProps, prevState)
    {
        // if there was a new comment posted by the user
        if(this.props.update)
        {
            this.getComments();
        }
    }

    async componentDidMount()
    {
        // update comments every 15 seconds
        let apiInterval = setInterval(()=> {
            this.getComments();
        }, 15000);
        this.setState({intervalId: apiInterval});
        this.getComments();
    }

    // function used to send api call to the server to get the comments
    async getComments()
    {
        let url = "http://localhost:9000/review/" + this.state.reviewId + "/getcomments";
        let result = await apiGetJsonRequest(url);
        let status = result[0];
        let message = result[1].message;
        let requester = result[1].requester;
        this.receiveCommentsResultHandler(status, message, requester, result);
    }

    receiveCommentsResultHandler(status, message, requester, result)
    {
        if(status === 200)
        {
            let comments = result[1].comments;
            this.setState({
                comments: comments,
                currentUser: requester
            });
            this.props.updateLoggedIn(requester);
            // calls the moviePostPopups setMessage
            this.props.setMessages({messages: [{message: message, type: "success"}]});

        }
        else
        {
            this.props.updateLoggedIn(requester);
            if(status === 401)
            {
                this.props.showLoginPopUp(false);
            }
            else if(status === 400)
            {
                // reviewId invalid due to format
                this.props.setMessages({messages: [{message: message, type: "failure"}]});
                // stop the component from querying for data
                clearInterval(this.state.intervalId);
                this.setState({
                    comments: []
                });
            }
            else if(status === 404)
            {
                // review could not be found
                // remove the post from the moviePost component
                this.props.removePost();
                // close the popup and display the message on the screen
                this.props.closeFunction({messages: [{message: message, type: "failure"}]});

            }
            else
            {
                // stop the component from querying for data
                clearInterval(this.state.intervalId);
                this.props.setMessages({messages: [{message: message, type: "failure"}]});
            }
        }
    }

    // function called when a comment is deleted or updated
    updateComments(results)
    {
        this.setState({
            comments: results[0],
            currentUser: results[1]
        });
    }

    componentWillUnmount()
    {
        // stop the component from querying for data
        clearInterval(this.state.intervalId);
    }

    // function to generate the html for each individual comment
    generateComments()
    {
        let commentsArray = [];
        this.state.comments.forEach((comment) => {
            let commentHtml = (
                    <CommentDisplay
                        comment={comment}
                        reviewUser={this.state.reviewUser}
                        currentUser={this.state.currentUser}
                        updateLoggedIn={this.props.updateLoggedIn}
                        showLoginPopUp={this.props.showLoginPopUp}
                        removePost={this.props.removePost}
                        closeFunction={this.props.closeFunction}
                        setMessage={this.props.setMessages}
                        updateComments={this.getComments}
                    />);
            commentsArray.push(commentHtml);
        });
        return commentsArray;
    }

    render() {
        let comments = this.generateComments();
        return (
            <div className={style2.commentsContainer}>
                {comments}
            </div>
        );
    }

}

export default CommentController;
