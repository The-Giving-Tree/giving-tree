import { all } from 'redux-saga/effects';
import watchAuthSagas from './auth/auth-sagas';
import watchUserSagas from './user/user-sagas';
import watchGlobalSagas from './global/global-sagas';

export default function* rootSaga() {
  yield all([watchAuthSagas(), watchUserSagas(), watchGlobalSagas()]);
}
