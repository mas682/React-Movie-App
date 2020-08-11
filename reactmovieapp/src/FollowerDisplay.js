import React from 'react';
import './css/forms.css';
import { Link, Redirect } from 'react-router-dom';
import style from './css/UserListPopUp.module.css';

class FollowerDisplay extends React.Component {
    constructor(props) {
        super(props);
        this.state ={
            user: this.props.user,
            following: this.props.following,
            loading: true,
            // holds the name of the logged in user
            requester: this.props.requester
        };
        this.closeModal = this.closeModal.bind(this);
        this.changeHandler = this.changeHandler.bind(this);
        this.generateFollowButton = this.generateFollowButton.bind(this);
        this.followHandler = this.followHandler.bind(this);
        this.unfollowHandler = this.unfollowHandler.bind(this);
    }

    // load the data in here
    async componentDidMount()
    {

    }


    // will eventually be used when users are able to follow users from the list
    // by clicking a button
    changeHandler(event) {
        let name = event.target.name;
        let value = event.target.value;
        this.setState({[name]: value});
    }

    // function called when closing the popup
    // the props.removeFunction is a function passed in by the calling component that
    // is used to remove the popup from the calling components display
    closeModal() {
    }

    followHandler()
    {
        // if here, no reason to try to follow a user you already follow
        if(this.state.following)
        {
            return;
        }
        // will have to update the state to indicate you are now following the user
        // call api
        const requestOptions = {
            method: 'POST',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json'},
            body: JSON.stringify({
                id: this.state.id
            })
        };

        let status = 0;
        let url = "http://localhost:9000/profile/" + this.state.user.username + "/follow";
        fetch(url, requestOptions)
            .then(res => {
                status = res.status;
                return res.text();
            }).then(result =>{
                if(status === 200 && result === "User successfully followed")
                {
                    this.setState({following: true});
                }
                else if(status === 401 && result === "Unable to verify requester")
                {
                    alert("You must login to follow this user");
                }
                else if(status === 404 && result === "Unable to find user to follow")
                {
                    alert("The user to follow could not be found");
                }
                else if(status === 404 && result === "User cannot follow themself")
                {
                    alert(result);
                }
                else if(status === 406 && result === "You already follow the user")
                {
                    alert(result);
                }
                else
                {
                    alert(result);
                    alert("Some unknown error occurred when trying to follow the user");
                    this.setState({following: false});
                }
                //return [status, result];
                // update button to indicate now following user
                // may want to send updated friends list to user eventually
                // if fails, do a alert
            });
    }

    unfollowHandler()
    {
        // if here, no use trying to unfollow a user you do not already follow
        if(!this.state.following)
        {
            return;
        }
        // will have to update the state to indicate you are now following the user
        // call api
        const requestOptions = {
            method: 'POST',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json'},
            body: JSON.stringify({
                id: this.state.user.id
            })
        };

        let status = 0;
        let url = "http://localhost:9000/profile/" + this.state.username + "/unfollow";
        fetch(url, requestOptions)
            .then(res => {
                status = res.status;
                return res.text();
            }).then(result =>{
                if(status === 200 && result === "User successfully unfollowed")
                {
                    this.setState({following: false});
                }
                else if(status === 401 && result === "Unable to verify requester")
                {
                    alert("You must login to follow this user");
                }
                else if(status === 404 && result === "Unable to find user to unfollow")
                {
                    alert("The user to unfollow could not be found");
                }
                else if(status === 404 && result === "User cannot unfollow themself")
                {
                    alert(result);
                }
                else if(status === 404 && result === "The id passed in the request does not match the user")
                {
                    alert(result);
                }
                else if(status === 406 && result === "You already do not follow the user or the user does not exist")
                {
                    alert(result);
                }
                else
                {
                    alert(result);
                    alert("Some unknown error occurred when trying to unfollow the user");
                    this.setState({following: false});
                }
            });
    }

    generateFollowButton()
    {
        if(this.state.requester === this.state.user.username)
        {
            return "";
        }
        else if(this.state.following)
        {
            return (<button className={`${style.followButton} ${style.followColor}`} onClick={(e)=> this.unfollowHandler(e)}>Following</button>);
        }
        else
        {
            return (<button className={`${style.followButton} ${style.notFollowingColor}`} onClick={(e)=> this.followHandler(e)}>Follow</button>);
        }
    }

    render() {
        let followButton = this.generateFollowButton();
        let path = "/profile/" + this.state.user.username;

        return (
            <div className={style.userNameContainer}>
                <div className={style.userImageBox}>
                    <Link to={path}><img className={style.profilePic} src={require("./images/profile-pic.jpg")}/></Link>
                </div>
                <div className={style.usernameBox}>
                    <Link to={path} className={style.userLink}>{this.state.user.username}</Link>
                </div>
                <div className ={style.followBox}>
                    {followButton}
                </div>
            </div>
        );
    }

}

export default FollowerDisplay;
