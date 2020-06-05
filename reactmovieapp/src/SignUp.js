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
                <div className="header"> Sign Up! </div>
                <div className="content">
                    <form id="form1"/>
                    <div className="inputFieldContainer">
                        <label>
                            <h4>First name:</h4>
                            <input type="text" name="firstName" form = "form1" className="inputFieldBox"/>
                        </label>
                    </div>
                    <div className="inputFieldContainer">
                        <label>
                            <h4>Last name:</h4>
                            <input type="text" name="lastName" form = "form1" className="inputFieldBox"/>
                        </label>
                    </div>
                    <div className="inputFieldContainer">
                        <label>
                            <h4>Email:</h4>
                            <input type="text" name="email" form = "form1" className="inputFieldBox"/>
                        </label>
                    </div>
                </div>
                <div className="actions">
                    <input type="submit" value="Submit" form = "form1"/>
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
