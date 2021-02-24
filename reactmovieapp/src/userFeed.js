import React from 'react';
// should get rid of this eventually
import { Redirect, withRouter } from "react-router-dom";
import MoviePost from './moviePost.js';
import style from './css/userProfile.module.css';
import './css/forms.css';
import {apiGetJsonRequest} from './StaticFunctions/ApiFunctions.js';


class UserFeed extends React.Component {
    constructor(props)
    {
        super(props);
        this.state ={
            // this gets the username from the url
            // in the router, set the username as :id
            currentUser: this.props.currentUser,
            // this will be set by the api call
            posts: [],
            loading: true,
            redirect: false,
            // boolean for loading data on scroll
            loadingData: false,
            offset: 0,
            // boolean to indicate if more data to be pulle d from api still
            // false if on last pull less than max records were returned from api
            moreData: true
        }
    }

    async componentDidMount()
    {
        if(this.state.currentUser !== "")
        {
            this.callApi(this.state.currentUser);
        }
        else
        {
            this.props.showLoginPopUp(true);
            this.setState({
                loading: false,
                redirect: true
            });
        }
    }

    async callApi(username)
    {
        let url = "http://localhost:9000/profile/" + username + "/feed?offset=" + this.state.offset + "&max=30";
        let result = await apiGetJsonRequest(url);
        let status = result[0];
        let message = result[1].message;
        let requester = result[1].requester;
        this.checkApiResults(status, message, requester, result, this.state.offset, 30);
    }

    componentDidUpdate(prevProps, prevState)
    {
        if(!this.state.loading && (this.props.currentUser !== prevProps.currentUser))
        {
            // if the user logged out, redirect to landing page
            if(this.props.currentUser === "")
            {
                this.setState({
                    redirect: true
                });
            }
            else
            {
                this.callApi(this.props.currentUser);
            }
        }
    }

    checkApiResults(status, message, requester, result, offset, max)
    {
        if(status === 200)
        {
            console.log(result);
            let posts = [...this.state.posts];
            this.setState({
                posts: (this.state.loadingData) ? posts.concat(result[1].reviews) : result[1].reviews,
                currentUser: result[1].requester,
                loading: false,
                loadingData: false,
                moreData: (result[1].reviews.length === max) ? true : false,
                offset: offset + max
            });
            this.props.updateLoggedIn(result[1].requester);
        }
        else
        {
            if(status === 401)
            {
                // either not logged in or trying to access another users feed
                this.props.showLoginPopUp(true);
            }
            else if(status === 404)
            {
                this.props.updateLoggedIn(requester);
                // username in url incorrect format
                // should just about never happen
                this.props.setMessages({messages: [{type: "failure", message: message}]});
            }
        }
    }

    render()
    {
        if(this.state.loading)
        {
            return null;
        }
        if(this.state.redirect)
        {
            return <Redirect to="" />;
        }
        let posts = [];
        // generate the posts
        this.state.posts.forEach((p) => {
            posts.push(<MoviePost
                 data={p}
                 usersPage={undefined}
                 currentUser={this.state.currentUser}
                 updateLoggedIn={this.props.updateLoggedIn}
                 setMessages={this.props.setMessages}
                 showLoginPopUp={this.props.showLoginPopUp}
                 />);
        });
        if(posts.length < 1)
        {
            return (
                <div className={`${style.mainBodyContainer} ${style.userFeedEmpty}`}>
                    <div>Follow more users to see posts on your feed!</div>
                </div>
            );
        }
        else
        {
            return (
                <div className={style.mainBodyContainer}>
                    {posts}
                </div>
            );
        }
    }
}

// used withRouter to get the parameter from the query string in the url
export default withRouter(UserFeed);
