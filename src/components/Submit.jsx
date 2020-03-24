import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Slate, Editable, ReactEditor, withReact, useSlate, useEditor } from 'slate-react';
import { Editor, Text, createEditor } from 'slate';
import ReactDOM from 'react-dom';
import isHotkey from 'is-hotkey';
import { Range } from 'slate';
import { css, cx } from 'emotion';
import { withHistory } from 'slate-history';
import PlacesAutocomplete from 'react-places-autocomplete';
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
    selectMenu,
    titleStore,
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
  const [latLng, setLatLng] = useState({});
  const [cart, setCart] = React.useState([]);
  const [selectedRequest, setRequest] = React.useState('');
  const [value, setValue] = React.useState('');
  const [checkout, setCheckout] = React.useState(false);
  const [tags, setTags] = React.useState([]);
  let [changedCart, setChangedCart] = useState(0);
  const [cartQuantity, setCartQuantity] = React.useState('');
  const [cartName, setCartName] = React.useState('');
  const [description, setDescription] = useState('');

  // initialize state
  React.useEffect(() => {
    setTitle(titleStore);
    if (selectMenu !== '') {
      setCheckout(true);

      if (selectMenu === 'Food') {
        setRequest('food');
      } else if (selectMenu === 'Supplies') {
        setRequest('supplies');
      }
    }
  }, [titleStore, selectMenu]);

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
        description,
        cart,
        location: latLng,
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

  useEffect(() => {}, [changedCart]);

  const isEmpty = obj => {
    for (var key in obj) {
      if (obj.hasOwnProperty(key)) return false;
    }
    return true;
  };

  const transportationJSX = (
    <div>
      <div>Pickup</div>
      <div>Dropoff</div>
      <div>Date</div>
    </div>
  );

  const validCart = cartName && cartQuantity && Number(cartQuantity) > 0;

  const cartJSX = () => {
    return cart.length === 0 ? (
      <div className="text-center">no items in cart</div>
    ) : (
      <table className="table-auto" style={{ width: '100%' }}>
        <thead>
          <tr>
            <th className="px-4 py-2">Item Description</th>
            <th className="px-4 py-2">Quantity</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {cart.map((item, i) => (
            <tr className={i % 2 === 0 && `bg-gray-100`}>
              <td className={`border px-4 py-2`}>{item.name}</td>
              <td className={`border px-4 py-2`}>{item.quantity}</td>
              <td className={`border px-4 py-2`} style={{ width: 50, cursor: 'pointer' }}>
                {' '}
                <img
                  onClick={() => {
                    let cartNow = cart;
                    cartNow.splice(i, 1);
                    setCart(cartNow);
                    setChangedCart((changedCart += 1)); // to update state every time
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

  const suppliesJSX = () => {
    foodJSX();
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
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
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
            className="ml-3 shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            id="title"
            value={phoneNumber}
            pattern="[0-9]{3}-[0-9]{3}-[0-9]{4}"
            type="tel"
            placeholder="Phone Number (for delivery confirmation)"
          />
        </div>
        <div className="font-bold text-base text-left my-1 mt-4">Delivery Address</div>
        <PlacesAutocomplete
          value={address}
          onChange={address => setAddress(address)}
          onSelect={address => {
            setAddress(address);
            geocodeByAddress(address)
              .then(results => getLatLng(results[0]))
              .then(latLng => {
                console.log('Success', latLng);
                setLatLng(latLng);
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
            setDescription(e.target.value);
          }}
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          id="description"
          value={description}
          type="text"
          placeholder="tell us a little more about your request..."
        />
        <div className="mt-4"></div>
        {cartJSX()}
        <div className={`flex items-center mt-4`}>
          <input
            onChange={e => {
              setCartName(e.target.value);
            }}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            id="food"
            value={cartName}
            type="text"
            placeholder={
              selectMenu === 'Food'
                ? `food item`
                : selectMenu === 'Supplies'
                ? 'household supplies'
                : ''
            }
          />
          <input
            onChange={e => {
              setCartQuantity(e.target.value);
            }}
            className="mx-4 shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            style={{ width: 100 }}
            value={cartQuantity}
            id={selectMenu === 'Food' ? `food` : selectMenu === 'Supplies' ? 'supplies' : ''}
            type="number"
            placeholder="quantity"
          />
          <button
            className={`${validCart ? 'bg-indigo-500' : 'bg-gray-500'} ${validCart &&
              'hover:bg-indigo-700'} text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline`}
            type="button"
            onClick={() => {
              if (validCart) {
                let cartNew = cart;
                cartNew.push({ name: cartName, quantity: cartQuantity });
                setCart(cartNew);
                setCartQuantity('');
                setCartName('');
              } else {
                alert(
                  `please enter a valid ${
                    selectMenu === 'Food' ? `food` : selectMenu === 'Supplies' ? 'supplies' : ''
                  } cart item`
                );
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
                    <div className="font-bold text-xl text-left">I need:</div>
                    <div>
                      {selectedRequest !== '' && (
                        <button
                          onClick={() => setCheckout(true)}
                          style={{ outline: 'none' }}
                          className="bg-indigo-500 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded"
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
                      className="font-bold text-xl text-left"
                      style={{ cursor: 'pointer' }}
                    >
                      <ArrowLeft size={20} />
                    </div>
                    <div>
                      {selectedRequest !== '' && (
                        <button
                          onClick={() => {
                            if (title && address && description && cart.length > 0) {
                              let foodString = {
                                address,
                                type: selectedRequest,
                                description,
                                cart,
                                location: latLng,
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
                            title && address && description && cart.length > 0
                              ? 'bg-green-500'
                              : 'bg-gray-500'
                          } ${title &&
                            address &&
                            description &&
                            cart.length > 0 &&
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
                <div className="grid grid-cols-3 gap-4">
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
                    <div className="px-6 py-8">
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
                        setRequest('supplies');
                      }
                    }}
                    className={`max-w-sm rounded  hover:border-indigo-600 overflow-hidden shadow-lg border ${selectedRequest ===
                      'supplies' && 'border-indigo-600'} rounded-lg transition duration-150`}
                    style={{ cursor: 'pointer' }}
                  >
                    <img
                      style={{
                        objectFit: 'cover',
                        maxHeight: 150,
                        width: 400,
                        overflow: 'auto'
                      }}
                      src="https://d1ppmvgsdgdlyy.cloudfront.net/supplies.jpg"
                      alt="Supplies"
                    ></img>
                    <div className="px-6 py-8">
                      <div
                        className={`font-bold text-xl text-center ${selectedRequest ===
                          'supplies' && 'text-green-600'}`}
                      >
                        Supplies
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
                    <div className="px-6 py-8">
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
                  {selectedRequest === 'supplies' && suppliesJSX()}
                  {selectedRequest === 'transportation' && transportationJSX()}
                </React.Fragment>
              )}
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
  selectMenu: state.auth.selectMenu,
  titleStore: state.auth.title,
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
