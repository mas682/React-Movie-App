import React from 'react';
// should get rid of this eventually
import { withRouter } from "react-router-dom";
import MoviePost from './moviePost.js';
import style5 from './css/userProfile.module.css';
import './css/forms.css'
import ProfileHeader from './ProfileHeader.js';
import MoviePostDisplay from './MoviePostDisplay.js';


class UserProfile extends React.Component {
    constructor(props)
    {
        super(props)
        this.state ={
            // this gets the username from the url
            // in the router, set the username as :id
            username: this.props.match.params.id,
            // this will be set by the api call
            postCount: 0,
            followingCountChange: 0,
            followerCountChange: 0
        }
        this.setPostCount = this.setPostCount.bind(this);
        this.updateFollowingCount = this.updateFollowingCount.bind(this);
        this.updateFollowerCount = this.updateFollowerCount.bind(this);
    }

    // this gets called when the component is changing from user to another
    // such as when clicking on a users link when the userProfile page is already
    // up
    // may not need this
    componentWillReceiveProps(nextProps) {
        if(this.props.match.params.id !== nextProps.match.params.id) {
            this.getData(nextProps.match.params.id);
        }
    }

    // called after component was updated
    componentDidUpdate()
    {
        // if the state is not 0, call the updateFollowingCount function to reset to 0
        // this will cause shouldComponentUpdate to be called which will return false
        if(this.state.followingCountChange !== 0)
        {
            this.updateFollowingCount(0);
        }
        else if(this.state.followerCountChange !== 0)
        {
            this.updateFollowerCount(0);
        }

    }

    // plan is to have movie posts follower list call the update function to
    // kick off the rerendering of the userProfile page
    //
    shouldComponentUpdate(nextProps, nextState){

        return (nextState.followingCountChange !== 0 || nextState.followerCountChange !== 0);
    }

    updateFollowingCount(value)
    {
        this.setState({followingCountChange: value});
    }

    updateFollowerCount(value)
    {
        this.setState({followerCountChange: value});
    }

    // function to be utilized by MoviePostDisplay to update the count of the posts
    setPostCount(value)
    {
        this.setState({postCount:value});
    }


    // this only gets called by the above method to update the state on
    // user profile change
    getData = (param) => {
        this.setState({
            username: param,
        });
    }

    render()
    {
        return (

            <div className={style5.mainBodyContainer}>
                <ProfileHeader username={this.state.username} postCount={this.state.postCount} updateFollowingCount={this.state.followingCountChange} updateFollowerCount={this.state.followerCountChange} updateLoggedIn={this.props.updateLoggedIn} showLoginPopUp={this.props.showLoginPopUp}/>
                <MoviePostDisplay username={this.state.username} setPostCount={this.setPostCount} updateFunction={this.updateFollowingCount} updateFollowersFunction={this.updateFollowerCount} updateLoggedIn={this.props.updateLoggedIn} showLoginPopUp={this.props.showLoginPopUp}/>
            </div>
        );
    }
}

// used withRouter to get the parameter from the query string in the url
export default withRouter(UserProfile);
