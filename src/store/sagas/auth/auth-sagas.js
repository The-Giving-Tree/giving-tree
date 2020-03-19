import { call, delay, put, takeLatest } from 'redux-saga/effects';
import ACTION_TYPE from '../../actions/auth/action-types';
import Api from './api';
import { getUserData } from '../user/user-sagas';
import GLOBAL_TYPES from '../../actions/global/action-types';
import ROUTES from '../../../utils/routes';

export function* login(action) {
  try {
    const data = yield call(
      Api.login,
      action.payload.env,
      action.payload.username,
      action.payload.password,
      action.payload.rememberMe
    );
    const { message, email, username, token, _id } = data.data;

    /* eslint-disable */
    localStorage.setItem('giving_tree_jwt', token);
    /* eslint-enable */

    yield put({
      type: ACTION_TYPE.LOGIN_SUCCESS,
      payload: {
        message,
        email,
        username,
        _id
      }
    });
  } catch (error) {
    yield put({ type: ACTION_TYPE.LOGIN_FAILURE, payload: error });
  }
}

export function* register(action) {
  try {
    const data = yield call(
      Api.register,
      action.payload.env,
      action.payload.name,
      action.payload.email,
      action.payload.username,
      action.payload.password
    );
    const { email, name, profilePictureUrl, balanceUSD, username, token, _id } = data.data;

    /* eslint-disable */
    localStorage.setItem('giving_tree_jwt', token);
    /* eslint-enable */

    yield put({
      type: ACTION_TYPE.REGISTER_SUCCESS,
      payload: {
        message: 'success!',
        email,
        username,
        name,
        balanceUSD,
        profilePictureUrl,
        _id
      }
    });
  } catch (error) {
    yield put({ type: ACTION_TYPE.REGISTER_FAILURE, payload: error });
  }
}

export function* addComment(action) {
  try {
    const token = localStorage.getItem('giving_tree_jwt');
    yield call(
      Api.addComment,
      action.payload.env,
      action.payload.postId,
      action.payload.newComment,
      token
    );

    yield put({
      type: ACTION_TYPE.ADD_COMMENT_SUCCESS
    });
  } catch (error) {
    console.log('error add reply: ', error);
    yield put({ type: ACTION_TYPE.ADD_COMMENT_FAILURE, payload: error });
    if (error.code === 401) {
      localStorage.removeItem('giving_tree_jwt');
      window.location = '/';
    }
  }
}

export function* addReply(action) {
  try {
    const token = localStorage.getItem('giving_tree_jwt');
    yield call(
      Api.addReply,
      action.payload.env,
      action.payload.postId,
      action.payload.commentId,
      action.payload.newReply,
      token
    );

    yield put({
      type: ACTION_TYPE.ADD_REPLY_SUCCESS
    });
  } catch (error) {
    console.log('error add reply: ', error);
    yield put({ type: ACTION_TYPE.ADD_REPLY_FAILURE, payload: error });
    if (error.code === 401) {
      localStorage.removeItem('giving_tree_jwt');
      window.location = '/';
    }
  }
}

export function* deleteComment(action) {
  try {
    const token = localStorage.getItem('giving_tree_jwt');
    const data = yield call(
      Api.deleteComment,
      action.payload.env,
      action.payload.postId,
      action.payload.commentId,
      token
    );

    const newItem = data.data;

    yield put({
      type: ACTION_TYPE.DELETE_COMMENT_SUCCESS,
      payload: {
        newItem
      }
    });
  } catch (error) {
    yield put({ type: ACTION_TYPE.DELETE_COMMENT_FAILURE, payload: error });
    if (error.code === 401) {
      localStorage.removeItem('giving_tree_jwt');
      window.location = '/';
    }
  }
}

