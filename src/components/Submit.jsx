import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Slate, Editable, ReactEditor, withReact, useSlate, useEditor } from 'slate-react';
import { Editor, Text, createEditor } from 'slate';
import ReactDOM from 'react-dom';
import isHotkey from 'is-hotkey';
import { Range } from 'slate';
import { css, cx } from 'emotion';
import { withHistory } from 'slate-history';
import imageExtensions from 'image-extensions';
import isUrl from 'is-url';
import {
  HeaderNavigation,
  ALIGN,
  StyledNavigationItem as NavigationItem,
  StyledNavigationList as NavigationList
} from 'baseui/header-navigation';
import moment from 'moment';
import { withStyle } from 'baseui';
import { StyledInputContainer } from 'baseui/input';
import Dropzone from 'react-dropzone';
import { StatefulTooltip } from 'baseui/tooltip';
import { StyledLink as Link } from 'baseui/link';
import { Button, SHAPE, KIND, SIZE } from 'baseui/button';
import { StatefulSelect as Search, TYPE } from 'baseui/select';
import { StatefulMenu } from 'baseui/menu';
import Navigation from './Navigation';
import { Avatar } from 'baseui/avatar';
import { Redirect } from 'react-router-dom';
import { Card, StyledBody, StyledAction } from 'baseui/card';
import { Block } from 'baseui/block';
import { H1, H2, H3, H4, H5, H6 } from 'baseui/typography';
import { Upload, ChevronUp, ChevronDown } from 'baseui/icon';
import { useStyletron } from 'baseui';
import { Input, StyledInput } from 'baseui/input';
import { Tag, VARIANT as TAG_VARIANT } from 'baseui/tag';
import { ContextMenu, hideMenu, ContextMenuTrigger } from 'react-contextmenu';
// Import the Slate editor factory.

import { connect } from 'react-redux';
import {
  ButtonEditor,
  Icon,
  Toolbar,
  Element,
  Leaf,
  LIST_TYPES,
  HOTKEYS,
  insertImage
} from './submitHelper';
import { getCurrentUser, loadUser } from '../store/actions/auth/auth-actions';
import {
  submitDraft,
  saveDraft,
  publishPost,
  handleSeenSubmit,
  uploadPhoto
} from '../store/actions/user/user-actions';
import { findByLabelText } from '@testing-library/dom';

const InputReplacement = ({ tags, removeTag, ...restProps }) => {
  const [css] = useStyletron();
  return (
    <div
      className={css({
        flex: '1 1 0%',
        flexWrap: 'wrap',
        display: 'flex',
        alignItems: 'center'
      })}
    >
      {tags.map((tag, index) => (
        <Tag
          variant={TAG_VARIANT.solid}
          kind="positive"
          onActionClick={() => removeTag(tag)}
          key={index}
        >
          {tag}
        </Tag>
      ))}
      <StyledInput {...restProps} />
    </div>
  );
};

// check to see if valid user or not
// if valid, show
// if invalid, redirect to error page

export const Portal = ({ children }) => {
  return ReactDOM.createPortal(children, document.body);
};

