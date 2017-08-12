import React from 'react';
import TopRow from './TopRow.jsx';

const TopTen = props => (
  <div className="new-releases">
    <h5>U.S. New Releases</h5>
    {this.props.showSpotifyPlayer ?
      <div>
        <iframe
          title="spotify player"
          className="new-iframe"
          src={`https://open.spotify.com/embed?uri=${this.props.spotifyPlayerUri}`}
          frameBorder="0"
          width="80%"
          height="auto"
        /><button onClick={this.props.closePlayer}>Close Player</button> </div> : null}
    <ol>
      { this.props.spotifyHomePage.map((item, idx) =>
        (<TopRow
          showSpotifyPlayer={this.props.showSpotifyPlayer}
          newReleaseClick={this.props.newReleaseClick}
          key={idx}
          rows={item}
        />))}
    </ol>
  </div>
);

export default TopTen;
