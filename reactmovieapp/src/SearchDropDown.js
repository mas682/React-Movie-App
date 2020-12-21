import React from 'react';
import style from './css/reviewform.module.css';
import { Link, Redirect, withRouter } from 'react-router-dom';

class SearchDropDown extends React.Component {
    constructor(props)
    {
        super(props);
        // props:
        // updateFunction - function to call to return either the object associated with the
        // selected value or a string

        // used if the array has objects that have keys, ex. movie.title
        let valueKeys = (this.props.valueKeys !== undefined) ? this.props.valueKeys : undefined;
        // optional prop to preset suggestions
        let suggestions = (this.props.suggestionArray !== undefined) ? this.props.suggestionArray : {};
        // optional prop to preset the value
        let value = (this.props.value !== undefined) ? this.props.value : "";
        // optional prop to display multiple types of values
        let multipleTypes = (this.props.multipleTypes) ? this.props.multipleTypes : false;
        // optional prop to preset the hashkey to use
        let currentHashKey = (this.props.currentHashKey !== undefined) ? this.props.currentHashKey : "";
        // optional prop to preset the hashKeyIndex
        let currentHashKeyIndex = (this.props.currentHashKeyIndex !== undefined) ? this.props.currentHashKeyIndex : 0;
        let allowNoSuggestion = (this.props.allowNoSuggestion !== undefined) ? this.props.allowNoSuggestion : true;
        // let the index into the suggestion array be -1 if you can select a value that is not suggested
        let suggestionIndex = (allowNoSuggestion) ? -1 : 0;
        // boolean to call parents updateFunction on every change or just on enter/click
        // requires updateFunction to be passed in as props
        let updateOnChange = (this.props.updateOnChange !== undefined) ? this.props.updateOnChange : false;
        // max number of characters allowed in input box
        let maxLength = (this.props.maxLength !== undefined) ? this.props.maxLength : -1;
        // value to display in input box when empty
        let placeHolder = (this.props.placeHolder !== undefined) ? this.props.placeHolder : "";
        // clear the input box on enter/click
        let clearOnSubmit = (this.props.clearOnSubmit !== undefined) ? this.props.clearOnSubmit : false;
        // prevent input on search bar
        let locked = (this.props.locked !== undefined) ? this.props.locked : false;
        // message to display in the search bar if locked
        let lockedMessage = (this.props.lockedMessage !== undefined) ? this.props.lockedMessage : "";
        this.state = {
            // current value in search box
            value: value,
            // suggestions
            suggestions: suggestions,
            // does the search bar have focus?
            focused: false,
            // index of the currently selected/highlighted suggestion
            suggestionIndex: suggestionIndex,
            // key of hashtable to use to get value to display for each suggestion
            // ex. {Movies:"title", Users:"username"}
            // if not multiple types, use a single string such as "title"
            // the value from the array's objects to display
            valueKeys: valueKeys,
            // true or false depending on if the search will have multiple types of objects returned
            multipleTypes: multipleTypes,
            // current hashkey to use with the given index for what is selected
            currentHashKey: currentHashKey,
            // keeps track of index of hash key in suggestion keys array
            // for the button clicked handler
            currentHashKeyIndex: currentHashKeyIndex,
            // boolean to indicate if a suggested value has to be highlighted if there are any
            // also allows component to return the value in the text box if true
            allowNoSuggestion: allowNoSuggestion,
            // boolean to indicate if the props updateFunction should be called on every change to the value
            // or highlighted value
            updateOnChange: updateOnChange,
            maxLength: maxLength,
            redirect: false,
            placeHolder: placeHolder,
            clearOnSubmit: clearOnSubmit,
            locked: locked,
            lockedMessage: lockedMessage,
            // hash table holding path, and key to use to generate path
            // ex. {Movies: {Path:"/movie/", key:"id"}, Users: {Path:"/profile/",key:"username"}}
            redirectPaths: this.props.redirectPaths
        }
        this.changeHandler = this.changeHandler.bind(this);
        this.onFocusHandler = this.onFocusHandler.bind(this);
        this.offFocusHandler = this.offFocusHandler.bind(this);
        this.keyPressedHandler = this.keyPressedHandler.bind(this);
        this.generateInputBox = this.generateInputBox.bind(this);
        this.generateSuggestionBox = this.generateSuggestionBox.bind(this);
        this.redirectHandler = this.redirectHandler.bind(this);
        this.suggestionFocusHandler = this.suggestionFocusHandler.bind(this);
    }

