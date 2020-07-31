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
            // this will be set by the api call
            posts: [],
        }
    }

    /*
        To do:
        1. Fix movie posts to display correct username
            - done
        2. Will want to limit query to only so many results
        3. Will want to reroute to this page on login
            - done but may move to somewhere else eventually
        4. also want to show timing of post on movie post
            - done but needs formatting
        5. then create fake reviews and make sure listed in order
            - done
        6. may want to move this to a different route
        7. notice using user profile css!
        8. add status codes to login requests
        9. need to fix following on users pages so that if you follow it is blue when you go
          to it after switching pages
        10. also handle the case where the user is going to their own page
            - simply return true if current user from server
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
                });

            }
            else
            {
                alert("request for user feed failed");
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
            posts.push(<MoviePost data={p} user={this.state.username}/>)
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
