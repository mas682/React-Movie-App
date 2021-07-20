import React from 'react';
import {Link} from 'react-router-dom';
import style from './css/MoviePost/moviePost.module.css';
import style2 from './css/MoviePost/moviePostPopUp.module.css';
import {apiPostJsonRequest} from './StaticFunctions/ApiFunctions.js';


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
        this.commentResultHandler = this.commentResultHandler.bind(this);
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
    async postComment()
    {
        if(this.state.comment.length === 0)
        {
            this.setState({
                commentError: "You cannot post a empty comment"
            });
            return;
        }
        let url = "https://localhost:9000/review/postcomment";
        let params = {
            comment: this.state.comment,
            reviewId: this.state.reviewId,
        };
        let result = await apiPostJsonRequest(url, params);
        let status = result[0];
        let message = result[1].message;
        let requester = result[1].requester;
        this.commentResultHandler(status, message, requester);
    }

    commentResultHandler(status, message, requester)
    {
        if(status === 201)
        {
            this.setState({
                comment: "",
                commentError: ""
            });
            this.props.updateLoggedIn(requester);
            // update the popups state to get the commentController to reload the comments
            this.props.updateCommentsFunction();
        }
        else
        {
            this.props.updateLoggedIn(requester);
            if(status === 401)
            {
                // either not logged in or user could not be found
                // since posts are public for now, do not reroute
                this.props.showLoginPopUp(false);
            }
            else if(status === 400)
            {
                // comment in bad format or review id in bad format
                this.setState({
                    commentError: message
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
                // currently, only 500 option
                // server error
                this.setState({
                    commentError: message
                });
            }
        }

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
                <div className={style2.commentBoxContainer}>
                    {commentBox}
                </div>
                <div className={style2.commentSubmitContainer}>
                    <button
                        className={`${style.postButton} ${style2.commentButton}`}
                        onClick={this.postComment}>Post Comment
                    </button>
                </div>
            </React.Fragment>
        );
    }

}

export default CommentBox;
