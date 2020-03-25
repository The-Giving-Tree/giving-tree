import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
  HeaderNavigation,
  ALIGN,
  StyledNavigationItem as NavigationItem,
  StyledNavigationList as NavigationList
} from 'baseui/header-navigation';
import { StyledLink as Link } from 'baseui/link';
import { Button, SHAPE } from 'baseui/button';
import { StatefulSelect as Search, TYPE } from 'baseui/select';
import Navigation from './../Navigation';

class ErrorPage extends Component {
  render() {
    return (
      <div style={{ width: '100%' }}>
        <Navigation />
        <div style={{ paddingLeft: 24, paddingRight: 24 }}>
          <h1 style={{ color: 'rgb(112, 108, 100)', textAlign: 'center' }}>Oops! You hit a 404!</h1>
        </div>
      </div>
    );
  }
}

ErrorPage.propTypes = {
  errorCode: PropTypes.string
};

export default ErrorPage;
