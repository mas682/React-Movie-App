import React from 'react';
import {Link} from 'react-router-dom';
import Dropdown from 'react-bootstrap/Dropdown'
import style2 from './css/MoviePost/moviePostPopUp.module.css'
import style from './css/MoviePost/moviePost.module.css';
import {apiPostJsonRequest} from './StaticFunctions/ApiFunctions.js';


class CommentDisplay extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            commentData: this.props.comment,
            currentUser: this.props.currentUser,
            commentId: this.props.comment.id,
            commentUser: this.props.comment.user.username,
            comment: this.props.comment.value,
            reviewUser: this.props.reviewUser,
            updateError: "",
            editComment: false,
            removeComment: false,
            props: this.props
        }
        this.buttonHandler = this.buttonHandler.bind(this);
        this.changeHandler = this.changeHandler.bind(this);
        this.generateEditComment = this.generateEditComment.bind(this);
        this.updateComment = this.updateComment.bind(this);
        this.generateRemoveButton = this.generateRemoveButton.bind(this);
        this.removeComment = this.removeComment.bind(this);
        this.cancelRemoval = this.cancelRemoval.bind(this);
        this.generateEditButtons = this.generateEditButtons.bind(this);
        this.commentUpdateResultHandler = this.commentUpdateResultHandler.bind(this);
        this.commentRemovalResultHandler = this.commentRemovalResultHandler.bind(this);
    }

    changeHandler(event)
    {
        let name = event.target.name;
        let value = event.target.value;
        this.setState({[name]: value});
    }

    // used to update the state for the title, review, and the rating
    buttonHandler(event) {
        let key = event.target.value;
        let value = !this.state[key];
        // if canceling editing the comment, reset the comment to it's original value
        if(key === "editComment" && value === false)
        {
            this.setState({
                [key]: value,
                comment: this.props.comment.value
            });
        }
        else
        {
            this.setState({[key]: value});
        }
    }

    static getDerivedStateFromProps(nextProps, prevState)
    {
        if(nextProps.comment.id !== prevState.commentId)
        {
            return CommentDisplay.updateNewState(nextProps);
        }
        else if(nextProps.comment.value !== prevState.props.comment.value)
        {
            return CommentDisplay.updateNewState(nextProps);
        }
        else
        {
            return null;
        }
    }

    /* this function should be called when a comment was removed to update an existing
    component to hold new data whenever the api call to get the comments is done */
    static updateNewState(nextProps) {
        return {
            commentData: nextProps.comment,
            currentUser: nextProps.currentUser,
            commentId: nextProps.comment.id,
            comment: nextProps.comment.value,
            commentUser: nextProps.comment.user.username,
            reviewUser: nextProps.reviewUser,
            updateError: "",
            editComment: false,
            removeComment: false,
            props: nextProps
        };
    }

    /*
        Used to send updated comments to the server for a review
    */
    async updateComment()
    {
        if(this.state.comment.length === 0)
        {
            this.setState({
                updateError: "You cannot post a empty comment"
            });
            return;
        }
        let url = "http://localhost:9000/review/updatecomment";
        let params = {
            comment: this.state.comment,
            commentId: this.state.commentId
        };
        let result = await apiPostJsonRequest(url, params);
        let status = result[0];
        let message = result[1].message;
        let requester = result[1].requester;
        this.commentUpdateResultHandler(status, message, requester);
    }

    commentUpdateResultHandler(status, message, requester)
    {
        if(status == 200)
        {
            this.setState({
                editComment: false,
                updateError: ""
            });
            this.props.updateLoggedIn(requester);
            // get the parent component to reload the comments
            this.props.updateComments();
            this.props.setMessage({messages: [{message: message, type: "success"}]});

        }
        else
        {
            this.props.updateLoggedIn(requester);
            if(status === 401)
            {
                if(message === "You cannot update another users comment")
                {
                    this.setState({
                        editComment: false,
                        comment: this.props.comment.value,
                        updateError: ""
                    });
                    this.props.setMessage({messages: [{message: message, type: "failure"}]});

                }
                else
                {
                    // not logged in
                    this.props.showLoginPopUp(false);
                }
            }
            else if(status === 400)
            {
                this.setState({
                    updateError: message
                });
            }
            else if(status === 404)
            {
                // comment could not be found
                // cause comment reload
                this.props.updateComments();
                this.props.setMessage({messages: [{message: message, type: "failure"}]});
            }
            else
            {
                // update failed for some unknown reason
                this.setState({
                    updateError: message
                });
            }
        }
    }

    cancelRemoval()
    {
        this.setState({
            removeComment: false
        });
    }

    /*
        Used to remove comments from a review
    */
    async removeComment()
    {
        let url = "http://localhost:9000/review/removecomment";
        let params = {
            comment: this.state.comment,
            commentId: this.state.commentId
        };
        let result = await apiPostJsonRequest(url, params);
        let status = result[0];
        let message = result[1].message;
        let requester = result[1].requester;
        this.commentRemovalResultHandler(status, message, requester);
    }

    commentRemovalResultHandler(status, message, requester)
    {
        if(status == 200)
        {
            this.setState({
                commentData: null,
                comment: "",
                removeComment: false,
                updateError: ""
            });
            this.props.updateLoggedIn(requester);
            // get the parent component to reload the comments
            this.props.updateComments();
            this.props.setMessage({messages: [{message: message, type: "success"}]});
        }
        else
        {
            this.props.updateLoggedIn(requester);
            if(status === 401)
            {
                if(message === "You cannot remove another users comment")
                {
                    this.setState({
                        removeComment: false,
                    });
                    this.props.setMessage({messages: [{message: message, type: "failure"}]});

                }
                else
                {
                    // not logged in
                    this.props.showLoginPopUp(false);
                }
            }
            else if(status === 400)
            {
                // error with comment ID format
                this.props.setMessage({messages: [{message: message, type: "failure"}]});
            }
            else if(status === 404)
            {
                // this is only true if trying to remove the comment as the user who posted the review
                if(message === "The review the comment was associated with could not be found")
                {
                    this.props.removePost();
                    this.props.closeFunction({messages: [{message: message, type: "failure"}]});

                }
                else
                {
                    // comment could not be found
                    // cause comment reload
                    this.props.updateComments();
                    // if the comment was not found may not care as it means it already
                    // does not exist?
                    this.props.setMessage({messages: [{message: message, type: "warning"}]});

                }
            }
            else
            {
                // update failed for some unknown reason
                this.setState({
                    updateError: message
                });
            }
        }
    }

    // used to generate the edit comment box
    generateEditComment()
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
        if(this.state.updateError !== "")
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
                                    <small className={`errorTextSmall`}>{this.state.updateError}</small>
                                </div>
                        </React.Fragment>);
        }
        return (<React.Fragment>
            <div className={style2.editCommentContainer}>
                {inputBox}
            </div>
            <div className={style2.editSubmitContainer}>
                <button value="editComment" className={`${style.postButton} ${style2.cancelButton}`} onClick={this.buttonHandler}>Cancel</button>
                <button className={`${style.postButton}`} onClick={this.updateComment}>Update Comment</button>
            </div>
        </React.Fragment>);
    }

    // used to generate the remove/cancel buttons when remove comment clicked
    generateRemoveButton()
    {
        return (<React.Fragment>
            <div className={style2.removalText}>
                Are you sure you want to remove the comment?
            </div>
            <div className={style2.removeContainer}>
                <button value="removeComment" className={`${style.postButton}`} onClick={this.cancelRemoval}>Cancel</button>
                <button className={`${style.postButton} ${style2.cancelButton}`} onClick={this.removeComment}>Remove</button>
            </div>
        </React.Fragment>);
    }

    generateEditButtons()
    {
        let buttons = null;
        if(this.state.commentUser === this.state.currentUser)
        {
            buttons = (<React.Fragment>
                <Dropdown.Item as="button" value="editComment" className={style2.dropDownButton} onClick={this.buttonHandler}>Edit Comment</Dropdown.Item>
                <Dropdown.Item as="button" value="removeComment" className={`${style2.dropDownButton} ${style2.removeCommentButton}`} onClick={this.buttonHandler}>Remove Comment</Dropdown.Item>
            </React.Fragment>);
        }
        else if(this.state.reviewUser === this.state.currentUser)
        {
            buttons = (<React.Fragment>
                <Dropdown.Item as="button" value="removeComment" className={`${style2.dropDownButton} ${style2.removeCommentButton}`} onClick={this.buttonHandler}>Remove Comment</Dropdown.Item>
                <Dropdown.Item as="button" className={style2.dropDownButton}>Report</Dropdown.Item>
            </React.Fragment>);
        }
        else
        {
            buttons = (<React.Fragment>
                <Dropdown.Item as="button" className={style2.dropDownButton}>Report</Dropdown.Item>
            </React.Fragment>);
        }
        return buttons;
    }

    render() {
        // if there is no data, the comment was just removed so just return null
        if(this.state.commentData === null)
        {
            return null;
        }
        // path to the users profile who posted the comment
        let userPath = "/profile/" + this.state.commentUser;
        // if the user selected to edit the comment
        if(this.state.editComment)
        {
            let commentBox = this.generateEditComment();
            return (
                <div className={style2.commentContainer}>
                    <div className={style2.userNameBox}>
                        <div className={style2.commentUser}><Link to={userPath}>{this.state.commentData.user.username}</Link></div>
                        <div className={style2.commentTime}>{this.state.commentData.createdAt}</div>
                    </div>
                    {commentBox}
                </div>
            )
        }
        // if the user selected to remove the comment
        else if(this.state.removeComment)
        {
            let removeBox = this.generateRemoveButton();
            return (
                <div className={style2.commentContainer}>
                    {removeBox}
                </div>
            )
        }
        else
        {
            let editButtons = this.generateEditButtons();
            return (
                <div className={style2.commentContainer}>
                    <div className={style2.userNameBox}>
                        <div className={style2.commentUser}><Link to={userPath}>{this.state.commentData.user.username}</Link></div>
                        <div className={style2.commentTime}>{this.state.commentData.createdAt}</div>
                    </div>
                    <Dropdown className={style2.editButtonContainer} drop="left">
                        <Dropdown.Toggle variant="success" id="dropdown-basic" className={style2.editButtons}>
                            &#10247;
                        </Dropdown.Toggle>
                        <Dropdown.Menu>
                            {editButtons}
                        </Dropdown.Menu>
                    </Dropdown>
                    <div className={style2.commentBox}>
                        <div>{this.state.comment}</div>
                    </div>
                </div>
            );
        }
    }

}

export default CommentDisplay;
