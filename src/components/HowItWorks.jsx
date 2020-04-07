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

function HowItWorks(props) {
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
            How It Works
          </div>
          <div className="about-section">
            <div id={'how-to-help'} className="about-heading">
              How To Provide Help
            </div>
            <div className="about-text" style={{ width: '100%', paddingTop: 20 }}>
              <b>Helper Guidelines</b>
              <div className="section-text">
                <br />
                Explore the Find Requests feed to find new, unclaimed requests near you
                <br />
                <br />
                Review the request’s details thoroughly to ensure you’ll be able to fulfill all
                requirements (including the due date/time). Use the Comments section to ask the
                requester any clarifying questions to better understand the scope of the request if
                unclear.
                <br />
                <br />
                Know that once you claim a request, you are committing to completing it. Should you
                decide to release a request because you cannot complete it, please note that you
                will need to provide an explanation and may lose Karma points.
                <br />
                <br />
                Communicate directly with the requester! We recommend:
                <br />
                <br />
                <ul className="list-disc">
                  <li>
                    Exchanging contact information so that you can call/text/email one another
                  </li>
                  <li>
                    Asking questions where necessary, so that you know exactly what the requester
                    needs
                  </li>
                  <li>
                    Agreeing on a reimbursement method beforehand for any purchases you’ll need to
                    make on the requester’s behalf
                  </li>
                  <li>
                    Aim for a contactless exchange of money, like Paypal, Venmo, or another
                    e-transfer method.
                  </li>
                </ul>
                <br />
                <br />
                If your requester can only reimburse you with cash, make sure that the cash exchange
                complies with social distancing regulations. Discuss whether you will need to supply
                exact change, or whether the remaining amount will be gifted to you as a tip. Please
                understand that any tips are entirely voluntary, and up to the requester’s
                discretion and ability.
                <br />
                <br />
                <ul className="list-disc">
                  <li>Agreeing on how/where you will deliver items and/or provide services</li>
                  <li>Keeping the requester updated on your progress and location</li>
                  <li>Review and follow our Health &amp; Safety guidelines</li>
                </ul>
                <br />
                <br />
                <b>Safety Guidelines for Helpers</b>
                <br />
                When completing grocery and supply runs, or other errands:
                <br />
                <br />
                <ul className="list-disc">
                  <li>
                    Avoid touching handrails, public furniture, or any other public surfaces as much
                    as possible.
                  </li>
                  <li>
                    Wear gloves if possible. Be mindful of cross-contamination while wearing gloves,
                    and do not use your same gloved hands to touch store items and your face and/or
                    your phone.
                  </li>
                  <li>
                    Do not greet anyone in public with physical contact (handshakes, kisses, or
                    hugs).
                  </li>
                  <li>Don’t take public transit to complete a request.</li>
                  <li>
                    Don’t encroach on a social distance of 6 feet with anyone, including (and
                    especially) the person you’re delivering goods to.
                  </li>
                  <li>
                    When coughing and sneezing, cover your nose and mouth in the crook of your elbow{' '}
                  </li>
                  <li>
                    Do not touch your face (or eyes, nose and mouth) unless you have first
                    thoroughly washed your hands.
                  </li>
                  <li>
                    If possible, sanitize any packages you’ve picked up before delivering them to
                    the requester.
                  </li>
                  <li>
                    After delivering the goods to the requester, disinfect or wash your hands
                    thoroughly with soap and water.
                  </li>
                  <li>
                    It is extremely important that there is no physical contact between helpers and
                    request requesters, as those requesting help are likely in a high-risk group,
                    and extra care is essential.
                  </li>
                </ul>
              </div>
            </div>
          </div>
          <div className="about-section" style={{ backgroundColor: '#F2F2F2' }}>
            <div id={'how-to-get-help'} className="about-heading">
              How to Request Help
            </div>
            <div className="about-text" style={{ width: '100%', paddingTop: 20 }}>
              <b>Requester Guidelines</b>
              <br />
              <div className="section-text">
                Remember that ordinary citizens are braving COVID-19 on your behalf, and try to
                create as few requests as possible so that you’re not sending multiple people out to
                multiple stores on your behalf. Instead, consolidate your asks into one request, and
                try to think of ways your helper could procure your needs from a single destination
                (e.g. Fred Meyer, Safeway).
                <br />
                <br />
                Help your helpers feel safe. Please don’t ask them to breach social distancing to
                hand-deliver your goods, or to exchange cash or other items.
                <br />
                <br />
                Communicate directly with your helper! We recommend:
                <br />
                <br />
                <ul className="list-disc">
                  <li>
                    Exchanging contact information so that you can call/text/email one another
                  </li>
                  <li>
                    Answering questions clearly so that your helper knows exactly how to help you
                  </li>
                  <li>
                    Agreeing on a reimbursement method beforehand for any purchases you’ll need to
                    make on the requester’s behalf
                  </li>
                </ul>
                <br />
                Aim for a contactless exchange of money, like Paypal, Venmo, or another e-transfer
                method. If you can only pay your helper in cash: Either coordinate with your helper
                to ensure they bring the correct change, or understand that the remaining amount can
                be gifted to your helper as a tip.
                <br />
                <br />
                Make sure that the cash exchange complies with social distancing regulations
                Agreeing on how/where your helper will deliver items and/or provide services, so
                that your helper knows what to expect Review and follow our Health &amp; Safety
                guidelines
                <br />
                <br />
                <b>How to make a new request</b>
                <br />
                <ul className="list-disc">
                  <li>Select the type of assistance you need, and click “Next”.</li>
                  <li>
                    Fill out the following form. Please be specific about your needs so your helper
                    can quickly and easily understand how to fulfill your request.
                  </li>
                  <li>
                    Be sure to provide your contact information, like your email address and/or
                    phone number, so your helper can coordinate with you directly.
                  </li>
                  <li>
                    Try to be as flexible with your due date/time as possible. The longer you give
                    helpers to claim and fulfill your request, the better your chances are of having
                    your request fulfilled.
                  </li>
                  <li>
                    Click “Submit”. A good samaritan in your area will claim your request and reach
                    out to you soon!
                  </li>
                </ul>
                <br />
                <br />
                <b>Helpful Tips</b>
                <br />
                <ul className="list-disc">
                  <li>
                    Be specific about your needs so that your helper can fulfill your request as
                    quickly and easily as possible
                  </li>
                  <li>
                    If you are requesting very specific items, we recommend suggesting acceptable
                    alternatives, in case the items/brands you want are out of stock
                  </li>
                  <li>
                    Under special instructions, we recommend including any information that would
                    assist your helper in better understanding your unique circumstances and/or
                    needs. Here are some examples:{' '}
                    <i>
                      I am hard of hearing and request a phone call when my helper arrives (vs.
                      text/knocking on the door) I will need my helper to come up to my apartment
                      and cannot meet in the lobby I am wheelchair bound I’d prefer only same-gender
                      helpers for safety reasons There is a dog at my household who will bark but is
                      not violent/dangerous
                    </i>
                  </li>
                </ul>
                <br />
                <br />
                <b>Safety Guidelines for Requesters</b>
                <br />
                When receiving goods from a helper:
                <br />
                <br />
                <ul className="list-disc">
                  <li>
                    Keep in mind that the virus can come from public places/surfaces into your home.
                  </li>
                  <li>
                    Stay at least 1 meter away from the person making the delivery; do not greet
                    your helper with any physical contact (e.g. handshakes or hugs).
                  </li>
                  <li>
                    Upon receiving items, sanitize their packaging with disinfectant wipes if
                    possible.
                  </li>
                  <li>
                    While you are sanitizing and storing items, be sure not to touch your face, your
                    phone, or any of your other belongings.
                  </li>
                  <li>
                    After putting away the items, wash your hands thoroughly with soap and water.
                  </li>
                </ul>
              </div>
            </div>
          </div>
          <div className="about-section">
            <div id={'faqs'} className="about-heading" style={{ fontSize: 36 }}>
              FAQs
            </div>
            <div className="privacy-text mt-4">
              <b>Q: Do I have to pay to use this website?</b>
              <br />
              No, these services are provided entirely for free by a community of volunteers -
              ordinary people who have signed up to brave the risks of COVID-19 on your behalf.
              <br />
              <br />
              <b>Q: What kinds of things can we ask for?</b>
              <br />
              The Giving Tree can be used to request grocery and supply deliveries, food and supply
              donations, and other services you may need help with. You can ask for items such as
              groceries, toiletries, or other essential items. You can also ask for services
              relating to essential household functions (i.e. plumbing, appliance repair). We ask
              that you do not use The Giving Tree for self-promotion purposes unrelated to community
              welfare. Learn more about our Community Guidelines here.
              <br />
              <br />
              <b>Q: How do I pay my helper for purchases they’ve made on my behalf?</b>
              <br />
              If your request will require your helper to make purchases on your behalf, you should
              coordinate with your helper to determine how to reimburse them. Because exchanging
              cash may require you to breach social distance, we encourage you to use a contactless
              method to send your helper money, like PayPal, Venmo, or another e-transfer method.
              <br />
              <br />
              <b>Q: How do I make sure I am reimbursed for purchases I make? </b>
              <br />
              The Giving Tree works on a trust basis, and will not accept liability for the actions
              of our users. Please coordinate with the request’s requester beforehand, and use your
              best judgment when deciding whether you feel comfortable making purchases on behalf of
              the requester prior to reimbursement. We strongly recommend that helpers and
              requesters iron out payment arrangements and other details over a phone call, instead
              of over text. As we are working to build a community based on trust, we are putting
              our faith in our users to uphold common values like trust, honesty, and social
              responsibility.
              <br />
              <br />
              <b>Q: What does Karma mean? How do I improve it?</b>
              <br />
              Karma is The Giving Tree’s social currency -- the more involved you are in your
              community, the more Karma you collect. You can gain Karma in several ways: being
              upvoted for fulfilling help requests in your community, referring new users to The
              Giving Tree, and completing onboarding requests when you create your account.
              <br />
              <br />
              <b>Q: Do I have to share my home address with helpers?</b>
              <br />
              No, you can set a drop-off location anywhere that is publicly accessible, but we
              stress that you should abide by CDC’s{' '}
              <a
                href="https://www.cdc.gov/coronavirus/2019-ncov/prevent-getting-sick/prevention.html"
                target="_blank"
              >
                health and safety guidelines
              </a>{' '}
              if you are meeting a helper/picking up items in a public setting.
              <br />
              <br />
              <b>Q: Do I have to share my real phone number?</b>
              <br />
              No, you can use your email address or a social media account to communicate with other
              users. However, please ensure that whichever medium you use is one you check
              consistently, and has your real full name and photos of you, as this helps establish
              trust with the other users you’re communicating with. Please be respectful to the
              people you are helping, or who are helping you!
              <br />
              <br />
              <b>Q: Am I eligible to ask for help?</b>
              <br />
              Our only requirement is that helpers and requesters be 16 years of age or older. As
              long as you adhere to our Community Guidelines, anyone who is over the age of 16 and
              feels they need help can request it.
              <br />
              <br />
              <b>Q: How do you screen helpers?</b>
              <br />
              As it stands right now, we allow anyone over the age of 16 to sign up for The Giving
              Tree, and allow people of all ages to view its public posts. We strongly recommend
              that you use your discretion and common sense when interacting with other users, and
              that you refrain from providing/accepting help when you do not feel comfortable.
              <br />
              <br />
              We are working on methods to have users verify their identity using reliable social
              media accounts. We want to make The Giving Tree widely accessible, but it is also
              extremely important to us to keep our community safe from scamming and exploitation.
              <br />
              <br />
              <b>
                Q: I am trying to fulfill requests, but no one is accepting my help. What can I do?
              </b>
              <br />
              If you haven’t already, please ensure you complete your profile by adding your photo
              and other information. Providing real details on who you are can help instill trust
              with other users.
              <br />
              <br />
              <b>Q: I am trying to get help, but no one has picked up my request. What can I do?</b>
              <br />
              See our How to Request Help guidelines and ensure that you’ve included all of the
              necessary information in your request. If you need urgent help (picking up a required
              medical prescription, for example), please contact us directly at{' '}
              <a
                className="text-green-600 hover:text-green-800 transition duration-150"
                href="mailto:team.givingtree@gmail.com"
              >
                team.givingtree@gmail.com
              </a>{' '}
              with the subject line “URGENT” and we will try to find you a helper.
              <br />
              <br />
              <b>Q: How can I contact The Giving Tree team directly via email or phone?</b>
              <br />
              We can be reached by email at{' '}
              <a
                className="text-green-600 hover:text-green-800 transition duration-150"
                href="mailto:team.givingtree@gmail.com"
              >
                team.givingtree@gmail.com
              </a>
              . You can text or call us at{' '}
              <a
                className="text-green-600 hover:text-green-800 transition duration-150"
                href="tel:+1415-964-4261"
              >
                415-964-4261
              </a>
              .
              <br />
              <br />
              <b>Q: Can I text instead of creating a request online?</b>
              <br />
              Yes, you can text a request to our team at{' '}
              <a
                className="text-green-600 hover:text-green-800 transition duration-150"
                href="tel:+1415-964-4261"
              >
                415-964-4261
              </a>{' '}
              and we will post a request on your behalf.
              <br />
              <br />
              <b>Q: Can I sign up for, or post on The Giving Tree on behalf of other people?</b>
              <br />
              Yes, but only if you have confirmed that the person you are participating on behalf of
              is aware of and consenting to your involvement. Please do not advocate for someone
              against their will.
              <br />
              <br />
              <b>Q: Help! My Karma has decreased. Why?</b>
              <br />
              Oh no! Your Karma may have decreased because someone downvoted one of your help
              requests. This may have been an accident, or it may be because your request violates
              one of our Community Guidelines. Please make sure to review the guidelines, and edit
              or delete your post to better comply with them.
              <br />
              <br />
              <b>Q: How else can I get involved?</b>
              <br />
              Thank you for your interest! Since our project is very new, we need all the help we
              can get. There are several ways to help us out -- the simplest being providing us
              feedback using the Give Feedback! button in the platform’s lower right-hand corner
              (desktop). Additionally, you can email us to share your thoughts on how we can
              improve, or to express interest in joining our team.
              <br />
              <br />
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

HowItWorks.defaultProps = {};

HowItWorks.propTypes = {};

export default connect(mapStateToProps, mapDispatchToProps)(geolocated()(HowItWorks));
