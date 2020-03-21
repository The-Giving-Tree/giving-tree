import * as React from 'react';
import {
  HeaderNavigation,
  ALIGN,
  StyledNavigationItem as NavigationItem,
  StyledNavigationList as NavigationList
} from 'baseui/header-navigation';
import { StyledLink as Link } from 'baseui/link';
import { useStyletron } from 'baseui';
import { Button, SHAPE } from 'baseui/button';
import { Input, SIZE } from 'baseui/input';
import { Tag, VARIANT, KIND } from 'baseui/tag';
import { StatefulMenu } from 'baseui/menu';
import { withHistory } from 'slate-history';
import queryString from 'query-string';
import { StatefulSelect as Search, TYPE } from 'baseui/select';
import { ContextMenu, hideMenu, ContextMenuTrigger } from 'react-contextmenu';
import { StatefulTooltip } from 'baseui/tooltip';
import Navigation from './Navigation';
import { css } from 'emotion';
import { Avatar } from 'baseui/avatar';
import { Redirect } from 'react-router-dom';
import { Card, StyledBody, StyledAction } from 'baseui/card';
import { Block } from 'baseui/block';
import { H1, H2, H3, H4, H5, H6 } from 'baseui/typography';
import { Editable, withReact, useSlate, ReactEditor, Slate } from 'slate-react';
import { Text, Transforms, Editor, createEditor, Range } from 'slate';
import { Upload, ChevronUp, ChevronDown } from 'baseui/icon';
import { Drawer } from 'baseui/drawer';
import { Notification } from 'baseui/notification';
import moment from 'moment';
import axios from 'axios';
import isHotkey from 'is-hotkey';
import { Modal, ModalHeader, ModalBody, ModalFooter, ModalButton } from 'baseui/modal';
import ROUTES from '../utils/routes';
import {
  ButtonEditor,
  Icon,
  Toolbar,
  LIST_TYPES,
  HOTKEYS,
  Portal,
  Menu,
  Element,
  withImages,
  withRichText
} from './submitHelper';

import { connect } from 'react-redux';

import {
  getCurrentUser,
  loadUser,
  editComment,
  deleteComment,
  addComment,
  loadPost,
  upvote,
  downvote,
  addReply,
  markSeen
} from '../store/actions/auth/auth-actions';

import { editPost } from '../store/actions/user/user-actions';

const Leaf = ({ attributes, children, leaf }) => {
  if (leaf.bold) {
    children = <strong>{children}</strong>;
  }

  if (leaf.code) {
    children = <code>{children}</code>;
  }

  if (leaf.italic) {
    children = <em>{children}</em>;
  }

  if (leaf.underline) {
    children = <u>{children}</u>;
  }

  if (leaf.annotated) {
    children = (
      <div style={{ backgroundColor: 'rgb(255, 225, 104)', opacity: '30%' }}>{children}</div>
    );
  }

  return (
    <span
      className={css`
        font-weight: ${leaf.bold && 'bold'};
        background-color: ${leaf.highlight && 'rgb(255, 225, 104)'};
      `}
      {...attributes}
    >
      {children}
    </span>
  );
};

const isBlockActive = (editor, format) => {
  const [match] = Editor.nodes(editor, {
    match: n => n.type === format,
    mode: 'all'
  });

  return !!match;
};

const isMarkActive = (editor, format) => {
  const marks = Editor.marks(editor);
  return marks ? marks[format] === true : false;
};

// check to see if valid user or not
// if valid, show
// if invalid, redirect to error page

