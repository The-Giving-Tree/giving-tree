import GLOBAL_TYPES from './action-types';

export const search = payload => ({
  type: GLOBAL_TYPES.SEARCH_REQUESTED,
  payload
});
