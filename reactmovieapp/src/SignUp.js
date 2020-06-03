import React from 'react';
import history from './History'
import { Link } from 'react-router-dom';

const SignUp = () => {
    return (
        <div className="mainBodyContainer">
            <div className="mainBodyHeader">
                <h2>Sign Up Page</h2>
                <Link to="/"><button className ="testButton">Home Page</button></Link>
            </div>
            <div className="userNameBox">
                <form>
                    <label>
                        Name:
                        <input type="text" name="name" />
                    </label>
                    <input type="submit" value="Submit" />
                </form>
            </div>
        </div>
    );
};

export default SignUp;
