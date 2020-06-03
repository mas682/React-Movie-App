import React from 'react';
import history from './History'
import {Link } from 'react-router-dom';

const MainPage = () => {
    return (
        <div className="mainBodyContainer">
            <div className="mainBodyHeader">
                <h2>Main Page</h2>
            </div>
            <div className="mainBodyChild">
                <Link to="/signup"><button className ="testButton">Sign Up page</button></Link>
            </div>
        </div>
    );
};

export default MainPage;
