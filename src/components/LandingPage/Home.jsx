/* eslint-disable */
import * as React from 'react';
import {
  HeaderNavigation,
  ALIGN,
  StyledNavigationItem as NavigationItem,
  StyledNavigationList as NavigationList
} from 'baseui/header-navigation';
import { StyledLink as Link } from 'baseui/link';
import { Block } from 'baseui/block';
import { Button, SHAPE } from 'baseui/button';
import { StatefulSelect as Search, TYPE } from 'baseui/select';
import { withHistory } from 'slate-history';
import useWindowSize from 'react-use/lib/useWindowSize';
import Confetti from 'react-confetti';
import Navigation from './../Navigation';
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
  upvote,
  downvote,
  addComment,
  addReply
} from '../../store/actions/auth/auth-actions';

function Home(props) {
  const {
    user,
    getCurrentUserDispatch,
    loadNewsfeedDispatch,
    newsfeed,
    upvoteDispatch,
    downvoteDispatch,
    newsfeedSuccess,
    newsfeedLoading,
    currentPage,
    pages,
    numOfResults,
    addCommentDispatch,
    addReplyDispatch,
    newsfeedUpdated
  } = props;

  let items = [];
  const [news, setNews] = React.useState([]);
  const [newsfeedDictionary, setNewsfeedDictionary] = React.useState({});
  const [updatedNews, setUpdateNews] = React.useState(false);
  const [newsfeedSort, setSort] = React.useState('');
  const [upvoteIndex, setUpvoteIndex] = React.useState([]);
  const [downvoteIndex, setDownvoteIndex] = React.useState([]);
  const [upvoteHover, setUpvoteHover] = React.useState([]);
  const [downvoteHover, setDownvoteHover] = React.useState([]);
  const [hasMoreItems, setHasMoreItems] = React.useState(true);
  const [newPost, setNewPost] = React.useState('');
  const [confetti, showConfetti] = React.useState(false);
  const { width, height } = useWindowSize();

  const isEmpty = obj => {
    for (var key in obj) {
      if (obj.hasOwnProperty(key)) return false;
    }
    return true;
  };

  // id dictates the type of feed
  let id = props.match.params.id ? props.match.params.id.toLowerCase() : '';

  // if user is logged in
  if (!isEmpty(user)) {
    switch (id) {
      case '':
        window.location = '/home/discover'; // temporary to redirect to discover
        return;
        if (newsfeedSort !== 'Home') {
          setSort('Home');
          loadNewsfeedDispatch({
            env: process.env.NODE_ENV,
            page: Number(currentPage),
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
            feed: 'Discover'
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

  const renderElement = React.useCallback(props => <Element {...props} />, []);
  const renderLeaf = React.useCallback(props => <Leaf {...props} />, []);

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

  refresh();

  // keep track of which sub comment/post is overflowing div
  let overFlowList = {};

  const foodCartJSX = foodCart => {
    return foodCart.length === 0 ? (
      <div className="text-center">no items in cart</div>
    ) : (
      <table class="table-auto" style={{ width: '99%' }}>
        <thead>
          <tr>
            <th class="px-4 py-2">Item Description</th>
            <th class="px-4 py-2">Quantity</th>
          </tr>
        </thead>
        <tbody>
          {foodCart.map((item, i) => (
            <tr className={i % 2 === 0 && `bg-gray-100`}>
              <td className={`border px-4 py-2`}>{item.name}</td>
              <td className={`border px-4 py-2`}>{item.quantity}</td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  };

  const render = async () => {
    news.map((item, i) => {
      items.push(
        <div className="item" key={i}>
          <Card
            overrides={{
              Root: {
                style: {
                  width: '100%',
                  margin: '10px auto 0px auto',
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
                      onClick={() => (window.location = `/user/${item.username}`)}
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
                        onClick={() => (window.location = `/post/${item._id}`)}
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
                          item.upVotes.includes(user._id) ||
                          upvoteIndex.includes(i) ||
                          upvoteHover.includes(i)
                            ? '#268bd2'
                            : '#aaa'
                        }
                        style={{ alignContent: 'center', cursor: 'pointer' }}
                        onMouseEnter={() => mouseOverUp(i)}
                        onMouseLeave={() => mouseOutUp(i)}
                        onClick={async () =>
                          await handleUpClick(
                            item.type,
                            item._id,
                            item.type === 'Comment' && item.postId
                          )
                        }
                      />
                      <div style={{ alignContent: 'center', marginBottom: 3 }}>
                        {item.voteTotal}
                      </div>
                      <ChevronDown
                        color={
                          item.downVotes.includes(user._id) ||
                          downvoteIndex.includes(i) ||
                          downvoteHover.includes(i)
                            ? '#268bd2'
                            : '#aaa'
                        }
                        size={25}
                        style={{ alignContent: 'center', cursor: 'pointer' }}
                        onMouseEnter={() => mouseOverDown(i)}
                        onMouseLeave={() => mouseOutDown(i)}
                        onClick={async () =>
                          await handleDownClick(
                            item.type,
                            item._id,
                            item.type === 'Comment' && item.postId
                          )
                        }
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
                                <div class="text-sm my-1 mt-4">
                                  {item.text && `Address: ${JSON.parse(item.text).address}`}
                                </div>
                                <div className="text-sm my-1 mt-4">
                                  {item && `Description: ${JSON.parse(item.text).foodDescription}`}
                                </div>
                                <div className="mt-4"></div>
                                {item.text &&
                                  JSON.parse(item.text).type === 'food' &&
                                  foodCartJSX(JSON.parse(item.text).foodCart)}
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
                                    onClick={() =>
                                      (window.location = `/user/${item.parent.username}`)
                                    }
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
                                      (window.location = `/post/${item.parent && item.parent._id}`)
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
                                        {item.parent &&
                                          `Description: ${item.parent.foodDescription}`}
                                      </div>
                                      <div className="mt-4"></div>
                                      {item.parent.text &&
                                        JSON.parse(item.parent.text).type === 'food' &&
                                        foodCartJSX(JSON.parse(item.parent.text).foodCart)}
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
                            {/* {overFlowList[item._id] === true && (
                              <div
                                className="fade"
                                style={{
                                  background: `linear-gradient(180deg, rgba(255,255,255,0) 0%, rgba(255,255,255, 1) 100%)`,
                                  height: `100px`,
                                  marginTop: `-100px`,
                                  position: `relative`
                                }}
                              />
                            )} */}
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
                              onClick={() => (window.location = '/submit')}
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

                                  window.location = `/post/${item._id}`;
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
                  {/* <div style={{ display: 'flex', alignContent: 'center' }}>
                  <Button
                    style={{ padding: 0, cursor: 'initial', backgroundColor: 'white' }}
                    kind="minimal"
                    size={SIZE.compact}
                  >
                    <div style={{ textTransform: 'uppercase', fontSize: 12 }}>
                      <strong>{0}&nbsp;&nbsp;Views</strong>
                    </div>
                  </Button>
                </div> */}
                  {confetti && <Confetti width={width} height={height} recycle={false} />}
                  {item.type === 'Post' && !item.completed && (
                    <div style={{ display: 'flex', alignContent: 'center', marginLeft: 15 }}>
                      <Button
                        style={{ outline: 'none', padding: 0 }}
                        kind="minimal"
                        size={SIZE.compact}
                        onClick={() => {
                          if (item.assignedUser) {
                            alert(
                              'someone is already helping on this task - please look other requests'
                            );
                            return;
                          }

                          if (
                            window.confirm(
                              'Please confirm your committment to helping this person - by saying yes, other people cannot claim this request.'
                            )
                          ) {
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
                          <div style={{ marginLeft: 5, textTransform: 'uppercase', fontSize: 12 }}>
                            <strong>Share</strong>
                          </div>
                        </Button>
                      </StatefulPopover>
                    </CopyToClipboard>
                  </div>
                  <div style={{ display: 'flex', alignContent: 'center', marginLeft: 15 }}>
                    <Button
                      style={{ outline: 'none', padding: 0 }}
                      kind="minimal"
                      size={SIZE.compact}
                      onClick={() => (window.location = `/post/${item._id}`)}
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

  async function loadNewsfeedHelper() {
    if (pages === '') {
    } else if (Number(currentPage) < Number(pages)) {
      let nextPage = Number(currentPage) + 1;
      console.log('here');
      await loadNewsfeedDispatch({ env: process.env.NODE_ENV, page: nextPage, feed: newsfeedSort });
      for (var j = 0; j < newsfeed.length; j++) {
        if (newsfeedDictionary[newsfeed[j]._id] === undefined) {
          news.push(newsfeed[j]);
          newsfeedDictionary[newsfeed[j]._id] = true;
        }
      }
    } else {
      setHasMoreItems(false);
      console.log('not here');
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
        background: `url(https://d1ppmvgsdgdlyy.cloudfront.net/pangaea.jpg)`,
        backgroundPosition: '50% 50%',
        backgroundSize: 'cover'
      }}
    >
      <Navigation searchBarPosition="center" />
      {authenticated ? (
        <table class="table-auto" style={{ width: '100%', background: '#F5F5F5' }}>
          <thead>
            <tr>
              <th class="px-4 py-2 text-right" style={{ width: '25%' }}>
                <div
                  style={{
                    width: '100%',
                    height: `calc(100vh - 70px + ${60 + items.length * 60}px)`
                  }}
                >
                  <div
                    className="text-black transition duration-150 hover:text-indigo-600 flex items-center justify-between"
                    style={{ cursor: 'pointer', paddingLeft: 24, paddingTop: 30 }}
                  >
                    <span />
                    <div className='flex items-center'>
                      <img
                        src="https://d1ppmvgsdgdlyy.cloudfront.net/search.svg"
                        alt="search"
                        style={{ height: 20, marginRight: 10 }}
                      />
                      Discover Tasks
                    </div>
                  </div>
                  <div
                    className="text-black transition duration-150 hover:text-indigo-600 flex items-center justify-between"
                    style={{ cursor: 'pointer', paddingLeft: 24, paddingTop: 10 }}
                  >
                    <span />
                    <div className='flex items-center'>
                      <img
                        src="https://d1ppmvgsdgdlyy.cloudfront.net/care.svg"
                        alt="care"
                        style={{ height: 20, marginRight: 10 }}
                      />
                      Your Tasks
                    </div>
                  </div>
                  <div
                    className="text-black transition duration-150 hover:text-indigo-600 flex items-center justify-between"
                    style={{ cursor: 'pointer', paddingLeft: 24, paddingTop: 10 }}
                  >
                    <span />
                    <div className='flex items-center'>
                      <img
                        src="https://d1ppmvgsdgdlyy.cloudfront.net/gift.svg"
                        alt="gift"
                        style={{ height: 20, marginRight: 10 }}
                      />
                      Completed Tasks
                    </div>
                  </div>
                  <div
                    className="text-black transition duration-150 hover:text-indigo-600 flex items-center justify-between"
                    style={{ cursor: 'pointer', paddingLeft: 24, paddingTop: 10 }}
                  >
                    <span />
                    <div className='flex items-center'>
                      <img
                        src="https://d1ppmvgsdgdlyy.cloudfront.net/global.svg"
                        alt="global"
                        style={{ height: 20, marginRight: 10 }}
                      />
                      Global Tasks
                    </div>
                  </div>
                </div>
              </th>
              <th class="px-4 py-2" style={{ width: '50%' }}>
                <div
                  style={{
                    width: '100%',
                    height: `calc(100vh - 70px + ${60 + items.length * 60}px)`
                  }}
                >
                  <div style={{ paddingLeft: 24, paddingRight: 24, paddingTop: 30 }}>
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
                                //   label: 'Home'
                                // },
                                // {
                                //   label: 'Popular'
                                // },
                                // {
                                //   label: 'Newest'
                                // },
                                {
                                  label: 'Discover'
                                }
                              ]}
                              onItemSelect={item => {
                                close();
                                switch (item.item.label) {
                                  case 'Home':
                                    window.location = '/';
                                    break;
                                  case 'Popular':
                                    window.location = '/home/popular';
                                    break;
                                  case 'Newest':
                                    window.location = '/home/newest';
                                    break;
                                  case 'Discover':
                                    window.location = '/home/discover';
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
                            style={{ marginRight: 10 }}
                            endEnhancer={() => <ChevronDown size={24} />}
                          >
                            {newsfeedSort}
                          </Button>
                        </StatefulPopover>
                        <Input
                          value={newPost}
                          onClick={() => (window.location = '/submit')}
                          onChange={event => setNewPost(event.currentTarget.value)}
                          placeholder="Ask for help / assistance"
                        />
                        <Button
                          onClick={() => (window.location = '/submit')}
                          kind="secondary"
                          style={{ marginLeft: 10, fontSize: 14 }}
                          shape={SHAPE.square}
                        >
                          Submit
                        </Button>
                      </div>
                    </Card>
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
                        {id !== 'discover' ? `You don't follow anyone yet :(` : 'No requests yet'}
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
              <th class="px-4 py-2" style={{ width: '25%' }}></th>
            </tr>
          </thead>
        </table>
      ) : (
        <div style={{ paddingLeft: 24, paddingRight: 24, height: `calc(100vh - 70px)` }}>
          <Block>
            <h1 style={{ fontSize: 64, color: 'white' }}>We're one big family</h1>
            <h2 style={{ color: 'rgb(247, 242, 233)' }}>
              Request help or give to neighbors in need.
            </h2>
          </Block>
        </div>
      )}
    </div>
  );
}

const mapDispatchToProps = dispatch => ({
  getCurrentUserDispatch: payload => dispatch(getCurrentUser(payload)),
  loadNewsfeedDispatch: payload => dispatch(loadNewsfeed(payload)),
  upvoteDispatch: payload => dispatch(upvote(payload)),
  downvoteDispatch: payload => dispatch(downvote(payload)),
  addCommentDispatch: payload => dispatch(addComment(payload)),
  addReplyDispatch: payload => dispatch(addReply(payload))
});

const mapStateToProps = state => ({
  user: state.auth.user,
  newsfeed: state.auth.newsfeed,
  currentPage: state.auth.currentPage,
  pages: state.auth.pages,
  numOfResults: state.auth.numOfResults,
  newsfeedSuccess: state.auth.newsfeedSuccess,
  newsfeedUpdated: state.auth.newsfeedUpdated,
  newsfeedLoading: state.auth.newsfeedLoading
});

Home.defaultProps = {};

Home.propTypes = {};

export default connect(mapStateToProps, mapDispatchToProps)(Home);
