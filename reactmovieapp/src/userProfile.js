import React from 'react';
// should get rid of this eventually
import { withRouter } from "react-router-dom";
import MoviePost from './moviePost.js';
import style5 from './css/userProfile.module.css';
import './css/forms.css'


class UserProfile extends React.Component {
    constructor(props)
    {
        super(props)
        this.state ={
            // this gets the username from the url
            // in the router, set the username as :id
            username: this.props.match.params.id,
            id: -1,
            // if this is the current user, set to true
            // if this is someone else, set to appropriate value
            following: false,
            // this will be set by the api call
            posts: [],
            currentUser: false
        }
    }

    // this gets called when the component is changing from user to another
    // such as when clicking on a users link when the userProfile page is already
    // up
    // may have been that key issue??
    componentWillReceiveProps(nextProps) {
       if(this.props.match.params.id !== nextProps.match.params.id) {
           this.getData(nextProps.match.params.id);
       }
    }

    // this only gets called by the above method to update the state on
    // user profile change
    getData = (param) => {
        this.callApi(param).then(result =>{
            // set status to result[0]
            let status = result[0];
            // see if request succeeded
            if(status == 200)
            {
                this.setState({
                    username: param,
                    posts: result[1][3],
                    // get the users id from the response
                    id: result[1][0],
                    currentUser: result[1][1],
                    following: result[1][2]
                });

            }
            else
            {
                alert("request for user profile failed");
            }
        });
    }


    /* To Do:
        1. call api to get users posts and verify user exists
        2. show users posts
        3. create a header to show username, pictuer, etc.
            - will need to create a css file for this componenet

    */

    async componentDidMount()
    {
        this.callApi(undefined).then(result =>{
            // set status to result[0]
            let status = result[0];
            // see if request succeeded
            if(status == 200)
            {
                this.setState({
                    posts: result[1][3],
                    // get the users id from the response
                    id: result[1][0],
                    currentUser: result[1][1],
                    following: result[1][2]
                });

            }
            else
            {
                alert("request for user profile failed");
            }
        });
        /*
            left off here
            1. need to set up api to add text to return status or just set code?
                - such as user not found, results found, not authenticated, etc.
                - also need to edit api so that it can take the username of the user
                you are attempting to get
                    - done
                - also need to return info for the user, so probably want to do something
                in the server db to fix it
                    - already done with each post...
            2. then handle generating html here based off response

        */
    }

    callApi(username)
    {
        if(username === undefined)
        {
          username = this.state.username;
        }
        const requestOptions = {
            method: 'GET',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json'},
        };

        let url = "http://localhost:9000/profile/" + username;
        let status = 0;
        return fetch(url, requestOptions)
            .then(res => {
                status = res.status;
                return res.json();
            }).then(result =>{
                return [status, result];
            });
    }


// next deal with unfollowing users, make sure everything working as expected

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
        let url = "http://localhost:9000/profile/" + this.state.username + "/follow";
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
                id: this.state.id
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
                //return [status, result];
                // update button to indicate now following user
                // may want to send updated friends list to user eventually
                // if fails, do a alert
            });
    }


    render()
    {
        let posts = []
        // generate the posts
        this.state.posts.forEach((p) => {
            // if the posts are for the currenlty logged in user
            if(this.state.currentUser)
            {
                posts.push(<MoviePost data={p} user={this.state.username}/>)
            }
            else
            {
              posts.push(<MoviePost data={p} user=""/>)
            }
        });

        let followButton = "";
        if(this.state.currentUser)
        {
            followButton = "";
        }
        else
        {
            if(this.state.following)
            {
                followButton = <button className={`${style5.followButton} ${style5.followColor}`} onClick={(e)=> this.unfollowHandler(e)}>Follow</button>;
            }
            else
            {
                followButton = <button className={`${style5.followButton} ${style5.notFollowingColor}`} onClick={(e)=> this.followHandler(e)}>Follow</button>;
            }
        }

        return (

            <div className={style5.mainBodyContainer}>
                <div className={style5.profileHeader}>
                    <img className={style5.profilePic} src={require("./images/profile-pic.jpg")}/>
                    <h3>{this.state.username}</h3>
                    {followButton}
                </div>
                {posts}
            </div>
        );
    }
}

// used withRouter to get the parameter from the query string in the url
export default withRouter(UserProfile);
