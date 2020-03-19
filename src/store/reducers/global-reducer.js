import GLOBAL_TYPES from '../actions/global/action-types';

const initialState = {
  searchResults: [],
  searchLoading: false,
  searchSuccess: false,
  searchFailure: false,
  errorMessage: ''
};

const global = (state = initialState, action) => {
  switch (action.type) {
    case GLOBAL_TYPES.SEARCH_REQUESTED:
      return Object.assign({}, state, {
        searchLoading: true,
        searchSuccess: false,
        searchFailure: false,
        errorMessage: ''
      });
    case GLOBAL_TYPES.SEARCH_SUCCESS:
      return Object.assign({}, state, {
        searchLoading: false,
        searchSuccess: true,
        searchResults: action.payload.searchResults
      });
    case GLOBAL_TYPES.SEARCH_FAILURE:
      return Object.assign({}, state, {
        searchLoading: false,
        searchSuccess: false,
        searchFailure: true,
        errorMessage: action.payload.message
      });
    default:
      return state;
  }
};

export default global;