    componentDidUpdate()
    {
        if(this.state.redirect)
        {
            this.setState({redirect: false});
        }
    }
    // update the state if new props came in with a different profile
    // or a different user logged in
    static getDerivedStateFromProps(nextProps, prevState)
    {
        if(prevState.locked !== nextProps.locked)
        {
            return {locked: nextProps.locked, lockedMessage: nextProps.lockedMessage};
        }
        else
        {
            return null;
        }
    }

    // optimization to keep component from rerendering
    shouldComponentUpdate(nextProps, nextState){
        // only rerender if there was a change in followers, following, or username
        // whose page we are currently on
        let render = true;
        if(this.state.redirect === true && nextState.redirect === false)
        {
            render = false;
        }
        return render;
    }

    // function is ran on all key presses
    // but only catching up, down, and enter in here
    keyPressedHandler(event)
    {
        if(event.keyCode === 13)
        {
            // needed so that this does not cause the event to close the movie form
            event.preventDefault();
        }
        // if there are no suggestions or the suggestions was a empty {} object
        if(this.state.suggestions === undefined || (Object.keys(this.state.suggestions)).length < 1)
        {
            // if the enter key was pressed
            if(event.keyCode === 13)
            {
                // if the field value is accepted
                if(this.state.allowNoSuggestion)
                {
                    // remove focus from the input field
                    event.target.blur();
                    if(this.props.updateFunction !== undefined)
                    {
                        this.props.updateFunction(this.state.value);
                        if(this.state.clearOnSubmit)
                        {
                            this.setState({value: ""});
                        }
                    }
                }
            }
            return;
        }
        // if the key pushed is down or up
        if(event.keyCode === 40 || event.keyCode === 38)
        {
            let result;
            let currentKey = this.state.currentHashKey;
            let currentIndex = this.state.suggestionIndex;
            let currentKeyIndex = this.state.currentHashKeyIndex;
            if(event.keyCode === 40)
            {
                result = this.downKeyHandler(currentKey, currentIndex, currentKeyIndex, this.state.suggestions, this.state.allowNoSuggestion, this.state.multipleTypes);
            }
            else
            {
                result = this.upKeyHandler(currentKey, currentIndex, currentKeyIndex, this.state.suggestions, this.state.allowNoSuggestion, this.state.multipleTypes);
            }
            if(result.newState)
            {
                currentKey = result.state.currentHashKey;
                currentIndex = result.state.suggestionIndex;
                this.setState(result.state);
                // if the parents update function exists and on focus change it wants to be called
                if(this.props.updateFunction !== undefined && this.state.updateOnChange)
                {
                    // if allowNoSuggestion is true, current index can be -1, so return the value of the input box if so
                    let newValue = (currentIndex === -1) ? this.state.value : this.state.suggestions[currentKey][currentIndex];
                    this.props.updateFunction(newValue);
                }
            }
        }
        // if the enter key was pressed
        else if(event.keyCode === 13)
        {
            // if here, there are suggestions being displayed
            // remove focus from the input field
            event.target.blur();

            // if a suggestion is highlighted
            if(this.state.suggestionIndex !== -1)
            {
                // if there are paths to redirect to
                if(this.state.redirectPaths !== undefined)
                {
                    this.redirectHandler();
                }
                else
                {
                    this.suggestionFocusHandler();
                }
            }
            // if there are no suggestions highlighted
            else
            {
                this.suggestionFocusHandler();
            }
        }
    }

    // currentKey is the key into the object holding the suggestions
    // ex. {movies: [], users: [], genres: []}...the key could be movies
    // currentIndex is the index into whatever array is currently being used, ex. movies[1]
    // keyIndex is the index of the key in the object
    downKeyHandler(currentKey, currentIndex, keyIndex, suggestions, allowNoSuggestion, multipleTypes)
    {
        let currentArray = suggestions[currentKey];
        let arrayLength = currentArray.length;
        // if at the end of the current suggestion array
        if(currentIndex + 1 === arrayLength)
        {
            let newValue = false;
            // need to go to next array if multiple types
            if(multipleTypes)
            {
                let result = this.getCurrentKeyAndIndex(suggestions, keyIndex + 1, true);
                // if there was another array in the suggestion object to go to
                if(result.nextKeyFound)
                {
                    newValue = true;
                    // new key into suggestions object
                    currentKey = result.currentKey;
                    currentIndex = 0;
                    keyIndex = result.index;
                }
            }
            if(!newValue)
            {
                // if no new value found, at bottom of suggestion list so do nothing
                return {newState: false};
            }
        }
        // if not at the end of the currently used array, just increase index
        else
        {
            currentIndex = currentIndex + 1;
        }
        let newState = {
            suggestionIndex: currentIndex,
            currentHashKey: currentKey,
            currentHashKeyIndex: keyIndex
        };
        return {
            newState: true,
            state: newState
        };
    }

