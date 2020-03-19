import Axios from 'axios';
import * as Sentry from '@sentry/browser';
import queryString from 'query-string';

import ROUTES from '../../../utils/routes';

const search = async (env, query) => {
  try {
    console.log('env: ', env);
    let qstring = queryString.stringify({ q: query });
    const data = await Axios.get(`${ROUTES[env].giving_tree}/search/?${qstring}`);
    return data;
  } catch (e) {
    const error = e.response.data ? e.response.data : e;
    Sentry.captureException(new Error(JSON.stringify(error)));
    throw error;
  }
};

const Api = {
  search
};

export default Api;
