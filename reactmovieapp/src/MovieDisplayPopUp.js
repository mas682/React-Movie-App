import React from 'react';
import Popup from 'reactjs-popup';
import style from './css/Movies/MovieDisplayPopUp.module.css'
import './css/Movies/MovieDisplayPopUp.css'
import {Redirect, withRouter} from 'react-router-dom';
import {generateWatchListButton, generateWatchedListButton, generateMovieTrailer,
generateMovieInfo, generateOverview, generateDirector, generateGenres, generateMoviePoster} from './StaticFunctions/MovieHtmlFunctions.js';
import {apiPostJsonRequest} from './StaticFunctions/ApiFunctions.js';
import {addMovieToWatchListResultsHandler, removeWatchListMovieResultsHandler,
    addMovieToWatchedListResultsHandler, removeWatchedListMovieResultsHandler}
     from './StaticFunctions/UserResultsHandlers.js';
import SignInPopup from './SignIn.js';
import SignUpPopup from './SignUp.js';
import Alert from './Alert.js';
import {generateMessageState} from './StaticFunctions/StateGeneratorFunctions.js';

// component to display the movie poster large on screen when clicked on
// the movies page
class MovieDisplayPopUp extends React.Component {
	constructor(props) {
		super(props);
		this.state = MovieDisplayPopUp.generateState(this.props);
		this.openModal = this.openModal.bind(this);
		this.closeModal = this.closeModal.bind(this);
		this.changeHandler = this.changeHandler.bind(this);
		this.buttonHandler = this.buttonHandler.bind(this);
		this.showSignInForm = this.showSignInForm.bind(this);
		this.signInRemoveFunction = this.signInRemoveFunction.bind(this);
        this.showSignUpForm = this.showSignUpForm.bind(this);
        this.signUpRemoveFunction  = this.signUpRemoveFunction.bind(this);
        this.setMessages = this.setMessages.bind(this);
	}

	static getDerivedStateFromProps(nextProps, prevState)
	{
		if(prevState.props.movie.id !== nextProps.movie.id)
		{
			return MovieDisplayPopUp.generateState(nextProps);
		}
		else if(prevState.props.currentUser !== nextProps.currentUser)
		{
			return MovieDisplayPopUp.generateState(nextProps, prevState);
		}
		else
		{
			return null;
		}
	}

	static generateState(props, prevState)
	{
		return {
			open: true,
			movie: props.movie,
			poster: props.movie.poster,
			headerImage: props.movie.backgroundImage,
			trailer: props.movie.trailer,
			currentUser: props.currentUser,
			movieInfoString: generateMovieInfo(props.movie),
			watched: props.watched,
			watchList: props.watchList,
			// index into array of movies if on one of the movie filter pages
			index: props.index,
			// the type of page the pop up is called from
			type: props.type,
			// show the sign in pop up
			displaySignIn: (prevState === undefined) ? false : prevState.displaySignIn,
            displaySignUp: (prevState === undefined) ? false : prevState.displaySignUp,
            messages: [],
            messageId: -1,
            clearMessages: false,
            props: props
		};
	}

	openModal() {
		this.setState({ open: true });
	}

	closeModal() {
        this.setState({
            open: false,
        });
		this.props.removeFunction();
    }

	showSignInForm()
	{
		this.setState({displaySignIn: true});
	}

    showSignUpForm()
    {
        this.setState({displaySignUp: true});
    }

	signInRemoveFunction = (username) =>
	{
		let user = "";
		if(username !== undefined)
		{
			user = username;
		}
		this.props.updateLoggedIn(user);
		this.setState({displaySignIn: false});
	}

    signUpRemoveFunction = (username) =>
    {
        this.setState({displaySignUp: false});
    }

    setMessages(messageState)
    {
        let state = {...messageState};
        if(state.messages !== undefined)
        {
            let messageCount = this.state.messageId + state.messages.length;
            state.messageId = messageCount;
        }
        else if(state.clearMessages !== undefined)
        {
            // if messages was undefined and clearMessages set to true, reset id to clear all messages
            if(state.clearMessages)
            {
                state.messageId = -1;
            }
        }
        else
        {
            return;
        }
        if(state.clearMessages === undefined)
        {
            state.clearMessages = false;
        }
        // will have to do some error handling around swithcing pages..
        // need to deal with clearMessages....
        // preferably in the generateMessageState function
        this.setState(state);
    }


	changeHandler(event) {
        let name = event.target.name;
        let value = event.target.value;
        this.setState({[name]: value});
    }

