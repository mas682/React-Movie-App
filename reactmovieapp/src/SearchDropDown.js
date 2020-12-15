import React from 'react';
import style from './css/reviewform.module.css';
import { Link, Redirect, withRouter } from 'react-router-dom';

class SearchDropDown extends React.Component {
    constructor(props)
    {
        super(props);
        // props:
        // updateOnChange - boolean value to indicate if the updateFunction
        // should be called on every change; not applicable if updateFunction not defined
        // updateFunction - function to call to return either the object associated with the
        // selected value or a string
        // allowNoSuggestion - boolean value to indicate if the user can select values that
        // are not from the suggestion box
        //fix this so that it does not hover on a entry automatically if you pass a certain
        //prop....see googles search bar

        let valueKeys = undefined;
        // used if the array has objects that have keys, ex. movie.title
        if(this.props.valueKeys !== undefined)
        {
            valueKeys = this.props.valueKeys;
        }
        // optional prop to preset suggestions
        let suggestions = {};
        if(this.props.suggestionArray !== undefined)
        {
            suggestions = this.props.suggestionArray;
        }
        // optional prop to preset the value
        let value = "";
        if(this.props.value !== undefined)
        {
            value = this.props.value;
        }
        let multipleTypes = false;
        if(this.props.multipleTypes)
        {
            multipleTypes = true;
        }
        let currentHashKey = "";
        if(this.props.currentHashKey !== undefined)
        {
            currentHashKey = this.props.currentHashKey;
        }
        let currentHashKeyIndex = 0;
        if(this.props.currentHashKeyIndex !== undefined)
        {
            currentHashKeyIndex = this.props.currentHashKeyIndex;
        }
        let useSuggestionValue = false;
        if(this.props.useSuggestionValue)
        {
            useSuggestionValue = true;
        }
        let suggestionIndex = (this.props.allowNoSuggestion) ? -1 : 0;
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
            valueKeys: valueKeys,
            // true or false depending on if the search will have multiple types
            multipleTypes: multipleTypes,
            // current hashkey to use with the given index for what is selected
            // only applicable if multiple types
            currentHashKey: currentHashKey,
            // keeps track of index of hash key in suggestion keys array
            // for the button clicked handler
            currentHashKeyIndex: currentHashKeyIndex,
            // boolean to indicate if setting value to whatever suggestion is highlighted
            useSuggestionValue: useSuggestionValue,
            redirect: false,
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

    keyPressedHandler(event)
    {
        // if no suggestions, ignore the key push
        // need to be careful if enter pressed..
        if(event.keyCode === 13)
        {
            // needed so that this does not cause the event to close the movie form
            event.preventDefault();
        }
        if(this.state.suggestions === undefined || (Object.keys(this.state.suggestions)).length < 1)
        {
            // if the enter key was pressed
            if(event.keyCode === 13)
            {
                // if the field value is accepted
                if(this.props.allowNoSuggestion)
                {
                    // remove focus from the input field
                    event.target.blur();
                    this.props.updateFunction(this.state.value);
                }
            }
            return;
        }
        let currentKey = this.state.currentHashKey;
        let currentIndex = this.state.suggestionIndex;
        // if the key pushed is down, increment index by 1 if not at end
        if(event.keyCode === 40)
        {
            let currentArray = this.state.suggestions[currentKey];
            let arrayLength = currentArray.length;
            if(currentIndex + 1 === arrayLength)
            {
                // need to go to next array if possible
                // if not multiple types do nothing as at end of array
                if(this.state.multipleTypes)
                {
                    // get the keys from the suggestions
                    let keys = Object.keys(this.state.suggestions);
                    if(keys.length > 0)
                    {
                        let found = false;
                        // increment the hash key index to get the next avaiable key
                        let keyIndex = this.state.currentHashKeyIndex + 1;
                        // if there are more keys and one that has suggestions is not found
                        while(!found && keyIndex < keys.length)
                        {
                            currentKey = keys[keyIndex];
                            if(this.state.suggestions[currentKey].length > 0)
                            {
                                found = true;
                            }
                            else
                            {
                                keyIndex = keyIndex + 1;
                            }
                        }
                        if(found)
                        {
                            this.setState({
                                suggestionIndex: 0,
                                currentHashKey: currentKey,
                                currentHashKeyIndex: keyIndex
                            });
                            // if the parents update function exists and on focus change it wants to be called
                            if(this.props.updateFunction !== undefined && this.props.updateOnChange)
                            {
                                this.props.updateFunction(this.state.suggestions[currentKey][0]);
                            }
                        }
                    }
                }
            }
            else
            {
                currentIndex = currentIndex + 1;
                console.log(currentIndex);
                this.setState({suggestionIndex: currentIndex});
                // if the parents update function exists and on focus change it wants to be called
                if(this.props.updateFunction !== undefined && this.props.updateOnChange)
                {
                    this.props.updateFunction(this.state.suggestions[currentKey][currentIndex]);
                }
            }
        }
        // if the key pushed is up, decrement index by 1 if not at beginning
        else if(event.keyCode === 38)
        {
            let currentArray = this.state.suggestions[currentKey];
            let arrayLength = currentArray.length;
            console.log(currentIndex -1);
            if(currentIndex - 1 <= -1)
            {
                // need to go to next array if possible
                // if not multiple types do nothing
                if(this.state.multipleTypes)
                {
                    // get the keys from the suggestions
                    let keys = Object.keys(this.state.suggestions);
                    let suggestionIndex = 0;
                    if(keys.length > 0)
                    {
                        let found = false;
                        // increment the hash key index to get the next avaiable key
                        let keyIndex = this.state.currentHashKeyIndex - 1;
                        // if there are more keys and one that has suggestions is not found
                        while(!found && keyIndex > -1)
                        {
                            currentKey = keys[keyIndex];
                            if(this.state.suggestions[currentKey].length > 0)
                            {
                                found = true;
                                // get the last index of the array
                                suggestionIndex = this.state.suggestions[currentKey].length - 1;
                            }
                            else
                            {
                                keyIndex = keyIndex - 1;
                            }
                        }
                        if(found)
                        {
                            this.setState({
                                suggestionIndex: suggestionIndex,
                                currentHashKey: currentKey,
                                currentHashKeyIndex: keyIndex
                            });
                            // if the parents update function exists and on focus change it wants to be called
                            if(this.props.updateFunction !== undefined && this.props.updateOnChange)
                            {
                                this.props.updateFunction(this.state.suggestions[currentKey][suggestionIndex]);
                            }
                        }
                    }
                }
                else
                {
                    // if the user can selet the value in the text box
                    if(this.props.allowNoSuggestion)
                    {
                        // set the index to a index outside of the array
                        this.setState({
                            suggestionIndex: -1
                        });
                    }
                }
            }
            else
            {
                currentIndex = currentIndex - 1;
                this.setState({suggestionIndex: currentIndex});
                // if the parents update function exists and on focus change it wants to be called
                if(this.props.updateFunction !== undefined && this.props.updateOnChange)
                {
                    this.props.updateFunction(this.state.suggestions[this.state.currentHashKey][currentIndex]);
                }
            }
        }
        // if the enter key was pressed
        else if(event.keyCode === 13)
        {
            // remove focus from the input field
            event.target.blur();
            // if enter pressed on a redirect
            let keys = Object.keys(this.state.suggestions);
            if(keys.length > 0)
            {
                if(this.state.redirectPaths !== undefined)
                {
                    this.redirectHandler();
                }
                else
                {
                    alert(keys.length);
                    console.log(this.state.suggestions);
                    this.suggestionFocusHandler();
                }
            }
            else
            {
                // redirect search to search page?
            }
        }
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
            if(this.props.updateFunction !== undefined && this.props.updateOnChange)
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
        let suggestionIndex = (this.props.allowNoSuggestion) ? -1 : 0;
        this.setState({
            suggestionIndex: suggestionIndex,
            suggestions: tempSuggestions,
            currentHashKey: "",
            currentHashKeyIndex: 0,
            focused: true
        });
    }

    // called when the search box loses focus
    offFocusHandler()
    {
        this.setState({focused: false});
        // if no highlighted options to be selected, return undefined
        if(Object.keys(this.state.suggestions).length < 1 && this.props.updateFunction !== undefined && this.props.updateOnChange)
        {
            this.props.updateFunction(undefined);
        }
    }

    // called when the suggestions to click on do not cause redirects
    suggestionFocusHandler()
    {
        if(Object.keys(this.state.suggestions).length > 0 && this.state.valueKeys !== undefined)
        {
            // update the value to whatever the current highlighted value is
            this.setState({value: (this.state.suggestions[this.state.currentHashKey][this.state.suggestionIndex][this.state.valueKeys[this.state.currentHashKey]])});
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

    async changeHandler(event)
    {
        let name = event.target.name;
        let value = event.target.value;
        let tempSuggestions = {};
        // if the value entered is not a empty string
        if(value.length > 0)
        {
            tempSuggestions = await this.props.getSuggestions(value);
            // if the updateFunction exists and the selected value is supposed to be cleared
            // every time
            if(this.props.updateFunction !== undefined && this.props.updateOnChange)
            {
                if(Object.keys(tempSuggestions).length < 1)
                {
                    this.props.updateFunction(undefined);
                }
            }
        }
        else
        {
            // if the updateFunction exists and the selected value is supposed to be cleared
            // every time
            if(this.props.updateFunction !== undefined && this.props.updateOnChange)
            {
                this.props.updateFunction(undefined);
            }
        }
        let currentKey = "";
        // index into keys array
        let index = 0;
        if(tempSuggestions !== undefined)
        {
            let newValues = this.getCurrentKeyAndIndex(tempSuggestions, index, true);
            currentKey = newValues.currentKey;
            index = newValues.index;
        }
        let suggestionIndex = (this.props.allowNoSuggestion) ? -1 : 0;
        this.setState({
            [name]: value,
            suggestionIndex: suggestionIndex,
            currentHashKey: currentKey,
            currentHashKeyIndex: index,
            suggestions: tempSuggestions
        });
    }


    // note: if you want to start from the beginning, pass 0 as the index
    // may not need to pass in currentKey...
    // increment is a boolean indicating if to add or subtract from index in
    // the suggestions keys
    getCurrentKeyAndIndex(suggestions, index, increment)
    {
        let currentKey = "";
        // get the keys from the suggestions
        let keys = Object.keys(suggestions);
        if(keys.length > 0)
        {
            // key into tempSuggestions
            currentKey = keys[index];
            // array of values from tempSuggestions
            let tempArray = suggestions[currentKey];
            // if going from bottom to top of suggestions
            if(increment)
            {
                // if the array has no entries, try the next key
                while(tempArray.length < 1 && index < keys.length -1)
                {
                    index = index + 1;
                    currentKey = keys[index];
                    tempArray = suggestions[currentKey];
                }
            }
            else
            {
                while(tempArray.length < 1 && index > -1)
                {
                    index = index - 1;
                    currentKey = keys[index];
                    tempArray = suggestions[currentKey];
                }
            }
            // this should be taken out..
            // update the selected value if true
            if(this.props.updateFunction !== undefined && this.props.updateOnChange)
            {
                this.props.updateFunction((suggestions[currentKey][0]));
            }
        }
        return {currentKey: currentKey, index: index};
    }

    generateInputBox()
    {
        let suggestions = this.generateSuggestionBox();
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
        console.log(this.state.suggestions);
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
