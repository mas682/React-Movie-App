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
            // id of the review post
            reviewId: this.props.reviewId,
        }
        this.getComments = this.getComments.bind(this);
        this.generateComments = this.generateComments.bind(this);
    }

    async componentDidMount()
    {
        let result = await this.getComments();
        let status = result[0];
        alert(status);
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
        }
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
            let commentHtml = (<CommentDisplay comment={comment} currentUser={this.state.currentUser}/>);
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
