import * as React from 'react';
// Custom Components
import Navigation from '../../components/Navigation/Navigation';
import Sidebar from '../../components/Sidebar/Sidebar';
import NewsfeedTable from '../NewsFeed/NewsfeedTable';
import LeaderboardTable from '../../components/LeaderboardTable/LeaderboardTable';
// Libraries
import queryString from 'query-string';
import { hotjar } from 'react-hotjar';
import { connect } from 'react-redux';
import { geolocated } from 'react-geolocated';
import { useHistory } from 'react-router-dom';
// Base UI
import { StatefulPopover, PLACEMENT } from 'baseui/popover';

import {
  getCurrentUser,
  loadNewsfeed,
  addComment,
  register,
  addReply,
  selectMenu,
  initiateReset,
  login
} from '../../store/actions/auth/auth-actions';
import NewsFeedCard from './NewsFeedCard/NewsFeedCard';
import HelpMenu from '../../components/HelpMenu/HelpMenu';

function NewsFeedPage(props) {
  const {
    user,
    loadNewsfeedDispatch,
    newsfeed,
    currentPage,
    pages,
    selectMenu,
    selectMenuDispatch,
    userRanking
  } = props;

  const history = useHistory();
  const [latLng, setLatLng] = React.useState({});
  const [address, setAddress] = React.useState('');
  const [updatedNews, setUpdateNews] = React.useState(false);
  const [openCustomAddress, setOpenCustomAddress] = React.useState(false);
  const [hasMoreItems, setHasMoreItems] = React.useState(true);
  const [newPost, setNewPost] = React.useState('');
  const [newsfeedSort, setSort] = React.useState('');
  const [newsfeedDictionary] = React.useState({});
  const authenticated = localStorage.getItem('giving_tree_jwt');
  const [news] = React.useState([]);

  const items = [];
  const parsed = queryString.parse(props.location.search);

  // id dictates the type of feed
  let id = props.match.params ? props.match.params[0].toLowerCase() : '';

  if (true) {
    switch (id) {
      case '':
        if (newsfeedSort !== 'Home') {
          setSort('Home');
        }
        break;
      case 'discover':
        if (newsfeedSort !== 'Discover') {
          setSort('Discover');
          console.log('loading discover');
          loadNewsfeedDispatch({
            env: process.env.NODE_ENV,
            page: Number(currentPage),
            location: latLng,
            feed: 'Discover'
          });
        }
        break;
      case 'ongoing':
        if (newsfeedSort !== 'Ongoing') {
          setSort('Ongoing');
          loadNewsfeedDispatch({
            env: process.env.NODE_ENV,
            page: Number(currentPage),
            location: latLng,
            feed: 'Ongoing'
          });
        }
        break;
      case 'completed':
        if (newsfeedSort !== 'Completed') {
          setSort('Completed');
          loadNewsfeedDispatch({
            env: process.env.NODE_ENV,
            page: Number(currentPage),
            location: latLng,
            feed: 'Completed'
          });
        }
        break;
      case 'global':
        if (newsfeedSort !== 'Global') {
          setSort('Global');
          loadNewsfeedDispatch({
            env: process.env.NODE_ENV,
            page: Number(currentPage),
            feed: 'Global'
          });
        }
        break;
      case 'popular':
        if (newsfeedSort !== 'Popular') {
          setSort('Popular');
          loadNewsfeedDispatch({
            env: process.env.NODE_ENV,
            page: Number(currentPage),
            feed: 'Popular'
          });
        }
        break;
      case 'newest':
        if (newsfeedSort !== 'Newest') {
          setSort('Newest');
          loadNewsfeedDispatch({
            env: process.env.NODE_ENV,
            page: Number(currentPage),
            location: latLng,
            feed: 'Newest'
          });
        }
        break;
      default:
        break;
    }
  }

  // remove items
  const resetItems = () => {
    window.location = `/home/discover?lat=${latLng.lat}&lng=${latLng.lng}`; // explicit lat and lng coordinates
  };

  async function loadNewsfeedHelper() {
    if (pages === '') {
    } else if (Number(currentPage) < Number(pages)) {
      let nextPage = Number(currentPage) + 1;
      await loadNewsfeedDispatch({
        env: process.env.NODE_ENV,
        location: latLng,
        page: nextPage,
        feed: newsfeedSort
      });
      for (var j = 0; j < newsfeed.length; j++) {
        if (newsfeedDictionary[newsfeed[j]._id] === undefined) {
          news.push(newsfeed[j]);
          newsfeedDictionary[newsfeed[j]._id] = true;
        }
      }
    } else {
      setHasMoreItems(false);
      if (newsfeed) {
        for (var k = 0; k < newsfeed.length; k++) {
          if (newsfeedDictionary[newsfeed[k]._id] === undefined) {
            news.push(newsfeed[k]);
            newsfeedDictionary[newsfeed[k]._id] = true;
          }
        }
      }
    }
  }

  React.useEffect(() => {
    loadNewsfeedHelper();
    setUpdateNews(false);
  }, [updatedNews]);

  React.useEffect(() => {
    setLatLng(parsed); // initialize
    hotjar.initialize('1751072', 6);

    if (parsed.lat === '37.7749295' && parsed.lng === '-122.4194155') {
      setAddress('San Francisco, CA');
    } else if (parsed.lat === '34.0522342' && parsed.lng === '-118.2436849') {
      setAddress('Los Angeles, CA');
    } else if (parsed.lat === '43.653226' && parsed.lng === '-79.3831843') {
      setAddress('Toronto, ON, Canada');
    } else if (parsed.lat === '49.2827291' && parsed.lng === '-123.1207375') {
      setAddress('Vancouver, BC, Canada');
    } else if (parsed.lat === '40.7127753' && parsed.lng === '-74.0059728') {
      setAddress('New York City, NY');
    } else if (!parsed.lat && !parsed.lng) {
      setAddress('Earth');
    }

    selectMenuDispatch({ selectMenu: 'Food' });
  }, []);

  React.useEffect(() => {
    if (props.match.url === '/home/discover') {
      loadNewsfeedDispatch({
        env: process.env.NODE_ENV,
        page: Number(currentPage),
        location: latLng,
        feed: 'Discover'
      });
    }
  }, [latLng, address, !openCustomAddress]);

  const render = () => {
    news.map((item, i) => {
      items.push(
        <NewsFeedCard item={item} key={i} user={user} className="mb-4"
        index={i} />
      );
    });
  };

  render();

  return (
    <div>
      <Navigation selectMenuDispatch={selectMenuDispatch} 
      searchBarPosition="center" />
      <div className="lg:max-w-4xl xl:max-w-screen-xl w-full mx-auto py-12 px-6">
        <div className="block xl:flex">
          <div className="xl:pr-6 sidebar-wrapper">
            <Sidebar {...props} />
          </div>
          <section className="w-full xl:px-6">
            <NewsfeedTable
              {...props}
              authenticated={authenticated}
              address={address}
              setNewPost={setNewPost}
              hasMoreItems={hasMoreItems}
              selectMenuDispatch={selectMenuDispatch}
              id={id}
              items={items}
              resetItems={resetItems}
              setOpenCustomAddress={setOpenCustomAddress}
              setAddress={setAddress}
              setLatLng={setLatLng}
              latLng={latLng}
              newPost={newPost}
              selectMenu={selectMenu}
              openCustomAddress={openCustomAddress}
              setUpdateNews={setUpdateNews}
            />
          </section>
          <section className="hidden xl:block xl:pl-6 w-full" style={{
            maxWidth: '344px'
          }}>
            <div className="bg-white rounded-lg p-6 shadow-lg">
              <div className="flex justify-between items-center">
                <div className="text-left" style={{ fontWeight: 300 }}>
                  <div
                    style={{
                      fontStyle: 'normal',
                      fontWeight: 500,
                      fontSize: 16,
                      lineHeight: '20px',
                      color: '#545454',
                      paddingTop: '0px'
                    }}
                    className={`mb-4`}
                  >
                    Leaderboard
                  </div>
                  <div
                    style={{
                      fontStyle: 'normal',
                      fontWeight: 'normal',
                      fontSize: 12,
                      lineHeight: '14px',
                      color: '#545454'
                    }}
                  >
                    Top Helpers
                  </div>
                </div>
                <button
                  className="bg-transparent hover:bg-gray-600 text-gray-700 font-semibold hover:text-white py-1 px-3 border border-gray-600 hover:border-transparent transition duration-150 rounded"
                  style={{ outline: 'none' }}
                  onClick={() => history.push('/leaderboard')}
                >
                  <span style={{ fontSize: 12 }}>See full list</span>
                </button>
              </div>
              <div className="mt-4">
                <LeaderboardTable limit={10} />
              </div>
              {Number(userRanking) >= 0 && (
                <div className="mt-8">
                  <div
                    style={{
                      fontStyle: 'normal',
                      fontWeight: 'normal',
                      fontSize: 12,
                      lineHeight: '14px',
                      color: '#545454'
                    }}
                    className="text-left mb-4"
                  >
                    Your Ranking
                  </div>
                  <LeaderboardTable user={user} />
                  <StatefulPopover
                    placement={PLACEMENT.bottomRight}
                    overrides={{
                      Arrow: {
                        style: {
                          borderRadius: '50px'
                        }
                      },
                      Body: {
                        style: {
                          borderRadius: '50px'
                        }
                      },
                      Root: {
                        style: {
                          borderRadius: '50px',
                          boxShadow: `0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)`
                        }
                      }
                    }}
                    content={({ close }) => (
                      <div className="bg-white rounded-lg p-5 shadow-lg">
                        <div className="tooltip-heading py-1 mb-1">
                          How does Karma on Giving Tree work?
                        </div>
                        <div className="tooltip-text py-1">
                          Your karma points accumulate when other users upvote your completed
                          requests.
                        </div>
                        <div className="tooltip-text py-1">
                          Upvotes you receive from users with higher karma have a greater influence on
                          your karma points.
                        </div>
                        <div className="tooltip-text py-1">
                          Have thoughts about our karma system?{' '}
                          <a className="tooltip-heading" href="mailto:givingtree@gmail.com">
                            Email Us
                          </a>
                        </div>
                      </div>
                    )}
                  >
                    <div
                      style={{
                        fontStyle: 'normal',
                        fontWeight: 'normal',
                        fontSize: 12,
                        lineHeight: '14px',
                        color: '#545454',
                        cursor: 'pointer'
                      }}
                      className="text-left mt-4"
                    >
                      Want to improve your ranking?{' '}
                      <span className="font-bold hover:text-indigo-600 transition duration-150">
                        Find out how
                      </span>
                    </div>
                  </StatefulPopover>
                </div>
              )}
            </div>
          </section>
        </div>
      </div>
      <HelpMenu />     
    </div>
  );
}

