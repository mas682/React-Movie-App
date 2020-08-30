import React from 'react';
import {Link} from 'react-router-dom';
import style from './css/MoviePost/moviePost.module.css';
import style2 from './css/MoviePost/moviePostPopUp.module.css'


class CommentBox extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            comment: "",
            form: this.props.form,
            reviewId: this.props.reviewId,
            commentError: ""
        }
        this.changeHandler = this.changeHandler.bind(this);
        this.postComment = this.postComment.bind(this);
        this.generateCommentBox = this.generateCommentBox.bind(this);
    }

    // used to update the state for the title, review, and the rating
    changeHandler(event) {
        let name = event.target.name;
        let value = event.target.value;
        this.setState({[name]: value});
    }

    /*
        Used to post comments to the server for a review
    */
    postComment()
    {
        if(this.state.comment.length === 0)
        {
            this.setState({
                commentError: "You cannot post a empty comment"
            });
            return;
        }
        const requestOptions = {
            method: 'POST',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                comment: this.state.comment,
                reviewId: this.state.reviewId,
            })
        };
        let status = 0;
        fetch("http://localhost:9000/review/postcomment", requestOptions)
            .then(res => {
                status = res.status;
                return res.json();
            }).then(result => {
                if(status == 201)
                {
                    this.setState({
                        comment: "",
                        commentError: ""
                    });
                    // return the all the comments for the post and the user who posted it
                    // to the pop up
                    this.props.updateCommentsFunction(result[0], result[1]);
                }
                else
                {
                    if(result[0] === "You cannot post a empty comment")
                    {
                        this.setState({
                            commentError: "You cannot post a empty comment"
                        });
                    }
                    else
                    {
                        alert(result[0]);
                    }
                }
            });
    }

    generateCommentBox()
    {
        let inputBox = (<textarea
                            type="text"
                            name="comment"
                            form = {this.state.form}
                            value={this.state.comment}
                            className={`inputFieldBoxLong validInputBox`}
                            onChange={this.changeHandler}
                            rows="3"
                            placeholder="Add a comment"
                        />);
        if(this.state.commentError !== "")
        {
            inputBox = (<React.Fragment>
                            <textarea
                                    type="text"
                                    name="comment"
                                    form = {this.state.form}
                                    value={this.state.comment}
                                    className={`inputFieldBoxLong inputBoxError`}
                                    onChange={this.changeHandler}
                                    rows="3"
                                    placeholder="Add a comment"
                                />
                                <div className={style2.errorText}>
                                    <small className={`errorTextSmall`}>{this.state.commentError}</small>
                                </div>
                        </React.Fragment>);
        }
        return inputBox;
    }

    render() {
        let commentBox = this.generateCommentBox();
        return (
            <React.Fragment>
                <div>
                    {commentBox}
                </div>
                <div className="commentSubmitContainer">
                    <button className={`${style.postButton} ${style2.commentButton}`} onClick={this.postComment}>Post Comment</button>
                </div>
            </React.Fragment>
        );
    }

}

export default CommentBox;
