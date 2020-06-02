import React from 'react';
import history from './History'
import {Link } from 'react-router-dom';

const MainPage = () => {
    return (
        <div className="mainBodyChild">
            <h2>Main Page</h2>
            <Link to="/signup"><button className ="testButton">Sign Up page</button></Link>
        </div>
    );
};

export default MainPage;
