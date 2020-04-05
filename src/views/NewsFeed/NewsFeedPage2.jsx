import * as React from 'react';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';

// Custom Components
import Navigation from '../../components/Navigation';
import Sidebar from '../../components/Sidebar';
import Footer from '../../components/Footer';
import Constants from '../../components/Constants';
import LocationBar from '../../components/LocationBar/LocationBar';
import NewsFeedTable2 from './NewsFeedTable2';
import LeaderboardTable from '../../components/LeaderboardTable/LeaderboardTable'

// Base UI
import { StatefulPopover, PLACEMENT } from 'baseui/popover';

// Auth
import { getCurrentUser } from '../../store/actions/auth/auth-actions';

class NewsFeedPage2 extends React.Component {

  constructor(props) {
    super(props)

    this.state = {
      params: '',
      id: this.getFeedMode(),
      location: {
        name: '',
        lat: '',
        lng: ''
      }
    };

    this.setLocation = this.setLocation.bind(this);
  }

  
  /**
   * Get the feed mode/filter from the URL params
   * @returns
   * @memberof NewsFeedPage2
   */
  getFeedMode() {
    const params = this.props.match.params;
    const _id = params ? params[0].toLowerCase() : '';
    return _id;
  }

  /**
   * Set the user's location based on latitude and longitude
   *
   * @param {*} loc
   * @memberof NewsFeedPage2
   */
  setLocation(loc) {
    this.setState({
      location: {
        name: loc.name,
        lat: loc.lat,
        lng: loc.lng
      }
    })
  }

  render() {
    return (
      <div className="h-full flex flex-col">
        <Navigation searchBarPosition="center" />
        <div className="max-w-screen-lg w-full mx-auto xl:flex xl:max-w-6xl py-12">
          <aside className="hidden xl:block">
            <Sidebar {...this.props} />
          </aside>
          <section className="xl:w-1/2 px-6 lg:px-12">
            <div className="mb-4">
              <LocationBar location={this.state.location}
                setLocation={this.setLocation} />
            </div>
            <NewsFeedTable2 location={this.state.location} />
          </section>
          <section className="hidden xl:block">
            <div style={{
                width: '344px'
            }}
              className="bg-white rounded-lg p-6 shadow-lg">
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
                    Most helpful people in your area
                  </div>
                </div>
                <Link to={Constants.PATHS.LEADERBOARD}
                  className="bg-transparent hover:bg-gray-600 text-gray-700 font-semibold hover:text-white py-1 px-3 border border-gray-600 hover:border-transparent transition duration-150 rounded"
                  style={{ outline: 'none' }}>
                  <span style={{ fontSize: 12 }}>See full list</span>
                </Link>
              </div>
              <div className="mt-4">
                <LeaderboardTable limit={10} />
              </div>
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
                <LeaderboardTable user={this.props.user} />
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
            </div>
          </section>
        </div>
        <Footer />
      </div>
    );
  }
}

const mapDispatchToProps = dispatch => ({
  getCurrentUserDispatch: payload => dispatch(getCurrentUser(payload))
});

const mapStateToProps = state => ({
  user: state.auth.user
});

export default connect(mapStateToProps, mapDispatchToProps)(NewsFeedPage2);