function Post(props) {
  const {
    user,
    foundUser,
    errorMessage,
    foundPost,
    getCurrentUserDispatch,
    loadPostDispatch,
    downvoteDispatch,
    upvoteDispatch,
    loadUserDispatch,
    newsfeedUpdated,
    loadPostSuccess,
    editCommentDispatch,
    deleteCommentDispatch,
    addCommentDispatch,
    addReplyDispatch,
    markSeenDispatch,
    editPostDispatch,
    markSeenBool,
    markSeenFailure,
    editPostLoading,
    editPostSuccess,
    editPostFailure
  } = props;
  const id = props.match.params.id;
  let parsed = queryString.parse(window.location.href);
  parsed = Object.values(parsed)[0];

  const renderElement = React.useCallback(props => <Element {...props} />, []);
  const renderLeaf = React.useCallback(props => <Leaf {...props} />, []);

  const [title, setTitle] = React.useState('');
  const [updated, setUpdated] = React.useState(true);
  const [upvoteIndex, setUpvoteIndex] = React.useState([]);
  const [downvoteIndex, setDownvoteIndex] = React.useState([]);
  const [upvoteHover, setUpvoteHover] = React.useState([]);
  const [downvoteHover, setDownvoteHover] = React.useState([]);
  const [hiddenElements, setHidden] = React.useState([]);
  const [replyArray, setReplyArray] = React.useState([]);
  const [editArray, setEditArray] = React.useState([]);
  const [editState, setEditState] = React.useState({});
  const [annotationOpen, setAnnotationOpen] = React.useState(false);
  const [deleteModal, setDeleteModal] = React.useState(false);
  const [deleteChild, setDeleteChild] = React.useState({});
  const [postComment, setPostComment] = React.useState('');
  const [successComment, setSuccessComment] = React.useState(false);
  const [editor, setEditor] = React.useState(false);

  const [tags, setTags] = React.useState([]);
  const initialValue = [
    {
      type: 'paragraph',
      children: [{ text: 'Loading' }]
    }
  ];
  const [slateValue, setSlateValue] = React.useState(initialValue);
  const addTag = tag => {
    setTags([...tags, tag]);
  };
  const removeTag = tag => {
    setTags(tags.filter(t => t !== tag));
  };

  const slateEditor = React.useMemo(
    () => withImages(withRichText(withFormatting(withHistory(withReact(createEditor()))))),
    []
  );

  // not null
  if (parsed !== null && !markSeenBool && !markSeenFailure) {
    markSeenDispatch({ env: process.env.NODE_ENV, postId: id, userId: parsed });
  }

  React.useEffect(() => {
    loadPostDispatch({
      env: process.env.NODE_ENV,
      id
    });
    setUpdated(false);
  }, [props.newsfeed, props.newsfeedUpdated, id, loadPostDispatch, editPostSuccess]);

  React.useEffect(() => {
    console.log('updating state');
    if (!isEmpty(foundPost) && loadPostSuccess) {
      setTitle(foundPost.title);
      setTags(foundPost.categories);
      setSlateValue(JSON.parse(foundPost.text));
    }
  }, [foundPost, loadPostSuccess]);

  const isEmpty = obj => {
    for (var key in obj) {
      if (obj.hasOwnProperty(key)) return false;
    }
    return true;
  };

  const handlePostLoad = async id => {
    if (isEmpty(foundPost) || !updated) {
      await loadPostDispatch({
        env: process.env.NODE_ENV,
        id
      });
      setUpdated(true);
    }
  };

  handlePostLoad(id);

  async function handleUpClick(type, _id, postId = '') {
    if (isEmpty(user)) {
      alert('need to login first!');
    } else {
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
  }

  async function handleDownClick(type, _id, postId = '') {
    if (isEmpty(user)) {
      alert('need to login first!');
    } else {
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

  function handleCancelReply(id) {
    setReplyArray(replyArray.filter(item => item !== id));
  }

  function handleCancelEdit(id) {
    setEditArray(editArray.filter(item => item !== id));
  }

  function generateHash(username = '') {
    const secret = 'giving_tree';
    const hash = require('crypto')
      .createHmac('sha256', secret)
      .update(username.toLowerCase())
      .digest('hex');

    return 'https://d1ppmvgsdgdlyy.cloudfront.net/user/' + hash;
  }

  function generateCommentHTML(childComment, leftIndent) {
    return (
      <div
        style={{
          alignContent: 'center',
          marginLeft: Number(leftIndent) + 25,
          background: id === childComment._id ? '#FDF7E3' : ''
        }}
      >
        <div style={{ display: 'table' }}>
          <div style={{ textAlign: 'center' }}>
            <ChevronUp
              size={25}
              color={
                upvoteHover.includes(childComment._id) || childComment.upVotes.includes(user._id)
                  ? '#268bd2'
                  : '#aaa'
              }
              style={{ alignContent: 'center', cursor: 'pointer' }}
              onMouseEnter={() => mouseOverUp(childComment._id)}
              onMouseLeave={() => mouseOutUp(childComment._id)}
              onClick={async () =>
                await handleUpClick(
                  childComment.type,
                  childComment._id,
                  childComment.type === 'Comment' && childComment.postId
                )
              }
            />
            <div style={{ alignContent: 'center', marginBottom: 3 }}>{childComment.voteTotal}</div>
            <ChevronDown
              color={
                downvoteHover.includes(childComment._id) ||
                childComment.downVotes.includes(user._id)
                  ? '#268bd2'
                  : '#aaa'
              }
              size={25}
              style={{ alignContent: 'center', cursor: 'pointer' }}
              onMouseEnter={() => mouseOverDown(childComment._id)}
              onMouseLeave={() => mouseOutDown(childComment._id)}
              onClick={async () =>
                await handleDownClick(
                  childComment.type,
                  childComment._id,
                  childComment.type === 'Comment' && childComment.postId
                )
              }
            />
          </div>
          <div
            style={{
              display: 'table-cell',
              verticalAlign: 'middle',
              tableLayout: 'fixed',
              width: '100%'
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
              {childComment.type === 'Comment' && (
                <div>
                  <Block
                    overrides={{
                      Root: {
                        style: {
                          borderRadius: '10px'
                        }
                      }
                    }}
                    style={{ width: '100%', marginTop: 15 }}
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
                          onClick={() => (window.location = `/user/${childComment.username}`)}
                          style={{
                            width: 32,
                            height: 32,
                            background: `url(${generateHash(
                              childComment.username
                            )}), url(https://d1ppmvgsdgdlyy.cloudfront.net/acacia.svg)`,
                            backgroundPosition: '50% 50%',
                            backgroundSize: 'cover',
                            borderRadius: '50%',
                            marginRight: 10,
                            cursor: 'pointer'
                          }}
                        />
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                          <a
                            style={{ textDecoration: 'none', color: 'rgb(0, 121, 211)' }}
                            href={`/user/${childComment.username}`}
                          >
                            <strong>{childComment.username}</strong>
                          </a>
                          &nbsp;·&nbsp;
                          {moment(childComment.updatedAt).format('MMM D, YYYY h:mm A')}{' '}
                          {childComment.updatedAt !== childComment.createdAt && '(edited)'}
                          &nbsp;
                          {childComment.type === 'Post' && (
                            <React.Fragment>
                              ·&nbsp;
                              <a
                                href={`/post/${childComment._id}`}
                                style={{ textDecoration: 'none', color: 'rgb(0, 121, 211)' }}
                              >
                                {childComment.title || ''}
                              </a>
                            </React.Fragment>
                          )}
                        </div>
                      </div>
                    </div>
                    {editArray.includes(childComment._id) ? (
                      <div style={{ paddingTop: 5, paddingBottom: 10 }}>
                        <Input
                          overrides={{
                            InputContainer: {
                              style: {
                                border: 0,
                                borderRadius: '5px'
                              }
                            }
                          }}
                          autoFocus
                          value={editState[childComment._id]}
                          onChange={event => {
                            let copyEditState = Object.assign({}, editState);
                            copyEditState[childComment._id.toString()] = event.currentTarget.value;
                            setEditState(copyEditState);
                          }}
                          size={SIZE.compact}
                          onKeyPress={event => {
                            var code = event.keyCode || event.which;
                            if (code === 13 && event.target.value !== '') {
                              // submit comment edit
                              editCommentDispatch({
                                env: process.env.NODE_ENV,
                                postId: foundPost._id,
                                commentId: childComment._id,
                                newContent: editState[childComment._id]
                              });

                              // close
                              handleCancelEdit(childComment._id);
                            }
                          }}
                          placeholder="add a comment..."
                        />
                        <div
                          style={{
                            fontSize: 12,
                            marginLeft: 6,
                            cursor: 'pointer',
                            color: 'rgb(0, 121, 211)'
                          }}
                          onClick={() => handleCancelEdit(childComment._id)}
                        >
                          cancel
                        </div>
                      </div>
                    ) : (
                      <div style={{ marginTop: 10 }}>
                        <StyledBody>{childComment.content}</StyledBody>
                      </div>
                    )}
                  </Block>
                  <div
                    style={{
                      display: 'flex',
                      alignContent: 'center',
                      marginTop: -10,
                      opacity: '50%'
                    }}
                  >
                    <Button
                      style={{ padding: 0 }}
                      onClick={() => setReplyArray(replyArray.concat(childComment._id))}
                      kind="minimal"
                      size={SIZE.compact}
                    >
                      <img
                        src="https://d1ppmvgsdgdlyy.cloudfront.net/reply.svg"
                        alt="reply"
                        style={{ height: 10, width: 'auto', display: 'block' }}
                      />
                      <div style={{ marginLeft: 5, textTransform: 'capitalize', fontSize: 10 }}>
                        <strong>Reply</strong>
                      </div>
                    </Button>
                    {childComment.username === user.username && (
                      <React.Fragment>
                        <Button
                          style={{ padding: 0, marginLeft: 4 }}
                          onClick={() => {
                            let copyEditState = Object.assign({}, editState);
                            copyEditState[childComment._id.toString()] = childComment.content; // update the name property, assign a new value
                            setEditState(copyEditState);
                            setEditArray(editArray.concat(childComment._id));
                          }}
                          kind="minimal"
                          size={SIZE.compact}
                        >
                          <div style={{ marginLeft: 5, textTransform: 'capitalize', fontSize: 10 }}>
                            <strong>Edit</strong>
                          </div>
                        </Button>
                        <Button
                          style={{ padding: 0, marginLeft: 4 }}
                          onClick={() => {
                            setDeleteModal(true);
                            setDeleteChild(childComment);
                          }}
                          kind="minimal"
                          size={SIZE.compact}
                        >
                          <div style={{ marginLeft: 5, textTransform: 'capitalize', fontSize: 10 }}>
                            <strong>Delete</strong>
                          </div>
                        </Button>
                        <Modal onClose={() => setDeleteModal(false)} isOpen={deleteModal}>
                          <ModalHeader>Delete Comment?</ModalHeader>
                          <ModalBody>
                            This cannot be undone. Comment and replies will be removed from your
                            profile and the newsfeed of any accounts that follow you.
                          </ModalBody>
                          <ModalFooter>
                            <ModalButton
                              size={'compact'}
                              kind={'minimal'}
                              onClick={() => setDeleteModal(false)}
                            >
                              Cancel
                            </ModalButton>
                            <ModalButton
                              size={'compact'}
                              onClick={() => {
                                deleteCommentDispatch({
                                  env: process.env.NODE_ENV,
                                  postId: foundPost._id,
                                  commentId: deleteChild._id
                                });
                                setDeleteModal(false);
                              }}
                            >
                              Delete
                            </ModalButton>
                          </ModalFooter>
                        </Modal>
                      </React.Fragment>
                    )}
                  </div>
                  {replyArray.includes(childComment._id) && (
                    <div style={{ paddingTop: 5, paddingBottom: 10 }}>
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
                        autoFocus
                        size={SIZE.compact}
                        onKeyPress={event => {
                          var code = event.keyCode || event.which;
                          if (code === 13 && event.target.value !== '') {
                            addReplyDispatch({
                              env: process.env.NODE_ENV,
                              postId: foundPost._id,
                              commentId: childComment._id,
                              newReply: event.target.value
                            });

                            // close
                            handleCancelReply(childComment._id);
                          }
                        }}
                        placeholder="add a comment..."
                      />
                      <div
                        style={{
                          fontSize: 12,
                          marginLeft: 6,
                          cursor: 'pointer',
                          color: 'rgb(0, 121, 211)'
                        }}
                        onClick={() => handleCancelReply(childComment._id)}
                      >
                        cancel
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  function mouseOverDown(i) {
    setDownvoteHover(downvoteHover.concat(i));
  }

  function recursiveCommentGenerator(comments, leftIndent) {
    let returnDOM = [];
    if (comments && comments.length > 0) {
      for (var index = 0; index < comments.length; index++) {
        const childComment = comments[index];

        let existingElement = generateCommentHTML(childComment, leftIndent);

        if (childComment.comments.length > 0) {
          let newElement = recursiveCommentGenerator(
            childComment.comments,
            Number(leftIndent) + 25
          );

          returnDOM.push(
            <div>
              {existingElement}
              {newElement}
            </div>
          );
        } else {
          returnDOM.push(existingElement);
        }
      }
      return returnDOM;
    }
  }

  let commentFeed = '';
  const createCommentFeed = async () => {
    commentFeed = recursiveCommentGenerator(foundPost.comments, 0);
  };

  createCommentFeed();

  const HoveringToolbar = () => {
    const ref = React.useRef();
    const slateEditor = useSlate();

    React.useEffect(() => {
      const el = ref.current;
      const { selection } = slateEditor;

      if (!el) {
        return;
      }

      if (
        !selection ||
        !ReactEditor.isFocused(slateEditor) ||
        editor || // cannot be editing document
        Range.isCollapsed(selection) ||
        Editor.string(slateEditor, selection) === ''
      ) {
        el.removeAttribute('style');
        return;
      }

      const domSelection = window.getSelection();
      console.log('dom selection: ', domSelection);
      const domRange = domSelection.getRangeAt(0);
      console.log('range: ', domRange);
      const rect = domRange.getBoundingClientRect();
      el.style.opacity = 1;
      el.style.top = `${rect.top + window.pageYOffset - el.offsetHeight}px`;
      el.style.left = `${rect.left + window.pageXOffset - el.offsetWidth / 2 + rect.width / 2}px`;
    });

    return (
      <Portal>
        <Menu
          ref={ref}
          className={css`
            padding: 8px 7px 6px;
            position: absolute;
            z-index: 1;
            top: -10000px;
            left: -10000px;
            margin-top: -6px;
            opacity: 0;
            background-color: #222;
            border-radius: 4px;
            transition: opacity 0.75s;
          `}
        >
          <FormatButton format="annotate" icon="create" />
        </Menu>
      </Portal>
    );
  };

  const search = 'text';

  const decorate = React.useCallback(
    ([node, path]) => {
      const ranges = [];

      if (search && Text.isText(node)) {
        const { text } = node;
        const parts = text.split(search);
        let offset = 0;

        parts.forEach((part, i) => {
          if (i !== 0) {
            ranges.push({
              anchor: { path, offset: offset - search.length },
              focus: { path, offset },
              highlight: true
            });
          }

          offset = offset + part.length + search.length;
        });
      }

      return ranges;
    },
    [search]
  );

  return (
    <div style={{ width: '100%' }}>
      <Navigation searchBarPosition="center" />
      {successComment && (
        <Notification
          autoHideDuration={3000}
          overrides={{
            Body: {
              style: {
                position: 'fixed',
                margin: '0 auto',
                bottom: 0,
                textAlign: 'center',
                backgroundColor: 'rgb(54, 135, 89)',
                color: 'white'
              }
            }
          }}
          kind={'positive'}
        >
          Added comment successfully!
        </Notification>
      )}
      <div style={{ width: '100%', background: '#F5F5F5', height: 'calc(100vh - 70px)' }}>
        {errorMessage ? (
          <div
            style={{
              color: 'rgb(204, 50, 63)',
              margin: '0 auto',
              textAlign: 'center',
              paddingTop: 30
            }}
          >
            {errorMessage}
          </div>
        ) : (
          <React.Fragment>
            <Drawer
              isOpen={annotationOpen}
              autoFocus
              size={'auto'}
              overrides={{ Backdrop: { style: { opacity: 0 } }, Close: { style: { border: 0 } } }}
              onClose={() => setAnnotationOpen(false)}
            >
              <div style={{ width: '17vw' }}>NOTES!</div>
            </Drawer>
            <div style={{ paddingLeft: 24, paddingRight: 24, paddingTop: 50 }}>
              {!isEmpty(foundPost) && (
                <React.Fragment>
                  <ContextMenuTrigger id="giving-tree-editor">
                    <Card
                      overrides={{
                        Root: {
                          style: {
                            width: '55%',
                            margin: '10px auto 0px auto'
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
                            alignItems: 'center'
                          }}
                        >
                          <div
                            onClick={() => (window.location = `/user/${foundPost.username}`)}
                            style={{
                              width: 32,
                              height: 32,
                              background: `url(${generateHash(
                                foundPost.username
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
                                href={`/user/${foundPost.username}`}
                              >
                                {foundPost.username}
                              </a>
                            </strong>{' '}
                            ·{' '}
                            <StatefulTooltip
                              content={moment(foundPost.updatedAt).format('MMM D, YYYY h:mm A')}
                            >{`${
                              foundPost.createdAt === foundPost.updatedAt ? 'published' : 'updated'
                            } ${moment(new Date(foundPost.updatedAt)).fromNow()}`}</StatefulTooltip>
                          </div>
                          {/* <div style={{ textTransform: 'capitalize' }}>&nbsp;·&nbsp;{0}&nbsp;Views</div> */}
                        </div>
                        <div style={{ alignContent: 'flex-start' }}>
                          <div style={{ display: 'flex', alignContent: 'center' }}>
                            {foundPost.type === 'Post' &&
                              !editor &&
                              foundPost.categories.map(i => (
                                <Tag
                                  overrides={{
                                    Root: {
                                      style: {
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
                            {!isEmpty(user) &&
                              user._id.toString() === foundPost.authorId.toString() &&
                              (editor ? (
                                <div>
                                  <Button
                                    style={{ marginRight: 10, marginLeft: 10, fontSize: '12px' }}
                                    size={'compact'}
                                    shape={'pill'}
                                    kind={'secondary'}
                                    onClick={() => setEditor(false)}
                                  >
                                    Cancel
                                  </Button>
                                  <Button
                                    style={{
                                      fontSize: '12px',
                                      backgroundColor: '#03a87c',
                                      color: 'white'
                                    }}
                                    size={SIZE.compact}
                                    kind={KIND.secondary}
                                    shape={SHAPE.pill}
                                    disabled={editPostLoading}
                                    onClick={() => {
                                      editPostDispatch({
                                        env: process.env.NODE_ENV,
                                        postId: foundPost._id,
                                        title,
                                        text: JSON.stringify(slateValue),
                                        categories: tags.join(',')
                                      });

                                      setEditor(false);
                                    }}
                                  >
                                    {editPostLoading
                                      ? 'Saving...'
                                      : editPostSuccess
                                      ? 'Saved'
                                      : 'Save'}
                                  </Button>
                                </div>
                              ) : (
                                <img
                                  onClick={() => {
                                    setEditor(true);
                                  }}
                                  src="https://d1ppmvgsdgdlyy.cloudfront.net/edit.svg"
                                  alt="edit"
                                  style={{
                                    marginLeft: 15,
                                    width: 15,
                                    height: 'auto',
                                    cursor: 'pointer'
                                  }}
                                />
                              ))}
                          </div>
                        </div>
                      </div>
                      <div style={{ alignContent: 'center' }}>
                        <div style={{ display: 'table' }}>
                          <div style={{ textAlign: 'center' }}>
                            <ChevronUp
                              size={25}
                              color={
                                upvoteHover.includes(foundPost._id) ||
                                foundPost.upVotes.includes(user._id)
                                  ? '#268bd2'
                                  : '#aaa'
                              }
                              style={{ alignContent: 'center', cursor: 'pointer' }}
                              onMouseEnter={() => mouseOverUp(foundPost._id)}
                              onMouseLeave={() => mouseOutUp(foundPost._id)}
                              onClick={async () =>
                                await handleUpClick(
                                  foundPost.type,
                                  foundPost._id,
                                  foundPost.type === 'Comment' && foundPost.postId
                                )
                              }
                            />
                            <div style={{ alignContent: 'center', marginBottom: 3 }}>
                              {foundPost.voteTotal}
                            </div>
                            <ChevronDown
                              color={
                                downvoteHover.includes(foundPost._id) ||
                                foundPost.downVotes.includes(user._id)
                                  ? '#268bd2'
                                  : '#aaa'
                              }
                              size={25}
                              style={{ alignContent: 'center', cursor: 'pointer' }}
                              onMouseEnter={() => mouseOverDown(foundPost._id)}
                              onMouseLeave={() => mouseOutDown(foundPost._id)}
                              onClick={async () =>
                                await handleDownClick(
                                  foundPost.type,
                                  foundPost._id,
                                  foundPost.type === 'Comment' && foundPost.postId
                                )
                              }
                            />
                          </div>
                          <div
                            style={{
                              display: 'table-cell',
                              verticalAlign: 'middle',
                              tableLayout: 'fixed',
                              width: '100%'
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
                              {editor ? (
                                <Input
                                  onChange={event => {
                                    setTitle(event.target.value);
                                  }}
                                  size={'compact'}
                                  value={title}
                                ></Input>
                              ) : (
                                <div
                                  style={{
                                    textTransform: 'capitalize',
                                    fontSize: 16,
                                    marginTop: 15
                                  }}
                                >
                                  <strong>{foundPost.title}</strong>
                                </div>
                              )}
                              <div
                                style={{ marginTop: 5 }}
                                onClick={() => {
                                  // setAnnotationOpen(!editor ? true : false);
                                }}
                              >
                                {foundPost.type === 'Post' ? (
                                  <div style={{ marginTop: 20 }}>
                                    <Slate
                                      editor={slateEditor}
                                      value={slateValue}
                                      onChange={value => {
                                        setSlateValue(editor ? value : slateValue);
                                      }}
                                    >
                                      <HoveringToolbar />
                                      {editor && (
                                        <Toolbar>
                                          <MarkButton format="bold" icon="format_bold" />
                                          <MarkButton format="italic" icon="format_italic" />
                                          <MarkButton format="underline" icon="format_underlined" />
                                          <MarkButton format="code" icon="code" />
                                          <BlockButton format="heading-one" icon="looks_one" />
                                          <BlockButton format="heading-two" icon="looks_two" />
                                          <BlockButton format="block-quote" icon="format_quote" />
                                          <BlockButton
                                            format="numbered-list"
                                            icon="format_list_numbered"
                                          />
                                          <BlockButton
                                            format="bulleted-list"
                                            icon="format_list_bulleted"
                                          />
                                        </Toolbar>
                                      )}
                                      <Editable
                                        style={
                                          editor
                                            ? {}
                                            : {
                                                color: 'transparent',
                                                textShadow: '0 0 0 rgb(84, 84, 84)'
                                              }
                                        }
                                        renderLeaf={renderLeaf}
                                        renderElement={renderElement}
                                        spellCheck
                                        autoFocus
                                        decorate={decorate}
                                        onKeyDown={event => {
                                          for (const hotkey in HOTKEYS) {
                                            if (isHotkey(hotkey, event)) {
                                              event.preventDefault();
                                              const mark = HOTKEYS[hotkey];
                                              switch (mark) {
                                                case 'bold':
                                                case 'italic':
                                                case 'underline':
                                                case 'code':
                                                case 'annotate':
                                                  slateEditor.exec({
                                                    type: 'format_text',
                                                    properties: { [mark]: true }
                                                  });
                                                  break;
                                                case 'save':
                                                  console.log('summarize hot key');
                                                  break;
                                                case 'cut':
                                                  console.log(`cut`);
                                                  break;
                                                case 'paste':
                                                  console.log(`paste`);
                                                  break;
                                                case 'copy':
                                                  console.log(`copy`);
                                                  break;
                                                case 'latex':
                                                  console.log(`latex`);
                                                  break;
                                                case 'link':
                                                  console.log(`link`);
                                                  break;
                                                case 'insert_image':
                                                  console.log(`insert_image`);
                                                  break;
                                                default:
                                                  break;
                                              }
                                            }
                                          }
                                        }}
                                      />
                                    </Slate>
                                  </div>
                                ) : editor ? (
                                  <Input size={'compact'} value={foundPost.content}></Input>
                                ) : (
                                  foundPost.content
                                )}
                              </div>
                              {!editor && (
                                <div style={{ paddingTop: 5, paddingBottom: 10 }}>
                                  <Input
                                    overrides={{
                                      InputContainer: {
                                        style: {
                                          border: 0,
                                          borderRadius: '5px'
                                        }
                                      }
                                    }}
                                    autoFocus
                                    value={postComment}
                                    onChange={event => {
                                      setPostComment(event.target.value);
                                      setSuccessComment(false);
                                    }}
                                    size={SIZE.compact}
                                    onKeyPress={event => {
                                      var code = event.keyCode || event.which;
                                      if (code === 13 && event.target.value !== '') {
                                        // submit comment
                                        addCommentDispatch({
                                          env: process.env.NODE_ENV,
                                          postId: foundPost._id,
                                          newComment: postComment
                                        });
                                        // close
                                        setSuccessComment(true);
                                        setPostComment('');
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
                      <hr />
                      <div style={{ marginTop: 15 }}>{commentFeed}</div>
                    </Card>
                  </ContextMenuTrigger>
                  <ContextMenu id="giving-tree-editor">
                    <StatefulMenu
                      overrides={{
                        List: {
                          style: {
                            outline: 'none',
                            width: '347px',
                            borderRadius: '10px'
                          }
                        }
                      }}
                      onItemSelect={e => {
                        switch (e.item.command) {
                          case 'annotate':
                            console.log('annotate');
                            break;
                          case 'summarize':
                            console.log('summarize');
                            break;
                          default:
                            break;
                        }
                        hideMenu();
                      }}
                      items={[
                        {
                          command: 'annotate',
                          label: (
                            <div
                              style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center'
                              }}
                            >
                              <div style={{ display: 'flex', alignItems: 'center' }}>
                                <img
                                  src="https://d1ppmvgsdgdlyy.cloudfront.net/annotate.svg"
                                  alt="annotate"
                                  style={{
                                    height: '12px',
                                    marginRight: 7,
                                    alignItems: 'center'
                                  }}
                                />
                                <div>Annotate</div>
                              </div>
                              <div>⌘&nbsp;D</div>
                            </div>
                          )
                        },
                        {
                          command: 'summarize',
                          label: (
                            <div
                              style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center'
                              }}
                            >
                              <div style={{ display: 'flex', alignItems: 'center' }}>
                                <img
                                  src="https://d1ppmvgsdgdlyy.cloudfront.net/summary.svg"
                                  alt="summarize"
                                  style={{
                                    height: '12px',
                                    marginRight: 7,
                                    alignItems: 'center'
                                  }}
                                />
                                <div>Summarize</div>
                              </div>
                              <div>⌘&nbsp;S</div>
                            </div>
                          )
                        }
                      ]}
                    />
                  </ContextMenu>
                </React.Fragment>
              )}
            </div>
          </React.Fragment>
        )}
      </div>
    </div>
  );
}

const BlockButton = ({ format, icon }) => {
  const editorSlate = useSlate();
  return (
    <ButtonEditor
      active={isBlockActive(editorSlate, format)}
      onMouseDown={event => {
        event.preventDefault();
        editorSlate.exec({ type: 'format_block', format });
      }}
    >
      <Icon>{icon}</Icon>
    </ButtonEditor>
  );
};

const MarkButton = ({ format, icon }) => {
  const editorSlate = useSlate();
  return (
    <ButtonEditor
      active={isMarkActive(editorSlate, format)}
      onMouseDown={event => {
        event.preventDefault();
        editorSlate.exec({ type: 'format_text', properties: { [format]: true } });
      }}
    >
      <Icon>{icon}</Icon>
    </ButtonEditor>
  );
};

const toggleFormat = (editor, format) => {
  const isActive = isFormatActive(editor, format);
  Transforms.setNodes(
    editor,
    { [format]: isActive ? null : true },
    { match: Text.isText, split: true }
  );
};

const FormatButton = ({ format, icon }) => {
  const editor = useSlate();
  return (
    <ButtonEditor
      reversed
      active={isFormatActive(editor, format)}
      onMouseDown={event => {
        event.preventDefault();
        return toggleFormat(editor, format);
      }}
    >
      <Icon>{icon}</Icon>
    </ButtonEditor>
  );
};

const withFormatting = editor => {
  const { exec } = editor;

  editor.exec = command => {
    switch (command.type) {
      case 'toggle_format': {
        const { format } = command;
        const isActive = isFormatActive(editor, format);
        Editor.setNodes(
          editor,
          { [format]: isActive ? null : true },
          { match: Text.isText, split: true }
        );
        break;
      }

      default: {
        exec(command);
        break;
      }
    }
  };

  return editor;
};

const isFormatActive = (editor, format) => {
  const [match] = Editor.nodes(editor, {
    match: n => n[format] === true,
    mode: 'all'
  });
  return !!match;
};

const mapDispatchToProps = dispatch => ({
  getCurrentUserDispatch: payload => dispatch(getCurrentUser(payload)),
  loadUserDispatch: payload => dispatch(loadUser(payload)),
  editCommentDispatch: payload => dispatch(editComment(payload)),
  deleteCommentDispatch: payload => dispatch(deleteComment(payload)),
  markSeenDispatch: payload => dispatch(markSeen(payload)),
  editPostDispatch: payload => dispatch(editPost(payload)),
  addReplyDispatch: payload => dispatch(addReply(payload)),
  loadPostDispatch: payload => dispatch(loadPost(payload)),
  upvoteDispatch: payload => dispatch(upvote(payload)),
  downvoteDispatch: payload => dispatch(downvote(payload)),
  addCommentDispatch: payload => dispatch(addComment(payload))
});

const mapStateToProps = state => ({
  user: state.auth.user,
  foundUser: state.auth.foundUser,
  foundPost: state.auth.foundPost,
  errorMessage: state.auth.errorMessage,
  newsfeedUpdated: state.auth.newsfeedUpdated,
  loadPostSuccess: state.auth.loadPostSuccess,
  markSeenBool: state.auth.markSeen,
  markSeenFailure: state.auth.markSeenFailure,
  editPostLoading: state.user.editPostLoading,
  editPostSuccess: state.user.editPostSuccess,
  editPostFailure: state.user.editPostFailure
});

Post.defaultProps = {};

Post.propTypes = {};

export default connect(mapStateToProps, mapDispatchToProps)(Post);
