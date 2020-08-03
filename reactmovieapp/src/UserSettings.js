import React from 'react';
import history from './History'
import {Link, Redirect } from 'react-router-dom';
import './App.css';
import style from './css/SettingsForm/UserSettings.module.css';


// left off here, need to make main page a class so it can have props
class UserSettings extends React.Component {

	constructor(props)
	{
		super(props);
        this.state = {
            firstName: "",
            lastName: "",
            userName: "",
            email: "",
            loaded: false,
            redirect: false,
            editFirst: false,
            editLast: false,
            editUser: false,
            editEmail: false
        };
        this.setEdit = this.setEdit.bind(this);
        this.generateInput = this.generateInput.bind(this);
        this.changeHandler = this.changeHandler.bind(this);
        this.callApi = this.callApi.bind(this);
	}

	async componentDidMount()
	{
        this.callApi().then(result =>{
            // set status to result[0]
            let status = result[0];
            // see if request succeeded
            if(status == 200)
            {
                this.setState({
                    firstName: result[1][0],
                    lastName: result[1][1],
                    userName: result[1][2],
                    email: result[1][3],
                    loaded: true
                });
            }
            else
            {
                alert(result[1][0]);
                this.setState({
                    loaded: true,
                    redirect: true
                });
            }
        });
	}

    changeHandler(event) {
        let name = event.target.name;
        let value = event.target.value;
        this.setState({[name]: value});
    }

    setEdit(type)
    {
        let currentValue = this.state[type];
        let value = false;
        if(!currentValue)
        {
            value = true;
        }
        this.setState({[type]:value});
    }

	async callApi()
	{
        const requestOptions = {
            method: 'GET',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json'},
        };

        let status = 0;
        return fetch("http://localhost:9000/getuserinfo", requestOptions)
            .then(res => {
                status = res.status;
                return res.json();
            }).then(result =>{
                return [status, result];
            });
	}

    generateInput(type, value, title)
    {
        let result = "";
        if(this.state[type])
        {
            result = (
                <React.Fragment>
                    <div className={style.sectionHeader}>
                        <h3 className={style.h3Header}>{title}</h3>
                        <button className={style.editText} onClick={() => {this.setEdit(type)} }>Cancel</button>
                    </div>
                    <div className={style.inputFieldContainer}>
                        <input
                            type="text"
                            name={type}
                            form="form1"
                            value={this.state[value]}
                            className={style.inputBox}
                            onChange={this.changeHandler}
                        />
                    </div>
                </React.Fragment>);
        }
        else
        {
            result = (
                <React.Fragment>
                    <div className={style.sectionHeader}>
                        <h3 className={style.h3Header}>{title}</h3>
                        <button className={style.editText} onClick={() => {this.setEdit(type)} }>Edit</button>
                    </div>
                    <div className={style.sectionText}>
                        {this.state[value]}
                    </div>
                </React.Fragment>);
        }
        return result;
    }

	render()
	{
        if(!this.state.loaded)
        {
            return null;
        }
        if(this.state.redirect)
        {
            return <Redirect to="/" />;
        }
        let firstInput = this.generateInput("editFirst", "firstName", "First Name");
        let lastInput = this.generateInput("editLast", "lastName", "Last Name");
        let userInput = this.generateInput("editUser", "userName", "Username");
        let emailInput = this.generateInput("editEmail", "email", "Email");

		return (
			<div className={style.mainBodyContainer}>
			        <div className={style.header}>
                        <h2>Settings</h2>
		            </div>
                    {firstInput}
                    {lastInput}
                    {userInput}
                    {emailInput}
		    </div>
			);
	}
}
export default UserSettings;
