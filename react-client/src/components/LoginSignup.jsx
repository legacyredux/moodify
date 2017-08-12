import { Redirect } from 'react-router-dom';
import axios from 'axios';
import React from 'react';
import Header from './Header.jsx';

class LoginSignup extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      usernameL: '',
      passwordL: '',
      usernameS: '',
      passwordS: '',
      redirect: false,
      userError: '',
      signError: '',
    };

    this.handleLogin = this.handleLogin.bind(this);
    this.usernameChangeL = this.usernameL.bind(this);
    this.passwordChangeL = this.username.bind(this);
    this.usernameChangeS = this.username.bind(this);
    this.passwordChangeS = this.username.bind(this);
  }

  usernameChangeL(e) { this.setState({ usernameL: e.target.value }); }
  passwordChangeL(e) { this.setState({ passwordL: e.target.value }); }
  usernameChangeS(e) { this.setState({ usernameS: e.target.value }); }
  passwordChangeS(e) { this.setState({ passwordS: e.target.value }); }

  login(username, password) {
    const loginInfo = { username, password };
    axios.post('/login', loginInfo)
    .then((res) => {
      if (!res.data.errorMessage) {
        this.setState({ redirect: true });
      } else if (res.data.errorMessage) {
        this.setState({ userError: res.data.errorMessage });
      }
    });
  }

  signup(username, password) {
    const signupInfo = { username, password };
    axios.post('/signup', signupInfo)
    .then((res) => {
      if (!res.data.errorMessage) {
        this.setState({ redirect: true });
      } else if (res.data.errorMessage) {
        this.setState({ signError: res.data.errorMessage });
      }
    });
  }

  handleLogin(e) {
    e.preventDefault();
    this.login(this.state.usernameL, this.state.passwordL);
  }

  handleSignup(e) {
    e.preventDefault();
    this.signup(this.state.usernameS, this.state.passwordS);
  }


  render() {
    if (this.state.redirect) {
      return <Redirect push to="/" />;
    }
    return (
      <div>
        <Header />
        <div className="forms">
          <div className="loginForm">
          Have an account?
          <br />
            <input
              type="text"
              className="inputText"
              name="usernameL"
              value={this.state.usernameL}
              placeholder="username"
              onChange={this.usernameChangeL}
            />
            <br />
            <input
              type="password"
              className="inputText"
              name="passwordL"
              value={this.state.passwordL}
              placeholder="password"
              onChange={this.passwordChangeL}
            />
            <br />
            <button onClick={this.handleLogin} className="loginButton"> Login </button>
            <br />
            {this.state.userError.length > 0 ?
              <div className="errorMessage">{this.state.userError}</div>
            : null}
          </div>
          <div className="signupForm">
          Need to sign up?
          <br />
            <input
              type="text"
              className="inputText"
              name="usernameS"
              value={this.state.usernameS}
              placeholder="username"
              onChange={this.usernameChangeS}
            />
            <br />
            <input
              type="password"
              className="inputText"
              name="passwordS"
              value={this.state.passwordS}
              placeholder="password"
              onChange={this.passwordChangeS}
            />
            <br />
            <button onClick={this.handleSignup} className="loginButton"> Signup </button>
            <br />
            {this.state.signError.length > 0 ?
              <div className="errorMessage">{this.state.signError}</div>
            : null}
          </div>
        </div></div>
    );
  }
}

export default LoginSignup;
