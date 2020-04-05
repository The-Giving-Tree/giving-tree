import * as React from 'react';
import Constants from './Constants';
import { NavLink } from 'react-router-dom';

class Sidebar extends React.Component {
  render() {
    const authenticated = localStorage.getItem('giving_tree_jwt');
    return (
      <div>
        {/* Mobile Nav */}

        {/* Desktop Nav */}
        <nav className="hidden lg:block">
          <ul className="list-none p-0 m-0">
            <li className="text-black transition duration-150 px-6 my-2">
              <NavLink
                to={Constants.PATHS.NEWSFEED}
                onClick={() => {
                  window.location = '/home/discover';
                }}
                className="flex items-center"
                activeClassName="text-indigo-600"
              >
                <img
                  alt="search"
                  className="inline mr-3"
                  src="https://d1ppmvgsdgdlyy.cloudfront.net/search.svg"
                  style={{ height: 20 }}
                />
                Discover Requests
              </NavLink>
            </li>

            <li className="text-black transition duration-150 px-6 my-2">
              <NavLink
                to={() => {
                  if (authenticated) {
                    return Constants.PATHS.ONGOING;
                  } else {
                    return Constants.PATHS.SIGNUP;
                  }
                }}
                className="flex items-center"
                activeClassName="text-indigo-600"
                onClick={() => {
                  window.location = '/home/ongoing';
                }}
              >
                <img
                  alt="search"
                  className="inline mr-3"
                  src="https://d1ppmvgsdgdlyy.cloudfront.net/care.svg"
                  style={{ height: 20 }}
                />
                Your requests
              </NavLink>
            </li>

            <li className="text-black transition duration-150 px-6 my-2">
              <NavLink
                to={() => {
                  if (authenticated) {
                    return Constants.PATHS.COMPLETED;
                  } else {
                    return Constants.PATHS.SIGNUP;
                  }
                }}
                onClick={() => {
                  window.location = '/home/completed';
                }}
                className="flex items-center"
                activeClassName="text-indigo-600"
              >
                <img
                  alt="search"
                  className="inline mr-3"
                  src="https://d1ppmvgsdgdlyy.cloudfront.net/gift.svg"
                  style={{ height: 20 }}
                />
                Completed requests
              </NavLink>
            </li>

            <li className="text-black transition duration-150 px-6 my-2">
              <NavLink
                to={Constants.PATHS.GLOBAL}
                className="flex items-center"
                activeClassName="text-indigo-600"
                onClick={() => {
                  window.location = '/home/global';
                }}
              >
                <img
                  alt="search"
                  className="inline mr-3"
                  src="https://d1ppmvgsdgdlyy.cloudfront.net/global.svg"
                  style={{ height: 20 }}
                />
                Global requests
              </NavLink>
            </li>

            <li className="text-black transition duration-150 px-6 my-2">
              <NavLink
                to={() => {
                  if (authenticated) {
                    return Constants.PATHS.SUBMIT;
                  } else {
                    return Constants.PATHS.SIGNUP;
                  }
                }}
                className="flex items-center"
                activeClassName="text-indigo-600"
              >
                <span className="mr-3">❤️</span> Make a Request
              </NavLink>
            </li>
          </ul>
        </nav>
      </div>
    );
  }
}

export default Sidebar;
