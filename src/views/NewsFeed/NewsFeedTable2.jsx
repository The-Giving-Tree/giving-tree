import * as React from 'react';
import { connect } from 'react-redux';
import InfiniteScroll from 'react-infinite-scroller';

import { loadNewsfeed } from '../../store/actions/auth/auth-actions';

class NewsFeedTable2 extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      currentPage: 1,
      totalPages: 0,
      hasMoreItems: true
    }
  }

  componentDidMount() {
    // Get the newsfeed items
    console.log(this.props.feedMode);
    this.getNewsFeed({
      lat: this.props.location.lat,
      lng: this.props.location.lng
    }, this.props.currentPage, this.props.feedMode);
    // this.loadNewsfeedHelper();
    
  }

  componentDidUpdate(prevProps, prevState) {
    // if the route changes...
    if (this.props.feedMode !== prevProps.feedMode) {
      // this.loadNewsfeedHelper()
      this.getNewsFeed({
        lat: this.props.location.lat,
        lng: this.props.location.lng
      }, this.state.currentPage, this.props.feedMode);
      // this.loadNewsfeedHelper() 
    }
  }

  componentWillUnmount() {
    
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
    console.log("PAGES: ", this.props)
    if (this.props.pages === ''){
    } else if (Number(this.props.currentPage) < Number(this.props.pages)) {
      const nextPage = Number(this.props.currentPage) + 1;
      console.log(nextPage);

      await this.getNewsFeed({
        lat: this.props.location.lat,
        lng: this.props.location.lng
      }, nextPage, this.props.feedMode);

      console.log("Oi!: ", this.props);
    } else {
      this.setHasMoreItems(false);
      if (this.props.newsfeed) {
        console.log(this.props.newsfeed)
      }
    }
  }

  parseFeed() {
    const feed = [];

    this.props.newsfeed.forEach((item, i) => {
      feed.push(<div key={i} className="p-3">{item.title}</div>);
    })

    return feed;
  }

  setHasMoreItems(val) {
    this.setState({ hasMoreItems: val })
  }


  setCurrentPage(page) {
    console.log(page);
    this.setState({currentPage: page})
  }



  render() {
    if (this.props.newsfeedLoading) return <div className="loading-spinner"></div>;

    let items = this.parseFeed();

    return (
      <div>
        {items.length ? (
          // <InfiniteScroll
          // pageStart={1}
          // loadMore={(page) => {
          //   console.log("CURR", this.props.currentPage)
          //   console.log
          // }}
          // hasMore={this.state.hasMoreItems}
          // loader={
          //   <div key={0} className="loading-spinner"></div>
          // }>
            <div>{items}</div>
          // </InfiniteScroll>
        ): (
          <p>There are no items.</p>
        )}
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
