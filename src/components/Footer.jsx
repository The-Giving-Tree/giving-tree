import * as React from 'react';
import Media from 'react-media';
import { connect } from 'react-redux';
import { HashLink as Link } from 'react-router-hash-link';

function Footer(props) {
  require('dotenv').config();

  return (
    <Media
      queries={{
        small: '(max-width: 599px)',
        medium: '(min-width: 600px) and (max-width: 1199px)',
        large: '(min-width: 1200px)'
      }}
    >
      {matches => (
        <React.Fragment>
          <div style={{
            height: 'auto',
            position: 'relative',
          }} className="footer px-10 py-6">
            <div className="grid grid-flow-row grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4">
              <div>
                <Link to="/about#about-us">
                  <div className="footer-heading">The Giving Tree</div>
                </Link>
                <Link to="/about#about-us">
                  <div className="footer-text hover:text-green-600 transition duration-150">
                    About Us
                  </div>
                </Link>
                <Link to="/about#contact-us">
                  <div className="footer-text hover:text-green-600 transition duration-150">
                    Contact Us
                  </div>
                </Link>
                <Link to="/about#privacy-policy">
                  <div className="footer-text hover:text-green-600 transition duration-150">
                    Privacy Policy
                  </div>
                </Link>
                <Link to="#">
                  <div className="footer-text hover:text-green-600 transition duration-150">
                    Hotline: +1 415-964-4261
                  </div>
                </Link>
              </div>
              <div>
                <Link to="/how-it-works#how-to-help">
                  <div className="footer-heading">How It Works</div>
                </Link>
                <Link to="/how-it-works#faqs">
                  <div className="footer-text hover:text-green-600 transition duration-150">
                    FAQs
                  </div>
                </Link>
                <Link to="/how-it-works#how-to-help">
                  <div className="footer-text hover:text-green-600 transition duration-150">
                    How to Help
                  </div>
                </Link>
                <Link to="/how-it-works#how-to-get-help">
                  <div className="footer-text hover:text-green-600 transition duration-150">
                    How to Get Help
                  </div>
                </Link>
              </div>
              <div>
                <Link to="/guidelines#health-and-safety">
                  <div className="footer-heading">Guidelines</div>
                </Link>
                <Link to="/guidelines#health-and-safety">
                  <div className="footer-text hover:text-green-600 transition duration-150">
                    Health and Safety
                  </div>
                </Link>
                <Link to="/guidelines#community">
                  <div className="footer-text hover:text-green-600 transition duration-150">
                    Community
                  </div>
                </Link>
              </div>
              <div className="text-left">
                <div className="footer-heading mb-3">Join The Community</div>
                <button
                  onClick={() => (window.location = '/signup')}
                  style={{ outline: 'none', fontSize: 18 }}
                  className="bg-black hover:bg-green-700 text-white font-bold py-2 px-8 rounded"
                >
                  Sign Up
                </button>
                <br />
                {/* <div className="footer-heading mt-8">Follow Us On</div> */}
              </div>
              <div className="block sm:hidden md:block">
                <img
                  style={{ 
                    position: 'absolute', 
                    bottom: 0, 
                    right: 0,
                    width: '175px'
                  }}
                  src="https://d1ppmvgsdgdlyy.cloudfront.net/footer-logo.svg"
                  alt="footer"
                />
              </div>
            </div>
          </div>
        </React.Fragment>
      )}
    </Media>
  );
}

const mapDispatchToProps = dispatch => ({});

const mapStateToProps = state => ({});

Footer.defaultProps = {};

Footer.propTypes = {};

export default connect(mapStateToProps, mapDispatchToProps)(Footer);
