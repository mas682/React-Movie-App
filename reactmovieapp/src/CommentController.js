import React from 'react';
import CommentDisplay from './CommentDisplay.js';
import {Link} from 'react-router-dom';
import style2 from './css/MoviePost/moviePostPopUp.module.css'


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
        this.generateComments = this.generateComments.bind(this);
        this.sendCommentCall = this.sendCommentCall.bind(this);
        this.updateComments = this.updateComments.bind(this);
    }

    componentWillReceiveProps(nextProps) {
        // if the props were received due to the user posting a new comment
       if(nextProps.update) {
          this.updateComments([nextProps.comments, nextProps.currentUser]);
       }
    }

    async componentDidMount()
    {
        // update comments every 15 seconds
        let apiInterval = setInterval(()=> {
            this.sendCommentCall();
        }, 15000);
        this.setState({intervalId: apiInterval});
        this.sendCommentCall();
    }

    // function used to send api call to the server to get the comments
    async sendCommentCall()
    {
        let result = await this.getComments();
        let status = result[0];
        if(status === 200)
        {
            this.setState({
                comments: result[1][0],
                currentUser: result[1][1]
            });
        }
        else
        {
            alert("Failed to get the comments for the post");
            alert(result);
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

    // function to receive the comments from the api
    getComments()
    {
        const requestOptions = {
            method: 'POST',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json'},
            body: JSON.stringify({
                reviewId: this.state.reviewId
            })
        };

        let status = 0;
        return fetch("http://localhost:9000/review/getcomments", requestOptions)
            .then(res => {
                status = res.status;
                return res.json();
            }).then(result =>{
                return [status, result];
            });
    }

    // function to generate the html for each individual comment
    generateComments()
    {
        let commentsArray = [];
        this.state.comments.forEach((comment) => {
            let commentHtml = (<CommentDisplay comment={comment} reviewUser={this.state.reviewUser} currentUser={this.state.currentUser}/>);
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
