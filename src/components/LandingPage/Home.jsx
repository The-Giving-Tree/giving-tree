/* eslint-disable */
import * as React from 'react';
import {
  HeaderNavigation,
  ALIGN,
  StyledNavigationItem as NavigationItem,
  StyledNavigationList as NavigationList
} from 'baseui/header-navigation';
import { StyledLink as Link } from 'baseui/link';
import { useStyletron } from 'baseui';
import { Block } from 'baseui/block';
import { Button, SHAPE } from 'baseui/button';
import { useHistory } from 'react-router-dom';
import PlacesAutocomplete from 'react-places-autocomplete';
import { geocodeByAddress, geocodeByPlaceId, getLatLng } from 'react-places-autocomplete';
import { StatefulSelect as Search, TYPE } from 'baseui/select';
import { withHistory } from 'slate-history';
import useWindowSize from 'react-use/lib/useWindowSize';
import { Slider } from 'baseui/slider';
import { Modal, ModalHeader, ModalBody, ModalFooter, ModalButton } from 'baseui/modal';
import { RadioGroup, Radio } from 'baseui/radio';
import Confetti from 'react-confetti';
import Navigation from './../Navigation';
import { geolocated } from 'react-geolocated';
import InfiniteScroll from 'react-infinite-scroller';
import { Card, StyledBody, StyledAction } from 'baseui/card';
import { StatefulPopover, PLACEMENT } from 'baseui/popover';
import { StatefulMenu } from 'baseui/menu';
import { Slate, Editable, ReactEditor, withReact, useSlate } from 'slate-react';
import { Editor, Text, createEditor } from 'slate';
import { Input, SIZE } from 'baseui/input';
import { Upload, ChevronUp, ChevronDown } from 'baseui/icon';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import { Tag, VARIANT, KIND } from 'baseui/tag';
import moment from 'moment';

import { withImages, withRichText, Element, Leaf, MarkButton, BlockButton } from '../submitHelper';

import { connect } from 'react-redux';

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
  selectMenu
} from '../../store/actions/auth/auth-actions';

