import React from 'react';
import style from './css/SearchDropDown/SearchDropDown.module.css';
import { Link, Redirect, withRouter } from 'react-router-dom';

class SearchDropDown extends React.Component {
    constructor(props)
    {
        super(props);
        // props:
        // updateFunction - function to call to return either the object associated with the

        // boolean to allow user to not select a suggested value
        let allowNoSuggestion = (this.props.allowNoSuggestion !== undefined) ? this.props.allowNoSuggestion : true;
        // let the index into the suggestion array be -1 if you can select a value that is not suggested
        let suggestionIndex = (allowNoSuggestion) ? -1 : 0;

        this.state = {
            // current value in search box, optional prop to preset value
            value: (this.props.value !== undefined) ? this.props.value : "",
            // suggestions, optional prop to preset values
            suggestions: (this.props.suggestionArray !== undefined) ? this.props.suggestionArray : {},
            // does the search bar have focus?
            focused: false,
            // index of the currently selected/highlighted suggestion
            suggestionIndex: suggestionIndex,
            // key of hashtable to use to get value to display for each suggestion
            // ex. {Movies:"title", Users:"username"}
            // if not multiple types, use a single string such as "title"
            // the value from the array's objects to display
            // used if the array has objects that have keys
            valueKeys: (this.props.valueKeys !== undefined) ? this.props.valueKeys : undefined,
            // true or false depending on if the search will have multiple types of objects returned
            // optional prop to display multiple types of values
            multipleTypes: (this.props.multipleTypes) ? this.props.multipleTypes : false,
            // current hashkey to use with the given index for what is selected
            // optional prop to preset the hashkey to use
            currentHashKey: (this.props.currentHashKey !== undefined) ? this.props.currentHashKey : "",
            // keeps track of index of hash key in suggestion keys array for the button clicked handler
            // optional prop to preset the hashKeyIndex
            currentHashKeyIndex: (this.props.currentHashKeyIndex !== undefined) ? this.props.currentHashKeyIndex : 0,
            // boolean to indicate if a suggested value has to be highlighted if there are any
            // also allows component to return the value in the text box if true
            allowNoSuggestion: allowNoSuggestion,
            // boolean to indicate if the props updateFunction should be called on every change to the value
            // or highlighted value
            updateOnChange: (this.props.updateOnChange !== undefined) ? this.props.updateOnChange : false,
            // max number of characters allowed in input box
            // 524288 is the default value
            maxLength: (this.props.maxLength !== undefined) ? this.props.maxLength : 524288,
            redirect: false,
            // value to display in input box when empty
            placeHolder: (this.props.placeHolder !== undefined) ? this.props.placeHolder : "",
            // clear the input box on enter/click
            clearOnSubmit: (this.props.clearOnSubmit !== undefined) ? this.props.clearOnSubmit : false,
            // prevent input on search bar
            locked: (this.props.locked !== undefined) ? this.props.locked : false,
            // message to display in the search bar if locked
            lockedMessage: (this.props.lockedMessage !== undefined) ? this.props.lockedMessage : "",
            // boolean to let search icon display in input
            showSearchIcon: (this.props.showSearchIcon !== undefined) ? this.props.showSearchIcon : false,
            // hash table holding path, and key to use to generate path
            // ex. {Movies: {Path:"/movie/", key:"id"}, Users: {Path:"/profile/",key:"username"}}
            redirectPaths: this.props.redirectPaths,
            searchDropDownContainterStyle: (this.props.searchDropDownContainterStyle === undefined) ? {} : this.props.searchDropDownContainterStyle,
            inputBoxStyle: (this.props.inputBoxStyle === undefined) ? {} : this.props.inputBoxStyle,
            dropDownContentStyle: (this.props.dropDownContentStyle === undefined) ? {} : this.props.dropDownContentStyle,
            suggestionStyle: (this.props.suggestionStyle === undefined) ? {} : this.props.suggestionStyle,
            keyStyle: (this.props.keyStyle === undefined) ? {} : this.props.keyStyle,
            searchIconStyle: (this.props.searchIconStyle === undefined) ? {} : this.props.searchIconStyle,
            // boolean to show the drop down from the search bar or not, if true, allowNoSuggestion should also be true
            showSuggestions: (this.props.showSuggestions === undefined) ? true : this.props.showSuggestions
        }
        this.changeHandler = this.changeHandler.bind(this);
        this.onFocusHandler = this.onFocusHandler.bind(this);
        this.offFocusHandler = this.offFocusHandler.bind(this);
        this.keyPressedHandler = this.keyPressedHandler.bind(this);
        this.generateInputBox = this.generateInputBox.bind(this);
        this.generateSuggestionBox = this.generateSuggestionBox.bind(this);
        this.redirectHandler = this.redirectHandler.bind(this);
        this.suggestionFocusHandler = this.suggestionFocusHandler.bind(this);
        this.searchIconClickHandler = this.searchIconClickHandler.bind(this);
    }

