import React from 'react';
import { Client as Styletron } from 'styletron-engine-atomic';
import { Provider as StyletronProvider } from 'styletron-react';
import { LightTheme, BaseProvider, styled } from 'baseui';
import { BrowserRouter, Switch, Route } from 'react-router-dom';
import Constants from './components/Constants';
import ErrorPage from './components/ErrorPage/ErrorPage';
import Home from './components/LandingPage/Home';
import Login from './components/Login';
import Signup from './components/Signup';
import User from './components/User';
import Setting from './components/Setting';
import Submit from './components/Submit';
import Post from './components/Post';
import Draft from './components/Draft';
import ResetPassword from './components/ResetPassword';
import './App.css';

const engine = new Styletron();
const Centered = styled('div', {
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  height: '100%'
});

function App() {
  return (
    <StyletronProvider value={engine}>
      <BaseProvider theme={LightTheme}>
        <Centered>
          <BrowserRouter>
            <Switch>
              <Route exact path={Constants.PATHS.HOME} component={Home} />
              <Route exact path="/home/:id" component={Home} />
              <Route exact path={Constants.PATHS.LOGIN} component={Login} />
              <Route exact path={Constants.PATHS.SIGNUP} component={Signup} />
              <Route exact path={Constants.PATHS.SUBMIT} component={Submit} />
              <Route exact path={Constants.PATHS.SETTING} component={Setting} />
              <Route exact path={Constants.PATHS.DRAFT} component={Draft} />
              <Route exact path={'/settings'} component={Setting} />
              <Route path="/user/:id" component={User} />
              <Route path="/post/:id" component={Post} />
              <Route path="/reset-password/:token" component={ResetPassword} />
              <Route render={props => <ErrorPage {...props} errorCode="404" />} /> />
            </Switch>
          </BrowserRouter>
        </Centered>
      </BaseProvider>
    </StyletronProvider>
  );
}

export default App;
