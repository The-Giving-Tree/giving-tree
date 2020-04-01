/* eslint-disable */
import * as React from 'react';
import { useHistory } from 'react-router-dom';
import Navigation from './Navigation';
import Footer from './Footer';
import { geolocated } from 'react-geolocated';
import { connect } from 'react-redux';
import { hotjar } from 'react-hotjar';
import {
  Link,
  DirectLink,
  Element,
  Events,
  animateScroll as scroll,
  scrollSpy,
  scroller
} from 'react-scroll';

import {
  getCurrentUser,
  loadNewsfeed,
  claimTask,
  unclaimTask,
  completeTask,
  upvote,
  downvote,
  addComment,
  addReply,
  selectMenu,
  getLeaderboard
} from '../store/actions/auth/auth-actions';

function About(props) {
  const { user, getCurrentUserDispatch, getLeaderboardDispatch, userRanking, leaderboard } = props;

  const history = useHistory();
  const [activeKey, setActiveKey] = React.useState('0');

  let items = [];
  const authenticated = localStorage.getItem('giving_tree_jwt');
  const refresh = async () => {
    if (authenticated && !user.username) {
      await getCurrentUserDispatch({
        env: process.env.NODE_ENV
      });
    }
  };

  React.useEffect(() => {
    hotjar.initialize('1751072', 6);
  }, []);

  function generateHash(username = '', version) {
    const secret = 'givingtree';
    const hash = require('crypto')
      .createHmac('sha256', secret)
      .update(username.toLowerCase())
      .digest('hex');

    const suffix = Number(version) === 0 || !version ? '' : `%3Fver%3D${version}`;
    const url = `https://d1ppmvgsdgdlyy.cloudfront.net/user/${hash}${suffix}`;
    return url;
  }

  function stringToHslColor(str, s, l) {
    var hash = 0;
    for (var i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }

    var h = hash % 360;
    return 'hsl(' + h + ', ' + s + '%, ' + l + '%)';
  }

  React.useEffect(() => {
    getLeaderboardDispatch({ env: process.env.NODE_ENV, location: 'global' });
  }, []);

  return (
    <div
      style={{
        width: '100%',
        backgroundPosition: '50% 50%',
        backgroundSize: 'cover',
        backgroundColor: '#fff'
      }}
    >
      <Navigation searchBarPosition="center" />
      <div
        style={{
          paddingTop: 40
        }}
      >
        <div
          style={{
            margin: '0 auto'
          }}
        >
          <div
            className="about-heading justify-center"
            style={{ fontSize: 44, textTransform: 'uppercase' }}
          >
            About
          </div>
          <div className="about-section flex justify-between items-center">
            <div>
              <div id={'about-us'} className="about-heading">
                About The Giving Tree
              </div>
              <div className="about-text" style={{ width: 576, paddingTop: 20 }}>
                “The best way to not feel hopeless is to get up and do something.” - Barack Obama
                <br />
                <br />
                We are a community of doers whose aim is to provide immediate, peer-to-peer
                assistance to our communities in the midst of COVID-19. We envision a safe,
                positive, and effective platform where anyone who feels they need help can receive
                it, and where anyone interested in supporting their community can do so quickly, and
                at their own pace. By gamifying our volunteering platform, we hope to encourage and
                entice our users to continue lifting up those around them through social good.
              </div>
            </div>
            <div>
              <img
                style={{ height: 200, marginRight: 150 }}
                src="https://giving-tree.s3.amazonaws.com/givingtree.svg"
              />
            </div>
          </div>
          <div
            className="about-section flex justify-between items-center"
            style={{ backgroundColor: '#F2F2F2' }}
          >
            <div>
              <div id={'who-we-are'} className="about-heading">
                Who We Are
              </div>
              <div>
              <img
                style={{ height: 400 }}
                className="rounded-lg"
                src="https://d1ppmvgsdgdlyy.cloudfront.net/whoweare.jpg"
              />
            </div>
              <div className="about-text" style={{ width: 576, paddingTop: 20 }}>
                We are a group of passionate, self-motivated, international
                strangers-turned-teammates, united by a common goal: to help ease our neighbors’
                suffering as a result of COVID-19, and the current social distancing regulations. We
                believe the solution lies in coming together as a community, and in empowering
                ordinary citizens to act on their altruistic inclinations. We believe that all
                people deserve to have their basic needs met -- during this global pandemic, and
                always -- regardless of age, race, ability, or socioeconomic status.
              </div>
            </div>
          </div>
          <div className="about-section flex justify-between items-center">
            <div>
              <div id={'get-involved'} className="about-heading">
                Get Involved
              </div>
              <div className="about-text" style={{ width: 576, paddingTop: 20 }}>
                Interested in contributing to our efforts? The best way to help out is by spreading
                the word to your friends/family/network about our platform, and by signing up to be
                a helper if you are able.
                <br />
                <br />
                You can also get in touch with us by email if you like what we are doing, or have
                ideas on how we can improve. If you would like to provide in-depth feedback on our
                site’s usability and features, make sure your email has the term “USER INTERVIEW” in
                the subject line so we know you’re interested in participating!
              </div>
            </div>
            <div>
              <img
                style={{ height: 300, marginRight: 100 }}
                src="https://d1ppmvgsdgdlyy.cloudfront.net/getinvolved.png"
              />
            </div>
          </div>
          <div
            className="about-section flex justify-between items-center"
            style={{ backgroundColor: '#F2F2F2' }}
          >
              <div>
              <img
                className="rounded-lg"
                style={{ height: 300 }}
                src="https://d1ppmvgsdgdlyy.cloudfront.net/contactus.jpg"
              />
            </div>
            <div>
              <div id={'contact-us'} className="about-heading">
                Contact Us
              </div>
              <div className="about-text" style={{ width: 576, paddingTop: 20 }}>
                Reach out to us anytime at{' '}
                <a
                  className="text-green-600 hover:text-green-800 transition duration-150"
                  href="mailto:team.givingtree@gmail.com"
                >
                  team.givingtree@gmail.com
                </a>
                .
                <br />
                <br />
                If you need our team to create a request on your behalf, call or text our hotline at{' '}
                <a
                  className="text-green-600 hover:text-green-800 transition duration-150"
                  href="tel:+1415-964-4261"
                >
                  415-964-4261
                </a>
                .
              </div>
            </div>
          </div>
          <div className="about-section flex justify-between items-center">
            <div>
              <div id={'get-help'} className="about-heading">
                Get Help
              </div>
              <div className="about-text" style={{ width: 576, paddingTop: 20 }}>
                Need immediate assistance with a request and can’t find a helper? Please{' '}
                <a
                  className="text-green-600 hover:text-green-800 transition duration-150"
                  href="mailto:team.givingtree@gmail.com"
                >
                  email us
                </a>{' '}
                with the word “URGENT” in the subject line.
                <br />
                <br />
                Need to report an incident, and/or the malicious or inappropriate behavior of
                another user? Please{' '}
                <a
                  className="text-green-600 hover:text-green-800 transition duration-150"
                  href="mailto:team.givingtree@gmail.com"
                >
                  email us
                </a>{' '}
                with the word “REPORT” in the subject line.
              </div>
            </div>
            <div>
              <img
                className="rounded-lg"
                style={{ height: 200, marginRight: 150 }}
                src="https://d1ppmvgsdgdlyy.cloudfront.net/gethelp.png"
              />
            </div>
          </div>
          <div className="about-section">
            <div id={'privacy-policy'} className="about-privacy">
              Privacy Policy
            </div>
            <div className="privacy-text mt-4">
              The Giving Tree and its website will not sell your data nor use any of the information
              except for improving facilitation and communication between volunteers (“helpers”) and
              those in need (“requesters”). There is one and only one purpose to the site, which is
              to aid our on-the-ground helpers in fulfilling supply requests for recipients. These
              guidelines dictate the spirit and operations of The Giving Tree and how we handle your
              data. By signing up for an account and participating on The Giving Tree’s platform,
              you agree to accept all risk and responsibility and, further, hold any facilitators
              associated with www.givingtreeproject.org harmless.
              <br />
              <br />
              <i>Last updated: March 31, 2020</i>
            </div>
          </div>
        </div>
      </div>
      <div
        onClick={() => window.scrollTo(0, 0)}
        className="back-to-top justify-center hover:text-green-700 transition-duration"
      >
        Back to top{' '}
        <img
          className="ml-2"
          src="https://d1ppmvgsdgdlyy.cloudfront.net/back-to-top.svg"
          alt="back-to-top"
        />
      </div>
      <Footer />
    </div>
  );
}

const mapDispatchToProps = dispatch => ({
  getCurrentUserDispatch: payload => dispatch(getCurrentUser(payload)),
  loadNewsfeedDispatch: payload => dispatch(loadNewsfeed(payload)),
  claimTaskDispatch: payload => dispatch(claimTask(payload)),
  unclaimTaskDispatch: payload => dispatch(unclaimTask(payload)),
  completeTaskDispatch: payload => dispatch(completeTask(payload)),
  upvoteDispatch: payload => dispatch(upvote(payload)),
  downvoteDispatch: payload => dispatch(downvote(payload)),
  addCommentDispatch: payload => dispatch(addComment(payload)),
  addReplyDispatch: payload => dispatch(addReply(payload)),
  selectMenuDispatch: payload => dispatch(selectMenu(payload)),
  getLeaderboardDispatch: payload => dispatch(getLeaderboard(payload))
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
  leaderboard: state.auth.leaderboard
});

About.defaultProps = {};

About.propTypes = {};

export default connect(mapStateToProps, mapDispatchToProps)(geolocated()(About));
