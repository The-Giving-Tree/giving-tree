import * as React from 'react';
// import Constants from './Constants';
// import { NavLink } from 'react-router-dom';

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
              <button onClick={() => {
                window.location = '/home/discover';
              }}
                className="flex items-center">
                  <img alt="search"
                    className="inline mr-3"
                    src="https://d1ppmvgsdgdlyy.cloudfront.net/search.svg"
                    style={{ height: 20 }}
                  />
                  Find Requests
              </button>
              {/* TODO: Use NavLink when NewsFeedPage2 is implemented */}
              {/* <NavLink
                to={Constants.PATHS.NEWSFEED}
                // onClick={() => {
                //   window.location = '/home/discover';
                // }}
                className="flex items-center"
                activeClassName="text-indigo-600"
              >
                <img
                  alt="search"
                  className="inline mr-3"
                  src="https://d1ppmvgsdgdlyy.cloudfront.net/search.svg"
                  style={{ height: 20 }}
                />
                Find Requests
              </NavLink> */}
            </li>

            <li className="text-black transition duration-150 px-6 my-2">
              <button onClick={() => {
                window.location = '/home/ongoing';
              }}
                className="flex items-center">
                  <img alt="search"
                    className="inline mr-3"
                    src="https://d1ppmvgsdgdlyy.cloudfront.net/care.svg"
                    style={{ height: 20 }}
                  />
                  Your requests
              </button>
              {/* TODO: Use NavLink when NewsFeedPage2 is implemented */}
               {/* <NavLink to={() => {
                  if (authenticated) {
                    return Constants.PATHS.ONGOING;
                  } else {
                    return Constants.PATHS.SIGNUP;
                  }
                }}
                className="flex items-center"
                activeClassName="text-indigo-600"
                // onClick={() => {
                //   window.location = '/home/ongoing';
                // }}
              >
                <img
                  alt="Care"
                  className="inline mr-3"
                  src="https://d1ppmvgsdgdlyy.cloudfront.net/care.svg"
                  style={{ height: 20 }}
                />
                Your requests
              </NavLink> */}
            </li>

            <li className="text-black transition duration-150 px-6 my-2">
              <button onClick={() => {
                window.location = '/home/completed';
              }}
                className="flex items-center">
                  <img alt="Gift"
                    className="inline mr-3"
                    src="https://d1ppmvgsdgdlyy.cloudfront.net/gift.svg"
                    style={{ height: 20 }}
                  />
                  Completed requests
              </button>
              {/* TODO: Use NavLink when NewsFeedPage2 is implemented */}
              {/* <NavLink
                to={() => {
                  if (authenticated) {
                    return Constants.PATHS.COMPLETED;
                  } else {
                    return Constants.PATHS.SIGNUP;
                  }
                }}
                // onClick={() => {
                //   window.location = '/home/completed';
                // }}
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
              </NavLink> */}
            </li>

            <li className="text-black transition duration-150 px-6 my-2">
              <button onClick={() => {
                window.location = '/home/global';
              }}
                className="flex items-center">
                  <img alt="Global"
                    className="inline mr-3"
                    src="https://d1ppmvgsdgdlyy.cloudfront.net/global.svg"
                    style={{ height: 20 }}
                  />
                  Global requests
              </button>
              {/* TODO: Use NavLink when NewsFeedPage2 is implemented */}
              {/* <NavLink
                to={Constants.PATHS.GLOBAL}
                className="flex items-center"
                activeClassName="text-indigo-600">
                <img
                  alt="search"
                  className="inline mr-3"
                  src="https://d1ppmvgsdgdlyy.cloudfront.net/global.svg"
                  style={{ height: 20 }}
                />
                Global requests
              </NavLink> */}
            </li>

            <li className="text-black transition duration-150 px-6 my-2">
              <button onClick={() => {
                const loc = (authenticated) ? '/home/submit' : '/home/signup';
                window.location = loc;
              }}
                className="flex items-center">
                  <span role="img" aria-label="Heart emoji"
                  className="mr-3">❤️</span> Make a Request
              </button>
              {/* TODO: Use NavLink when NewsFeedPage2 is implemented
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
              </NavLink> */}
            </li>
          </ul>
        </nav>
      </div>
    );
  }
}

export default Sidebar;
