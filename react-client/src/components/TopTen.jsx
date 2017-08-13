import React from 'react';
import TopRow from './TopRow.jsx';

const TopTen = props => (
  <div className="new-releases">
    <h5>U.S. New Releases</h5>
    {props.showSpotifyPlayer ?
      <div>
        <iframe
          title="spotify player"
          className="new-iframe"
          src={`https://open.spotify.com/embed?uri=${props.spotifyPlayerUri}`}
          frameBorder="0"
          width="80%"
          height="auto"
        /><button onClick={props.closePlayer}>Close Player</button> </div> : null}
    <ol>
      { props.spotifyHomePage.map((item, idx) =>
        (<TopRow
          showSpotifyPlayer={props.showSpotifyPlayer}
          newReleaseClick={props.newReleaseClick}
          key={idx}
          rows={item}
        />))}
    </ol>
  </div>
);

TopTen.propTypes = {
  closePlayer: React.PropTypes.func,
  newReleaseClick: React.PropTypes.func,
  spotifyHomePage: React.PropTypes.array, // eslint-disable-line react/forbid-prop-types
  spotifyPlayerUri: React.PropTypes.string,
};

TopTen.defaultProps = {
  closePlayer: () => {},
  newReleaseClick: () => {},
  spotifyHomePage: [],
  spotifyPlayerUri: '', // needs to be a real default uri
};

export default TopTen;