    // currentKey is the key into the object holding the suggestions
    // ex. {movies: [], users: [], genres: []}...the key could be movies
    // currentIndex is the index into whatever array is currently being used, ex. movies[1]
    // keyIndex is the index of the key in the object
    // allowNoSuggestion is a boolean value indiating if no suggestion can be selected
    upKeyHandler(currentKey, currentIndex, keyIndex, suggestions, allowNoSuggestion, multipleTypes)
    {
        // if at the beginning of the current suggestion array
        if(currentIndex === 0)
        {
            let newValues = false;
            // need to go to next array if multiple types
            if(multipleTypes)
            {
                // get the next key/index of the key
                let result = this.getCurrentKeyAndIndex(suggestions, keyIndex - 1, false);
                // if there was another array in the suggestion object to go to
                if(result.nextKeyFound)
                {
                    // new key into suggestions object
                    currentKey = result.currentKey;
                    // index into arrays values
                    currentIndex = suggestions[currentKey].length -1;
                    keyIndex = result.index;
                    newValues = true;
                }
                else
                {
                    // if no result found, no suggestions to go up to so if allowNoSuggestion
                    // is true, deselect the top suggestion
                    currentIndex = (allowNoSuggestion) ? -1 : 0;
                    newValues = (currentIndex === -1) ? true : false;
                }
            }
            // if only 1 type of suggestions
            else
            {
                // if you can deselect all entries, set index to -1
                if(allowNoSuggestion)
                {
                    newValues = true;
                    currentIndex = -1;
                }
            }
            if(!newValues)
            {
                return {newState: false};
            }
        }
        // if not at the end of the currently used array, just decrease index
        // or if the index is -1 if allowNoSuggestion is true
        else
        {
            if(currentIndex > 0)
            {
                currentIndex = currentIndex - 1;
            }
            else
            {
                // if the current index is -1 and up is pressed, leave as is
                return {newState: false};
            }
        }
        let newState = {
            suggestionIndex: currentIndex,
            currentHashKey: currentKey,
            currentHashKeyIndex: keyIndex
        };
        return {
            newState: true,
            state: newState
        };
    }



    // this is used if there are multiple types of suggsestions
    mouseHoverHashHandler(index, key, keyIndex, event)
    {
        // if the current suggestionIndex hovered over is not the one stored in the state
        // or if the current type of value hovered over is not the same type as currently
        // stored
        if(this.state.suggestionIndex !== index || this.state.currentHashKey !== key)
        {
            this.setState({
                suggestionIndex: index,
                currentHashKey: key,
                currentHashKeyIndex: keyIndex
            });
            if(this.props.updateFunction !== undefined && this.state.updateOnChange)
            {
                this.props.updateFunction(this.state.suggestions[key][index]);
            }
        }
    }

    // called when search box gains focus
    async onFocusHandler()
    {
        // reset the suggestions
        let tempSuggestions = {};
        // if a value is in the search box, get suggestions for it
        if(this.state.value.length > 0)
        {
            tempSuggestions = await this.props.getSuggestions(this.state.value);
        }
        let suggestionIndex = (this.state.allowNoSuggestion) ? -1 : 0;
        let result = this.getCurrentKeyAndIndex(tempSuggestions, 0, true);
        this.setState({
            suggestionIndex: suggestionIndex,
            suggestions: tempSuggestions,
            currentHashKey: result.currentKey,
            currentHashKeyIndex: 0,
            focused: true
        });
    }

    // called when the search box loses focus
    offFocusHandler()
    {
        this.setState({focused: false});
        // if no highlighted options to be selected, return undefined
        if(Object.keys(this.state.suggestions).length < 1 && this.props.updateFunction !== undefined && this.state.updateOnChange)
        {
            this.props.updateFunction(undefined);
        }
    }

