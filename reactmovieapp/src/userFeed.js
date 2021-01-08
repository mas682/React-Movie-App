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
            redirect: false
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
        let url = "http://localhost:9000/profile/" + username + "/feed";
        let result = await apiGetJsonRequest(url);
        let status = result[0];
        let message = result[1].message;
        let requester = result[1].requester;
        this.checkApiResults(status, message, requester, result);
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

    /*
    left off finishing this...
    next off:
    1. fix header
    2. want pages to determine what to do on logout like user feed does
    3. may want to do that for login too?
    4. for showSignInPopUP....remove redirect option...pages should control that..
    */

    checkApiResults(status, message, requester, result)
    {
        if(status === 200)
        {
            console.log(result);
            this.setState({
                posts: result[1].reviews,
                currentUser: result[1].requester,
                loading: false
            });
            this.props.updateLoggedIn(result[1].requester);
            this.props.setMessages({messages: [{type: "success", message: message}]});
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

    /*
    left off here....
    fix reroute to feed page
    found error when logging in from movie filter pages by clicking
    add to watchlist button on movie dipslay
    */

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
        let posts = []
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

        return (

            <div className={style.mainBodyContainer}>
                {posts}
            </div>
        );
    }
}

// used withRouter to get the parameter from the query string in the url
export default withRouter(UserFeed);
