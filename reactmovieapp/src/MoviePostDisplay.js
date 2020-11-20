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
        if(prevProps.username !== this.props.username)
        {
            this.getData(this.props.username);
        }
        else if(prevProps.currentUser !== this.props.currentUser)
        {
            this.getData(this.props.username);
        }
    }

    // handles calling api for componentDidMount and componentDidUpdate
    getData(username)
    {
        let url = "http://localhost:9000/profile/" + username;
        apiGetJsonRequest(url).then(result =>{
            this.checkApiResults(result, username);
        });
    }

    checkApiResults(result, username)
    {
        let status = result[0];
        if(status == 200)
        {
            let oldCount = this.state.posts.length;
            // consider putting this part into a static function
            if(result[1][1] !== "")
            {
                this.props.updateLoggedIn(result[1][1], true);
            }
            else
            {
                this.props.updateLoggedIn(result[1][1], false);
            }
            ///////////////^^^^^^^^^^^^^^^^^^^////////////////
            if(result[1][0].length !== oldCount)
            {
                this.props.setPostCount(result[1][0].length);
            }
            this.setState({
                username: username,
                posts: result[1][0],
                currentUser: result[1][1],
                loading: false
            });
        }
        else
        {
            alert("request for users posts failed");
            this.props.redirectToHome();
            return null;
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
            posts.push(<MoviePost data={p} usersPage={this.state.username} currentUser={this.state.currentUser} updateFunction={this.props.updateFunction} updateFollowersFunction={this.props.updateFollowersFunction} showLoginPopUp={this.props.showLoginPopUp} updateLoggedIn={this.props.updateLoggedIn}/>)
        });
        return (<React.Fragment>{posts}</React.Fragment>);
    }
}

// used withRouter to get the parameter from the query string in the url
export default MoviePostDisplay;