    // called when the suggestions to click on do not cause redirects
    suggestionFocusHandler()
    {
        // if a value is highlighted
        if(this.state.suggestionIndex !== -1 && Object.keys(this.state.suggestions).length > 0 && this.state.valueKeys !== undefined)
        {
            let value = (this.state.suggestions[this.state.currentHashKey][this.state.suggestionIndex][this.state.valueKeys[this.state.currentHashKey]]);
            let value2 = this.state.suggestions[this.state.currentHashKey][this.state.suggestionIndex];
            // if there is a update function, call it with the value in the input
            if(this.props.updateFunction !== undefined)
            {
                this.props.updateFunction(value2);
            }
            if(this.state.clearOnSubmit)
            {
                this.setState({value: ""});
            }
            else
            {
                this.setState({value: value});
            }
        }
        else if(this.state.suggestionIndex === -1)
        {
            // if there is a update function, call it with the value in the input
            if(this.props.updateFunction !== undefined && this.state.allowNoSuggestion)
            {
                this.props.updateFunction(this.state.value);
            }
            if(this.state.clearOnSubmit)
            {
                this.setState({value: ""});
            }
            else
            {
                this.setState({value: this.state.value});
            }
        }
        else
        {
            this.setState({value: ""});
        }
    }

    // used to redirect to a different page when suggestion clicked on
    redirectHandler()
    {
        if(this.state.redirectPaths !== undefined)
        {
            this.setState({
              redirect: true,
              value: ""
            });
        }
    }

    // function to handle character changes in the input box
    // note: does not execute on up, down, enter key presses
    async changeHandler(event)
    {
        let name = event.target.name;
        let value = event.target.value;
        let tempSuggestions = {};
        // if the value entered is not a empty string
        if(value.length > 0)
        {
            tempSuggestions = await this.props.getSuggestions(value);
        }
        let currentKey = "";
        // index into keys array
        let index = 0;
        let newKeyFound = false;
        if(tempSuggestions !== undefined)
        {
            let newValues = this.getCurrentKeyAndIndex(tempSuggestions, index, true);
            currentKey = newValues.currentKey;
            index = newValues.index;
            newKeyFound = newValues.nextKeyFound;
        }
        // if the updateFunction exists and the selected value is supposed to be cleared
        // updated every time in the parent
        if(this.props.updateFunction !== undefined && this.state.updateOnChange)
        {
            let newValue;
            if(newKeyFound)
            {
                // value is the value in the search bar
                newValue = (this.state.allowNoSuggestion) ? value : tempSuggestions[currentKey][0];
            }
            else
            {
                // if newKey is not found, tempSuggestions is empty or undefined
                newValue = (this.state.allowNoSuggestion) ? value : undefined;
            }
            this.props.updateFunction(newValue);
        }
        let suggestionIndex = (this.state.allowNoSuggestion) ? -1 : 0;
        this.setState({
            value: value,
            suggestionIndex: suggestionIndex,
            currentHashKey: currentKey,
            currentHashKeyIndex: index,
            suggestions: tempSuggestions
        });
    }


    // note: if you want to start from the beginning, pass 0 as the index
    // increment is a boolean indicating if to add or subtract from index in
    // the suggestions keys
    // suggestions is a object in the form of {movies: [...], users: [...]}
    // index is the index of the key to start at in the object, ex. 1 = users
    // increment is a boolean to either increment the index or decrement the index
    // on success, returns the next key that has values in its array
    // returns true for nextKeyFound if a key was found, false otherwise
    getCurrentKeyAndIndex(suggestions, index, increment)
    {
        let currentKey = "";
        let found = false;
        // get the keys from the suggestions
        let keys = Object.keys(suggestions);
        if(keys.length > 0 && index > -1 && index <= keys.length -1)
        {
            // key into tempSuggestions
            currentKey = keys[index];
            // array of values from tempSuggestions
            let tempArray = suggestions[currentKey];
            // if there are entries in the current array, new array already found
            if(tempArray.length > 0)
            {
                found = true;
            }
            if(!found)
            {
                // if going from bottom to top of suggestions
                if(increment)
                {
                    // if the array has no entries, try the next key
                    while(tempArray.length < 1 && index <= keys.length -1)
                    {
                        index = index + 1;
                        currentKey = keys[index];
                        tempArray = suggestions[currentKey];
                        found = (tempArray.length > 0) ? true : false;
                    }
                }
                else
                {
                    while(tempArray.length < 1 && index > -1)
                    {
                        index = index - 1;
                        currentKey = keys[index];
                        tempArray = suggestions[currentKey];
                        found = (tempArray.length > 0) ? true : false;
                    }
                }
            }
        }
        return {currentKey: currentKey, index: index, nextKeyFound: found};
    }

