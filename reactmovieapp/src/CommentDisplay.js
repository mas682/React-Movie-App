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
            comment: this.props.comment.value,
            editComment: false
        }
        this.editButtonHandler = this.editButtonHandler.bind(this);
        this.buttonHandler = this.buttonHandler.bind(this);
        this.changeHandler = this.changeHandler.bind(this);
        this.generateEditComment = this.generateEditComment.bind(this);
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
        this.setState({[key]: value});
    }

    generateEditComment()
    {
        return (<React.Fragment>
            <div className={style2.tester}>
                <textarea
                    type="text"
                    name="comment"
                    form = {this.state.form}
                    value={this.state.comment}
                    className={`inputFieldBoxLong`}
                    onChange={this.changeHandler}
                    rows="3"
                    placeholder="Add a comment"
                />
            </div>
            <div className={style2.editSubmitContainer}>
                <button value="editComment" className={`${style.postButton} ${style2.cancelButton}`} onClick={this.buttonHandler}>Cancel</button>
                <button className={`${style.postButton}`} onClick={this.postComment}>Update Comment</button>
            </div>
        </React.Fragment>);
    }

    editButtonHandler()
    {
        alert("HERE");
    }

    render() {
        let userPath = "/profile/" + this.state.commentData.user.username;
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
                    <Dropdown.Item as="button" value="editComment" className={style2.dropDownButton} onClick={this.buttonHandler}>Edit Comment</Dropdown.Item>
                    <Dropdown.Item as="button" className={`${style2.dropDownButton} ${style2.removeCommentButton}`}>Remove Comment</Dropdown.Item>
                    <Dropdown.Item as="button" className={style2.dropDownButton}>Report</Dropdown.Item>
                  </Dropdown.Menu>
                </Dropdown>
                <div className={style2.commentBox}>
                    <div>{this.state.comment}</div>
                </div>
            </div>
        );
    }

}

export default CommentDisplay;
