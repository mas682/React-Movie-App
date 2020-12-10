import React from 'react';
// should get rid of this eventually
import {Redirect, withRouter} from 'react-router-dom';
import MoviePost from './moviePost.js';
import style5 from './css/userProfile.module.css';
import './css/forms.css'
import ProfileHeader from './ProfileHeader.js';
import MoviePostDisplay from './MoviePostDisplay.js';
import Alert from './Alert.js';
import {getErrorDisplay} from './StaticFunctions/ErrorHtmlFunctions.js';
import {generateMessageState} from './StaticFunctions/StateGeneratorFunctions.js';


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
            followerCountChange: 0,
            currentUser: this.props.currentUser,
            redirect: false,
            message: "",
            messageId: -1,
            messageType: "",
            showErrorPage: false,
            errorMessage: ""
        }
        this.setPostCount = this.setPostCount.bind(this);
        this.updateFollowingCount = this.updateFollowingCount.bind(this);
        this.updateFollowerCount = this.updateFollowerCount.bind(this);
        this.redirectToHome = this.redirectToHome.bind(this);
        this.setMessage = this.setMessage.bind(this);
        this.showErrorPage = this.showErrorPage.bind(this);
    }

    // update the state if new props came in with a different profile
    // or a different user logged in
    static getDerivedStateFromProps(nextProps, prevState)
    {
        if(prevState.username !== nextProps.match.params.id)
        {
            return UserProfile.setProfileUser(nextProps.match.params.id, nextProps.currentUser);
        }
        else if(prevState.currentUser !== nextProps.currentUser)
        {
            return UserProfile.setProfileUser(nextProps.match.params.id, nextProps.currentUser);
        }
        else
        {
            return null;
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
        // only rerender if there was a change in followers, following, or username
        // whose page we are currently on
        return (nextState.followingCountChange !== 0
             || nextState.followerCountChange !== 0
             || nextState.username !== this.state.username
             || nextState.currentUser !== this.state.currentUser
             || nextState.postCount !== this.state.postCount
             || nextState.redirect === true
             || nextState.messageId !== this.state.messageId
             || nextState.showErrorPage !== this.state.showErrorPage
         );
    }

    redirectToHome()
    {
        if(!this.state.redirect)
        {
            this.setState({
                redirect: true
            });
        }
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
        if(value !== this.state.postCount)
        {
            this.setState({postCount:value});
        }
    }

    // this only gets called by the above method to update the state on
    // user profile change
    static setProfileUser = (param, currentUser) => {
        return {
            username: param,
            currentUser: currentUser,
            message: "",
            messageId: -1,
            messageType: ""
        };
    }

    setMessage(messageState)
    {
        this.setState(generateMessageState(messageState, this.state.messageId));
    }

    showErrorPage(message)
    {
        if(!this.state.showErrorPage)
        {
            this.setState({
                showErrorPage: true,
                errorMessage: message
            });
        }
    }

    render()
    {
        if(this.state.redirect)
        {
            return <Redirect to={"/"} />;
        }
        else if(this.state.showErrorPage)
        {
            return getErrorDisplay(this.state.errorMessage);
        }

        return (
            <React.Fragment>
                <Alert
                    message={this.state.message}
                    messageId={this.state.messageId}
                    type={this.state.messageType}
                />
                <div className={style5.mainBodyContainer}>
                    <ProfileHeader
                        username={this.state.username}
                        postCount={this.state.postCount}
                        updateFollowingCount={this.state.followingCountChange}
                        updateFollowerCount={this.state.followerCountChange}
                        updateLoggedIn={this.props.updateLoggedIn}
                        showLoginPopUp={this.props.showLoginPopUp}
                        currentUser={this.state.currentUser}
                        redirectToHome={this.redirectToHome}
                        setMessage={this.setMessage}
                        showErrorPage={this.showErrorPage}
                    />
                    <MoviePostDisplay
                        username={this.state.username}
                        setPostCount={this.setPostCount}
                        updateFunction={this.updateFollowingCount}
                        updateFollowersFunction={this.updateFollowerCount}
                        updateLoggedIn={this.props.updateLoggedIn}
                        showLoginPopUp={this.props.showLoginPopUp}
                        currentUser={this.state.currentUser}
                        redirectToHome={this.redirectToHome}
                        setMessage={this.setMessage}
                        showErrorPage={this.showErrorPage}
                    />
                </div>
            </React.Fragment>
        );
    }
}

// used withRouter to get the parameter from the query string in the url
export default withRouter(UserProfile);