    generateInputBox()
    {
        if(this.state.locked)
        {
            return (
              <React.Fragment>
                  <div className={style.dropdown}>
                      <input
                          autocomplete="off"
                          type="text"
                          name="value"
                          form = "form2"
                          className="inputFieldBoxLong validInputBox"
                          onChange={this.changeHandler}
                          onFocus={this.onFocusHandler}
                          placeholder={this.state.lockedMessage}
                          // when the input is no longer focused
                          onBlur={this.offFocusHandler}
                          value={this.state.value}
                          onKeyDown={this.keyPressedHandler}
                          disabled
                      />
                  </div>
                </React.Fragment>
            );
        }
        let suggestions = this.generateSuggestionBox();
        // if there is a maxlength
        if(this.state.maxLength > -1)
        {
            return (
              <React.Fragment>
                  <div className={style.dropdown}>
                      <input
                          autocomplete="off"
                          type="text"
                          name="value"
                          form = "form2"
                          className="inputFieldBoxLong validInputBox"
                          onChange={this.changeHandler}
                          onFocus={this.onFocusHandler}
                          maxlength={this.state.maxLength}
                          placeholder={this.state.placeHolder}
                          // when the input is no longer focused
                          onBlur={this.offFocusHandler}
                          value={this.state.value}
                          onKeyDown={this.keyPressedHandler}
                      />
                      {suggestions}
                  </div>
                </React.Fragment>
            );
        }
        return (
          <React.Fragment>
              <div className={style.dropdown}>
                  <input
                      autocomplete="off"
                      type="text"
                      name="value"
                      form = "form2"
                      className="inputFieldBoxLong validInputBox"
                      onChange={this.changeHandler}
                      onFocus={this.onFocusHandler}
                      placeholder={this.state.placeHolder}
                      // when the input is no longer focused
                      onBlur={this.offFocusHandler}
                      value={this.state.value}
                      onKeyDown={this.keyPressedHandler}
                  />
                  {suggestions}
              </div>
            </React.Fragment>
        );
    }

    generateSuggestionBox()
    {
        if(this.state.focused && this.state.value.length > 0 && (Object.keys(this.state.suggestions)).length > 0)
        {
            let keys = Object.keys(this.state.suggestions);
            let counter = 0;
            let suggestionHTML = [];
            while(counter < keys.length)
            {
                let key = keys[counter];
                let tempArr = this.state.suggestions[key];
                if(tempArr.length > 0 && this.state.multipleTypes)
                {
                    suggestionHTML.push(<a>{key}</a>);
                }
                tempArr.forEach((value, index) => {
                    // get the value of the suggestion
                    let searchValue = value[this.state.valueKeys[key]];
                    let html = <a onMouseOver={(e) => this.mouseHoverHashHandler(index, key, counter, e)}>{searchValue}</a>;
                    if(index === this.state.suggestionIndex && key === this.state.currentHashKey && this.state.redirectPaths !== undefined)
                    {
                        html = <a className={style.selectedSuggestion} onMouseDown={(e) => this.redirectHandler()} onMouseOver={(e) => this.mouseHoverHashHandler(index, key, counter, e)}>{searchValue}</a>;
                    }
                    else if(index === this.state.suggestionIndex && key === this.state.currentHashKey)
                    {
                        html = <a className={style.selectedSuggestion} onMouseDown={(e) => this.suggestionFocusHandler()} onMouseOver={(e) => this.mouseHoverHashHandler(index, key, counter, e)}>{searchValue}</a>;
                    }
                    suggestionHTML.push(html);
                });
                counter = counter + 1;
            }
            // if no suggestions after for each, return null
            if(suggestionHTML.length < 1)
            {
                return null;
            }
            return(
              <div className={style.dropdownContent}>
                  {suggestionHTML}
              </div>);
        }
        return null;
    }

    render()
    {
        let redirect = "";
        if(this.state.redirect)
        {
            let path = this.state.redirectPaths[this.state.currentHashKey].path;
            let key = this.state.redirectPaths[this.state.currentHashKey].key;
            let value = this.state.suggestions[this.state.currentHashKey][this.state.suggestionIndex][key];
            let url = path + value;
            redirect = <Redirect to={url} />;
        }
        let inputbox = this.generateInputBox();
        let suggestionBox = this.generateSuggestionBox();
        return (
            <React.Fragment>
                <div className={style.searchInputContainer}>
                    {inputbox}
                </div>
                {redirect}
            </React.Fragment>);
    }

}
export default withRouter(SearchDropDown);
