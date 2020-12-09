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
            // this gets the username from the url
            username: this.props.username,
            // this will be set by the api call
            posts: [],
            // the logged in users username or ""
            currentUser: this.props.currentUser,
            loading: true
        }
        this.getData = this.getData.bind(this);
        this.checkApiResults = this.checkApiResults.bind(this);
    }

    async componentDidMount()
    {
        this.getData(this.state.username);
    }

    // when the component receives new props, update the state here
    componentDidUpdate(prevProps, prevState) {
        if(!this.state.loading && (prevProps.username !== this.props.username))
        {
            this.getData(this.props.username);
        }
        else if(!this.state.loading && (this.props.currentUser !== prevProps.currentUser))
        {
            this.getData(this.props.username);
        }
    }

    // handles calling api for componentDidMount and componentDidUpdate
    getData(username)
    {
        console.log("get data movie post display");
        let url = "http://localhost:9000/profile/" + username;
        apiGetJsonRequest(url).then(result =>{
            let status = result[0];
            let message = result[1].message;
            let user = result[1].requester;
            this.checkApiResults(status, message, user, result, username);
        });
    }

    checkApiResults(status, message, user, result, username)
    {
        if(status == 200)
        {
            let reviews = result[1].reviews;
            this.props.updateLoggedIn(user);
            this.props.setPostCount(reviews.length);
            this.setState({
                username: username,
                posts: reviews,
                currentUser: user,
                loading: false
            });
            this.props.setMessage({
                message: message,
                messageType: "success"
            });
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
                this.props.setMessage({
                    message: message,
                    messageType: "failure"
                });
                this.props.setPostCount(0);
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
                this.props.setPostCount(0);
                // should redirect to 404 page..
                //this.props.redirectToHome();
            }
            else
            {
                alert("request for users posts failed");
                this.setState({
                    loading: false,
                    currentUser: user
                });
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
                            updateFunction={this.props.updateFunction}
                            updateFollowersFunction={this.props.updateFollowersFunction}
                            showLoginPopUp={this.props.showLoginPopUp}
                            updateLoggedIn={this.props.updateLoggedIn}
                            redirectToHome={this.props.redirectToHome}
                        />);
        });
        return (<React.Fragment>{posts}</React.Fragment>);
    }
}

// used withRouter to get the parameter from the query string in the url
export default MoviePostDisplay;
