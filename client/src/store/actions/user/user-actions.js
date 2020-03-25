import ACTION_TYPE from './action-types';

export const submitDraft = payload => ({
  type: ACTION_TYPE.SUBMIT_DRAFT_REQUESTED,
  payload
});

export const saveDraft = payload => ({
  type: ACTION_TYPE.SAVE_DRAFT_REQUESTED,
  payload
});

export const publishPost = payload => ({
  type: ACTION_TYPE.PUBLISH_POST_REQUESTED,
  payload
});

export const editPost = payload => ({
  type: ACTION_TYPE.EDIT_POST_REQUESTED,
  payload
});

export const uploadPhoto = payload => ({
  type: ACTION_TYPE.UPLOAD_PHOTO_REQUESTED,
  payload
});

export const getDraft = payload => ({
  type: ACTION_TYPE.GET_DRAFT_REQUESTED,
  payload
});

export const handleSeenSubmit = payload => ({
  type: ACTION_TYPE.SEEN_SUBMIT_TUTORIAL_REQUESTED,
  payload
});
