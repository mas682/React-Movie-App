import React from 'react';
// should get rid of this eventually
import { withRouter } from "react-router-dom";
import MoviePost from './moviePost.js';
import {apiGetJsonRequest} from './StaticFunctions/ApiFunctions.js';

class MoviePostDisplay extends React.Component {
    constructor(props)
    {
        super(props);
        this.state ={
            // the users page that the user is on
            username: this.props.username,
            // this will be set by the api call
            posts: [],
            // the logged in users username or ""
            currentUser: this.props.currentUser,
            // the id of the main body container so to implment paging
            mainBodyContainer: this.props.mainBodyContainer,
            loading: true,
            // boolean for loading data on scroll
            loadingData: false,
            offset: 0,
            // boolean to indicate if more data to be pulle d from api still
            // false if on last pull less than max records were returned from api
            moreData: true
        }
        this.getData = this.getData.bind(this);
        this.checkApiResults = this.checkApiResults.bind(this);
        this.scrollEventHandler = this.scrollEventHandler.bind(this);
    }

    async componentDidMount()
    {
        document.addEventListener('scroll', this.scrollEventHandler, {passive: true});
        this.getData(this.state.username, 0);
    }

    scrollEventHandler(event)
    {
        // if there is no more data to load return
        if(!this.state.moreData || this.state.loadingData) return;
        let element = document.querySelector("." + this.state.mainBodyContainer);
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
                this.getData(this.state.username, this.state.offset);
            }
        }
    }

    // when the component receives new props, update the state here
    componentDidUpdate(prevProps, prevState) {
        if(!this.state.loading && (prevProps.username !== this.props.username))
        {
            this.getData(this.props.username, 0);
        }
        else if(!this.state.loading && (this.props.currentUser !== prevProps.currentUser))
        {
            this.getData(this.props.username, 0);
        }
        else if(!this.state.loading && (this.props.newReview !== prevProps.newReview))
        {
            this.getData(this.props.username, 0);
        }
    }

    // handles calling api for componentDidMount and componentDidUpdate
    getData(username, offset)
    {
        let max = 5;
        let url = "http://localhost:9000/profile/" + username + "/reviews?offset=" + offset + "&max=" + max;
        apiGetJsonRequest(url).then(result =>{
            let status = result[0];
            let message = result[1].message;
            let user = result[1].requester;
            this.checkApiResults(status, message, user, result, username, this.state.offset, max);
        });
    }

    checkApiResults(status, message, user, result, username, offset, max)
    {
        if(status == 200)
        {
            let oldReviews = [...this.state.posts];
            let reviews = result[1].reviews;
            this.props.updateLoggedIn(user);
            // this needs updated with paging now happening
            this.setState({
                username: username,
                posts: (this.state.loadingData) ? oldReviews.concat(reviews) : reviews,
                currentUser: user,
                loading: false,
                loadingData: false,
                moreData: (reviews.length === max) ? true : false,
                offset: offset + max
            });
            /*this.props.setMessages({
                messages: [{type: "success", message: message}],
            });*/
        }
        else
        {
            this.props.updateLoggedIn(user);
            if(status === 401)
            {
                // not an issue right now as all reviews are public
            }
            else if(status === 400)
            {
                // request failed due to invalid username
                this.setState({
                    username: username,
                    posts: [],
                    currentUser: user,
                    loading: false
                });
                this.props.showErrorPage(message);
            }
            else if(status === 404)
            {
                // request failed as user not found
                this.setState({
                    username: username,
                    posts: [],
                    currentUser: user,
                    loading: false
                });
                this.props.showErrorPage(message);
            }
            else
            {
                this.setState({
                    loading: false,
                    currentUser: user
                });
                this.props.showErrorPage(message);
            }
        }
    }

    render()
    {
        if(this.state.loading)
        {
            return null;
        }
        let posts = [];
        // generate the posts
        this.state.posts.forEach((p) => {
            posts.push(<MoviePost
                            key={p.review.id}
                            data={p}
                            usersPage={this.state.username}
                            currentUser={this.state.currentUser}
                            updateFollowingFunction={this.props.updateFollowingFunction}
                            updateFollowersFunction={this.props.updateFollowersFunction}
                            showLoginPopUp={this.props.showLoginPopUp}
                            updateLoggedIn={this.props.updateLoggedIn}
                            setMessages={this.props.setMessages}
                            decrementPostCount={this.props.decrementPostCount}
                        />);
        });
        return (<React.Fragment>{posts}</React.Fragment>);
    }
}

// used withRouter to get the parameter from the query string in the url
export default MoviePostDisplay;
