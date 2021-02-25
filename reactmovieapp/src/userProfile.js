import React from 'react';
// should get rid of this eventually
import {Redirect, withRouter} from 'react-router-dom';
import MoviePost from './moviePost.js';
import style from './css/userProfile.module.css';
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
            showErrorPage: false,
            errorMessage: "",
            // used a switch to cause rerender when new review posted from this page
            newReview: this.props.newReview,
            props: props
        };
        this.decrementPostCount = this.decrementPostCount.bind(this);
        this.updateFollowingCount = this.updateFollowingCount.bind(this);
        this.updateFollowerCount = this.updateFollowerCount.bind(this);
        this.updatePostCount = this.updatePostCount.bind(this);
        this.redirectToHome = this.redirectToHome.bind(this);
        this.showErrorPage = this.showErrorPage.bind(this);
    }

    // update the state if new props came in with a different profile
    // or a different user logged in
    static getDerivedStateFromProps(nextProps, prevState)
    {
        if(prevState.username !== nextProps.match.params.id)
        {
            return UserProfile.setProfileUser(nextProps.match.params.id, nextProps.currentUser, nextProps);
        }
        else if(prevState.currentUser !== nextProps.currentUser)
        {
            return UserProfile.setProfileUser(nextProps.match.params.id, nextProps.currentUser, nextProps);
        }
        else if(prevState.newReview !== nextProps.newReview)
        {
            return {newReview: nextProps.newReview}
        }
        else
        {
            return null;
        }
    }

    // called after component was updated
    componentDidUpdate(prevProps, prevState)
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
        else if(this.state.postCount !== 0)
        {
            this.updatePostCount(0);
        }
        else if(prevState.username !== this.state.username)
        {
            // need to test to make sure this works...
            this.props.setMessages({
                messages: undefined,
                clearMessages: true
            });
        }

    }

    componentDidMount()
    {
        // used when a user posts a review to keep the review messages displayed
        if(this.props.location.state !== undefined)
        {
            if(this.props.location.state.newReview === undefined)
            {
                // clear the messages on mount
                this.props.setMessages({
                    message: undefined,
                    clearMessages: true
                });
            }
        }
        else
        {
            // clear the messages on mount
            this.props.setMessages({
                message: undefined,
                clearMessages: true
            });
        }
    }

    // plan is to have movie posts follower list call the update function to
    // kick off the rerendering of the userProfile page
    //
    shouldComponentUpdate(nextProps, nextState){
        // only rerender if there was a change in followers, following, or username
        // whose page we are currently on
        return (nextState.followingCountChange !== this.state.followingCountChange
             || nextState.followerCountChange !== this.state.followerCountChange
             || nextState.postCount === -1
             || nextState.username !== this.state.username
             || nextState.currentUser !== this.state.currentUser
             || nextState.redirect === true
             || nextState.showErrorPage !== this.state.showErrorPage
             || nextState.newReview !== this.state.newReview
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

    updatePostCount(value)
    {
        this.setState({postCount: value});
    }

    // function to be utilized by MoviePostDisplay to decrement the post count when
    // a user removes a post
    decrementPostCount()
    {
        this.setState({postCount:-1});
    }

    // this only gets called by the above method to update the state on
    // user profile change
    static setProfileUser = (param, currentUser, props) => {
        return {
            username: param,
            currentUser: currentUser,
            props: props
        };
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
                <div className={style.mainBodyContainer}>
                    <ProfileHeader
                        username={this.state.username}
                        postCount={this.state.postCount}
                        updateFollowingCount={this.state.followingCountChange}
                        updateFollowerCount={this.state.followerCountChange}
                        updateLoggedIn={this.props.updateLoggedIn}
                        showLoginPopUp={this.props.showLoginPopUp}
                        currentUser={this.state.currentUser}
                        redirectToHome={this.redirectToHome}
                        setMessages={this.props.setMessages}
                        showErrorPage={this.showErrorPage}
                        newReview={this.state.newReview}
                    />
                    <MoviePostDisplay
                        username={this.state.username}
                        decrementPostCount={this.decrementPostCount}
                        updateFollowingFunction={this.updateFollowingCount}
                        updateFollowersFunction={this.updateFollowerCount}
                        updateLoggedIn={this.props.updateLoggedIn}
                        showLoginPopUp={this.props.showLoginPopUp}
                        currentUser={this.state.currentUser}
                        redirectToHome={this.redirectToHome}
                        setMessages={this.props.setMessages}
                        showErrorPage={this.showErrorPage}
                        newReview={this.state.newReview}
                        mainBodyContainer={style.mainBodyContainer}
                    />
                </div>
            </React.Fragment>
        );
    }
}

// used withRouter to get the parameter from the query string in the url
export default withRouter(UserProfile);
