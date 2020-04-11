import * as React from 'react';
import { StatefulPopover, PLACEMENT } from 'baseui/popover';
import './HelpMenu.css';
import { NavLink } from 'react-router-dom';

class HelpMenu extends React.Component {

  render() {
    return (
      <div className="HelpMenu rounded-full shadow-lg bg-white">
        <StatefulPopover placement={PLACEMENT.topRight}
        overrides={{
          Body: {
            style: {
              borderRadius: '6px !important'
            }
          },
          Inner: {
            style: {
              borderRadius: '6px !important'
            }
          }
        }}
        content={({ close }) => (
          <div className="HelpMenuContent">
            <ul className="list-style-none">
              <li>
                <NavLink to="/how-it-works">How it works</NavLink>
              </li>
              <li>
                <NavLink to="/guidelines#health-and-safety">
                  Health and safety guidelines
                </NavLink>
              </li>
              <li>
                <NavLink to="/guidelines#community">
                  Community guidelines
                </NavLink>
              </li>
              <li className="divider relative"></li>
              <li>
                <a href="tel:415-964-4261">
                  Call/Text us: 415-964-4261
                </a>
              </li>
              <li>
                <a href="mailto: team.givingtree@gmail.com">
                  Email us: team.givingtree@gmail.com
                </a>
              </li>
              <li className="divider relative"></li>
              <li>
                <NavLink to="/about#about-us">
                  About us
                </NavLink>
              </li>
              <li>
                <NavLink to="/about#privacy-policy">
                  Privacy
                </NavLink>
              </li>
            </ul>
          </div>
        )}
        >
          <button className="text-xs flex items-center h-6 w-6">
            <img className="block w-full"
            src="https://d1ppmvgsdgdlyy.cloudfront.net/information.svg" 
            alt="Help menu"/>
          </button>
        </StatefulPopover>
      </div>
    );
  }
}

export default HelpMenu;