export function* editComment(action) {
  try {
    const token = localStorage.getItem('giving_tree_jwt');
    const data = yield call(
      Api.editComment,
      action.payload.env,
      action.payload.postId,
      action.payload.commentId,
      action.payload.newContent,
      token
    );

    const newItem = data.data;

    yield put({
      type: ACTION_TYPE.EDIT_COMMENT_SUCCESS,
      payload: {
        newItem
      }
    });
  } catch (error) {
    yield put({ type: ACTION_TYPE.EDIT_COMMENT_FAILURE, payload: error });
    if (error.code === 401) {
      localStorage.removeItem('giving_tree_jwt');
      window.location = '/';
    }
  }
}

export function* upvote(action) {
  try {
    const token = localStorage.getItem('giving_tree_jwt');
    const data = yield call(
      Api.upvote,
      action.payload.env,
      action.payload.postId,
      action.payload.commentId,
      token
    );

    const newItem = data.data;

    yield put({
      type: ACTION_TYPE.UPVOTE_SUCCESS,
      payload: {
        newItem
      }
    });
  } catch (error) {
    yield put({ type: ACTION_TYPE.UPVOTE_FAILURE, payload: error });
    if (error.code === 401) {
      localStorage.removeItem('giving_tree_jwt');
      window.location = '/';
    }
  }
}

export function* downvote(action) {
  try {
    const token = localStorage.getItem('giving_tree_jwt');
    const data = yield call(
      Api.downvote,
      action.payload.env,
      action.payload.postId,
      action.payload.commentId,
      token
    );

    const newItem = data.data;

    yield put({
      type: ACTION_TYPE.DOWNVOTE_SUCCESS,
      payload: {
        newItem
      }
    });
  } catch (error) {
    yield put({ type: ACTION_TYPE.DOWNVOTE_FAILURE, payload: error });
    if (error.code === 401) {
      localStorage.removeItem('giving_tree_jwt');
      window.location = '/';
    }
  }
}

export function* follow(action) {
  try {
    const token = localStorage.getItem('giving_tree_jwt');
    const data = yield call(Api.follow, action.payload.env, action.payload.userId, token);
    const foundUser = data.data;

    yield put({
      type: ACTION_TYPE.FOLLOW_SUCCESS,
      payload: {
        foundUser
      }
    });
  } catch (error) {
    yield put({ type: ACTION_TYPE.FOLLOW_FAILURE, payload: error });
    if (error.code === 401) {
      localStorage.removeItem('giving_tree_jwt');
      window.location = '/';
    }
  }
}

export function* unfollow(action) {
  try {
    const token = localStorage.getItem('giving_tree_jwt');
    const data = yield call(Api.unfollow, action.payload.env, action.payload.userId, token);
    const foundUser = data.data;

    yield put({
      type: ACTION_TYPE.UNFOLLOW_SUCCESS,
      payload: {
        foundUser
      }
    });
  } catch (error) {
    yield put({ type: ACTION_TYPE.UNFOLLOW_FAILURE, payload: error });
    if (error.code === 401) {
      localStorage.removeItem('giving_tree_jwt');
      window.location = '/';
    }
  }
}

export function* loadNewsfeed(action) {
  try {
    const token = localStorage.getItem('giving_tree_jwt');
    const data = yield call(
      Api.loadNewsFeed,
      action.payload.env,
      action.payload.page,
      action.payload.feed,
      token
    );

    const { newsfeed, currentPage, pages, numOfResults } = data.data;

    yield put({
      type: ACTION_TYPE.LOAD_NEWSFEED_SUCCESS,
      payload: {
        newsfeed,
        currentPage,
        pages,
        numOfResults
      }
    });
  } catch (error) {
    yield put({ type: ACTION_TYPE.LOAD_NEWSFEED_FAILURE, payload: error });
  }
}

export function* loadPost(action) {
  try {
    const token = localStorage.getItem('giving_tree_jwt');
    const data = yield call(Api.loadPost, action.payload.env, action.payload.id, token);
    const post = data.data;

    yield put({
      type: ACTION_TYPE.LOAD_POST_SUCCESS,
      payload: {
        post
      }
    });
  } catch (error) {
    yield put({ type: ACTION_TYPE.LOAD_POST_FAILURE, payload: error });
    if (error.code === 401) {
      localStorage.removeItem('giving_tree_jwt');
      window.location = '/';
    }
  }
}

