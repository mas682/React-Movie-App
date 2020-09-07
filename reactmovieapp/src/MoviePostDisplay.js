import React from 'react';
// should get rid of this eventually
import { withRouter } from "react-router-dom";
import MoviePost from './moviePost.js';


class MoviePostDisplay extends React.Component {
    constructor(props)
    {
        super(props)
        this.state ={
            // this gets the username from the url
            // in the router, set the username as :id
            username: this.props.username,
            // this will be set by the api call
            posts: [],
            currentUser: "",
            loading: true
        }
    }

    // this gets called when the component is changing from user to another
    // such as when clicking on a users link when the userProfile page is already
    // up
    componentWillReceiveProps(nextProps) {
       if(this.props.username !== nextProps.username) {
           this.getData(nextProps.username);
       }
    }

    // this only gets called by the above method to update the state on
    // user profile change
    getData = (param) => {
        this.callApi(param).then(result =>{
            // set status to result[0]
            let status = result[0];
            // see if request succeeded
            if(status == 200)
            {
                let oldCount = this.state.posts.length;
                this.setState({
                    username: param,
                    posts: result[1][0],
                    currentUser: result[1][1]
                });
                if(result[1][1] !== "")
                {
                    this.props.updateLoggedIn(result[1][1], true);
                }
                else
                {
                    this.props.updateLoggedIn(result[1][1], false);
                }
                if(result[1].length !== oldCount)
                {
                    this.props.setPostCount(result[1][0].length);
                }
            }
            else
            {
                alert("request for users posts failed");
            }
        });
    }

    async componentDidMount()
    {
        this.callApi(undefined).then(result =>{
            // set status to result[0]
            let status = result[0];
            // see if request succeeded
            if(status == 200)
            {
                let oldCount = this.state.posts.length;
                this.setState({
                    posts: result[1][0],
                    currentUser: result[1][1],
                    loading: false
                });
                if(result[1][1] !== "")
                {
                    this.props.updateLoggedIn(result[1][1], true);
                }
                else
                {
                    this.props.updateLoggedIn(result[1][1], false);
                }
                if(result[1].length !== oldCount)
                {
                    this.props.setPostCount(result[1][0].length);
                }
            }
            else
            {
                alert("request for users posts failed");
            }
        });
    }

    callApi(username)
    {
        if(username === undefined)
        {
          username = this.state.username;
        }
        const requestOptions = {
            method: 'GET',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json'},
        };

        let url = "http://localhost:9000/profile/" + username;
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
        if(this.state.loading)
        {
            return null;
        }
        let posts = []
        // generate the posts
        this.state.posts.forEach((p) => {
            posts.push(<MoviePost data={p} usersPage={this.state.username} currentUser={this.state.currentUser} updateFunction={this.props.updateFunction} updateFollowersFunction={this.props.updateFollowersFunction} showLoginPopUp={this.props.showLoginPopUp}/>)
        });


        return (<React.Fragment>{posts}</React.Fragment>);
    }
}

// used withRouter to get the parameter from the query string in the url
export default MoviePostDisplay;