function Submit(props) {
  const {
    user,
    foundUser,
    errorMessage,
    submitDraftSuccess,
    submitDraftLoading,
    saveDraftLoading,
    saveDraftSuccess,
    submitPostSuccess,
    submittedDraft,
    submittedPost,
    submitDraftDispatch,
    saveDraftDispatch,
    publishPostDispatch,
    loadUserDispatch,
    handleSeenSubmitDispatch,
    getCurrentUserDispatch,
    markSeenSubmitTutorial,
    uploadPhotoDispatch,
    uploadPhotoUrl,
    uploadPhotoSuccess
  } = props;

  const [title, setTitle] = React.useState('');
  const [imagePreview, setPreview] = React.useState('');
  const [text, setText] = React.useState('');
  const [value, setValue] = React.useState('');
  const [tags, setTags] = React.useState([]);
  const [slateValue, setSlateValue] = React.useState(initialValue);
  const addTag = tag => {
    setTags([...tags, tag]);
  };
  const removeTag = tag => {
    setTags(tags.filter(t => t !== tag));
  };

  const imageUpload = useRef(null);

  let disabledSave =
    submitDraftLoading || saveDraftLoading || !title || !slateValue || tags.length === 0;

  const BlockButton = ({ format, icon }) => {
    const editor = useSlate();
    return (
      <ButtonEditor
        active={isBlockActive(editor, format)}
        onMouseDown={event => {
          event.preventDefault();
          editor.exec({ type: 'format_block', format });
        }}
      >
        <Icon>{icon}</Icon>
      </ButtonEditor>
    );
  };

  const MarkButton = ({ format, icon }) => {
    const editor = useSlate();
    return (
      <ButtonEditor
        active={isMarkActive(editor, format)}
        onMouseDown={event => {
          event.preventDefault();
          editor.exec({ type: 'format_text', properties: { [format]: true } });
        }}
      >
        <Icon>{icon}</Icon>
      </ButtonEditor>
    );
  };

  const isImageUrl = url => {
    if (!url) return false;
    if (url.includes('https://d1ppmvgsdgdlyy.cloudfront.net')) return true;
    return false;
    // if (!isUrl(url)) return false;
    // const ext = new URL(url).pathname.split('.').pop();
    // return imageExtensions.includes(ext);
  };

  const unwrapLink = editor => {
    Editor.unwrapNodes(editor, { match: n => n.type === 'link' });
  };

  const wrapLink = (editor, url) => {
    if (isLinkActive(editor)) {
      unwrapLink(editor);
    }

    const { selection } = editor;
    const isCollapsed = selection && Range.isCollapsed(selection);
    const link = {
      type: 'link',
      url,
      children: isCollapsed ? [{ text: url }] : []
    };

    if (isCollapsed) {
      Editor.insertNodes(editor, link);
    } else {
      Editor.wrapNodes(editor, link, { split: true });
      Editor.collapse(editor, { edge: 'end' });
    }
  };

  const withLinks = editor => {
    const { exec, isInline } = editor;

    editor.isInline = element => {
      return element.type === 'link' ? true : isInline(element);
    };

    editor.exec = command => {
      if (command.type === 'insert_link') {
        const { url } = command;

        if (editor.selection) {
          wrapLink(editor, url);
        }

        return;
      }

      let text;

      if (command.type === 'insert_data') {
        text = command.data.getData('text/plain');
      } else if (command.type === 'insert_text') {
        text = command.text;
      }

      if (text && isUrl(text)) {
        wrapLink(editor, text);
      } else {
        exec(command);
      }
    };

    return editor;
  };

  const withImages = editor => {
    const { insertData, isVoid } = editor;

    editor.isVoid = element => {
      return element.type === 'image' ? true : isVoid(element);
    };

    editor.insertData = data => {
      const text = data.getData('text/plain');
      const { files } = data;

      if (files && files.length > 0) {
        for (const file of files) {
          const reader = new FileReader();
          const [mime] = file.type.split('/');

          if (mime === 'image') {
            reader.addEventListener('load', () => {
              const url = reader.result;
              insertImage(editor, url);
            });

            reader.readAsDataURL(file);
          }
        }
      } else if (isImageUrl(text)) {
        insertImage(editor, text);
      } else {
        insertData(data);
      }
    };

    return editor;
  };

  const withRichText = editor => {
    const { exec } = editor;

    editor.exec = command => {
      if (command.type === 'format_block') {
        const { format } = command;
        const isActive = isBlockActive(editor, format);
        const isList = LIST_TYPES.includes(format);

        for (const f of LIST_TYPES) {
          Editor.unwrapNodes(editor, { match: n => n.type === f, split: true });
        }

        Editor.setNodes(editor, {
          type: isActive ? 'paragraph' : isList ? 'list-item' : format
        });

        if (!isActive && isList) {
          Editor.wrapNodes(editor, { type: format, children: [] });
        }
      } else {
        exec(command);
      }
    };

    return editor;
  };

  const editor = useMemo(
    () => withLinks(withImages(withRichText(withHistory(withReact(createEditor()))))),
    []
  );

  React.useEffect(() => {
    console.log('new update');
    async function updateUser() {
      await getCurrentUserDispatch({ env: process.env.NODE_ENV });
    }

    updateUser();
  }, [props.submitDraftSuccess, props.markSeenSubmitTutorial, getCurrentUserDispatch]);

  const handleKeyDown = event => {
    switch (event.keyCode) {
      // Enter
      case 13: {
        if (!value) return;
        addTag(value);
        setValue('');
        return;
      }
      // Backspace
      case 8: {
        if (value || !tags.length) return;
        removeTag(tags[tags.length - 1]);
        return;
      }
      default:
        break;
    }
  };

  const renderElement = React.useCallback(props => <Element {...props} />, []);
  const renderLeaf = React.useCallback(props => <Leaf {...props} />, []);

  const isEmpty = obj => {
    for (var key in obj) {
      if (obj.hasOwnProperty(key)) return false;
    }
    return true;
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

  React.useEffect(() => {
    if (uploadPhotoUrl !== '') {
      let newUploadPhotoUrl = uploadPhotoUrl;
      newUploadPhotoUrl = newUploadPhotoUrl.replace(
        `https://d1ppmvgsdgdlyy.cloudfront`,
        `https://d1ppmvgsdgdlyy.cloudfront.net`
      );

      // replace imagePreview with this url
      let old = JSON.stringify(slateValue);
      console.log('old: ', old);
      let newSlateValue = old.replace(`"${imagePreview}"`, `"${newUploadPhotoUrl}"`);
      console.log('newSlateValue: ', newSlateValue);
      setSlateValue(JSON.parse(newSlateValue));
    } else {
      console.log('still empty');
    }
  }, [uploadPhotoSuccess, uploadPhotoUrl]);

  const onDropImage = (files, editor) => {
    if (files.length > 1) {
      alert('only 1 picture is allowed at a time');
    } else {
      let preview = URL.createObjectURL(files[0]).toString();

      uploadPhotoDispatch({
        env: process.env.NODE_ENV,
        rawImage: files[0]
      });

      setPreview(preview);

      insertImage(editor, preview);
    }
  };

  const isLinkActive = editor => {
    const [link] = Editor.nodes(editor, { match: n => n.type === 'link' });
    return !!link;
  };

  const LinkButton = () => {
    const editor = useSlate();
    return (
      <ButtonEditor
        active={isLinkActive(editor)}
        onMouseDown={event => {
          event.preventDefault();
          const url = window.prompt('Enter the URL of the link:');
          if (!url) return;
          editor.exec({ type: 'insert_link', url });
        }}
      >
        <Icon>link</Icon>
      </ButtonEditor>
    );
  };

  const InsertImageButton = () => {
    const editor = useEditor();
    return (
      <Dropzone
        accept="image/*"
        onDrop={(files, rejectedFiles, event) => {
          onDropImage(files, editor);
        }}
        className="dropzone-box"
      >
        {({ getRootProps, getInputProps }) => (
          <section>
            <div {...getRootProps()} style={{ outline: 'none' }}>
              <input {...getInputProps()} />
              <ButtonEditor
                ref={imageUpload}
                onMouseDown={event => {
                  event.preventDefault();
                }}
              >
                <Icon>image</Icon>
              </ButtonEditor>
            </div>
          </section>
        )}
      </Dropzone>
    );
  };

  return (
    <div style={{ width: '100%' }}>
      <Navigation searchBarPosition="center" />
      <div style={{ width: '100%', background: '#F5F5F5', height: 'calc(100vh - 70px)' }}>
        <div style={{ paddingLeft: 24, paddingRight: 24, paddingTop: 50 }}>
          {!isEmpty(user) && !user.seenSubmitTutorial && (
            <Card
              overrides={{
                Root: {
                  style: {
                    width: '60%',
                    margin: '0 auto',
                    marginBottom: '30px'
                  }
                }
              }}
            >
              <div
                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
              >
                <div>
                  <Tag
                    overrides={{ Root: { style: { marginLeft: 0 } } }}
                    closeable={false}
                    variant={'variant'}
                    kind="accent"
                  >
                    Tutorial
                  </Tag>
                </div>
                <div
                  onClick={() =>
                    handleSeenSubmitDispatch({ env: process.env.NODE_ENV, type: 'submit' })
                  }
                  style={{ cursor: 'pointer', color: 'black' }}
                >
                  X
                </div>
              </div>
              <div style={{ marginTop: 15 }}>
                Welcome to Giving Tree! You can submit a claim to the community and get help! You can also message us at <a className="text-indigo-600 hover:text-indigo-800" href="tel:+1507-533-5281">507-533-5281</a> to get help.
              </div>
            </Card>
          )}
          {submitPostSuccess && (
            <Card
              overrides={{
                Root: {
                  style: {
                    width: '60%',
                    margin: '0 auto',
                    marginBottom: '30px',
                    color: 'green'
                  }
                }
              }}
            >
              Your post is now live! Check it out{' '}
              <a style={{ textDecoration: 'none' }} href={`/post/${submittedPost._id}`}>
                here
              </a>
              .
            </Card>
          )}
          <Card
            overrides={{
              Root: {
                style: {
                  width: '60%',
                  margin: '0 auto'
                }
              }
            }}
          >
            <div
              style={{ display: 'flex', justifyContent: 'space-between', alignContent: 'center' }}
            >
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <Input
                  className="green-placeholder"
                  value={title}
                  onChange={event => setTitle(event.currentTarget.value)}
                  overrides={{
                    Input: {
                      style: {
                        color: '#03a87c',
                        fontSize: '20px',
                        fontWeight: 'bold',
                        paddingLeft: '0px'
                      }
                    },
                    InputContainer: { style: { borderColor: 'white', backgroundColor: 'white' } }
                  }}
                  placeholder="I need help with..."
                  kind={'minimal'}
                />
              </div>
              <div style={{ display: 'flex', alignContent: 'center' }}>
                <div
                  style={{
                    marginRight: 15,
                    fontSize: '12px',
                    display: 'flex',
                    alignItems: 'center'
                  }}
                >
                  {(saveDraftSuccess || submitDraftSuccess) &&
                    !isEmpty(submittedDraft) &&
                    `saved ${moment(submittedDraft.updatedAt).fromNow()}`}
                </div>
                {disabledSave ? (
                  <StatefulTooltip content={'Please enter title, content and tags before saving'}>
                    <Button
                      style={{
                        marginRight: !isEmpty(submittedDraft) ? 23 : 0,
                        fontSize: '12px',
                        backgroundColor: disabledSave ? 'grey' : '#03a87c',
                        color: 'white',
                        marginTop: 10,
                        marginBottom: 10
                      }}
                      size={SIZE.compact}
                      kind={KIND.secondary}
                      shape={SHAPE.pill}
                      disabled={disabledSave}
                    >
                      {submitDraftLoading || saveDraftLoading
                        ? 'Saving...'
                        : saveDraftSuccess || submitDraftSuccess
                        ? 'Saved'
                        : 'Save'}
                    </Button>
                  </StatefulTooltip>
                ) : (
                  <Button
                    style={{
                      marginRight: !isEmpty(submittedDraft) ? 23 : 0,
                      fontSize: '12px',
                      backgroundColor: '#03a87c',
                      color: 'white',
                      marginTop: 10,
                      marginBottom: 10
                    }}
                    size={SIZE.compact}
                    kind={KIND.secondary}
                    shape={SHAPE.pill}
                    disabled={disabledSave}
                    onClick={() => {
                      if (isEmpty(submittedDraft)) {
                        // create new draft and store on store
                        submitDraftDispatch({
                          env: process.env.NODE_ENV,
                          title,
                          text: JSON.stringify(slateValue),
                          categories: tags.join(',')
                        });
                      } else {
                        // update existing draft and update on store
                        saveDraftDispatch({
                          env: process.env.NODE_ENV,
                          postId: submittedDraft._id,
                          title,
                          text: JSON.stringify(slateValue),
                          categories: tags.join(',')
                        });
                      }
                    }}
                  >
                    {submitDraftLoading || saveDraftLoading
                      ? 'Saving...'
                      : saveDraftSuccess || submitDraftSuccess
                      ? 'Saved'
                      : 'Save'}
                  </Button>
                )}
                {/* only see publish button when a draft exists */}
                {!isEmpty(submittedDraft) && (
                  <Button
                    style={{ fontSize: '12px', marginTop: 10, marginBottom: 10 }}
                    onClick={() => {
                      // take existing draft and publish it (notify followers and make publically shareable)
                      publishPostDispatch({
                        env: process.env.NODE_ENV,
                        postId: submittedDraft._id,
                        title,
                        text: JSON.stringify(slateValue),
                        categories: tags.join(',')
                      });
                    }}
                    size={SIZE.compact}
                    shape={SHAPE.pill}
                  >
                    Publish
                  </Button>
                )}
              </div>
            </div>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignContent: 'center',
                marginTop: 5
              }}
            >
              <div style={{ width: '100%' }}>
                <Input
                  className="green-placeholder"
                  value={value}
                  placeholder={'Add tags (optional)...'}
                  size={'compact'}
                  kind={'minimal'}
                  onChange={e => setValue(e.currentTarget.value)}
                  overrides={{
                    InputContainer: { style: { borderColor: 'white', backgroundColor: 'white' } },
                    Input: {
                      style: {
                        width: 'auto',
                        flexGrow: 1,
                        color: '#03a87c',
                        paddingLeft: '0px'
                      },
                      component: InputReplacement,
                      props: {
                        tags: tags,
                        removeTag: removeTag,
                        onKeyDown: handleKeyDown
                      }
                    }
                  }}
                />
              </div>
            </div>
            <div style={{ marginTop: 20 }}>
              <ContextMenuTrigger id="giving-tree-editor">
                <Slate
                  editor={editor}
                  value={slateValue}
                  onChange={value => {
                    setSlateValue(value);
                    const content = JSON.stringify(value);
                    console.log('content: ', content);
                  }}
                >
                  <Toolbar>
                    <MarkButton format="bold" icon="format_bold" />
                    <MarkButton format="italic" icon="format_italic" />
                    <MarkButton format="underline" icon="format_underlined" />
                    <MarkButton format="code" icon="code" />
                    <BlockButton format="heading-one" icon="looks_one" />
                    <BlockButton format="heading-two" icon="looks_two" />
                    <BlockButton format="block-quote" icon="format_quote" />
                    <BlockButton format="numbered-list" icon="format_list_numbered" />
                    <BlockButton format="bulleted-list" icon="format_list_bulleted" />
                    <InsertImageButton />
                    <LinkButton />
                  </Toolbar>
                  <Editable
                    onClick={event => {
                      console.log('click: ', event);
                    }}
                    renderLeaf={renderLeaf}
                    renderElement={renderElement}
                    spellCheck
                    autoFocus
                    placeholder="Enter some text..."
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
                              editor.exec({
                                type: 'format_text',
                                properties: { [mark]: true }
                              });
                              break;
                            case 'save':
                              if (disabledSave) {
                                console.log('cannot save yet');
                              } else {
                                if (isEmpty(submittedDraft)) {
                                  // create new draft and store on store
                                  submitDraftDispatch({
                                    env: process.env.NODE_ENV,
                                    title,
                                    text: JSON.stringify(slateValue),
                                    categories: tags.join(',')
                                  });
                                } else {
                                  // update existing draft and update on store
                                  saveDraftDispatch({
                                    env: process.env.NODE_ENV,
                                    postId: submittedDraft._id,
                                    title,
                                    text: JSON.stringify(slateValue),
                                    categories: tags.join(',')
                                  });
                                }
                              }
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
                              const url = window.prompt('Enter the URL of the link:');
                              if (!url) return;
                              editor.exec({ type: 'insert_link', url });
                              break;
                            case 'annotate':
                              console.log(`annotate`);
                              break;
                            case 'insert_image':
                              imageUpload.current.click();
                              break;
                            default:
                              break;
                          }
                        }
                      }
                    }}
                  />
                </Slate>
              </ContextMenuTrigger>
              <ContextMenu id="giving-tree-editor">
                <StatefulMenu
                  overrides={{
                    List: { style: { outline: 'none', width: '347px', borderRadius: '10px' } }
                  }}
                  onItemSelect={e => {
                    switch (e.item.command) {
                      case 'annotate':
                        console.log('annotate');
                        break;
                      case 'link':
                        const url = window.prompt('Enter the URL of the link:');
                        if (!url) return;
                        editor.exec({ type: 'insert_link', url });
                        break;
                      case 'image':
                        imageUpload.current.click();
                        break;
                      case 'latex':
                        console.log('latex');
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
                              style={{ height: '12px', marginRight: 7, alignItems: 'center' }}
                            />
                            <div>Annotate</div>
                          </div>
                          <div>⌘&nbsp;D</div>
                        </div>
                      )
                    },
                    {
                      command: 'image',
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
                              src="https://d1ppmvgsdgdlyy.cloudfront.net/photo.svg"
                              alt="upload"
                              style={{ height: '12px', marginRight: 7, alignItems: 'center' }}
                            />
                            <div>Import Image</div>
                          </div>
                          <div>⌘+Shift+I</div>
                        </div>
                      )
                    },
                    {
                      command: 'link',
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
                              src="https://d1ppmvgsdgdlyy.cloudfront.net/link.svg"
                              alt="link"
                              style={{ height: '12px', marginRight: 7, alignItems: 'center' }}
                            />
                            <div>Link</div>
                          </div>
                          <div>⌘&nbsp;K</div>
                        </div>
                      )
                    },
                    {
                      command: 'latex',
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
                              src="https://d1ppmvgsdgdlyy.cloudfront.net/tex.svg"
                              alt="latex"
                              style={{ width: '12px', marginRight: 7, alignItems: 'center' }}
                            />
                            <div>Add LaTeX</div>
                          </div>
                          <div>⌘&nbsp;L</div>
                        </div>
                      )
                    }
                  ]}
                />
              </ContextMenu>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

