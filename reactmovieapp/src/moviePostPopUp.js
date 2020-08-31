import React from 'react';
import style from './css/MoviePost/moviePost.module.css';
import Popup from 'reactjs-popup';
import CommentController from './CommentController.js';
import CommentBox from './CommentBox.js';
import MoviePost from './moviePost.js';
import {Link} from 'react-router-dom';
import style2 from './css/MoviePost/moviePostPopUp.module.css'



class MoviePostPopUp extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            data: this.props.data,
            // boolean for whether or not this pop up is open
            open: this.props.data.openPopUp,
            // boolean for opening the edit pop up
            openEdit: false,
            // form id for the post
            form: this.props.data.form + "pop",
            // username for the user who posted the review
            username: this.props.data.username,
            // id of the review post
            id: this.props.data.id,
            comments: "",
            // the logged in users username
            currentUser: this.props.data.currentUser,
            // boolean to tell commentController to update if new comment was just posted
            // by the current user
            newComment: false
        };

        this.closeModal = this.closeModal.bind(this);
        this.changeState = this.changeState.bind(this);
        this.updateComments = this.updateComments.bind(this);
    }

    // called after component was updated
    componentDidUpdate()
    {
        // if there was a new comment on the last render, reset the boolean to false
        // this will cause shouldComponentUpdate to be called which will return false
        if(this.state.newComment !== false)
        {
            // set the newComment boolean to false
            this.changeState("newComment", false);
        }
    }

    // called whenever the state is changed for optimization
    shouldComponentUpdate(nextProps, nextState){
        // if the state change was the newComment being switched from true to false,
        // do not rerender
        if(this.state.newComment === true && nextState.newComment === false)
        {
            return false;
        }
        return true;
    }

    // called by the CommentBox component when a comment is posted
    // this will cause the component to rerender and update the props sent to
    // the CommentController component
    updateComments(newComments, user)
    {
        this.setState({
            currentUser: user,
            newComment: true,
            comments: newComments
        });
    }

    // function to change the state of the component
    changeState(key, value)
    {
        this.setState({[key]: value});
    }

    // function called when closing the popup
    closeModal() {
        this.setState({
            open: false,
        });
        this.props.removeFunction("openPopUp", false);
    }



	render() {
        let commentArray = <CommentController currentUser={this.state.currentUser} reviewUser={this.state.username} reviewId={this.state.id} update={this.state.newComment} comments={this.state.comments}/>;
        let commentBox = <CommentBox reviewId={this.state.id} form={this.state.form} updateCommentsFunction={this.updateComments}/>;
        let moviePost = <MoviePost data={this.state.data} type={"popup"} closeFunction={this.closeModal}/>
        return (
            <React.Fragment>
            <Popup
                open={this.state.open}
                closeOnDocumentClick
                onClose={this.closeModal}
                contentStyle={{ width: "45%"}}
            >
                <div className={style2.modal}>
                    {/* &times is the multiplication symbol (x) --> */}
                    <a className={style2.close} onClick={this.closeModal}>
                    &times;
                    </a>
                    <div className={style2.content}>
                        <div className={`${style.post} ${style2.postWidth}`}>
                            {moviePost}
                            {commentBox}
                            {commentArray}
                        </div>
                    </div>
                </div>
            </Popup>
            </React.Fragment>
        );
    }
}

export default MoviePostPopUp;