export function* loadUser(action) {
  try {
    const data = yield call(Api.loadUser, action.payload.env, action.payload.username);
    const {
      message,
      email,
      username,
      posts,
      comments,
      summary,
      followers,
      following,
      createdAt,
      upvotes,
      downvotes,
      verified,
      _id,
      profilePictureUrl,
      headerPictureUrl
    } = data.data;

    yield put({
      type: ACTION_TYPE.LOAD_USER_SUCCESS,
      payload: {
        _id,
        message,
        email,
        headerPictureUrl,
        username,
        upvotes,
        downvotes,
        profilePictureUrl,
        summary,
        posts,
        comments,
        verified,
        followers,
        following,
        createdAt
      }
    });
  } catch (error) {
    yield put({ type: ACTION_TYPE.LOAD_USER_FAILURE, payload: error });
    if (error.code === 401) {
      localStorage.removeItem('giving_tree_jwt');
      window.location = '/';
    }
  }
}

export function* getCurrentUser(action) {
  try {
    const token = localStorage.getItem('giving_tree_jwt');
    const data = yield call(Api.getCurrentUser, action.payload.env, token);
    const {
      message,
      email,
      username,
      _id,
      seenSubmitTutorial,
      welcomeTutorial,
      notifications,
      createdAt,
      drafts
    } = data.data;

    yield put({
      type: ACTION_TYPE.GET_CURRENT_USER_SUCCESS,
      payload: {
        message,
        email,
        username,
        seenSubmitTutorial,
        welcomeTutorial,
        notifications,
        createdAt,
        drafts,
        _id
      }
    });
  } catch (error) {
    yield put({ type: ACTION_TYPE.GET_CURRENT_USER_FAILURE, payload: error });
    if (error.code === 401) {
      localStorage.removeItem('giving_tree_jwt');
      window.location = '/';
    }
  }
}

export function* confirmPassword(action) {
  try {
    yield call(
      Api.confirmPassword,
      action.payload.env,
      action.payload.password,
      action.payload.token
    );

    yield put({
      type: ACTION_TYPE.CONFIRM_PASSWORD_SUCCESS
    });
  } catch (error) {
    let errorResponse = error;
    if (error === 'Too many requests, please try again later.') {
      errorResponse = { message: 'Please try again in 1 minunte' };
    }
    yield put({ type: ACTION_TYPE.CONFIRM_PASSWORD_FAILURE, payload: errorResponse });
  }
}

export function* initiateReset(action) {
  try {
    yield call(Api.initiateReset, action.payload.env, action.payload.email);

    yield put({
      type: ACTION_TYPE.INITIATE_RESET_SUCCESS
    });
  } catch (error) {
    yield put({ type: ACTION_TYPE.INITIATE_RESET_FAILURE, payload: error });
  }
}

export function* logout(action) {
  try {
    const token = localStorage.getItem('giving_tree_jwt');
    yield call(Api.logout, action.payload.env, token);

    localStorage.removeItem('giving_tree_jwt');

    yield put({
      type: ACTION_TYPE.LOGOUT_SUCCESS
    });
  } catch (error) {
    yield put({ type: ACTION_TYPE.LOGOUT_FAILURE, payload: error });
    localStorage.removeItem('giving_tree_jwt');
    window.location = '/';
  }
}

export function* markSeen(action) {
  try {
    const token = localStorage.getItem('giving_tree_jwt');
    yield call(
      Api.markSeen,
      action.payload.env,
      action.payload.postId,
      action.payload.userId,
      token
    );

    yield put({
      type: ACTION_TYPE.MARK_SEEN_SUCCESS
    });
  } catch (error) {
    console.log('error: ', error);
    yield put({ type: ACTION_TYPE.MARK_SEEN_FAILURE, payload: error });
  }
}

