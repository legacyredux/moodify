import { Switch, Route } from 'react-router-dom';
import React from 'react';
import LoginSignup from './LoginSignup.jsx';
import App from './App.jsx';

class Router extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
    };
  }

  render() {
    return (
      <div>
        <Switch>
          <Route exact path="/" >
            <App />
          </Route>
          <Route path="/loginSignup">
            <LoginSignup />
          </Route>
        </Switch>
      </div>
    );
  }
}

export default Router;