	async buttonHandler(event, type)
	{
		event.preventDefault();
        event.stopPropagation();

        if(!this.state.currentUser)
        {
			//this.props.showLoginPopUp();
            this.showSignInForm();
            return;
        }

        let url = "";
        let params = {movieId: this.state.movie.id};
        if(type === "watched")
        {
            url = "http://localhost:9000/movies/add_to_watched";
            if(this.state.watched)
            {
                url = "http://localhost:9000/movies/remove_from_watched";
            }
        }
        else if(type === "watchlist")
        {
            url = "http://localhost:9000/movies/add_to_watchlist";
            if(this.state.watchList)
            {
                url = "http://localhost:9000/movies/remove_from_watchlist";
            }
        }
        // send the request
        let apiResult = await apiPostJsonRequest(url, params);
        let status = apiResult[0];
        let message = apiResult[1].message;
        let requester = apiResult[1].requester;
        let result;
        if(type === "watched")
        {
            if(!this.state.watched)
            {
                result = addMovieToWatchedListResultsHandler(status, message, requester);
            }
            else
            {
                result = removeWatchedListMovieResultsHandler(status, message, requester, this.state.type);
                // if the movie was removed from the watchlist page or should have not been there alredy
                if(result.removeFromDiplay)
                {
                    this.props.removeMovieDisplay(this.state.index);
                    this.props.updateLoggedIn(requester);
                    return;
                }
            }
        }
        else
        {
            if(!this.state.watchList)
            {
                result = addMovieToWatchListResultsHandler(status, message, requester);
            }
            else
            {
                result = removeWatchListMovieResultsHandler(status, message, requester, this.state.type);
                // if the movie was removed from the watchlist page or should have not been there alredy
                if(result.removeFromDiplay)
                {
                    this.props.removeMovieDisplay(this.state.index);
                    this.props.updateLoggedIn(requester);
                    return;
                }
            }
        }

        if(result.movieNotFound)
        {
            this.props.removeMovieDisplay(this.state.index);
            this.props.updateLoggedIn(requester);
            this.props.setMessages(result.messageState);
        }
        else
        {
            console.log(result);
            if(result.showLoginPopUp)
            {
                this.showSignInForm();
                this.props.updateLoggedIn("");
                // this will also update who is logged in
                //this.props.showLoginPopUp(true);
				//this.closeModal();
            }
            else
            {
                console.log(result);
                let messageState = generateMessageState(result.messageState, this.state.messageId);
                this.setState({...messageState,...result.state});
				// if the pop up was caused because of a movie review, do not call this
				if(this.state.type !== "Review")
				{
					this.props.updateParentState(result.state);
				}
                this.props.updateLoggedIn(requester);
            }
        }
	}

    render() {
            let poster = generateMoviePoster(style, this.state.poster, this.state.movie.id);
            let trailer = generateMovieTrailer(style, this.state.trailer);
            let overview = generateOverview(style, this.state.movie.overview);
            let genres = generateGenres(style, this.state.movie.Genres);
            let director = generateDirector(style, this.state.movie.director);
			let watchListIcon = generateWatchListButton(style, this.buttonHandler, this.state.watchList);
			let watchedIcon = generateWatchedListButton(style, this.buttonHandler, this.state.watched);

			let headerBackgroundCss = {backgroundImage: "linear-gradient(to bottom, rgba(112,107,107,0.9), rgba(112,107,107,0.9))"};
			if(this.state.headerImage !== null)
			{
            	headerBackgroundCss = {backgroundImage: "linear-gradient(to bottom, rgba(112,107,107,0.9), rgba(112,107,107,0.9)),url(\"https://image.tmdb.org/t/p/original" + this.state.headerImage};
			}
			else if(this.state.poster !== null)
			{
				headerBackgroundCss = {backgroundImage: "linear-gradient(to bottom, rgba(112,107,107,0.9), rgba(112,107,107,0.9)),url(\"https://image.tmdb.org/t/p/original" + this.state.poster};

			}

			let signInForm = "";
			if(this.state.displaySignIn)
			{
				signInForm = <SignInPopup
                                removeFunction={this.signInRemoveFunction}
                                showSignUpForm={this.showSignUpForm}
                            />;
			}
            let signUpForm = "";
            if(this.state.displaySignUp)
            {
                signUpForm = <SignUpPopup
                                removeFunction={this.signUpRemoveFunction}
                                updateLoggedIn={this.props.updateLoggedIn}
                                setMessages={this.setMessages}
                                showLoginPopUp={this.showSignInForm}
                            />
            }
            console.log(this.state.messages);
            console.log(style.contentStyle);
    		return (
        			<div>
                        <Popup
                            open={this.state.open}
                            closeOnDocumentClick
                            className={"movieDisplay"}
                            onClose={this.closeModal}
                        >
                            <div className={style.modal}>
                                <div className={style.content} style={headerBackgroundCss}>
                                    <Alert
                                        messages={this.state.messages}
                                        messageId={this.state.messageId}
                                        clearMessages={this.state.clearMessages}
                                    />
                                    <div className={style.headerContainer}>
                                        {poster}
                                        <div className={style.movieDetailsOutterContainer}>
                                            <div className={style.movieDetailsContainer}>
                                                <div className={style.movieTitle}>
                                                    {this.state.movie.title}
                                                </div>
												<div className={style.infoContainer}>
													{this.state.movieInfoString}
												</div>
												<div className={style.icons}>
													{watchedIcon}
													{watchListIcon}
												</div>
												{overview}
                                                {genres}
                                                {director}
                                            </div>
                                        </div>
                                    </div>
                                    {trailer}
                                </div>
                            </div>
                        </Popup>
						{signInForm}
                        {signUpForm}
        			</div>
    		);
    }
}


export default MovieDisplayPopUp;