const mapDispatchToProps = dispatch => ({
  getCurrentUserDispatch: payload => dispatch(getCurrentUser(payload)),
  loadNewsfeedDispatch: payload => dispatch(loadNewsfeed(payload)),
  signupDispatch: payload => dispatch(register(payload)),
  addCommentDispatch: payload => dispatch(addComment(payload)),
  addReplyDispatch: payload => dispatch(addReply(payload)),
  selectMenuDispatch: payload => dispatch(selectMenu(payload)),
  loginDispatch: payload => dispatch(login(payload)),
  initiateResetDispatch: payload => dispatch(initiateReset(payload))
});

const mapStateToProps = state => ({
  user: state.auth.user,
  newsfeed: state.auth.newsfeed,
  currentPage: state.auth.currentPage,
  selectMenu: state.auth.selectMenu,
  pages: state.auth.pages,
  numOfResults: state.auth.numOfResults,
  newsfeedSuccess: state.auth.newsfeedSuccess,
  newsfeedUpdated: state.auth.newsfeedUpdated,
  newsfeedLoading: state.auth.newsfeedLoading,
  userRanking: state.auth.userRanking,
  errorMessage: state.auth.errorMessage,
  registerLoading: state.auth.registerLoading,
  registerSuccess: state.auth.registerSuccess,
  registerFailure: state.auth.registerFailure,
  isRegistered: state.auth.isRegistered,
  loginLoading: state.auth.loginLoading,
  loginSuccess: state.auth.loginSuccess,
  loginFailure: state.auth.loginFailure,
  initiateResetSuccess: state.auth.initiateResetSuccess
});

export default connect(mapStateToProps, mapDispatchToProps)(geolocated()(NewsFeedPage));
