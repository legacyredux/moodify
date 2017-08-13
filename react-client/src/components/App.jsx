// dependencies
import React from 'react';
import axios from 'axios';
// sub components
import Lyrics from './Lyrics.jsx';
import Mood from './Mood.jsx';
import Search from './Search.jsx';
import Header from './Header.jsx';
import SearchResults from './SearchResults.jsx';
import User from './User.jsx';
import TopTen from './TopTen.jsx';

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      currentSongNameAndArtist: [],
      currentLyrics: '',
      watson: {},
      thumbnail: null,
      spotifyURI: null,
      recentlyPlayed: false,
      searchResults: [],
      searchResultsUser: [],
      searchResultsLoading: false,
      spotifyLoading: false,
      lyricsLoading: false,
      showPlayer: false,
      showLyrics: false,
      showMood: false,
      showResults: false,
      showResultsUser: false,
      showPrev: false,
      upDown: true,
      url: window.location.href,
      loggedIn: false,
      upDownUser: false,
      searchResultsLoadingUser: false,
      landingPageComponents: false,
      spotifyHomePage: [],
      showSpotifyPlayer: false,
      spotifyPlayerUri: '',
      showImage: false,
    };

    this.search = this.search.bind(this);
    this.process = this.process.bind(this);
    this.showResults = this.showResults.bind(this);
    this.upDown = this.upDown.bind(this);
    this.upDownUser = this.upDownUser.bind(this);
    this.showResultsUser = this.showResultsUser.bind(this);
    this.loadPastSearchResults = this.loadPastSearchResults.bind(this);
    this.newReleaseClick = this.newReleaseClick.bind(this);
    this.closePlayer = this.closePlayer.bind(this);
    this.recentlyPlayedSongs = this.recentlyPlayedSongs.bind(this);
    this.loginSpotify = this.loginSpotify.bind(this);
  }


  componentDidMount() {
    axios.get('/newreleases').then((res) => {
      if (!res.data) {
        console.log('Error on initial load of song data');
      }
      this.setState({
        spotifyHomePage: res.data,
      });
    });
  }

  search(title, artist, searchField) {
    this.setState({ showResults: true, searchResultsLoading: true, showPrev: true, upDown: false });

    const options = {
      title,
      artist,
    };

    axios.post(searchField, options).then((res) => {
      if (!res.data) {
        console.log('error');
      }
      // if (res.data.items[0].volumeInfo) {
      //   this.setState({ searchResults: res.data.items, searchResultsLoading: false })
      // } else if (res.data) {
      //   this.setState({ searchResults: res.data, searchResultsLoading: false });
      // }

      // this is working right now, but can't test song search to make sure so I'm leaving
      // the commented code above available. If this doesn't work, friday morning, ask john
      const results = res.data.items ? res.data.items : res.data;
      this.setState({
        searchResults: results,
        searchResultsLoading: false,
      });
    });
  }


  process(trackObj) {
    if (trackObj.volumeInfo) {
      const input = {
        book_id: trackObj.id,
        book_name: trackObj.volumeInfo.title,
        author_name: trackObj.volumeInfo.authors ? trackObj.volumeInfo.authors[0] : '',
        img: trackObj.volumeInfo.imageLinks ? trackObj.volumeInfo.imageLinks.thumbnail : '',
        description: trackObj.volumeInfo.description,
      };

      axios.post('/processBook', input).then((res) => {
        const data = res.data;
        this.setState({
          currentSongNameAndArtist: data[0],
          currentLyrics: data[1],
          watson: data[2],
          thumbnail: data[3],
          spotifyLoading: false,
          lyricsLoading: false,
          showLyrics: true,
          showMood: true,
          showPlayer: true,
          showImage: true,
          showSpotifyPlayer: false,
        });
      })
      .catch((err) => {
        console.log('Error retrieving book analysis from watson: ', err);
      });
    } else {
      let input = {};
      input.track_id = trackObj.track_id;
      input.track_name = trackObj.track_name;
      input.artist_name = trackObj.artist_name;
      input.album_coverart_100x100 = trackObj.album_coverart_100x100;
      input.album_coverart_350x350 = trackObj.album_coverart_350x350;
      input.album_coverart_500x500 = trackObj.album_coverart_500x500;
      input.album_coverart_800x800 = trackObj.album_coverart_800x800;

      axios.post('/process', input).then((res) => {
        const data = res.data;
        this.setState({
          currentSongNameAndArtist: data[0],
          currentLyrics: data[1],
          watson: data[2],
          spotifyURI: data[3],
          spotifyLoading: false,
          showPlayer: true,
          lyricsLoading: false,
          showLyrics: true,
          showMood: true,
          showImage: false,
          showSpotifyPlayer: true,
        });
      }).catch((error) => {
        throw error;
      });
    }
  }

  showResults() { this.setState({ showResults: !this.state.showResults }); }

  showResultsUser() { this.setState({ showResultsUser: !this.state.showResultsUser }); }

  upDown() { this.setState({ upDown: !this.state.upDown }); }

  upDownUser() { this.setState({ upDownUser: !this.state.upDownUser }); }

  loadPastSearchResults(trackId) {
    axios.post('/loadPastSearchResults', { track_id: trackId }).then((res) => {
      const songData = res.data[0];
      const watsonData = res.data[1];
      this.setState({
        currentLyrics: songData.lyrics,
        currentSongNameAndArtist: [
          songData.track_name, songData.artist_name,
        ],
        watson: watsonData,
        spotifyURI: songData.spotify_uri,
        showMood: true,
        showPlayer: true,
        showLyrics: true,
      });
    }).catch(err => console.log(err));
  }

  newReleaseClick(val) {
    if (!this.state.showSpotifyPlayer) {
      this.setState({
        showSpotifyPlayer: true,
        spotifyPlayerUri: val,
      });
    } else if (this.state.showSpotifyPlayer && this.state.spotifyPlayerUri !== '') {
      this.setState({
        spotifyPlayerUri: val,
      });
    }
  }

  closePlayer() {
    this.setState({
      showSpotifyPlayer: false,
    });
  }

  recentlyPlayedSongs(songArtist) {
    this.setState({ searchResultsLoading: true, showPrev: true, upDown: false });
    const options = {
      title: songArtist[0],
      artist: songArtist[1],
    };
    axios.post('/search', options)
    .then((res) => {
      if (!res.data) {
        console.log('error');
      }
      this.setState({ searchResultsLoading: false });
      return res.data.track_list[0];
    })
    .then((data) => {
      this.process(data.track);
    });
  }


  loginSpotify() {
    axios.get('/recentlyplayed')
      .then((res) => {
        this.setState({
          searchResults: res.data,
          showResults: true,
          recentlyPlayed: true,
        });
      })
      .catch((err) => {
        console.log(err);
      });
  }

  render() {
    return (
      <div>
        <Header url={this.state.url} />
        <div className="container">
          <div className="col1">
            <Search
              search={this.search}
              prev={this.showResults}
              showPrev={this.state.showPrev}
              upDown={this.state.upDown}
              runUpDown={this.upDown}
            />
            { this.state.showResults ?
              <SearchResults
                results={this.state.searchResults}
                recent={this.state.recentlyPlayed}
                recentlyPlayedSongs={this.recentlyPlayedSongs}
                search={this.search}
                process={this.process}
                searchResultsLoading={this.state.searchResultsLoading}
              />
              : null}

            { !this.state.showLyrics && !this.state.showResults && !this.showPlayer ?
              <TopTen
                showSpotifyPlayer={this.state.showSpotifyPlayer}
                newReleaseClick={this.newReleaseClick}
                spotifyHomePage={this.state.spotifyHomePage}
                spotifyPlayerUri={this.state.spotifyPlayerUri}
                closePlayer={this.closePlayer}
              />
            : null}

            {this.state.showPlayer ?
              <Lyrics
                showPlayer={this.state.showPlayer}
                thumbnail={this.state.thumbnail}
                showImage={this.state.showImage}
                spotifyURI={this.state.spotifyURI}
                loading={this.state.spotifyLoading}
                lyrics={this.state.currentLyrics}
                showSpotifyPlayer={this.state.showSpotifyPlayer}
                songNameAndArtist={this.state.currentSongNameAndArtist}
              />
              : null}
          </div>
          <div className="col2">
            <User
              showPrev={this.state.showResultsUser}
              prev={this.showResultsUser}
              upDown={this.state.upDownUser}
              runUpDown={this.upDownUser}
              process={this.process} // why?
              searchResultsLoading={this.state.searchResultsLoadingUser}
              loadPastSearchResults={this.loadPastSearchResults}
              playlist={this.loginSpotify}
            />
            {this.state.showMood ?
              <Mood
                watson={this.state.watson}
                songNameAndArtist={this.state.currentSongNameAndArtist}
              />
            : null}

            { !this.state.showLyrics && !this.state.showResults && !this.showPlayer ?
              <div className="test">
                show top ten mood component.
              </div>
            : null}

          </div>
        </div>
      </div>
    );
  }
}

export default App;
