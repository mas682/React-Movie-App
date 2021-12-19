import React from 'react';
// should get rid of this eventually
import { Redirect, withRouter } from "react-router-dom";
import MoviePost from './MoviePost.js';
import style from '../css/Users/userProfile.module.css';
import '../css/forms.css';
import {apiGetJsonRequest} from '../StaticFunctions/ApiFunctions.js';


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

        this.scrollEventHandler = this.scrollEventHandler.bind(this);
        this.callApi = this.callApi.bind(this);
    }

    async componentDidMount()
    {
        // clear the messages on mount
        this.props.setMessages({
            messages: undefined,
            clearMessages: true
        });
        if(this.state.currentUser !== "")
        {
            document.addEventListener('scroll', this.scrollEventHandler, {passive: true});
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

    componentWillUnmount()
    {
        document.removeEventListener('scroll', this.scrollEventHandler, {passive: true});
    }

    scrollEventHandler(event)
    {
        // if there is no more data to load return
        if(!this.state.moreData || this.state.loadingData) return;
        let element = document.querySelector("." + style.mainBodyContainer);
        let mainElementHeight = parseFloat(getComputedStyle(document.querySelector("main")).height);
        let headerHeight = parseFloat(document.body.offsetHeight);
        // get the total height of the page
        let pageHeight = headerHeight + mainElementHeight;
        // if scrolled to 75% of the page, start loading new data
        if((pageHeight * .75) < (parseFloat(window.pageYOffset) + parseFloat(window.innerHeight)))
        {
            // if already loading data, do nothing
            if(!this.state.loadingData)
            {
                this.setState({
                    loadingData: true
                });
                console.log("Get new data");
                this.callApi(this.state.currentUser);
            }
        }
    }

    async callApi(username)
    {
        let max = 10;
        let url = "/profile/" + username + "/feed?offset=" + this.state.offset + "&max=" + max;
        let result = await apiGetJsonRequest(url);
        let status = result[0];
        let message = result[1].message;
        let requester = result[1].requester;
        this.checkApiResults(status, message, requester, result, this.state.offset, max);
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
        let resultFound = true;
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
            else if(status === 500)
            {
                this.props.updateLoggedIn(requester);
                // username in url incorrect format
                // should just about never happen
                this.setState({
                    loading: false,
                    loadingData: false
                });
                this.props.setMessages({messages: [{type: "failure", message: message, timeout: 0}]});
            }
            else
            {
                this.setState({
                    loading: false,
                    loadingData: false
                });
                resultFound = false;
            }
        }
        if(!resultFound)
        {
            let output = "Some unexpected " + status + " code was returned by the server.  Message: " + message;
            this.setState({
                loading: false,
                loadingData: false
            });
            this.props.setMessages({messages: [{type: "failure", message: output, timeout: 0}]});
            this.props.updateLoggedIn(requester);
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
            return <Redirect to="/" />;
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