function Home(props) {
  const {
    user,
    getCurrentUserDispatch,
    loadNewsfeedDispatch,
    claimTaskDispatch,
    unclaimTaskDispatch,
    completeTaskDispatch,
    newsfeed,
    upvoteDispatch,
    downvoteDispatch,
    newsfeedSuccess,
    newsfeedLoading,
    currentPage,
    pages,
    numOfResults,
    selectMenu,
    addCommentDispatch,
    addReplyDispatch,
    selectMenuDispatch,
    newsfeedUpdated
  } = props;

  const history = useHistory();

  let items = [];
  const [news, setNews] = React.useState([]);
  const [openCustomAddress, setOpenCustomAddress] = React.useState(false);
  const [distance, setDistance] = React.useState([1000]);
  const [latLng, setLatLng] = React.useState({});
  const [address, setAddress] = React.useState('');
  const [openFoodTracking, setOpenFoodTracking] = React.useState(false);
  const [postId, setPostId] = React.useState('');
  const [eta, setETA] = React.useState('');
  const [missing, setOrderMissing] = React.useState('');
  const [deliverer, setOrderDeliverer] = React.useState('');
  const [newsfeedDictionary, setNewsfeedDictionary] = React.useState({});
  const [updatedNews, setUpdateNews] = React.useState(false);
  const [newsfeedSort, setSort] = React.useState('');
  const [upvoteIndex, setUpvoteIndex] = React.useState([]);
  const [downvoteIndex, setDownvoteIndex] = React.useState([]);
  const [initialUpvotes, setInitialUpvotes] = React.useState([]);
  const [initialDownvotes, setInitialDownvotes] = React.useState([]);
  const [upvoteHover, setUpvoteHover] = React.useState([]);
  const [downvoteHover, setDownvoteHover] = React.useState([]);
  const [hasMoreItems, setHasMoreItems] = React.useState(true);
  const [newPost, setNewPost] = React.useState('');
  const [confetti, showConfetti] = React.useState(false);
  const { width, height } = useWindowSize();

  const mToKm = value => `${(value / 1000).toFixed(1)}km`;

  const [css, theme] = useStyletron();

  const isEmpty = obj => {
    for (var key in obj) {
      if (obj.hasOwnProperty(key)) return false;
    }
    return true;
  };

  // id dictates the type of feed
  let id = props.match.params.id ? props.match.params.id.toLowerCase() : '';

  // if user is logged in
  // if (!isEmpty(user)) {
  if (true) {
    switch (id) {
      case '':
        if (newsfeedSort !== 'Home') {
          setSort('Home');
        }
        break;
        if (newsfeedSort !== 'Home') {
          setSort('Home');
          loadNewsfeedDispatch({
            env: process.env.NODE_ENV,
            page: Number(currentPage),
            location: latLng,
            feed: 'Home'
          });
        }
        break;
      case 'discover':
        if (newsfeedSort !== 'Discover') {
          setSort('Discover');
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

  const slateEditor = React.useMemo(
    () => withImages(withRichText(withHistory(withReact(createEditor())))),
    []
  );

  const authenticated = localStorage.getItem('giving_tree_jwt');
  const refresh = async () => {
    if (authenticated && !user.username) {
      await getCurrentUserDispatch({
        env: process.env.NODE_ENV
      });
    }
  };

  function generateHash(username = '') {
    const secret = 'givingtree';
    const hash = require('crypto')
      .createHmac('sha256', secret)
      .update(username.toLowerCase())
      .digest('hex');

    return 'https://d1ppmvgsdgdlyy.cloudfront.net/user/' + hash;
  }

  const shorten = (length, text) => {
    if (text) {
      if (text.length <= length) {
        return text;
      } else {
        return text.slice(0, length) + '...';
      }
    }
    return text;
  };

  // refresh();

  // keep track of which sub comment/post is overflowing div
  let overFlowList = {};

  const foodCartJSX = cart => {
    return cart.length === 0 ? (
      <div className="text-center">no items in cart</div>
    ) : (
      <table className="table-auto" style={{ width: '99%' }}>
        <thead>
          <tr>
            <th className="px-4 py-2">Item Description</th>
            <th className="px-4 py-2">Quantity</th>
          </tr>
        </thead>
        <tbody>
          {cart.map((item, i) => (
            <tr className={i % 2 === 0 && `bg-gray-100`}>
              <td className={`border px-4 py-2`}>{item.name}</td>
              <td className={`border px-4 py-2`}>{item.quantity}</td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  };

  // completed order details
  const completedOrderJSX = trackingDetails => {
    return trackingDetails.length === 0 ? (
      <div className="text-center">no tracking details added yet</div>
    ) : (
      <React.Fragment>
        <div
          className="bg-indigo-100 border-l-4 border-indigo-500 text-indigo-700 p-4 mt-8"
          role="alert"
        >
          <div
            style={{
              textTransform: 'capitalize',
              fontSize: 16,
              fontWeight: 600,
              marginBottom: 10,
              textDecoration: 'underline'
            }}
          >
            Order Details:
          </div>
          <p style={{ textTransform: 'capitalize' }}>order created: {trackingDetails.created}</p>
          <p style={{ textTransform: 'capitalize' }}>dropoff ETA: {trackingDetails.dropoffEta}</p>
          <p style={{ textTransform: 'capitalize' }}>method: {trackingDetails.method}</p>
          <p style={{ textTransform: 'capitalize' }}>notes: {trackingDetails.notes}</p>
        </div>
      </React.Fragment>
    );
  };

  const completedOrderGlobalJSX = item => {
    return item.length === 0 ? (
      <div className="text-center">no completed details available yet</div>
    ) : (
      <React.Fragment>
        <div
          className="bg-indigo-100 border-l-4 border-indigo-500 text-indigo-700 p-4 mt-8"
          role="alert"
        >
          {item.trackingDetails && (
            <React.Fragment>
              <div
                style={{
                  textTransform: 'capitalize',
                  fontSize: 16,
                  fontWeight: 600,
                  marginBottom: 10,
                  textDecoration: 'underline'
                }}
              >
                Order Details:
              </div>
              <p style={{ textTransform: 'capitalize' }}>
                order created: {moment(item.trackingDetails.created).format('MMM D, YYYY h:mm A')}
              </p>
              <p style={{ textTransform: 'capitalize' }}>
                dropoff ETA: {item.trackingDetails.dropoffEta}
              </p>
              <p style={{ textTransform: 'capitalize' }}>method: {item.trackingDetails.method}</p>
              <p style={{ textTransform: 'capitalize' }}>notes: {item.trackingDetails.notes}</p>
            </React.Fragment>
          )}

          <div
            style={{
              fontSize: 16,
              fontWeight: 600,
              marginTop: item.trackingDetails ? 15 : 0,
              textDecoration: 'underline'
            }}
          >
            Fulfilled By:
          </div>
          <p
            style={{ textTransform: 'lowercase', cursor: 'pointer' }}
            className="flex items-center"
          >
            <span
              onClick={() => history.push(`/user/${item.assignedUser.username}`)}
              className="hover:text-indigo-800"
            >
              {item.assignedUser.username}
            </span>
            {Number(item.assignedUser.karma) >= 0 && (
              <div>&nbsp;&bull; {item.assignedUser.karma} karma</div>
            )}
          </p>
          <p style={{ textTransform: 'lowercase' }}>
            email: <a href={`mailto:${item.assignedUser.email}`}>{item.assignedUser.email}</a>
          </p>
        </div>
      </React.Fragment>
    );
  };

  function removeIndex(array, element) {
    const index = array.indexOf(element);
    array.splice(index, 1);
  }

  const render = () => {
    news.map((item, i) => {
      if (item.downVotes.includes(user._id) && !downvoteIndex.includes(i) && !initialDownvotes.includes(i)) {
        initialDownvotes.push(i);
        downvoteIndex.push(i);
      }
      if (item.upVotes.includes(user._id) && !upvoteIndex.includes(i) && !initialUpvotes.includes(i)) {
        initialUpvotes.push(i);
        upvoteIndex.push(i);
      }
      items.push(
        <div className="item" key={i}>
          <Card
            overrides={{
              Root: {
                style: {
                  width: '100%',
                  margin: `${props.match.url === '/home/discover' ? '10px' : '0px'} auto 0px auto`,
                  maxHeight: '800px',
                  overflow: 'hidden'
                }
              },
              Body: {
                style: {
                  margin: '-10px'
                }
              }
            }}
          >
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between'
              }}
            >
              <div>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignContent: 'center',
                    paddingBottom: 15
                  }}
                >
                  <div
                    style={{
                      textTransform: 'lowercase',
                      fontSize: 12,
                      marginLeft: 5,
                      display: 'flex',
                      alignContent: 'center'
                    }}
                  >
                    <div
                      onClick={() => history.push(`/user/${item.username}`)}
                      style={{
                        width: 32,
                        height: 32,
                        background: `url(${generateHash(
                          item.username
                        )}), url(https://d1ppmvgsdgdlyy.cloudfront.net/acacia.svg)`,
                        backgroundPosition: '50% 50%',
                        backgroundSize: 'cover',
                        borderRadius: '50%',
                        marginRight: 10,
                        cursor: 'pointer'
                      }}
                    />
                    <div>
                      <strong>
                        <a
                          style={{ textDecoration: 'none', color: 'rgb(0, 121, 211)' }}
                          href={`/user/${item.username}`}
                        >
                          {item.username}
                        </a>
                      </strong>{' '}
                      · {moment(new Date(item.createdAt)).fromNow()}
                    </div>
                  </div>
                  <div
                    style={{
                      alignContent: 'flex-start'
                    }}
                  >
                    <div style={{ display: 'flex', alignContent: 'center' }}>
                      {item.type === 'Post' &&
                        item.categories.map(i => (
                          <Tag
                            overrides={{
                              Root: {
                                style: {
                                  marginRight: item.assignedUser ? '5px' : '15px',
                                  marginTop: '0px',
                                  marginBottom: '0px'
                                }
                              }
                            }}
                            closeable={false}
                            color="#4327F1"
                            kind={KIND.custom}
                          >
                            {i}
                          </Tag>
                        ))}
                      {item.assignedUser && !item.completed && (
                        <Tag
                          overrides={{
                            Root: {
                              style: {
                                marginRight: '15px',
                                marginTop: '0px',
                                marginBottom: '0px'
                              }
                            }
                          }}
                          closeable={false}
                          color="#FFA500"
                          kind={KIND.custom}
                        >
                          In Progress
                        </Tag>
                      )}
                      {item.assignedUser && item.completed && (
                        <Tag
                          overrides={{
                            Root: {
                              style: {
                                marginRight: '15px',
                                marginTop: '0px',
                                marginBottom: '0px'
                              }
                            }
                          }}
                          closeable={false}
                          color="#4BCA81"
                          kind={KIND.custom}
                        >
                          Completed
                        </Tag>
                      )}
                      <img
                        onClick={() => history.push(`/post/${item._id}`)}
                        src="https://d1ppmvgsdgdlyy.cloudfront.net/more.svg"
                        alt="more"
                        style={{ width: 15, height: 'auto', cursor: 'pointer' }}
                      />
                    </div>
                  </div>
                </div>
                <div
                  style={{
                    alignContent: 'center',
                    maxHeight: `calc(0.8 * 550px)`,
                    overflow: 'hidden'
                  }}
                >
                  <div style={{ display: 'table' }}>
                    <div style={{ textAlign: 'center' }}>
                      <ChevronUp
                        size={25}
                        color={
                          upvoteIndex.includes(i) || upvoteHover.includes(i) ? '#268bd2' : '#aaa'
                        }
                        style={{ alignContent: 'center', cursor: 'pointer' }}
                        onMouseEnter={() => mouseOverUp(i)}
                        onMouseLeave={() => mouseOutUp(i)}
                        onClick={async () => {
                          if (authenticated) {
                            await handleUpClick(
                              item.type,
                              item._id,
                              item.type === 'Comment' && item.postId
                            );

                            if (downvoteIndex.includes(i)) {
                              removeIndex(downvoteIndex, i);
                            }

                            if (upvoteIndex.includes(i)) {
                              removeIndex(upvoteIndex, i);
                            } else {
                              upvoteIndex.push(i);
                            }
                          } else {
                            alert('please signup first');
                            history.push('/signup');
                          }
                        }}
                      />
                      <div style={{ alignContent: 'center', marginBottom: 3 }}>
                        {item.voteTotal +
                          Number(upvoteIndex.includes(i) ? item.upVotes.includes(user._id) ? 0 : 1 : item.upVotes.includes(user._id) ? -1 : 0) -
                          Number(downvoteIndex.includes(i) ? item.downVotes.includes(user._id) ? 0 : 1 : item.downVotes.includes(user._id) ? -1 : 0)}
                      </div>
                      <ChevronDown
                        color={
                          downvoteIndex.includes(i) || downvoteHover.includes(i)
                            ? '#268bd2'
                            : '#aaa'
                        }
                        size={25}
                        style={{ alignContent: 'center', cursor: 'pointer' }}
                        onMouseEnter={() => mouseOverDown(i)}
                        onMouseLeave={() => mouseOutDown(i)}
                        onClick={async () => {
                          if (authenticated) {
                            await handleDownClick(
                              item.type,
                              item._id,
                              item.type === 'Comment' && item.postId
                            );

                            if (upvoteIndex.includes(i)) {
                              removeIndex(upvoteIndex, i);
                            }

                            if (downvoteIndex.includes(i)) {
                              removeIndex(downvoteIndex, i);
                            } else {
                              downvoteIndex.push(i);
                            }
                          } else {
                            alert('please signup first');
                            history.push('/signup');
                          }
                        }}
                      />
                    </div>
                    <div
                      style={{
                        display: 'table-cell',
                        verticalAlign: 'middle',
                        tableLayout: 'fixed',
                        width: '100%',
                        textAlign: 'left',
                        maxHeight: 'calc(0.7 * 300px)'
                      }}
                    >
                      <div
                        style={{
                          display: 'block',
                          alignContent: 'center',
                          marginBottom: 3,
                          marginLeft: 20
                        }}
                      >
                        <div
                          style={{
                            textTransform: 'capitalize',
                            fontSize: 20,
                            fontWeight: 600,
                            marginTop: 5
                          }}
                        >
                          {item.title}
                        </div>
                        <div style={{ marginTop: 5 }}>
                          {item.type === 'Post' ? (
                            <div style={{ marginTop: 20 }}>
                              <div>
                                <div className="text-sm my-1 mt-4">
                                  {item.text && `Address: ${JSON.parse(item.text).address}`}
                                </div>
                                <div className="text-sm my-1 mt-4">
                                  {item && `Description: ${JSON.parse(item.text).description}`}
                                </div>
                                {item &&
                                  props.match.url === '/home/ongoing' &&
                                  JSON.parse(item.text).phoneNumber && (
                                    <div className="text-sm my-1 mt-4">
                                      Phone Number: {JSON.parse(item.text).phoneNumber}
                                    </div>
                                  )}
                                <div className="mt-4"></div>
                                {item.text &&
                                  props.match.url !== '/home/ongoing' &&
                                  JSON.parse(item.text).type === 'food' &&
                                  foodCartJSX(JSON.parse(item.text).cart)}
                                {item.text &&
                                  props.match.url === '/home/completed' &&
                                  item.trackingDetails &&
                                  completedOrderJSX(item.trackingDetails)}
                                {item.text &&
                                  props.match.url === '/home/global' &&
                                  completedOrderGlobalJSX(item)}
                              </div>
                            </div>
                          ) : (
                            item.content
                          )}
                        </div>
                        {item.type === 'Comment' && (
                          <div>
                            <Card
                              overrides={{
                                Root: {
                                  style: {
                                    borderRadius: '10px',
                                    maxHeight: '300px',
                                    overflow: 'hidden'
                                  }
                                }
                              }}
                              style={{ /*width: '100%',*/ marginTop: 15 }}
                            >
                              <div
                                style={{
                                  marginTop: -10,
                                  display: 'flex',
                                  justifyContent: 'space-between',
                                  alignContent: 'center'
                                }}
                              >
                                <div
                                  style={{
                                    display: 'flex',
                                    alignContent: 'center',
                                    textTransform: 'lowercase',
                                    fontSize: 12
                                  }}
                                >
                                  <div
                                    onClick={() => history.push(`/user/${item.parent.username}`)}
                                    style={{
                                      width: 32,
                                      height: 32,
                                      background: `url(${generateHash(
                                        item.parent.username
                                      )}), url(https://d1ppmvgsdgdlyy.cloudfront.net/acacia.svg)`,
                                      backgroundPosition: '50% 50%',
                                      backgroundSize: 'cover',
                                      borderRadius: '50%',
                                      marginRight: 10,
                                      cursor: 'pointer'
                                    }}
                                  />
                                  <strong>
                                    <a
                                      style={{
                                        textDecoration: 'none',
                                        color: 'rgb(0, 121, 211)'
                                      }}
                                      href={`/user/${item.parent.username}`}
                                    >
                                      {item.parent && item.parent.username}
                                    </a>
                                  </strong>
                                  &nbsp;·&nbsp;
                                  {moment(item.parent && item.parent.createdAt).format(
                                    'MMM D, YYYY h:mm A'
                                  )}
                                  &nbsp;
                                  {item.parent && item.parent.type === 'Post' && (
                                    <React.Fragment>
                                      ·&nbsp;
                                      <a
                                        href={`/post/${item.parent && item.parent._id}`}
                                        style={{
                                          textDecoration: 'none',
                                          color: 'rgb(0, 121, 211)'
                                        }}
                                      >
                                        {shorten(60, (item.parent && item.parent.title) || '')}
                                      </a>
                                    </React.Fragment>
                                  )}
                                </div>
                                <div style={{ alignContent: 'flex-start' }}>
                                  <img
                                    onClick={() =>
                                      history.push(`/post/${item.parent && item.parent._id}`)
                                    }
                                    src="https://d1ppmvgsdgdlyy.cloudfront.net/more.svg"
                                    alt="more"
                                    style={{ width: 15, height: 'auto', cursor: 'pointer' }}
                                  />
                                </div>
                              </div>
                              <br />
                              {/* String length <= 250 or add '...' */}
                              {item.parent && item.parent.type === 'Post'
                                ? item.parent && (
                                    <div>
                                      <div className="text-sm my-1 mt-4">
                                        {item.parent && item.parent.address}
                                      </div>
                                      <div className="text-sm my-1 mt-4">
                                        {item.parent && `Description: ${item.parent.description}`}
                                      </div>
                                      <div className="mt-4"></div>
                                      {item.parent.text &&
                                        JSON.parse(item.parent.text).type === 'food' &&
                                        foodCartJSX(JSON.parse(item.parent.text).cart)}
                                    </div>
                                  )
                                : item.parent && shorten(250, item.parent.content)}
                              <div
                                style={{
                                  display: 'flex',
                                  justifyContent: 'space-between',
                                  alignContent: 'center',
                                  marginTop: 10,
                                  marginBottom: -10,
                                  textTransform: 'lowercase',
                                  fontSize: 12,
                                  zIndex: 200
                                }}
                              >
                                <strong>
                                  {item.parent && item.parent.upVotes.length !== 0 ? (
                                    <div style={{ color: 'green', display: 'inline' }}>
                                      +{item.parent && item.parent.upVotes.length} upvotes
                                    </div>
                                  ) : (
                                    '0 upvotes'
                                  )}{' '}
                                  ,{' '}
                                  {item.parent && item.parent.downVotes.length !== 0 ? (
                                    <div style={{ color: 'red', display: 'inline' }}>
                                      -{item.parent && item.parent.downVotes.length} downvotes
                                    </div>
                                  ) : (
                                    '0 downvotes'
                                  )}
                                </strong>
                                <div>
                                  <strong>
                                    {item.parent && item.parent.comments.length} comments
                                  </strong>
                                </div>
                              </div>
                            </Card>
                          </div>
                        )}
                        {item.type === 'Comment' && (
                          <div style={{ paddingTop: 20 }}>
                            <Input
                              overrides={{
                                InputContainer: {
                                  style: {
                                    border: 0,
                                    borderRadius: '5px'
                                  }
                                }
                              }}
                              clearable
                              onClick={() => history.push('/submit')}
                              size={SIZE.compact}
                              onKeyPress={async event => {
                                var code = event.keyCode || event.which;
                                if (code === 13 && event.target.value !== '') {
                                  // post comment if post parent, reply if comment parent
                                  if (item.parent.type === 'Post') {
                                    await addCommentDispatch({
                                      env: process.env.NODE_ENV,
                                      postId: item.parent._id,
                                      newComment: event.target.value
                                    });
                                  } else if (item.parent.type === 'Comment') {
                                    await addReplyDispatch({
                                      env: process.env.NODE_ENV,
                                      postId: item.postId,
                                      commentId: item._id,
                                      newReply: event.target.value
                                    });
                                  }

                                  history.push(`/post/${item._id}`);
                                }
                              }}
                              placeholder="add a comment..."
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div
                style={{
                  display: 'flex',
                  maxHeight: 'calc(0.2 * 550px)',
                  justifyContent: 'space-between',
                  alignContent: 'center',
                  marginTop: 10
                }}
              >
                <div />
                <div style={{ display: 'flex', alignContent: 'center' }}>
                  {confetti && <Confetti width={width} height={height} recycle={false} />}
                  {item.type === 'Post' && !item.completed && props.match.url === '/home/discover' && (
                    <div style={{ display: 'flex', alignContent: 'center', marginLeft: 15 }}>
                      <Button
                        style={{ outline: 'none', padding: 0 }}
                        kind="minimal"
                        size={SIZE.compact}
                        onClick={() => {
                          if (item.assignedUser) {
                            alert(
                              'someone is already helping on this task (in progress) - please look other requests'
                            );
                            return;
                          }

                          if (
                            window.confirm(
                              'Please confirm your committment to helping this person - by saying yes, other people cannot claim this request.'
                            )
                          ) {
                            claimTaskDispatch({
                              env: process.env.NODE_ENV,
                              postId: item._id
                            });

                            showConfetti(true);
                          }
                        }}
                      >
                        <img
                          src="https://d1ppmvgsdgdlyy.cloudfront.net/help_color.svg"
                          alt="help"
                          style={{ height: 22, width: 'auto', display: 'block' }}
                        />
                        <div style={{ marginLeft: 5, textTransform: 'uppercase', fontSize: 12 }}>
                          <strong>Help</strong>
                        </div>
                      </Button>
                    </div>
                  )}
                  {props.match.url !== '/home/ongoing' && (
                    <div style={{ display: 'flex', alignContent: 'center', marginLeft: 15 }}>
                      <CopyToClipboard text={`${window.location.origin}/post/${item._id}`}>
                        <StatefulPopover
                          placement={PLACEMENT.bottomLeft}
                          content={({ close }) => (
                            <StatefulMenu
                              items={[
                                {
                                  label: 'Copy Link'
                                }
                              ]}
                              onItemSelect={item => {
                                close();
                                switch (item.item.label) {
                                  case 'Copy Link':
                                    break;
                                  default:
                                    break;
                                }
                              }}
                              overrides={{
                                List: { style: { outline: 'none', padding: '0px' } }
                              }}
                            />
                          )}
                        >
                          <Button
                            style={{ outline: 'none', padding: 0 }}
                            kind="minimal"
                            size={SIZE.compact}
                          >
                            <img
                              src="https://d1ppmvgsdgdlyy.cloudfront.net/share.svg"
                              alt="share"
                              style={{ height: 22, width: 'auto', display: 'block' }}
                            />
                            <div
                              style={{ marginLeft: 5, textTransform: 'uppercase', fontSize: 12 }}
                            >
                              <strong>Share</strong>
                            </div>
                          </Button>
                        </StatefulPopover>
                      </CopyToClipboard>
                    </div>
                  )}
                  {props.match.url !== '/home/ongoing' && (
                    <div style={{ display: 'flex', alignContent: 'center', marginLeft: 15 }}>
                      <Button
                        style={{ outline: 'none', padding: 0 }}
                        kind="minimal"
                        size={SIZE.compact}
                        onClick={() => history.push(`/post/${item._id}`)}
                      >
                        <img
                          src="https://d1ppmvgsdgdlyy.cloudfront.net/comment.svg"
                          alt="comment"
                          style={{ height: 22, width: 'auto', display: 'block' }}
                        />
                        <div style={{ marginLeft: 5, textTransform: 'uppercase', fontSize: 12 }}>
                          <strong>{item.comments.length}&nbsp;&nbsp;Comments</strong>
                        </div>
                      </Button>
                    </div>
                  )}
                  {props.match.url === '/home/ongoing' && (
                    <div style={{ display: 'flex', alignContent: 'center', marginLeft: 15 }}>
                      <StatefulPopover
                        placement={PLACEMENT.bottomLeft}
                        content={({ close }) => (
                          <StatefulMenu
                            items={[
                              {
                                label: 'Manually Add Details',
                                key: 'manual'
                              },
                              {
                                label: (
                                  <div className="flex justify-center">
                                    <img
                                      src="https://d1ppmvgsdgdlyy.cloudfront.net/postmates.svg"
                                      alt="postmates"
                                      style={{ height: 50 }}
                                    />
                                  </div>
                                ),
                                key: 'postmates'
                              }
                            ]}
                            onItemSelect={i => {
                              close();
                              switch (i.item.key) {
                                case 'manual':
                                  setPostId(item._id);
                                  setOpenFoodTracking(true);
                                  break;
                                case 'postmates':
                                  alert('coming soon');
                                  break;
                                default:
                                  break;
                              }
                            }}
                            overrides={{
                              List: { style: { outline: 'none', padding: '0px' } }
                            }}
                          />
                        )}
                      >
                        <Button
                          style={{ outline: 'none', padding: 0 }}
                          kind="minimal"
                          size={SIZE.compact}
                        >
                          <div style={{ marginLeft: 5, textTransform: 'uppercase', fontSize: 12 }}>
                            <strong>Add Tracking Details</strong>
                          </div>
                        </Button>
                      </StatefulPopover>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </Card>
        </div>
      );
    });
  };

  render();

  React.useEffect(() => {
    loadNewsfeedHelper();
    setUpdateNews(false);
  }, [updatedNews]);

  React.useEffect(() => {
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

  function mouseOutUp(i) {
    setUpvoteHover(upvoteHover.filter(item => item !== i));
  }

  function mouseOverUp(i) {
    setUpvoteHover(upvoteHover.concat(i));
  }

  function mouseOutDown(i) {
    setDownvoteHover(downvoteHover.filter(item => item !== i));
  }

  function mouseOverDown(i) {
    setDownvoteHover(downvoteHover.concat(i));
  }

  async function handleUpClick(type, _id, postId = '') {
    switch (type) {
      case 'Post':
        await upvoteDispatch({
          env: process.env.NODE_ENV,
          postId: _id
        });
        break;
      case 'Comment':
        await upvoteDispatch({
          env: process.env.NODE_ENV,
          postId,
          commentId: _id
        });
        break;
      default:
        break;
    }
  }

  async function handleDownClick(type, _id, postId = '') {
    switch (type) {
      case 'Post':
        await downvoteDispatch({
          env: process.env.NODE_ENV,
          postId: _id
        });
        break;
      case 'Comment':
        await downvoteDispatch({
          env: process.env.NODE_ENV,
          postId,
          commentId: _id
        });
        break;
      default:
        break;
    }
  }

  return (
    <div
      style={{
        width: '100%',
        backgroundPosition: '50% 50%',
        backgroundSize: 'cover'
      }}
    >
      <Navigation searchBarPosition="center" />
      <Modal
        overrides={{ Dialog: { style: { borderRadius: '7px' } } }}
        onClose={() => setOpenFoodTracking(false)}
        isOpen={openFoodTracking}
      >
        <ModalHeader>Add Tracking Details</ModalHeader>
        <ModalBody>
          When is the food arriving (ETA)?
          <Input
            value={eta}
            onChange={e => setETA(e.target.value)}
            placeholder="4/2/2020 @ 6:40pm"
          />
          <br />
          Are you missing anything from the order?
          <Input
            value={missing}
            onChange={e => setOrderMissing(e.target.value)}
            placeholder="spinach was out"
          />
          <br />
          Who is delivering the food? (name, phone number, etc)
          <Input
            value={deliverer}
            onChange={e => setOrderDeliverer(e.target.value)}
            placeholder="Barack Obama, 6465335281"
          />
          <br />
        </ModalBody>
        <ModalFooter>
          <ModalButton size={'compact'} kind={'minimal'} onClick={() => setOpenFoodTracking(false)}>
            Cancel
          </ModalButton>
          <ModalButton
            size={'compact'}
            onClick={() => {
              if (eta && missing && deliverer && postId) {
                completeTaskDispatch({
                  env: process.env.NODE_ENV,
                  postId: postId,
                  trackingDetails: {
                    method: 'manual',
                    created: new Date(),
                    dropoffEta: eta,
                    notes: `${missing}. \n\n${deliverer}`
                  }
                });

                showConfetti(false);
                showConfetti(true);
                setOpenFoodTracking(false); // close dialog
              } else {
                alert('you need to fill all the details');
              }
            }}
          >
            Submit
          </ModalButton>
        </ModalFooter>
      </Modal>
      {props.match.url !== '/' ? (
        <table className="table-auto" style={{ width: '100%', background: '#F5F5F5' }}>
          <thead>
            <tr>
              <th className="px-4 py-2 text-right" style={{ width: '25%' }}>
                <div
                  style={{
                    width: '100%',
                    height: `calc(100vh - 70px + ${60 + items.length * 60}px)`
                  }}
                >
                  <div
                    className={`text-black transition duration-150 hover:text-indigo-600 ${props
                      .match.url === '/home/discover' &&
                      'text-indigo-600'} flex items-center justify-between`}
                    style={{ cursor: 'pointer', paddingLeft: 24, paddingTop: 30 }}
                  >
                    <span />
                    <div
                      className="flex items-center"
                      onClick={() => (window.location = '/home/discover')}
                    >
                      <img
                        src="https://d1ppmvgsdgdlyy.cloudfront.net/search.svg"
                        alt="search"
                        style={{ height: 20, marginRight: 10 }}
                      />
                      Discover Tasks
                    </div>
                  </div>
                  <div
                    className={`text-black transition duration-150 hover:text-indigo-600 ${props
                      .match.url === '/home/ongoing' &&
                      'text-indigo-600'} flex items-center justify-between`}
                    style={{ cursor: 'pointer', paddingLeft: 24, paddingTop: 10 }}
                  >
                    <span />
                    <div
                      className="flex items-center"
                      onClick={() => {
                        if (authenticated) {
                          window.location = '/home/ongoing';
                        } else {
                          alert('please login/signup before you can view your tasks');
                          history.push('/signup');
                        }
                      }}
                    >
                      <img
                        src="https://d1ppmvgsdgdlyy.cloudfront.net/care.svg"
                        alt="care"
                        style={{ height: 20, marginRight: 10 }}
                      />
                      Your Tasks
                    </div>
                  </div>
                  <div
                    className={`text-black transition duration-150 hover:text-indigo-600 ${props
                      .match.url === '/home/completed' &&
                      'text-indigo-600'} flex items-center justify-between`}
                    style={{ cursor: 'pointer', paddingLeft: 24, paddingTop: 10 }}
                  >
                    <span />
                    <div
                      className="flex items-center"
                      onClick={() => {
                        if (authenticated) {
                          window.location = '/home/completed';
                        } else {
                          alert('please login/signup before you can view your completed tasks');
                          history.push('/signup');
                        }
                      }}
                    >
                      <img
                        src="https://d1ppmvgsdgdlyy.cloudfront.net/gift.svg"
                        alt="gift"
                        style={{ height: 20, marginRight: 10 }}
                      />
                      Completed Tasks
                    </div>
                  </div>
                  <div
                    className={`text-black transition duration-150 hover:text-indigo-600 ${props
                      .match.url === '/home/global' &&
                      'text-indigo-600'} flex items-center justify-between`}
                    style={{ cursor: 'pointer', paddingLeft: 24, paddingTop: 10 }}
                  >
                    <span />
                    <div
                      className="flex items-center"
                      onClick={() => (window.location = '/home/global')}
                    >
                      <img
                        src="https://d1ppmvgsdgdlyy.cloudfront.net/global.svg"
                        alt="global"
                        style={{ height: 20, marginRight: 10 }}
                      />
                      Global Tasks
                    </div>
                  </div>
                  <div
                    className={`text-black transition duration-150 hover:text-indigo-600 flex items-center justify-between`}
                    style={{ cursor: 'pointer', paddingLeft: 24, paddingTop: 10 }}
                  >
                    <span />
                    <div
                      className="flex items-center"
                      onClick={() => {
                        if (authenticated) {
                          history.push('/submit');
                        } else {
                          alert('please login/signup before you can ask for help');
                          history.push('/signup');
                        }
                      }}
                    >
                      ❤️Ask for Help
                    </div>
                  </div>
                </div>
              </th>
              <th className="px-4 py-2" style={{ width: '50%' }}>
                <div
                  style={{
                    width: '100%',
                    height: `calc(100vh - 70px + ${60 + items.length * 60}px)`
                  }}
                >
                  <div style={{ paddingLeft: 24, paddingRight: 24, paddingTop: 30 }}>
                    {props.match.url === '/home/discover' && (
                      <Card
                        overrides={{
                          Root: {
                            style: {
                              width: '100%',
                              margin: '0 auto'
                            }
                          },
                          Body: {
                            style: {
                              margin: '-15px'
                            }
                          }
                        }}
                      >
                        <div
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignContent: 'center'
                          }}
                        >
                          <StatefulPopover
                            placement={PLACEMENT.bottomLeft}
                            content={({ close }) => (
                              <StatefulMenu
                                items={[
                                  // {
                                  //   key: 'Home'
                                  // },
                                  // {
                                  //   key: 'Popular'
                                  // },
                                  // {
                                  //   key: 'Newest'
                                  // },
                                  {
                                    label: 'Food',
                                    key: 'Food'
                                  },
                                  {
                                    label: 'Supplies',
                                    key: 'Supplies'
                                  }
                                  // {
                                  //   label: 'Transportation (coming soon)',
                                  //   key: 'Transportation'
                                  // },
                                  // {
                                  //   key: 'Completed Tasks'
                                  // },
                                  // {
                                  //   key: 'Global Tasks'
                                  // }
                                ]}
                                onItemSelect={item => {
                                  close();
                                  switch (item.item.key) {
                                    case 'Home':
                                      history.push('/');
                                      break;
                                    case 'Food':
                                      selectMenuDispatch({ selectMenu: 'Food', title: newPost });
                                      break;
                                    case 'Supplies':
                                      selectMenuDispatch({
                                        selectMenu: 'Supplies',
                                        title: newPost
                                      });
                                      break;
                                    case 'Transportation':
                                      alert('coming soon');
                                      break;
                                    case 'Custom Address':
                                      setOpenCustomAddress(true);
                                      break;
                                    case 'Popular':
                                      history.push('/home/popular');
                                      break;
                                    case 'Newest':
                                      history.push('/home/newest');
                                      break;
                                    case 'Discover':
                                      history.push('/home/discover');
                                      break;
                                    case 'Your Tasks':
                                      history.push('/home/ongoing');
                                      break;
                                    case 'Completed Tasks':
                                      history.push('/home/completed');
                                      break;
                                    case 'Global Tasks':
                                      history.push('/home/global');
                                      break;
                                    default:
                                      break;
                                  }
                                }}
                                overrides={{
                                  List: { style: { outline: 'none' } }
                                }}
                              />
                            )}
                          >
                            <Button
                              size={'compact'}
                              kind={'secondary'}
                              style={{ marginRight: 0, outline: 'none' }}
                              endEnhancer={() => <ChevronDown size={24} />}
                            >
                              {selectMenu}
                            </Button>
                          </StatefulPopover>
                          <Input
                            value={newPost}
                            onChange={event => {
                              setNewPost(event.currentTarget.value);
                              selectMenuDispatch({ selectMenu, title: event.currentTarget.value });
                            }}
                            placeholder="Ask for help / assistance"
                          />
                          <Button
                            onClick={() => history.push('/submit')}
                            kind="secondary"
                            style={{ marginLeft: 10, fontSize: 14 }}
                            shape={SHAPE.square}
                          >
                            Submit
                          </Button>
                        </div>
                      </Card>
                    )}
                    {openCustomAddress ? (
                      <div className="flex justify-between items-center mt-2">
                        <PlacesAutocomplete
                          value={address}
                          onChange={address => setAddress(address)}
                          onSelect={address => {
                            setAddress(address);
                            geocodeByAddress(address)
                              .then(results => getLatLng(results[0]))
                              .then(latLng => {
                                setLatLng(latLng);
                              })
                              .catch(error => console.error('Error', error));
                          }}
                        >
                          {({ getInputProps, suggestions, getSuggestionItemProps, loading }) => (
                            <div style={{ width: '100%' }}>
                              <input
                                {...getInputProps({
                                  placeholder: 'Enter an address',
                                  className: 'location-search-input'
                                })}
                                value={address}
                                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none"
                                id="address"
                                type="text"
                              />
                              <div className="autocomplete-dropdown-container">
                                {loading && <div>Loading...</div>}
                                {suggestions.map(suggestion => {
                                  const className = suggestion.active
                                    ? 'suggestion-item--active'
                                    : 'suggestion-item';
                                  // inline style for demonstration purpose
                                  const style = suggestion.active
                                    ? { backgroundColor: '#fafafa', cursor: 'pointer' }
                                    : { backgroundColor: '#ffffff', cursor: 'pointer' };
                                  return (
                                    <div
                                      {...getSuggestionItemProps(suggestion, {
                                        className,
                                        style
                                      })}
                                    >
                                      <span>{suggestion.description}</span>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          )}
                        </PlacesAutocomplete>
                        <div className="flex items-center">
                          <button
                            className={`ml-4 bg-gray-500 hover:bg-gray-700 text-white py-2 px-3 rounded focus:outline-none focus:shadow-outline`}
                            type="button"
                            onClick={() => {
                              let lat = props.coords && props.coords.latitude;
                              let lng = props.coords && props.coords.longitude;
                              setLatLng({ lat, lng });
                              setOpenCustomAddress(false);
                              setAddress('');
                            }}
                          >
                            Cancel
                          </button>
                          <button
                            className={`ml-4 bg-indigo-500 hover:bg-indigo-700 text-white py-2 px-3 rounded focus:outline-none focus:shadow-outline`}
                            type="button"
                            onClick={() => {
                              if (address) {
                                setOpenCustomAddress(false);
                              } else {
                                alert('you must enter an address to save!');
                              }
                            }}
                          >
                            Save
                          </button>
                        </div>
                      </div>
                    ) : (
                      props.match.url === '/home/discover' && (
                        <div className={`text-left mt-2`} style={{ fontSize: 12 }}>
                          {address ||
                            `Your current location (${props.coords &&
                              props.coords.latitude}, ${props.coords && props.coords.longitude})`}
                          &nbsp;
                          <span
                            onClick={() => setOpenCustomAddress(true)}
                            className="text-indigo-600 hover:text-indigo-800 transition duration-150"
                            style={{ cursor: 'pointer' }}
                          >
                            (edit)
                          </span>
                        </div>
                      )
                    )}
                    <InfiniteScroll
                      pageStart={1}
                      loadMore={() => setUpdateNews(true)}
                      hasMore={hasMoreItems}
                      loader={
                        <StyledBody
                          className="loader"
                          style={{ textAlign: 'center', padding: 10, marginTop: 20 }}
                          key={0}
                        >
                          Loading...
                        </StyledBody>
                      }
                    >
                      {items}
                    </InfiniteScroll>
                    <div style={{ paddingTop: 30 }} />
                    {items.length === 0 && newsfeedSuccess && !newsfeedLoading && (
                      <StyledBody style={{ margin: '0 auto', textAlign: 'center', marginTop: 20 }}>
                        {id === 'discover' && (
                          <div className="mb-2">
                            No requests yet -{' '}
                            <span
                              className={`text-indigo-600 hover:text-indigo-800 transition duration-150`}
                              style={{ cursor: 'pointer' }}
                              onClick={() => {
                                selectMenuDispatch({ selectMenu: '' }); // to show base page
                                history.push('/submit');
                              }}
                            >
                              create a new request if you need help
                            </span>
                          </div>
                        )}
                        {id === 'ongoing' && (
                          <div className="mb-2">You don't have any ongoing tasks yet</div>
                        )}
                        {id === 'completed' && (
                          <div className="mb-2">You haven't completed any tasks yet</div>
                        )}
                        {id === 'global' && (
                          <div className="mb-2">
                            No requests globally completed yet! Invite your friends and start
                            spreading the love
                          </div>
                        )}
                        {id !== 'discover' && (
                          <div
                            onClick={() => {
                              window.location = '/home/discover';
                            }}
                            style={{ cursor: 'pointer', color: 'rgb(25, 103, 210)' }}
                          >
                            Click here to discover topics and people to follow.
                          </div>
                        )}
                      </StyledBody>
                    )}
                  </div>
                </div>
              </th>
              <th className="px-4 py-2" style={{ width: '25%' }}></th>
            </tr>
          </thead>
        </table>
      ) : (
        <div
          style={{
            background: 'url(https://d1ppmvgsdgdlyy.cloudfront.net/eat2.jpg)',
            backgroundSize: '100%',
            paddingLeft: 24,
            paddingRight: 24,
            height: `calc(100vh - 70px)`
          }}
        >
          <Block>
            <h1 style={{ fontSize: 100, color: 'white' }}>We're one big family</h1>
            <h2 style={{ color: 'rgb(247, 242, 233)', fontSize: 40 }}>
              We are waves of the same sea, leaves of the same tree, flowers of the same garden.
            </h2>
          </Block>
          <button
            style={{ outline: 'none' }}
            className="mt-5 bg-indigo-500 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded"
            onClick={() => history.push('/home/discover')}
          >
            see leaderboard
          </button>
        </div>
      )}
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
  selectMenuDispatch: payload => dispatch(selectMenu(payload))
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
  newsfeedLoading: state.auth.newsfeedLoading
});

Home.defaultProps = {};

Home.propTypes = {};

export default connect(mapStateToProps, mapDispatchToProps)(geolocated()(Home));