const initialValue = [
  {
    type: 'paragraph',
    children: [{ text: '' }]
  }
];

const mapDispatchToProps = dispatch => ({
  getCurrentUserDispatch: payload => dispatch(getCurrentUser(payload)),
  loadUserDispatch: payload => dispatch(loadUser(payload)),
  submitDraftDispatch: payload => dispatch(submitDraft(payload)),
  saveDraftDispatch: payload => dispatch(saveDraft(payload)),
  publishPostDispatch: payload => dispatch(publishPost(payload)),
  handleSeenSubmitDispatch: payload => dispatch(handleSeenSubmit(payload)),
  uploadPhotoDispatch: payload => dispatch(uploadPhoto(payload))
});

const mapStateToProps = state => ({
  user: state.auth.user,
  foundUser: state.auth.foundUser,
  errorMessage: state.auth.errorMessage,
  submitDraftLoading: state.user.submitDraftLoading,
  submitDraftSuccess: state.user.submitDraftSuccess,
  submitPostSuccess: state.user.submitPostSuccess,
  submittedDraft: state.user.submittedDraft,
  submittedPost: state.user.submittedPost,
  saveDraftLoading: state.user.saveDraftLoading,
  saveDraftSuccess: state.user.saveDraftSuccess,
  saveDraftFailure: state.user.saveDraftFailure,
  getDraftFailure: state.user.getDraftFailure,
  getDraftSuccess: state.user.getDraftSuccess,
  uploadPhotoUrl: state.user.uploadPhotoUrl,
  uploadPhotoSuccess: state.user.uploadPhotoSuccess,

  markSeenSubmitTutorial: state.user.markSeenSubmitTutorial
});

Submit.defaultProps = {};

Submit.propTypes = {};

export default connect(mapStateToProps, mapDispatchToProps)(Submit);
