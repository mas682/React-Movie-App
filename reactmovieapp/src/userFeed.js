import React from 'react';
// should get rid of this eventually
import { withRouter } from "react-router-dom";
import MoviePost from './moviePost.js';
import style5 from './css/userProfile.module.css';
import './css/forms.css'


class UserFeed extends React.Component {
    constructor(props)
    {
        super(props)
        this.state ={
            // this gets the username from the url
            // in the router, set the username as :id
            username: this.props.match.params.id,
            currentUser: "",
            // this will be set by the api call
            posts: [],
        }
    }

    /*
        To do:
        7. notice using user profile css!
        8. add status codes to login requests
    */

    async componentDidMount()
    {
        this.callApi().then(result =>{
            // set status to result[0]
            let status = result[0];
            // see if request succeeded
            if(status == 200)
            {
                this.setState({
                    posts: result[1],
                    currentUser: this.state.username
                });
                console.log(this.state.username);
                this.props.updateLoggedIn(this.state.username, true);
            }
            else
            {
                alert("request for user feed failed");
                this.props.updateLoggedIn("", false);
            }
        });
    }

    callApi()
    {
        const requestOptions = {
            method: 'GET',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json'},
        };

        let returnValue = 0;
        let url = "http://localhost:9000/profile/" + this.state.username + "/feed";
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
        let posts = []
        // generate the posts
        this.state.posts.forEach((p) => {
            posts.push(<MoviePost data={p} currentUser={this.state.currentUser}/>)
        });

        return (

            <div className={style5.mainBodyContainer}>
                {posts}
            </div>
        );
    }
}

// used withRouter to get the parameter from the query string in the url
export default withRouter(UserFeed);
