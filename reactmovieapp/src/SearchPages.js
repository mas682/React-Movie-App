import React, { Component } from 'react';
import {Link, Redirect, useLocation, withRouter} from 'react-router-dom';
import Alert from './Alert.js';
import SearchDropDown from './SearchDropDown.js';
import style from './css/SearchPage/SearchPage.module.css';
import queryString from "query-string";
import {apiGetJsonRequest} from './StaticFunctions/ApiFunctions.js';
import {generateMessageState} from './StaticFunctions/StateGeneratorFunctions.js';

class SearchPage extends React.Component {
    constructor(props){
        super(props);
        this.state = {
            loading: false
        };
    }

    render()
    {
        if(this.state.loading) return null;
        return (
            <div className={style.mainBodyContainer}>
                <div className={style.searchBarContainer}>
                    <SearchDropDown
                        showSearchIcon={true}
                    />
                </div>
                <div className={style.typeContainer}>
                    <div className={style.typeButtonContainer}>
                        <button className={`${style.typeButton} ${style.selectedType}`}>All</button>
                    </div>
                    <div className={style.typeButtonContainer}>
                        <button className={`${style.typeButton} ${style.unselectedType}`}>Movies</button>
                    </div>
                    <div className={style.typeButtonContainer}>
                        <button className={`${style.typeButton} ${style.unselectedType}`}>Users</button>
                    </div>
                    <div className={style.typeButtonContainer}>
                        <button className={`${style.typeButton} ${style.unselectedType}`}>Genres</button>
                    </div>
                    <div className={style.typeButtonContainer}>
                        <button className={`${style.typeButton} ${style.unselectedType}`}>Directors</button>
                    </div>
                    <div className={style.typeButtonContainer}>
                        <button className={`${style.typeButton} ${style.unselectedType}`}>Actors</button>
                    </div>
                </div>
                <div className={style.resultsContainer}>
                    <div className={style.resultType}>
                        Movies
                    </div>
                    2 options here:<br></br>
                    1. Show 4 movies like movie filter pages but let user hit a arrow to go to next 1 or next 4<br></br>
                    2. Show 4 movies but have a button that says show more<br></br>
                    3. after displaying maybe 20 movies, last button will say show all which will only show the movies<br></br>
                    4. may also want a show all option visible at all times?<br></br>
                    also, eventually need to add a option to filter even further such as by date, type, etc.<br></br>
                    will have to limit based off the query type<br></br>
                    for movies, show movie post displays, for users show a profile pic kind of like movie post display, etc.
                </div>
            </div>
        );
    }
}

export default SearchPage;
