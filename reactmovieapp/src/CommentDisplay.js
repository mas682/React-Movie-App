import React from 'react';
import {Link} from 'react-router-dom';
import style2 from './css/MoviePost/moviePostPopUp.module.css'


class CommentDisplay extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            comment: this.props.comment,
            currentUser: this.props.currentUser
        }
    }

    render() {
        let userPath = "/profile/" + this.state.comment.user.username;
        console.log(this.state.comment);
        return (
            <div className={style2.commentContainer}>
                <div className={style2.userNameBox}>
                    <div className={style2.commentUser}><Link to={userPath}>{this.state.comment.user.username}</Link></div>
                    <div className={style2.commentTime}>{this.state.comment.createdAt}</div>
                </div>
                <div className={style2.commentBox}>
                    <div>{this.state.comment.value}</div>
                </div>
            </div>
        );
    }

}

export default CommentDisplay;
