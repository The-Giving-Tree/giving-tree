import { call, delay, put, takeLatest } from 'redux-saga/effects';
import Api from './api';
import GLOBAL_TYPES from '../../actions/global/action-types';

export function* search(action) {
  try {
    const data = yield call(Api.search, action.payload.env, action.payload.query);
    const searchResults = data.data;

    yield put({
      type: GLOBAL_TYPES.SEARCH_SUCCESS,
      payload: {
        searchResults
      }
    });
  } catch (error) {
    console.log('error: ', error);
    yield put({ type: GLOBAL_TYPES.SEARCH_FAILURE, payload: error });
  }
}

export default function* watchGlobalSagas() {
  yield takeLatest(GLOBAL_TYPES.SEARCH_REQUESTED, search);
}
