import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Slate, Editable, ReactEditor, withReact, useSlate, useEditor } from 'slate-react';
import { Editor, Text, createEditor } from 'slate';
import ReactDOM from 'react-dom';
import isHotkey from 'is-hotkey';
import { Range } from 'slate';
import { css, cx } from 'emotion';
import { withHistory } from 'slate-history';
import PlacesAutocomplete from 'react-places-autocomplete';
import phoneFormatter from 'phone-formatter';
import { geocodeByAddress, geocodeByPlaceId, getLatLng } from 'react-places-autocomplete';
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
import { ArrowLeft } from 'baseui/icon';
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
  const [phoneNumber, setPhoneNumber] = React.useState('');
  const [imagePreview, setPreview] = React.useState('');
  const [text, setText] = React.useState('');
  const [address, setAddress] = useState('');
  const [latLngFood, setLatLngFood] = useState({});
  const [foodCart, setFoodCart] = React.useState([]);
  const [selectedRequest, setRequest] = React.useState('');
  const [value, setValue] = React.useState('');
  const [checkout, setCheckout] = React.useState(false);
  const [tags, setTags] = React.useState([]);
  let [changedFoodCart, setChangedFoodCart] = useState(0);
  const [foodCartQuantity, setFoodCartQuantity] = React.useState('');
  const [foodCartName, setFoodCartName] = React.useState('');
  const [foodDescription, setFoodDescription] = useState('');
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

  React.useEffect(() => {
    console.log('submitted draft');
    async function submitDraft() {
      let foodString = {
        address,
        type: selectedRequest,
        foodDescription,
        foodCart,
        location: latLngFood,
        phoneNumber
      };

      await publishPostDispatch({
        env: process.env.NODE_ENV,
        postId: submittedDraft._id,
        title,
        text: JSON.stringify(foodString),
        categories: [selectedRequest].join(',')
      });
    }

    submitDraft();
  }, [props.submitDraftSuccess]);

  useEffect(() => {}, [changedFoodCart]);

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

  const transportationJSX = (
    <div>
      <div>Pickup</div>
      <div>Dropoff</div>
      <div>Date</div>
    </div>
  );

  const validFoodCart = foodCartName && foodCartQuantity && Number(foodCartQuantity) > 0;

  const foodCartJSX = () => {
    return foodCart.length === 0 ? (
      <div className="text-center">no items in cart</div>
    ) : (
      <table class="table-auto" style={{ width: '100%' }}>
        <thead>
          <tr>
            <th class="px-4 py-2">Item Description</th>
            <th class="px-4 py-2">Quantity</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {foodCart.map((item, i) => (
            <tr className={i % 2 === 0 && `bg-gray-100`}>
              <td className={`border px-4 py-2`}>{item.name}</td>
              <td className={`border px-4 py-2`}>{item.quantity}</td>
              <td className={`border px-4 py-2`} style={{ width: 50, cursor: 'pointer' }}>
                {' '}
                <img
                  onClick={() => {
                    let foodCartNow = foodCart;
                    foodCartNow.splice(i, 1);
                    setFoodCart(foodCartNow);
                    setChangedFoodCart((changedFoodCart += 1)); // to update state every time
                  }}
                  style={{ objectFit: 'cover', maxHeight: 15, overflow: 'auto' }}
                  src="https://d1ppmvgsdgdlyy.cloudfront.net/trash.svg"
                  alt="delete"
                ></img>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  };

  const foodJSX = () => {
    return (
      <div>
        <div className="flex justify-between">
          <div className="font-bold text-base text-left my-1">Title</div>
          <div className="font-bold text-base text-left ml-3 my-1">Phone Number</div>
        </div>
        <div className="flex justify-content">
          <input
            onChange={e => {
              setTitle(e.target.value);
            }}
            class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            id="title"
            value={title}
            type="text"
            placeholder="Title"
          />
          <input
            onChange={e => {
              var phoneValue = e.target.value;
              var output;
              phoneValue = phoneValue.replace(/[^0-9]/g, '');
              var area = phoneValue.substr(0, 3);
              var pre = phoneValue.substr(3, 3);
              var tel = phoneValue.substr(6, 4);

              if (area.length < 3) {
                output = area;
              } else if (area.length === 3 && pre.length < 3) {
                output = ' ' + area + ' ' + ' ' + pre;
              } else if (area.length === 3 && pre.length === 3) {
                output = '' + area + '' + ' ' + pre + ' ' + tel;
              }
              setPhoneNumber(output);
            }}
            class="ml-3 shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            id="title"
            value={phoneNumber}
            pattern="[0-9]{3}-[0-9]{3}-[0-9]{4}"
            type="tel"
            placeholder="Phone Number (for delivery confirmation)"
          />
        </div>
        <div class="font-bold text-base text-left my-1 mt-4">Delivery Address</div>
        <PlacesAutocomplete
          value={address}
          onChange={address => setAddress(address)}
          onSelect={address => {
            setAddress(address);
            geocodeByAddress(address)
              .then(results => getLatLng(results[0]))
              .then(latLng => {
                console.log('Success', latLng);
                setLatLngFood(latLng);
              })
              .catch(error => console.error('Error', error));
          }}
        >
          {({ getInputProps, suggestions, getSuggestionItemProps, loading }) => (
            <div>
              <input
                {...getInputProps({
                  placeholder: 'Enter an address',
                  className: 'location-search-input'
                })}
                value={address}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
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
        <div className="font-bold text-base text-left my-1 mt-4">Description</div>
        <input
          onChange={e => {
            setFoodDescription(e.target.value);
          }}
          class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          id="description"
          value={foodDescription}
          type="text"
          placeholder="tell us a little more about your request..."
        />
        <div className="mt-4"></div>
        {foodCartJSX()}
        <div className={`flex items-center mt-4`}>
          <input
            onChange={e => {
              setFoodCartName(e.target.value);
            }}
            class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            id="food"
            value={foodCartName}
            type="text"
            placeholder="food item"
          />
          <input
            onChange={e => {
              setFoodCartQuantity(e.target.value);
            }}
            class="mx-4 shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            style={{ width: 100 }}
            value={foodCartQuantity}
            id="food"
            type="number"
            placeholder="quantity"
          />
          <button
            className={`${validFoodCart ? 'bg-indigo-500' : 'bg-gray-500'} ${validFoodCart &&
              'hover:bg-indigo-700'} text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline`}
            type="button"
            onClick={() => {
              if (validFoodCart) {
                let foodCartNew = foodCart;
                foodCartNew.push({ name: foodCartName, quantity: foodCartQuantity });
                setFoodCart(foodCartNew);
                setFoodCartQuantity('');
                setFoodCartName('');
              } else {
                alert('please enter a valid food cart item');
              }
            }}
          >
            Add
          </button>
        </div>
      </div>
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
                  <img
                    src="https://d1ppmvgsdgdlyy.cloudfront.net/close.svg"
                    alt="close"
                    style={{ height: 10 }}
                  />
                </div>
              </div>
              <div style={{ marginTop: 15 }}>
                Welcome to Giving Tree! You can submit a claim to the community and get help! You
                can also message us at{' '}
                <a className="text-indigo-600 hover:text-indigo-800" href="tel:+1507-533-5281">
                  507-533-5281
                </a>{' '}
                to get help.
              </div>
            </Card>
          )}
          {submitPostSuccess ? (
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
              Your post is now live! 🥳Check it out{' '}
              <a
                className="text-indigo-600 hover:text-indigo-800 transition duration-150"
                style={{ textDecoration: 'none' }}
                href={`/post/${submittedPost._id}`}
              >
                here
              </a>
              .
            </Card>
          ) : (
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
              <div className="flex justify-between items-center my-4 mb-6" style={{ height: 36 }}>
                {!checkout ? (
                  <React.Fragment>
                    <div class="font-bold text-xl text-left">I need:</div>
                    <div>
                      {selectedRequest !== '' && (
                        <button
                          onClick={() => setCheckout(true)}
                          style={{ outline: 'none' }}
                          class="bg-indigo-500 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded"
                        >
                          Next
                        </button>
                      )}
                    </div>
                  </React.Fragment>
                ) : (
                  <React.Fragment>
                    <div
                      onClick={() => {
                        setRequest('');
                        setCheckout(false);
                      }}
                      class="font-bold text-xl text-left"
                      style={{ cursor: 'pointer' }}
                    >
                      <ArrowLeft size={20} />
                    </div>
                    <div>
                      {selectedRequest !== '' && (
                        <button
                          onClick={() => {
                            if (title && address && foodDescription && foodCart.length > 0) {
                              let foodString = {
                                address,
                                type: selectedRequest,
                                foodDescription,
                                foodCart,
                                location: latLngFood,
                                phoneNumber
                              };

                              if (isEmpty(submittedDraft)) {
                                submitDraftDispatch({
                                  env: process.env.NODE_ENV,
                                  title,
                                  text: JSON.stringify(foodString),
                                  categories: [selectedRequest].join(',')
                                });
                              } else {
                                alert('draft already submitted');
                              }
                            } else {
                              alert('please fill out all fields');
                            }
                          }}
                          style={{ outline: 'none' }}
                          class={`${
                            title && address && foodDescription && foodCart.length > 0
                              ? 'bg-green-500'
                              : 'bg-gray-500'
                          } ${title &&
                            address &&
                            foodDescription &&
                            foodCart.length > 0 &&
                            'hover:bg-green-700'} text-white font-bold py-2 px-4 rounded`}
                        >
                          Submit
                        </button>
                      )}
                    </div>
                  </React.Fragment>
                )}
              </div>
              {!checkout && (
                <div class="grid grid-cols-3 gap-4">
                  <div
                    onClick={() => {
                      if (selectedRequest) {
                        setRequest('');
                      } else {
                        setRequest('food');
                      }
                    }}
                    className={`max-w-sm rounded overflow-hidden shadow-lg border ${selectedRequest ===
                      'food' &&
                      'border-indigo-600'} hover:border-indigo-600 rounded-lg hover:text-green-600 transition duration-150`}
                    style={{ cursor: 'pointer' }}
                  >
                    <img
                      style={{ objectFit: 'cover', maxHeight: 150, width: 400, overflow: 'auto' }}
                      src="https://d1ppmvgsdgdlyy.cloudfront.net/groceries.jpg"
                      alt="Food"
                    ></img>
                    <div class="px-6 py-8">
                      <div
                        className={`font-bold text-xl text-center ${selectedRequest === 'food' &&
                          'text-green-600'}`}
                      >
                        Food
                      </div>
                    </div>
                  </div>
                  <div
                    onClick={() => {
                      if (selectedRequest) {
                        setRequest('');
                      } else {
                        // setRequest('supplies');
                      }
                    }}
                    className={`max-w-sm rounded overflow-hidden shadow-lg border ${selectedRequest ===
                      'supplies' && 'border-indigo-600'} rounded-lg transition duration-150`}
                    style={{ cursor: 'not-allowed' }}
                  >
                    <img
                      style={{
                        objectFit: 'cover',
                        maxHeight: 150,
                        width: 400,
                        overflow: 'auto',
                        filter: 'grayscale(100%)'
                      }}
                      src="https://d1ppmvgsdgdlyy.cloudfront.net/supplies.jpg"
                      alt="Supplies"
                    ></img>
                    <div class="px-6 py-8">
                      <div
                        className={`font-bold text-xl text-center ${selectedRequest ===
                          'supplies' && 'text-green-600'}`}
                      >
                        Supplies (coming soon)
                      </div>
                    </div>
                  </div>
                  <div
                    onClick={() => {
                      if (selectedRequest) {
                        setRequest('');
                      } else {
                        // setRequest('transportation');
                      }
                    }}
                    className={`max-w-sm rounded overflow-hidden shadow-lg border ${selectedRequest ===
                      'transportation' && 'border-indigo-600'} rounded-lg transition duration-150`}
                    style={{ cursor: 'not-allowed' }}
                  >
                    <img
                      style={{
                        objectFit: 'cover',
                        maxHeight: 150,
                        width: 400,
                        overflow: 'auto',
                        filter: 'grayscale(100%)'
                      }}
                      src="https://d1ppmvgsdgdlyy.cloudfront.net/transportation.jpg"
                      alt="Transportation"
                    ></img>
                    <div class="px-6 py-8">
                      <div
                        className={`font-bold text-xl text-center ${selectedRequest ===
                          'transportation' && 'text-green-600'}`}
                      >
                        Transportation (coming soon)
                      </div>
                    </div>
                  </div>
                </div>
              )}
              {checkout && (
                <React.Fragment>
                  {selectedRequest === 'food' && foodJSX()}
                  {selectedRequest === 'supplies' && 'supplies'}
                  {selectedRequest === 'transportation' && transportationJSX}
                </React.Fragment>
              )}
              {/* <div
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
            </div> */}
              {/* <div
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
                    placeholder="Describe your need..."
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
            </div> */}
            </Card>
          )}
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
