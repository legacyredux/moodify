import React from 'react';
import renderIf from 'render-if';

class Player extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    if (this.props.loading) { return (<div />); }
    return (
      <div>
        {renderIf(this.props.spotifyURI)(
          <div className="player" >
            <iframe
              title="spotify player"
              src={`https://open.spotify.com/embed?uri=${this.props.spotifyURI}`}
              frameBorder="0"
              width="100%"
              height="auto"
            />
          </div>,
        )}
      </div>
    );
  }
}

Player.propTypes = {
  loading: React.PropTypes.bool,
  spotifyURI: React.PropTypes.string,
};

Player.defaultProps = {
  loading: true,
  spotifyURI: '',
};

export default Player;
