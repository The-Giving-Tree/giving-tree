import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import PlacesAutocomplete from 'react-places-autocomplete';
import { geocodeByAddress, getLatLng } from 'react-places-autocomplete';
import Navigation from './Navigation';
import { Card } from 'baseui/card';
import { ArrowLeft } from 'baseui/icon';
import { Tag } from 'baseui/tag';
import Sidebar from './universal/Sidebar';

import { connect } from 'react-redux';
import { getCurrentUser, loadUser, selectMenu } from '../store/actions/auth/auth-actions';
import {
  submitDraft,
  saveDraft,
  publishPost,
  handleSeenSubmit,
  uploadPhoto
} from '../store/actions/user/user-actions';

export const Portal = ({ children }) => {
  return ReactDOM.createPortal(children, document.body);
};

function Submit(props) {
  const {
    user,
    selectMenu,
    titleStore,
    selectMenuDispatch,
    submitPostSuccess,
    submittedDraft,
    submittedPost,
    submitDraftDispatch,
    publishPostDispatch,
    handleSeenSubmitDispatch,
    getCurrentUserDispatch
  } = props;

  const [title, setTitle] = React.useState('');
  const [phoneNumber, setPhoneNumber] = React.useState('');
  const [address, setAddress] = useState('');
  const [latLng, setLatLng] = useState({});
  const [postal, setPostal] = useState('');
  const [cart, setCart] = React.useState([]);
  const [selectedRequest, setRequest] = React.useState('');
  const [checkout, setCheckout] = React.useState(false);
  let [changedCart, setChangedCart] = useState(0);
  const [cartQuantity, setCartQuantity] = React.useState('');
  const [cartName, setCartName] = React.useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');

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

  /* eslint-disable */
  React.useEffect(() => {
    async function submitDraft() {
      let foodString = {
        address,
        type: selectedRequest,
        description,
        cart,
        dueDate,
        location: latLng,
        postal,
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
  }, [props.submitDraftSuccess, publishPostDispatch, submittedDraft._id]);

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
    return foodJSX();
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
                output = `${' '}${area}${' '}${' '}${pre}`;
              } else if (area.length === 3 && pre.length === 3) {
                output = `${''}${area}${''}${' '}${pre}${' '}${tel}`;
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
            let postal = '';
            geocodeByAddress(address)
              .then(results => {
                for (var i = 0; i < results[0].address_components.length; i++) {
                  let x = results[0].address_components[i];
                  if (x.types[0] === 'postal_code') {
                    postal += x.long_name;
                  } else if (x.types[0] === 'postal_code_suffix') {
                    postal += `-${x.long_name}`;
                  }
                }
                setPostal(postal);
              })
              .catch(error => console.error('Error 1', error));

            geocodeByAddress(address)
              .then(results => getLatLng(results[0]))
              .then(latLng => {
                console.log('Success', latLng);
                setLatLng(latLng);
              })
              .catch(error => console.error('Error 2', error));
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
        <div className="font-bold text-base text-left my-1 mt-4">Due Date</div>
        <input
          style={{ height: '32px' }}
          onChange={e => {
            setDueDate(e.target.value); // YYYY-MM-DD
          }}
          class="appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
          type="date"
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
              selectedRequest === 'food'
                ? `food item`
                : selectedRequest === 'supplies'
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
            id={
              selectedRequest === 'food' ? `food` : selectedRequest === 'supplies' ? 'supplies' : ''
            }
            type="number"
            placeholder="quantity"
          />
          <button
            className={`bg-indigo-500 ${validCart &&
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
                    selectedRequest === 'food'
                      ? `food`
                      : selectedRequest === 'supplies'
                      ? 'supplies'
                      : ''
                  } cart item`
                );
              }
            }}
          >
            Add
          </button>
        </div>
        <div className="flex justify-between items-center mt-6">
          <span />
          <div>
            {selectedRequest !== '' && (
              <button
                onClick={() => {
                  if (
                    title &&
                    latLng.lat &&
                    latLng.lng &&
                    address &&
                    description &&
                    dueDate &&
                    cart.length > 0
                  ) {
                    let foodString = {
                      address,
                      type: selectedRequest,
                      description,
                      cart,
                      postal,
                      dueDate,
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
                className={`bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded`}
              >
                Submit
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div style={{ width: '100%' }}>
      <Navigation selectMenuDispatch={selectMenuDispatch} searchBarPosition="center" />
      <div
        style={{
          background: '#fff',
          display: 'flex',
          flexDirection: 'row',
          height: 'calc(100vh - 70px)',
          width: '100%'
        }}
      >
        <Sidebar {...props} />
        <div
          style={{
            paddingLeft: 24,
            paddingTop: 30,
            width: '46.5vw'
          }}
        >
          {!isEmpty(user) && !user.seenSubmitTutorial && (
            <Card
              overrides={{
                Root: {
                  style: {
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
                <a className="text-indigo-600 hover:text-indigo-800" href="tel:+1415-964-4261">
                  415-964-4261
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
                    margin: '0 auto',
                    marginBottom: '30px',
                    color: 'green'
                  }
                }
              }}
            >
              Your post is now live!{' '}
              <span role="img" aria-label="Smiley emoji with party hat">
                🥳
              </span>
              Check it out{' '}
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

const mapDispatchToProps = dispatch => ({
  getCurrentUserDispatch: payload => dispatch(getCurrentUser(payload)),
  loadUserDispatch: payload => dispatch(loadUser(payload)),
  submitDraftDispatch: payload => dispatch(submitDraft(payload)),
  saveDraftDispatch: payload => dispatch(saveDraft(payload)),
  publishPostDispatch: payload => dispatch(publishPost(payload)),
  handleSeenSubmitDispatch: payload => dispatch(handleSeenSubmit(payload)),
  uploadPhotoDispatch: payload => dispatch(uploadPhoto(payload)),
  selectMenuDispatch: payload => dispatch(selectMenu(payload))
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
