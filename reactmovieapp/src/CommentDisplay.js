import React from 'react';
import {Link} from 'react-router-dom';
import Dropdown from 'react-bootstrap/Dropdown'
import style2 from './css/MoviePost/moviePostPopUp.module.css'
import style from './css/MoviePost/moviePost.module.css';


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
            removeComment: false
        }
        this.buttonHandler = this.buttonHandler.bind(this);
        this.changeHandler = this.changeHandler.bind(this);
        this.generateEditComment = this.generateEditComment.bind(this);
        this.updateComment = this.updateComment.bind(this);
        this.generateRemoveButton = this.generateRemoveButton.bind(this);
        this.removeComment = this.removeComment.bind(this);
        this.updateNewState = this.updateNewState.bind(this);
        this.generateEditButtons = this.generateEditButtons.bind(this);
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


    // used when receiving a update from the CommentController
    componentWillReceiveProps(nextProps) {
        // if the props received are different than the curren state
       if(nextProps.comment.id !== this.state.commentId) {
          this.updateNewState(nextProps);
       }
    }

    /* this function should be called when a comment was removed to update an existing
    component to hold new data whenever the api call to get the comments is done */
    updateNewState(nextProps) {
        this.setState({
            commentData: nextProps.comment,
            currentUser: nextProps.currentUser,
            commentId: nextProps.comment.id,
            comment: nextProps.comment.value,
            commentUser: nextProps.comment.user.username,
            reviewUser: nextProps.reviewUser,
            updateError: "",
            editComment: false,
            removeComment: false
        })
    }

    /*
        Used to send updated comments to the server for a review
    */
    updateComment()
    {
        if(this.state.comment.length === 0)
        {
            this.setState({
                updateError: "You cannot post a empty comment"
            });
            return;
        }
        const requestOptions = {
            method: 'POST',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                comment: this.state.comment,
                commentId: this.state.commentId,
            })
        };
        let status = 0;
        fetch("http://localhost:9000/review/updatecomment", requestOptions)
            .then(res => {
                status = res.status;
                return res.json();
            }).then(result => {
                if(status == 200)
                {
                    this.setState({
                        commentData: result[0],
                        comment: result[0].value,
                        editComment: false,
                        updateError: ""
                    });
                }
                else
                {
                    alert(result[0]);
                    if(result[0] === "You cannot update another users comment")
                    {
                        this.setState({
                            editComment: false,
                            comment: this.props.comment.value,
                            updateError: ""
                        });
                    }
                    else if(result[0] === "Cannot post a empty comment")
                    {
                        this.setState({
                            updateError: "You cannot post a empty comment"
                        });
                    }
                }
            });
    }

    /*
        Used to remove comments from a review
    */
    removeComment()
    {
        const requestOptions = {
            method: 'POST',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                commentId: this.state.commentId,
            })
        };
        let status = 0;
        fetch("http://localhost:9000/review/removecomment", requestOptions)
            .then(res => {
                status = res.status;
                return res.text();
            }).then(result => {
                if(status == 200)
                {
                    this.setState({
                        commentData: null,
                        comment: "",
                        removeComment: false,
                        updateError: ""
                    });
                }
                else
                {
                    alert(result);
                    if(result === "You cannot remove another users comment")
                    {
                        this.setState({
                            removeComment: false
                        })
                    }
                }
            });
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
                <button value="removeComment" className={`${style.postButton}`} onClick={this.removeButton}>Cancel</button>
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
