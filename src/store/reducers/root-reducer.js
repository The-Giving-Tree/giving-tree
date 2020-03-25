import { combineReducers } from 'redux';

import global from './global-reducer';
import auth from './auth-reducer';
import user from './user-reducer';

export default () =>
  combineReducers({
    global,
    auth,
    user
  });
