import React from 'react';
import history from './History'
import { Link } from 'react-router-dom';
import Popup from 'reactjs-popup';
import './css/signup.css';

// documentation for PopUp https://react-popup.elazizi.com/component-api/
class ControlledPopup extends React.Component {
  constructor(props) {
    super(props);
    this.state = { open: false };
    this.openModal = this.openModal.bind(this);
    this.closeModal = this.closeModal.bind(this);
  }
  openModal() {
    this.setState({ open: true });
  }
  closeModal() {
    this.setState({ open: false });
  }

  render() {
    return (
      <div>
        <button className="button" onClick={this.openModal}>
            Sign Up Popup
        </button>
        <Popup
            open={this.state.open}
            closeOnDocumentClick
            onClose={this.closeModal}
        >
            <div className="modal">
                {/* &times is the multiplication symbol (x) --> */}
                <a className="close" onClick={this.closeModal}>
                &times;
                </a>
                <div className="header">
                    <h3> Sign Up! </h3>
                </div>
                <div className="content">
                    <form id="form1" method="post" target="/signup"/>
                    <div className="nameContainer">
                        <label>
                            <h4 className="nameFieldHeader">First name</h4>
                        </label>
                        <input type="text" name="firstName" form = "form1" className="inputFieldBoxShort"/>
                    </div>
                    <div className="nameContainer">
                        <label>
                            <h4>Last name</h4>
                        </label>
                        <input type="text" name="lastName" form = "form1" className="inputFieldBoxShort"/>
                    </div>
                    <div className="inputFieldContainer">
                        <label>
                            <h4>Email</h4>
                        </label>
                        <input type="text" name="email" form = "form1" className="inputFieldBoxLong"/>
                    </div>
                    <div className="inputFieldContainer">
                        <label>
                            <h4>Password</h4>
                        </label>
                        <input type="password" name="password" form = "form1" className="inputFieldBoxLong"/>
                    </div>
                </div>
                <div className="actions">
                    <button form="form1" value="create_account" className="submitButton">CREATE YOUR ACCOUNT</button>
                </div>
                <div className="accountExistsText">
                    Already have an account? <a href="">Log In Here</a>
                </div>
            </div>
        </Popup>
      </div>
    );
  }
}

const SignUp = () => {
    return (
        <div className="mainBodyContainer">
            <div className="mainBodyHeader">
                <h2>Sign Up Page</h2>
            </div>
            <div>
                <p> This will be changed to some other page..just a placeholder for now</p>
            </div>
            <Link to="/"><button className ="testButton">Home Page</button></Link>
            <ControlledPopup />
        </div>
    );
};

export default SignUp;
