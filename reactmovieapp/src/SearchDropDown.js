import React from 'react';
import style from './css/reviewform.module.css';

class SearchDropDown extends React.Component {
    constructor(props)
    {
        super(props);
        let key = undefined;
        // used if the array has objects that have keys, ex. movie.title
        if(this.props.objectKey !== undefined)
        {
            key = this.props.objectKey;
        }
        // optional prop to preset suggestions
        let suggestions = [];
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
        this.state = {
            value: "",
            suggestions: suggestions,
            focused: false,
            suggestionIndex: 0,
            key: key
        }
        this.changeHandler = this.changeHandler.bind(this);
        this.onFocusHandler = this.onFocusHandler.bind(this);
        this.offFocusHandler = this.offFocusHandler.bind(this);
        this.keyPressedHandler = this.keyPressedHandler.bind(this);
        this.generateInputBox = this.generateInputBox.bind(this);
        this.generateSuggestionBox = this.generateSuggestionBox.bind(this);
        this.mouseHoverHandler = this.mouseHoverHandler.bind(this);
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
        if(this.state.suggestions.length < 1)
        {
          return;
        }
        let currentIndex = this.state.suggestionIndex;
        // if the key pushed is down, increment index by 1 if not at end
        if(event.keyCode === 40)
        {
            if(currentIndex < this.state.suggestions.length - 1)
            {
              currentIndex = currentIndex + 1;
              this.setState({suggestionIndex: currentIndex});
              // update the currently selected movie
              this.props.updateFunction(this.state.suggestions[currentIndex]);
            }
        }
        // if the key pushed is up, decrement index by 1 if not at beginning
        else if(event.keyCode === 38)
        {
            if(currentIndex > 0)
            {
              currentIndex = currentIndex - 1;
              this.setState({suggestionIndex: currentIndex});
              // update the currently selected movie
              this.props.updateFunction(this.state.suggestions[currentIndex]);
            }
        }
        // if the enter key was pressed
        else if(event.keyCode === 13)
        {
            // remove focus from the input field
            event.target.blur();
        }
    }

    // moves focus to suggestion being hovered over
    mouseHoverHandler(index, event)
    {
        console.log(index);
        if(this.state.suggestionIndex != index)
        {
          if(this.state.key !== undefined)
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

    async onFocusHandler()
    {
        let tempSuggestions = [];
        if(this.state.value.length > 0)
        {
            tempSuggestions = await this.props.getSuggestions(this.state.value);
        }
        this.setState({
          suggestionIndex: 0,
          suggestions: tempSuggestions
        });

        this.setState({focused: true});
    }

    offFocusHandler()
    {
        this.setState({focused: false});
        // if no highlighted options to be selected, return undefined
        if(this.state.suggestions.length < 1)
        {
            this.props.updateFunction(undefined);
            return undefined;
        }
        if(this.state.key !== undefined)
        {
            // update the value to whatever the current highlighted value is
            this.setState({value: (this.state.suggestions[this.state.suggestionIndex][this.state.key])});        }
        else
        {
            this.setState({value: this.state.suggestions[this.state.suggestionIndex]});
        }

    }

    async changeHandler(event)
    {
        let name = event.target.name;
        let value = event.target.value;
        let tempSuggestions = [];
        if(value.length > 0)
        {
            tempSuggestions = await this.props.getSuggestions(value);
            // update the movie selected at every change...
            this.props.updateFunction((tempSuggestions[0]));
        }
        else
        {
            this.props.updateFunction(undefined);
        }
        this.setState({
          [name]: value,
          suggestionIndex: 0,
          suggestions: tempSuggestions
        });
    }

    generateInputBox()
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
                      // when the input is no longer focused
                      onBlur={this.offFocusHandler}
                      value={this.state.value}
                      onKeyDown={this.keyPressedHandler}
                  />
              </div>
            </React.Fragment>
        );
    }

    generateSuggestionBox()
    {
        if(this.state.focused && this.state.value.length > 0)
        {
            let suggestions = [];
            this.state.suggestions.forEach((value, index) => {
                let searchValue = value;
                console.log(this.state.key);
                if(this.state.key !== undefined)
                {
                    searchValue = searchValue[this.state.key];
                }
                let html = <a onMouseOver={(e) => this.mouseHoverHandler(index, e)}>{searchValue}</a>;
                if(index === this.state.suggestionIndex)
                {
                    html = <a className={style.selectedSuggestion} onMouseOver={(e) => this.mouseHoverHandler(index, e)}>{searchValue}</a>;
                }
                suggestions.push(html);
            });
            return(
              <div className={style.dropdownContent}>
                  {suggestions}
              </div>);
        }
        return null;
    }

    render()
    {
        let inputbox = this.generateInputBox();
        let suggestionBox = this.generateSuggestionBox();
        return (
            <React.Fragment>
                {inputbox}
                {suggestionBox}
            </React.Fragment>);
    }

}
export default SearchDropDown;
