import React from 'react';
// should get rid of this eventually
import './css/forms.css';
import { withRouter } from "react-router-dom";
import MoviePost from './moviePost.js';


class UserProfile extends React.Component {
    constructor(props)
    {
        super(props)
        this.state ={
            // this gets the username from the url
            id: this.props.match.params.abc,
            // this will be set by the api call
            posts: [{"id":1,"title":"Movie","rating":"2.50","review":"Sublimely funny, particularly in the first half-hour, with a gorgeous running gag about the band TLC and a fabulously moronic death scene for The Rock and Sam Jackson, who play a couple of hero-cops with a propensity for wrecking half the city in pursuit of small-time cannabis dealers.\nWahlberg is excellent - as unexpectedly good as Channing Tatum was in 21 Jump Street, though here the Max Payne and The Departed actor plays a coiled,perpetually furious bundle of resentment and frustration, ground down by the everyday humiliations that come with having accidentally shot Derek Jeter","updatedAt":"2020-07-12T05:36:29.436Z","goodTags":[{"id":1,"value":"Acting"},{"id":3,"value":"Too short"},{"id":2,"value":"Jokes"}],"badTags":[{"id":6,"value":"Theme"},{"id":4,"value":"Too long"},{"id":5,"value":"Story"}],"comments":[{"id":3,"value":"The scene where they talk about the lion and the tuna has to be my  favorite part.  Will Ferrell's face during the whole seen is too funny.","updatedAt":"2020-07-12T05:36:29.439Z","user":{"username":"admin","email":"admin@email.com"}},{"id":2,"value":"This is another comment to test the look of comments associated with this post.  I completely agree with you on this review but I would give it 5 stars.","updatedAt":"2020-07-12T05:36:29.438Z","user":{"username":"admin","email":"admin@email.com"}},{"id":1,"value":"This is the test comment for the 1st post","updatedAt":"2020-07-12T05:36:29.438Z","user":{"username":"admin","email":"admin@email.com"}}]},{"id":2,"title":"another movie","rating":"2.50","review":"","updatedAt":"2020-07-12T05:36:29.437Z","goodTags":[{"id":2,"value":"Jokes"}],"badTags":[],"comments":[]}],
        }
    }

    /* To Do:
        1. call api to get users posts and verify user exists
        2. show users posts
        3. create a header to show username, pictuer, etc.
            - will need to create a css file for this componenet

    */

    render()
    {
        let posts = []
        // generate the posts to display
        this.state.posts.forEach((p) => {
            posts.push(<MoviePost data={p}/>)
        });

        return (
            <div className="mainBodyContainer">
                <div className="mainBodyChild">
                    <h3>User Profile Page {this.state.id}</h3>
                    {posts}
                </div>
            </div>
        );
    }
}

// used withRouter to get the parameter from the query string in the url
export default withRouter(UserProfile);