export function* clearNotifications(action) {
  try {
    const token = localStorage.getItem('giving_tree_jwt');
    yield call(Api.clearNotifications, action.payload.env, token);

    yield put({
      type: ACTION_TYPE.CLEAR_NOTIFICATIONS_SUCCESS,
      action
    });
  } catch (error) {
    yield put({ type: ACTION_TYPE.CLEAR_NOTIFICATIONS_FAILURE, payload: error });
  }
}

export function* addNotifications(action) {
  try {
    yield put({
      type: ACTION_TYPE.ADD_NOTIFICATIONS_SUCCESS,
      action
    });
  } catch (error) {
    yield put({ type: ACTION_TYPE.ADD_NOTIFICATIONS_FAILURE, payload: error });
  }
}

export function* updateProfile(action) {
  try {
    const token = localStorage.getItem('giving_tree_jwt');
    yield call(
      Api.updateProfile,
      action.payload.env,
      action.payload.summary,
      action.payload.rawImage,
      action.payload.rawHeader,
      token
    );

    yield put({
      type: ACTION_TYPE.UPDATE_PROFILE_SUCCESS
    });
  } catch (error) {
    yield put({ type: ACTION_TYPE.UPDATE_PROFILE_FAILURE, payload: error });
    // localStorage.removeItem('giving_tree_jwt');
    // window.location = '/';
  }
}

export function* logoutAll(action) {
  try {
    const token = localStorage.getItem('giving_tree_jwt');
    yield call(Api.logoutAll, action.payload.env, token);

    localStorage.removeItem('giving_tree_jwt');

    yield put({
      type: ACTION_TYPE.LOGOUT_SUCCESS
    });
  } catch (error) {
    yield put({ type: ACTION_TYPE.LOGOUT_FAILURE, payload: error });
    localStorage.removeItem('giving_tree_jwt');
    window.location = '/';
  }
}

export default function* watchAuthSagas() {
  yield takeLatest(ACTION_TYPE.CONFIRM_PASSWORD_REQUESTED, confirmPassword);
  yield takeLatest(ACTION_TYPE.UPDATE_PROFILE_REQUESTED, updateProfile);
  yield takeLatest(ACTION_TYPE.ADD_NOTIFICATIONS_REQUESTED, addNotifications);
  yield takeLatest(ACTION_TYPE.CLEAR_NOTIFICATIONS_REQUESTED, clearNotifications);
  yield takeLatest(ACTION_TYPE.INITIATE_RESET_REQUESTED, initiateReset);
  yield takeLatest(ACTION_TYPE.MARK_SEEN_REQUESTED, markSeen);
  yield takeLatest(ACTION_TYPE.LOGIN_REQUESTED, login);
  yield takeLatest(ACTION_TYPE.REGISTER_REQUESTED, register);
  yield takeLatest(ACTION_TYPE.ADD_COMMENT_REQUESTED, addComment);
  yield takeLatest(ACTION_TYPE.ADD_REPLY_REQUESTED, addReply);
  yield takeLatest(ACTION_TYPE.EDIT_COMMENT_REQUESTED, editComment);
  yield takeLatest(ACTION_TYPE.DELETE_COMMENT_REQUESTED, deleteComment);
  yield takeLatest(ACTION_TYPE.UPVOTE_REQUESTED, upvote);
  yield takeLatest(ACTION_TYPE.DOWNVOTE_REQUESTED, downvote);
  yield takeLatest(ACTION_TYPE.FOLLOW_REQUESTED, follow);
  yield takeLatest(ACTION_TYPE.UNFOLLOW_REQUESTED, unfollow);
  yield takeLatest(ACTION_TYPE.LOAD_NEWSFEED_REQUESTED, loadNewsfeed);
  yield takeLatest(ACTION_TYPE.GET_CURRENT_USER_REQUESTED, getCurrentUser);
  yield takeLatest(ACTION_TYPE.LOAD_POST_REQUESTED, loadPost);
  yield takeLatest(ACTION_TYPE.LOAD_USER_REQUESTED, loadUser);
  yield takeLatest(ACTION_TYPE.LOGOUT_REQUESTED, logout);
  yield takeLatest(ACTION_TYPE.LOGOUT_ALL_REQUESTED, logoutAll);
}
