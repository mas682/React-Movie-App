import React from 'react';
import style from './css/reviewform.module.css';

class SearchDropDown extends React.Component {
    constructor(props)
    {
        super(props);
        this.state = {
            value: "",
            suggestions: ["abc", "def", "ced"],
            focused: false

        }
        this.changeHandler = this.changeHandler.bind(this);
        this.onFocusHandler = this.onFocusHandler.bind(this);
        this.offFocusHandler = this.offFocusHandler.bind(this);
    }


    onFocusHandler()
    {
        alert("HERE");
    }

    offFocusHandler()
    {
        alert("Done");
    }

    changeHandler(event)
    {
        let name = event.target.name;
        let value = event.target.value;
        this.setState({[name]: value});
    }


    render()
    {
        return (
            <React.Fragment>
                <label>
                    <h4 className={style.h4NoMargin}>Movie Title</h4>
                </label>
                <div className={style.dropdown}>
                    <input
                        type="text"
                        name="value"
                        form = "form2"
                        className="inputFieldBoxLong validInputBox"
                        onChange={this.changeHandler}
                        onFocusIn={this.onFocusHandler}
                        // when the input is no longer focused
                        onBlur={this.offFocusHandler}
                        value={this.state.value}
                    />
                    <div>
                </div>
            </React.Fragment>);
    }

}
export default SearchDropDown;
