import React from 'react';
import history from './History'
import { Link } from 'react-router-dom';

const SignUp = () => {
    return (
        <div className="mainBodyChild">
            <h2>SignUp</h2>
            <Link to="/"><button className ="testButton">Home Page</button></Link>
        </div>
    );
};

export default SignUp;
