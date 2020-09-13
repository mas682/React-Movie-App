import React from 'react';
import style from './css/reviewform.module.css';

class SearchDropDown extends React.Component {
    constructor(props)
    {
        super(props);
        this.state = {
            value: "",
            suggestions: [],

        }
        this.changeHandler = this.changeHandler.bind(this);
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
                <input
                    type="text"
                    name="value"
                    form = "form2"
                    className="inputFieldBoxLong validInputBox"
                    onChange={this.changeHandler}
                    value={this.state.value}
                />
            </React.Fragment>);
    }

}
export default SearchDropDown;
