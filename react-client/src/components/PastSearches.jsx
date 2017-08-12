import React from 'react';

class PastSearches extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      showPrev: false,
    };
    this.prevResults = this.prevResults.bind(this);
  }

  prevResults() {
    this.props.prev();
    this.props.runUpDown();
    this.setState({ showPrev: true });
    this.props.pastSearch();
  }

  render() {
    return (
      <div className="searchUser">
        <form>
          <div className="resultsBarUser" onClick={this.prevResults} >
          <div className="searchHeadlineUser">Previous Searches</div>
            {this.props.upDown ?
              <img alt="searchprevup" className="searchPrevUp" src="./img/ic_up.svg" width="18" height="18" />
            : <img alt="searchdn" className="searchPrevDown" src="./img/ic_down.svg" width="18" height="18" />}
          </div>
        </form>
      </div>
    );
  }
}

export default PastSearches;
