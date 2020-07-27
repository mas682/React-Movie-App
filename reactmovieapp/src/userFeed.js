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

        let status = 0;
        let url = "http://localhost:9000/profile/" + this.state.username + "/feed";
        fetch(url, requestOptions)
            .then(res => {
                status = res.status;
                return res.json();
            }).then(result => {
                return [status, result];
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
            posts.push(<MoviePost data={p}/>)
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
