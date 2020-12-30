import React from 'react';
// should get rid of this eventually
import { Redirect, withRouter } from "react-router-dom";
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
            currentUser: this.props.currentUser,
            // this will be set by the api call
            posts: [],
            loading: true,
            redirect: false,
            redirectLogin: false
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
                    posts: result[1].reviews,
                    currentUser: result[1].requester,
                    loading: false
                });
                this.props.updateLoggedIn(result[1].requester);
            }
            else
            {
                alert(result[1]);
                if(status === 401 && result[1] === "No cookie or cookie invalid")
                {
                    this.setState({
                        loading: false,
                        redirect: true,
                        redirectLogin: true
                    });
                    this.props.updateLoggedIn("");
                }
                this.setState({
                    loading: false,
                    redirect: true
                });

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
                if(status === 200)
                {
                    return res.json();
                }
                else
                {
                    return res.text();
                }
            }).then(result =>{
                return [status, result];
            });
    }

    render()
    {
        if(this.state.loading)
        {
            return null;
        }
        if(this.state.redirect)
        {
            if(this.state.redirectLogin)
            {
                return <Redirect to={{pathname: "/", state: {displayLogin: true}}} />;
            }
            return <Redirect to="" />;
        }
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
