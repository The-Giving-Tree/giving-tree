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

/* -------------------------------------------------------------------------- */
/* START OF UNIVERSAL SIDEBAR COMPONENT */
/* -------------------------------------------------------------------------- */
function Sidebar(props) {
  const authenticated = localStorage.getItem('giving_tree_jwt');
  const history = useHistory();
  const { match } = props;

  return (
    <th
      className="px-4 py-2 text-right"
      style={{
        alignItems: 'start',
        display: 'flex',
        width: '25vw',
      }}
    >
      <div
        style={{
          width: '100%',
        }}
      >
        <div
          className="text-black transition duration-150 flex items-center justify-between"
          style={{
            paddingLeft: 24,
            paddingTop: 30,
          }}
        >
          <span />
          <div
            className={`flex items-center hover:text-indigo-600 ${match.url === '/home/discover' && 'text-indigo-600'}`}
            onClick={() => (window.location = '/home/discover')}
            style={{
              cursor: 'pointer',
            }}
          >
            Discover Tasks
            <img
              alt="search"
              src="https://d1ppmvgsdgdlyy.cloudfront.net/search.svg"
              style={{
                height: 20,
                marginLeft: 10,
              }}
            />
          </div>
        </div>
        <div
          className="text-black transition duration-150 flex items-center justify-between"
          style={{
            paddingLeft: 24,
            paddingTop: 10,
          }}
        >
          <span />
          <div
            className={`flex items-center hover:text-indigo-600 ${match.url === '/home/ongoing' && 'text-indigo-600'}`}
            onClick={() => {
              if (authenticated) {
                window.location = '/home/ongoing';
              } else {
                alert('please login/signup before you can view your tasks');
                history.push('/signup');
              }
            }}
            style={{
              cursor: 'pointer',
            }}
          >
            Your Tasks
            <img
              alt="care"
              src="https://d1ppmvgsdgdlyy.cloudfront.net/care.svg"
              style={{
                height: 20,
                marginLeft: 10,
              }}
            />
          </div>
        </div>
        <div
          className="text-black transition duration-150 flex items-center justify-between"
          style={{
            paddingLeft: 24,
            paddingTop: 10,
          }}
        >
          <span />
          <div
            className={`flex items-center hover:text-indigo-600 ${match.url === '/home/completed' && 'text-indigo-600'}`}
            onClick={() => {
              if (authenticated) {
                window.location = '/home/completed';
              } else {
                alert('please login/signup before you can view your completed tasks');
                history.push('/signup');
              }
            }}
            style={{
              cursor: 'pointer',
            }}
          >
            Completed Tasks
            <img
              alt="gift"
              src="https://d1ppmvgsdgdlyy.cloudfront.net/gift.svg"
              style={{
                height: 20,
                marginLeft: 10,
              }}
            />
          </div>
        </div>
        <div
          className="text-black transition duration-150 flex items-center justify-between"
          style={{
            paddingLeft: 24,
            paddingTop: 10,
          }}
        >
          <span />
          <div
            className={`flex items-center hover:text-indigo-600 ${match.url === '/home/global' && 'text-indigo-600'}`}
            onClick={() => (window.location = '/home/global')}
            style={{
              cursor: 'pointer',
            }}
          >
            Global Tasks
            <img
              alt="global"
              src="https://d1ppmvgsdgdlyy.cloudfront.net/global.svg"
              style={{
                height: 20,
                marginLeft: 10,
              }}
            />
          </div>
        </div>
        <div
          className="text-black transition duration-150 flex items-center justify-between"
          style={{
            paddingLeft: 24,
            paddingTop: 10,
          }}
        >
          <span />
          <div
            className="flex items-center hover:text-indigo-600"
            onClick={() => {
              if (authenticated) {
                history.push('/submit');
              } else {
                alert('please login/signup before you can ask for help');
                history.push('/signup');
              }
            }}
            style={{
              cursor: 'pointer',
            }}
          >
            Ask for Help<span style={{ marginLeft: 10 }}>❤️</span>
          </div>
        </div>
      </div>
    </th>
  );
}

export default Sidebar;