    componentDidUpdate()
    {
        if(this.state.redirect)
        {
            this.setState({redirect: false});
            // if a redirect was caused and this function exists, call it
            if(this.props.redirectHandler !== undefined)
            {
                // function called when a redirect was caused
                this.props.redirectHandler();
            }
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


    searchIconClickHandler()
    {
        // if there are no suggestions or the suggestions was a empty {} object
        if(this.state.suggestions === undefined || (Object.keys(this.state.suggestions)).length < 1)
        {
            // if the field value is accepted
            if(this.state.allowNoSuggestion)
            {
                if(this.props.updateFunction !== undefined)
                {
                    this.props.updateFunction(this.state.value);
                    if(this.state.clearOnSubmit)
                    {
                        this.setState({value: ""});
                    }
                }
            }
            return;
        }
        // if here, there are suggestions being displayed
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
            // if showing suggestions is not allowed, do nothing
            if(!this.state.showSuggestions) return;
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
            if(this.state.suggestionIndex !== -1 && this.state.showSuggestions)
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
        let searchIcon = "";
        if(this.state.showSearchIcon)
        {
            searchIcon = (
                <div className={style.searchButtonContainer}>
                    <i class={`fas fa-search`} style={this.state.searchIconStyle} onClick={this.searchIconClickHandler}/>
                </div>
            );
        }
        let suggestions = (this.state.showSuggestions) ? this.generateSuggestionBox() : "";
        let placeHolder = (this.state.locked) ? this.state.lockedMessage : this.state.placeHolder;
        return (
              <div className={style.searchDropDownContainer} style={this.state.searchDropDownContainterStyle}>
                  <div className={style.inputFieldContainer}>
                      <input
                          autocomplete="off"
                          type="text"
                          name="value"
                          form = "form2"
                          className={`${style.inputFieldBoxLong} ${style.inputBoxWithIcon} validInputBox`}
                          onChange={this.changeHandler}
                          onFocus={this.onFocusHandler}
                          maxlength={this.state.maxLength}
                          placeholder={placeHolder}
                          // when the input is no longer focused
                          onBlur={this.offFocusHandler}
                          value={this.state.value}
                          onKeyDown={this.keyPressedHandler}
                          style={this.state.inputBoxStyle}
                          disabled={this.state.locked}
                      />
                      {searchIcon}
                  </div>
                  {suggestions}
              </div>
        );
    }

    generateSuggestionBox()
    {
        if(this.state.focused || this.state.focused && this.state.value.length > 0 && (Object.keys(this.state.suggestions)).length > 0)
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
                    suggestionHTML.push(<a style={this.state.keyStyle}>{key}</a>);
                }
                tempArr.forEach((value, index) => {
                    // get the value of the suggestion
                    let searchValue = value[this.state.valueKeys[key]];
                    let html = <a style={this.state.suggestionStyle} onMouseOver={(e) => this.mouseHoverHashHandler(index, key, counter, e)}>{searchValue}</a>;
                    if(index === this.state.suggestionIndex && key === this.state.currentHashKey && this.state.redirectPaths !== undefined)
                    {
                        html = <a style={this.state.suggestionStyle} className={style.selectedSuggestion} onMouseDown={(e) => this.redirectHandler()} onMouseOver={(e) => this.mouseHoverHashHandler(index, key, counter, e)}>{searchValue}</a>;
                    }
                    else if(index === this.state.suggestionIndex && key === this.state.currentHashKey)
                    {
                        html = <a style={this.state.suggestionStyle} className={style.selectedSuggestion} onMouseDown={(e) => this.suggestionFocusHandler()} onMouseOver={(e) => this.mouseHoverHashHandler(index, key, counter, e)}>{searchValue}</a>;
                    }
                    suggestionHTML.push(html);
                });
                counter = counter + 1;
            }
            // if no suggestions after loop, return null
            if(suggestionHTML.length < 1)
            {
                return null;
            }
            return(<React.Fragment>
              <div className={style.dropdownContent} style={this.state.dropDownContentStyle}>
                  {suggestionHTML}
              </div>
          </React.Fragment>);
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
        return (
            <React.Fragment>
                {inputbox}
                {redirect}
            </React.Fragment>);
    }

}
export default withRouter(SearchDropDown);
