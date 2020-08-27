import React from 'react';
import {Link} from 'react-router-dom';
import Dropdown from 'react-bootstrap/Dropdown'
import style2 from './css/MoviePost/moviePostPopUp.module.css'


class CommentDisplay extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            comment: this.props.comment,
            currentUser: this.props.currentUser
        }
        this.editButtonHandler = this.editButtonHandler.bind(this);
    }

    editButtonHandler()
    {
        alert("HERE");
    }

    render() {
        let userPath = "/profile/" + this.state.comment.user.username;
        return (
            <div className={style2.commentContainer}>
                <div className={style2.userNameBox}>
                    <div className={style2.commentUser}><Link to={userPath}>{this.state.comment.user.username}</Link></div>
                    <div className={style2.commentTime}>{this.state.comment.createdAt}</div>
                </div>
                <Dropdown className={style2.editButtonContainer} drop="left">
                  <Dropdown.Toggle variant="success" id="dropdown-basic" className={style2.editButtons}>
                    &#10247;
                  </Dropdown.Toggle>

                  <Dropdown.Menu>
                    <Dropdown.Item as="button" className={style2.dropDownButton}>Action</Dropdown.Item>
                    <Dropdown.Item as="button" bsPrefix={style2.dropDownButton}>Another action</Dropdown.Item>
                    <Dropdown.Item as="button" bsPrefix={style2.dropDownButton}>Something else</Dropdown.Item>
                  </Dropdown.Menu>
                </Dropdown>
                <div className={style2.commentBox}>
                    <div>{this.state.comment.value}</div>
                </div>
            </div>
        );
    }

}

export default CommentDisplay;
