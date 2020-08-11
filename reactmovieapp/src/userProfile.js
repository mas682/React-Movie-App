import React from 'react';
// should get rid of this eventually
import { withRouter } from "react-router-dom";
import MoviePost from './moviePost.js';
import UserListPopUp from './UserListPopUp.js';
import style5 from './css/userProfile.module.css';
import './css/forms.css'
import ProfileHeader from './ProfileHeader.js';


class UserProfile extends React.Component {
    constructor(props)
    {
        super(props)
        this.state ={
            // this gets the username from the url
            // in the router, set the username as :id
            username: this.props.match.params.id,
            // this will be set by the api call
            posts: [],
        }
    }

    // this gets called when the component is changing from user to another
    // such as when clicking on a users link when the userProfile page is already
    // up
    // may have been that key issue??
    componentWillReceiveProps(nextProps) {
        /*
       if(this.props.match.params.id !== nextProps.match.params.id) {
           this.getData(nextProps.match.params.id);
       }
       */
    }

    // this only gets called by the above method to update the state on
    // user profile change
    getData = (param) => {
        /*
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
                    following: result[1][2],
                    followedFollowers: result[1][4],
                    followedFollowing: result[1][5],
                    notFollowedFollowers: result[1][6],
                    notFollowedFollowing: result[1][7],
                    displayFollowers: false,
                    displayFollowed: false
                });
            }
            else
            {
                alert("request for user profile failed");
            }
        });
        */
    }

    async componentDidMount()
    {
        /*
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
                    following: result[1][2],
                    followedFollowers: result[1][4],
                    followedFollowing: result[1][5],
                    notFollowedFollowers: result[1][6],
                    notFollowedFollowing: result[1][7],
                    displayFollowers: false,
                    displayFollowed: false,
                    loading: false
                });

            }
            else
            {
                alert("request for user profile failed");
            }
        });
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

    render()
    {
        /*
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
        */


        return (

            <div className={style5.mainBodyContainer}>
                <ProfileHeader username={this.state.username} />
            </div>
        );
    }
}

// used withRouter to get the parameter from the query string in the url
export default withRouter(UserProfile);
