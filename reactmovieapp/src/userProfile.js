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
            id: this.props.match.params.id,
            // this will be set by the api call
            posts: [],
        }
    }

    /* To Do:
        1. call api to get users posts and verify user exists
        2. show users posts
        3. create a header to show username, pictuer, etc.
            - will need to create a css file for this componenet

    */

    async componentDidMount()
    {
        this.callApi().then(result =>{
            // set status to result[0]
            let status = result[0];
            // see if request succeeded
            if(status == 200)
            {
                this.setState({posts: result[1]});

            }
            else
            {
                alert("request for user profile failed");
            }
        });
        /*
            left off here
            1. need to set up api to add text to return status
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

    callApi()
    {
        const requestOptions = {
            method: 'GET',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json'},
        };

        let returnValue = 0;
        let url = "http://localhost:9000/profile/" + this.state.id;
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
                <div className={style5.profileHeader}>
                    <img className={style5.profilePic} src={require("./images/profile-pic.jpg")}/>
                    <h3>{this.state.id}</h3>
                    Space filler
                </div>
                {posts}
            </div>
        );
    }
}

// used withRouter to get the parameter from the query string in the url
export default withRouter(UserProfile);
