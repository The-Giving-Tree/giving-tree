import * as React from 'react';
import './Sidebar.css';

// Icons
import { ReactComponent as IconCare } from '../../assets/icons/care.svg';
import { ReactComponent as IconSearch } from '../../assets/icons/search.svg';
import { ReactComponent as IconGlobal } from '../../assets/icons/global.svg';
import { ReactComponent as IconBadge } from '../../assets/icons/badge.svg';
import {
  ReactComponent as IconHeart
} from '../../assets/icons/Heart_Inctive.svg';
import {
  ReactComponent as IconHeartActive
} from '../../assets/icons/Heart_Active.svg';


class Sidebar extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      authenticated: false
    }
  }

  componentDidMount() {
    this.setAuthentication();
  }

  componentDidUpdate(oProps, oState) {
    if (this.state.authenticated) {
      // this.setAuthentication();
      console.log(oProps, oState);
    }
  }

  /**
   * Check local storage for authentication
   *
   * @memberof Sidebar
   */
  setAuthentication() {
    // Check if auth key is set.
    const bool = (localStorage.getItem('giving_tree_jwt')) ? true : false;
    this.setState({
      authenticated: bool
    })
  }

  /**
   * Check if current URL matches value provided
   *
   * @param {*} val
   * @returns
   * @memberof Sidebar
   */
  isLocation(val) {
    return this.props.match.url === val;
  }

  render() {
    const authenticated = localStorage.getItem('giving_tree_jwt');
    return (
      <aside className="">
        {/* Mobile Nav HERE */}
        <nav className="sidebar-nav-sm fixed w-full block md:hidden">
          <ul className="list-none py-1 flex items-end justify-between">
            <li className={`px-2 ${(this.isLocation('/home/discover')) ? 'nav-item-active' : ''}`}>
              <button onClick={() => {
                window.location = '/home/discover';
              }}
                className="flex flex-col items-center justify-center">
                  <IconSearch className="mb-1" />
                  <strong>Find Requests</strong>
              </button>
            </li>

            <li className={`px-2 ${(this.isLocation('/home/global')) ? 'nav-item-active' : ''}`}>
              <button onClick={() => {
                window.location = '/home/global';
              }}
              className="flex flex-col items-center justify-center">
                <IconGlobal className="mb-1" />
                <strong>Global requests</strong>
              </button>
            </li>

            <li className={`px-2 ${(this.isLocation('/submit')) ? 'nav-item-active' : ''}`}>
              <button onClick={() => {
                const loc = (authenticated) ? '/submit' : '/signup';
                window.location = loc;
              }}
                className="flex flex-col items-center justify-center">
                {this.isLocation('/submit') ? (
                  <IconHeartActive className="icon-heart-active mb-1" />
                ) : (
                  <IconHeart className="icon-heart mb-1" />
                )}
                
                <strong>Make a Request</strong>
              </button>
            </li>

            <li className={`px-2 ${(this.isLocation('/home/ongoing')) ? 'nav-item-active' : ''}`}>
              <button onClick={() => {
                window.location = '/home/ongoing';
              }}
                className="flex flex-col items-center justify-center">
                  <IconCare className="mb-1" />
                  <strong>Your requests</strong>
              </button>
            </li>

            <li className={`px-2 ${(this.isLocation('/leaderboard')) ? 'nav-item-active' : ''}`}>
              <button onClick={() => {
                window.location = '/leaderboard';
              }}
                className="flex flex-col items-center justify-center">
                  <IconBadge className="icon-badge mb-1" />
                  <strong>View Leaderboard</strong>
              </button>
            </li>
          </ul>
        </nav>

        {/* Table & Desktop Nav */}
        <nav className="hidden md:block mb-10 sidebar-nav-md">
          <ul className="list-none p-0 m-0 flex items-center justify-center xl:block xl:px-6">
            <li className="text-black transition duration-150 xl:my-2 mx-4 xl:mx-0">
              <button onClick={() => {
                window.location = '/home/discover';
              }}
                className="flex flex-col xl:flex-row items-center justify-center xl:justify-start">
                  <span className="xl:inline-block border h-10 w-10 rounded-full border-gray-300 border flex items-center justify-center xl:mr-3 xl:border-none xl:h-5 xl:w-5 bg-white">
                    <img alt="search"
                      className="block w-5 h-5 xl:w-full xl:h-full"
                      src="https://d1ppmvgsdgdlyy.cloudfront.net/search.svg"
                    />
                  </span>
                  <span>Find Requests</span>
              </button>
            </li>

            <li className="text-black transition duration-150 xl:my-2 mx-4 xl:mx-0">
              <button onClick={() => {
                window.location = '/home/ongoing';
              }}
                className="flex flex-col xl:flex-row items-center justify-center xl:justify-start">
                  <span className="xl:inline-block border h-10 w-10 rounded-full border-gray-300 border flex items-center justify-center xl:mr-3 xl:border-none xl:h-5 xl:w-5 bg-white">
                    <img alt="search"
                      className="block w-5 h-5 xl:w-full xl:h-full"
                      src="https://d1ppmvgsdgdlyy.cloudfront.net/care.svg"
                    />
                  </span>
                  Your requests
              </button>
            </li>

            <li className="text-black transition duration-150 xl:my-2 mx-4 xl:mx-0 hidden xl:block">
              <button onClick={() => {
                window.location = '/home/completed';
              }}
                className="flex flex-col xl:flex-row items-center justify-center xl:justify-start">
                  <span className="xl:inline-block border h-10 w-10 rounded-full border-gray-300 border flex items-center justify-center xl:mr-3 xl:border-none xl:h-5 xl:w-5 bg-white">
                    <img alt="Gift"
                      className="block w-5 h-5 xl:w-full xl:h-full"
                      src="https://d1ppmvgsdgdlyy.cloudfront.net/gift.svg"
                    />
                  </span>
                    Completed requests
              </button>
            </li>

            <li className="text-black transition duration-150 xl:my-2 mx-4 xl:mx-0">
              <button onClick={() => {
                window.location = '/home/global';
              }}
              className="flex flex-col xl:flex-row items-center justify-center xl:justify-start">
                <span className="xl:inline-block border h-10 w-10 rounded-full border-gray-300 border flex items-center justify-center xl:mr-3 xl:border-none xl:h-5 xl:w-5 bg-white">
                  <img alt="Global"
                    className="block w-5 h-5 xl:w-full xl:h-full"
                    src="https://d1ppmvgsdgdlyy.cloudfront.net/global.svg"
                    style={{ height: 20 }}
                  />
                </span>
                  Global requests
              </button>
            </li>

            <li className="text-black transition duration-150 xl:my-2 mx-4 xl:mx-0">
              <button onClick={() => {
                const loc = (authenticated) ? '/home/submit' : '/home/signup';
                window.location = loc;
              }}
                className="flex flex-col xl:flex-row items-center justify-center xl:justify-start">
                <span className="xl:inline-block border h-10 w-10 rounded-full border-gray-300 border flex items-center justify-center xl:mr-3 xl:border-none xl:h-5 xl:w-5 bg-white">
                  <span role="img" aria-label="Heart emoji"
                  className="block w-5 h-5 xl:w-full xl:h-full">❤️</span> 
                </span>
                Make a Request
              </button>
            </li>
          </ul>
        </nav>
      </aside>
    );
  }
}

export default Sidebar;
