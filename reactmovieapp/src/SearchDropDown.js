import React from 'react';
import style from './css/reviewform.module.css';
import { Link, Redirect, withRouter } from 'react-router-dom';

class SearchDropDown extends React.Component {
    constructor(props)
    {
        super(props);
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
        this.state = {
            // current value in search box
            value: value,
            // suggestions
            suggestions: suggestions,
            // does the search bar have focus?
            focused: false,
            // index of the currently selected/highlighted suggestion
            suggestionIndex: 0,
            // key of hashtable to use to get value to display for each suggestion
            // ex. {Movies:"title", Users:"username"}
            // if not multiple types, use a single string such as "titie"
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
        this.mouseHoverHandler = this.mouseHoverHandler.bind(this);
        this.redirectHandler = this.redirectHandler.bind(this);
    }

    componentDidUpdate()
    {
        if(this.state.redirect)
        {
            this.setState({redirect: false});
        }
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
        if(this.state.suggestions === undefined)
        {
            return;
        }
        if((Object.keys(this.state.suggestions)).length < 1)
        {
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
                // if not multiple types do nothing
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
                            if(this.props.updateFunction !== undefined)
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
                this.setState({suggestionIndex: currentIndex});
                if(this.props.updateFunction !== undefined)
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
                            if(this.props.updateFunction !== undefined)
                            {
                                this.props.updateFunction(this.state.suggestions[currentKey][suggestionIndex]);
                            }
                        }
                    }
                }
            }
            else
            {
                currentIndex = currentIndex - 1;
                this.setState({suggestionIndex: currentIndex});
                if(this.props.updateFunction !== undefined)
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
            this.redirectHandler();
        }
    }

    // moves focus to suggestion being hovered over
    // this is used if only 1 type of suggestions
    mouseHoverHandler(index, event)
    {
        if(this.state.suggestionIndex !== index)
        {
            if(this.state.valueKeys !== undefined)
            {
                // update the value to whatever the current highlighted value is
                this.props.updateFunction((this.state.suggestions[index]));
            }
            else
            {
                this.props.updateFunction(this.state.suggestions[index]);
            }
            this.setState({suggestionIndex: index});
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
            this.props.updateFunction(this.state.suggestions[key][index]);
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
        this.setState({
            suggestionIndex: 0,
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
        if(Object.keys(this.state.suggestions).length < 1 && this.props.updateFunction !== undefined)
        {
            this.props.updateFunction(undefined);
        }
        // set the value stored in the search box to the suggestions that has focus
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
            this.setState({redirect: true});
        }
    }

    async changeHandler(event)
    {
        let name = event.target.name;
        let value = event.target.value;
        let tempSuggestions = {};
        if(value.length > 0)
        {
            tempSuggestions = await this.props.getSuggestions(value);
        }
        else
        {
            this.props.updateFunction(undefined);
        }
        let currentKey = "";
        // index into keys array
        let index = 0;
        if(tempSuggestions !== undefined)
        {
            // get the keys from the suggestions
            let keys = Object.keys(tempSuggestions);
            if(keys.length > 0)
            {
                // key into tempSuggestions
                currentKey = keys[index];
                // array of values from tempSuggestions
                let tempArray = tempSuggestions[currentKey];
                // if the array has no entries, try the next key
                while(tempArray.length < 1 && index < keys.length -1)
                {
                    index = index + 1;
                    currentKey = keys[index];
                    tempArray = tempSuggestions[currentKey];;
                }
                // update the movie selected at every change...
                this.props.updateFunction((tempSuggestions[currentKey][0]));
            }
        }
        this.setState({
            [name]: value,
            suggestionIndex: 0,
            currentHashKey: currentKey,
            currentHashKeyIndex: index,
            suggestions: tempSuggestions
        });
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
                    if(index === this.state.suggestionIndex && key === this.state.currentHashKey)
                    {
                        html = <a className={style.selectedSuggestion} onMouseDown={(e) => this.redirectHandler()} onMouseOver={(e) => this.mouseHoverHashHandler(index, key, counter, e)}>{searchValue}</a>;
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
