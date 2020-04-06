import * as React from 'react';
import { connect } from 'react-redux';
import InfiniteScroll from 'react-infinite-scroll-component';
import { loadNewsfeed } from '../../store/actions/auth/auth-actions';

class NewsFeedTable2 extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      hasMoreItems: true,
      newsfeed: []
    }
  }

  componentDidMount() {
    // Get the newsfeed items
    this.getNewsFeed({
      lat: this.props.location.lat,
      lng: this.props.location.lng
    }, Number(this.props.currentPage), this.props.feedMode)
  }

  setNewsFeed(feed) {
    this.setState({newsfeed: feed})
  }

  componentDidUpdate(prevProps, prevState) {
    // if the route changes...
    if (this.props.feedMode !== prevProps.feedMode) {
      console.log(this.props);
      this.getNewsFeed({
        lat: this.props.location.lat,
        lng: this.props.location.lng
      }, Number(this.props.currentPage), this.props.feedMode);
    }
  }

  getNewsFeed(loc, currentPage, feedMode) {      
    this.props.loadNewsfeedDispatch({
      env: process.env.NODE_ENV,
      page: Number(currentPage),
      feed: feedMode,
      location: loc
    });
  }

  async loadNewsfeedHelper() {
    console.log(this.props)
    const currentPage = Number(this.props.currentPage);
    if (currentPage < this.props.pages) {

      const nextPage = Number(this.props.currentPage) + 1;
      await this.getNewsFeed({
        lat: this.props.location.lat,
        lng: this.props.location.lng
      }, nextPage, this.props.feedMode);

      this.setNewsFeed(this.parseFeed(this.props.newsfeed))

      console.log(this.props.newsfeed)
    } else {
      this.setHasMoreItems(false);
    }

    
  }

  parseFeed() {
    const feed = [];
    console.log("PARSING")
    this.props.newsfeed.forEach((item, i) => {
      feed.push(<div key={i} className="p-3" style={{
        height: '500px'
      }}>{item.title}</div>);
    })

    return feed;
  }

  setHasMoreItems(val) {
    this.setState({ hasMoreItems: val })
  }


  render() {

    return (
      <div>
        <InfiniteScroll
        dataLength={this.props.numOfResults}
        next={() => {
          this.loadNewsfeedHelper()
        }}
        hasMore={this.state.hasMoreItems}
        endMessage={
          <p className="text-center">
            <b>Yay! You have seen it all</b>
          </p>
        }
        loader={
          <div className="loading-spinner"></div>
        }>
          {this.state.newsfeed}
        </InfiniteScroll>

      </div>
      
    );
  }
}

const mapDispatchToProps = dispatch => ({
  loadNewsfeedDispatch: (payload) => dispatch(loadNewsfeed(payload))
});

const mapStateToProps = state => ({
  newsfeed: state.auth.newsfeed,
  currentPage: state.auth.currentPage,
  pages: state.auth.pages,
  numOfResults: state.auth.numOfResults,
  newsfeedSuccess: state.auth.newsfeedSuccess,
  newsfeedUpdated: state.auth.newsfeedUpdated,
  newsfeedLoading: state.auth.newsfeedLoading,
});

export default connect(mapStateToProps, mapDispatchToProps)(NewsFeedTable2);
