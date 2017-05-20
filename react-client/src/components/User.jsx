import React from 'react';
import renderif from 'render-if';
import axios from 'axios';
import PastSearches from './PastSearches.jsx';
import PastSearchResults from './PastSearchResults.jsx';
import {Redirect, Link} from 'react-router-dom';
import SearchResults from './PastSearches.jsx';


class User extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      redirect: false,
      loggedIn: false,
      pastSearchResults: [],
      loading: false
    };
    this.logout = this.logout.bind(this);
    this.redirect = this.redirect.bind(this);
    this.pastSearch = this.pastSearch.bind(this);

    this.recentlyplayed = this.recentlyplayed.bind(this);

  }

  redirect() {
    this.setState({redirect: true});
  }

  logout() {
    axios.get('/logout').then(res => {
      this.setState({loggedIn: false, pastSearchResults: []});
    });
  }

//this function isn't being used, it can be removed. or not.
  recentlyplayed() {
    axios.get('/recentlyplayed')
      .then((res) => {
        console.log('Hello user, how do you like our app?');
        console.log('Maybe you opened dev tools accidentaly');
        console.log('have a great day!');
      })
      .catch( (err) => {
        console.log('Something went wrong, but we dont even know why');
      })
  }


  componentDidMount() {
    axios.get('/check').then(res => {
      if (res.data.statusCode === 200) {
        this.setState({loggedIn: true});
      }
    });
  }

  pastSearch() {
    this.setState({loading: true});
    axios.get('/pastSearches').then(res => {
      this.setState({pastSearchResults: res.data, loading: false});
    }).catch(err => {
      console.log(err);
    });
  }

  render() {
    if (this.state.redirect) {
      return <Redirect push to="/loginSignup"/>;
    }
    return (
      <div className="allUser">
        <div className="user">
          {renderif(!this.state.loggedIn)(
            <div>
              <a href="https://lahumeur.herokuapp.com/auth/spotify" className="loginButton">
              Connect With Spotify
              </a>
            </div>
          )}
          {renderif(this.state.loggedIn)(
            <div>
            <div className="loginButton" onClick={this.logout}>
              Logout!
            </div>
            <div className="loginButton" onClick={this.props.playlist}>
              Recently Played
            </div>
            </div>
          )}
          {renderif(this.state.loggedIn)(<PastSearches search={this.props.search} 
                                                       prev={this.props.prev} 
                                                       upDown={this.props.upDown} 
                                                       runUpDown={this.props.runUpDown} 
                                                       pastSearch={this.pastSearch}/>)}
        </div>
        <div>
          <br/> {renderif(this.props.showPrev)(<PastSearchResults results={this.state.pastSearchResults} 
                                                                  loading={this.state.loading} 
                                                                  loadPastSearchResults={this.props.loadPastSearchResults}/>)}
        </div>
      </div>
    );
  }
}

export default User;

