import { Redirect } from 'react-router-dom';
import React from 'react';
import renderif from 'render-if';
import axios from 'axios';
import config from '../../../config/index';
import PastSearches from './PastSearches.jsx';
import PastSearchResults from './PastSearchResults.jsx';

class User extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      redirect: false,
      loggedIn: false,
      pastSearchResults: [],
      loading: false,
    };

    this.logout = this.logout.bind(this);
    this.redirect = this.redirect.bind(this);
    this.pastSearch = this.pastSearch.bind(this);
  }

  componentDidMount() {
    console.log(config.spotifyAuth);
    axios.get('/check').then((res) => {
      if (res.data.statusCode === 200) {
        this.setState({ loggedIn: true });
      }
    });
  }

// this function isn't being used, it can be removed. or not.

  logout() {
    axios.get('/logout').then(() => {
      this.setState({ loggedIn: false, pastSearchResults: [] });
    });
  }

  redirect() { this.setState({ redirect: true }); }

  pastSearch() {
    this.setState({ loading: true });
    axios.get('/pastSearches')
    .then(res =>
      this.setState({ pastSearchResults: res.data, loading: false }),
    ).catch(err => console.error(err));
  }

  render() {
    if (this.state.redirect) {
      return <Redirect push to="/loginSignup" />;
    }
    return (
      <div className="allUser">
        <div className="user">
          {renderif(!this.state.loggedIn)(
            <div>
              <a href={config.SPOTIFY.spotifyAuth} className="loginButton">
              Connect With Spotify
              </a>
            </div>,
          )}
          {renderif(this.state.loggedIn)(
            <div>
              <div className="loginButton" onClick={this.logout}>
              Logout!
            </div>
              <div className="loginButton" onClick={this.props.playlist}>
              Recently Played
            </div>
            </div>,
          )}
          {renderif(this.state.loggedIn)(
            <PastSearches
              search={this.props.search}
              prev={this.props.prev}
              upDown={this.props.upDown}
              runUpDown={this.props.runUpDown}
              pastSearch={this.pastSearch}
            />)}
        </div>
        <div>
          <br /> {renderif(this.props.showPrev)(
            <PastSearchResults
              results={this.state.pastSearchResults}
              loading={this.state.loading}
              loadPastSearchResults={this.props.loadPastSearchResults}
            />)}
        </div>
      </div>
    );
  }
}

User.propTypes = {
};

User.defaultProps = {
};

export default User;
