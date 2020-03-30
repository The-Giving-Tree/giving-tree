/* eslint-disable */
import * as React from 'react';
import { HeaderNavigation, ALIGN } from 'baseui/header-navigation';
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

function NewsfeedTable(props) {
  const {
    address,
    coords,
    hasMoreItems,
    id,
    items,
    selectMenu,
    match,
    newPost,
    latLng,
    newsfeedLoading,
    newsfeedSuccess,
    openCustomAddress,
    setOpenCustomAddress,
    resetItems,
    setAddress,
    setLatLng,
    setUpdateNews
  } = props;

  const history = useHistory();

  return (
    <table className="table-auto" style={{ width: '50%' }}>
      <thead>
        <tr>
          <th className="px-4 py-2" style={{ width: '100%' }}>
            <div
              style={{
                height: `calc(100vh - 70px + ${60 + items.length * 60}px)`
              }}
            >
              <div style={{ paddingLeft: 24, paddingRight: 24, paddingTop: 30 }}>
                {match.url === '/home/discover' && (
                  <Card
                    overrides={{
                      Root: {
                        style: {
                          margin: '0 auto',
                          width: '100%'
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
                        alignContent: 'center',
                        display: 'flex',
                        justifyContent: 'space-between'
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
                          let lat = coords && coords.latitude;
                          let lng = coords && coords.longitude;

                          // only refresh if the user is coming from a different location
                          if (address !== 'Earth') {
                            window.location = '/home/discover';
                          }

                          setLatLng({ lat, lng });
                          setOpenCustomAddress(false);
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
                            resetItems();
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
                  match.url === '/home/discover' && (
                    <div className={`text-left mt-2`} style={{ fontSize: 12 }}>
                      Your current location:{' '}
                      {(address === 'Earth' && 'Earth 🌍') ||
                        `(${latLng.lat ? latLng.lat : coords && coords.latitude}, ${
                          latLng.lng ? latLng.lng : coords && coords.longitude
                        })`}
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
                        No requests globally completed yet! Invite your friends and start spreading
                        the love
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
  );
}

export default NewsfeedTable;
