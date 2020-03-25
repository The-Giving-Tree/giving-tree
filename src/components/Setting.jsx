import * as React from 'react';
import {
  HeaderNavigation,
  ALIGN,
  StyledNavigationItem as NavigationItem,
  StyledNavigationList as NavigationList
} from 'baseui/header-navigation';
import { StyledLink as Link } from 'baseui/link';
import { Button, SHAPE } from 'baseui/button';
import { StatefulSelect as Search, TYPE } from 'baseui/select';
import Navigation from './Navigation';
import { Avatar } from 'baseui/avatar';
import { Redirect } from 'react-router-dom';
import { Card, StyledBody, StyledAction } from 'baseui/card';
import { Block } from 'baseui/block';
import { H1, H2, H3, H4, H5, H6 } from 'baseui/typography';

import { connect } from 'react-redux';

import { getCurrentUser, loadUser, logoutAll } from '../store/actions/auth/auth-actions';
import { findByLabelText } from '@testing-library/dom';

// check to see if valid user or not
// if valid, show
// if invalid, redirect to error page

function Setting(props) {
  const {
    user,
    foundUser,
    errorMessage,
    getCurrentUserDispatch,
    loadUserDispatch,
    logoutAllDispatch
  } = props;
  const tab = props.match.params.tab;
  console.log('tab: ', tab);
  if (tab === undefined) {
    console.log(tab === undefined);
  }

  return (
    <div style={{ width: '100%' }}>
      <Navigation />
      <div style={{ width: 1100, paddingTop: 50, margin: '0 auto' }}>
        <h2 className="my-4 font-bold text-2xl">Settings</h2>
        <HeaderNavigation
          overrides={{
            Root: {
              style: {
                width: '100%'
              }
            }
          }}
        >
          <NavigationList $align={ALIGN.left}>
            <NavigationItem>
              <strong>
                <a
                  style={{
                    textDecoration: 'none',
                    color: tab === 'account' || tab === undefined ? '#0079D3' : 'black'
                  }}
                  href="/settings/account"
                >
                  Account
                </a>
              </strong>
            </NavigationItem>
          </NavigationList>
          {/* <NavigationList $align={ALIGN.left}>
            <NavigationItem>
              <strong>
                <a
                  style={{ textDecoration: 'none', color: tab === 'profile' ? '#0079D3' : 'black' }}
                  href="/settings/profile"
                >
                  Profile
                </a>
              </strong>
            </NavigationItem>
          </NavigationList>
          <NavigationList $align={ALIGN.left}>
            <NavigationItem>
              <strong>
                <a
                  style={{
                    textDecoration: 'none',
                    color: tab === 'security' ? '#0079D3' : 'black'
                  }}
                  href="/settings/security"
                >
                  Privacy and Security
                </a>
              </strong>
            </NavigationItem>
          </NavigationList>
          <NavigationList $align={ALIGN.left}>
            <NavigationItem>
              <strong>
                <a
                  style={{ textDecoration: 'none', color: tab === 'premium' ? '#0079D3' : 'black' }}
                  href="/settings/premium"
                >
                  Premium
                </a>
              </strong>
            </NavigationItem>
          </NavigationList> */}
        </HeaderNavigation>
        {(tab === undefined || tab === 'account') && (
          <Block>
            <div style={{ marginTop: 50, marginBottom: 30 }}>
              <p className="my-3" style={{ fontSize: 20 }}>
                Account
              </p>
              <Button
                onClick={() => {
                  logoutAllDispatch({ env: process.env.NODE_ENV });
                }}
              >
                Logout of all accounts
              </Button>
            </div>
          </Block>
        )}
        {tab === 'profile' && (
          <Block>
            <div style={{ marginTop: 50, marginBottom: 30 }}>
              <p className="my-3" style={{ fontSize: 20 }}>
                Profile
              </p>
            </div>
          </Block>
        )}
        {tab === 'security' && (
          <Block>
            <div style={{ marginTop: 50, marginBottom: 30 }}>
              <p className="my-3" style={{ fontSize: 20 }}>
                Security
              </p>
            </div>
          </Block>
        )}
        {tab === 'premium' && (
          <Block>
            <div style={{ marginTop: 50, marginBottom: 30 }}>
              <p className="my-3" style={{ fontSize: 20 }}>
                Premium
              </p>
            </div>
          </Block>
        )}
      </div>
    </div>
  );
}

const mapDispatchToProps = dispatch => ({
  getCurrentUserDispatch: payload => dispatch(getCurrentUser(payload)),
  loadUserDispatch: payload => dispatch(loadUser(payload)),
  logoutAllDispatch: payload => dispatch(logoutAll(payload))
});

const mapStateToProps = state => ({
  user: state.auth.user,
  foundUser: state.auth.foundUser,
  errorMessage: state.auth.errorMessage
});

Setting.defaultProps = {};

Setting.propTypes = {};

export default connect(mapStateToProps, mapDispatchToProps)(Setting);
