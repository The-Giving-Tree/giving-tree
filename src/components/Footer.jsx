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
          <div style={{ position: 'relative' }} className="footer">
            <div class="grid grid-cols-5 gap-4" style={{ paddingTop: 58, paddingLeft: 112 }}>
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
                {/* <Link to="/about#terms-of-use">
                  <div className="footer-text hover:text-green-600 transition duration-150">
                    Terms of Use
                  </div>
                </Link> */}
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
                <div className="footer-heading">Guidelines</div>
                <div className="footer-text hover:text-green-600 transition duration-150">
                  Community
                </div>
                <div className="footer-text hover:text-green-600 transition duration-150">
                  Health and Safety
                </div>
              </div>
              <div>
                <div className="footer-heading">Join The Community</div>
                <div className="flex justify-start">
                  <button
                    onClick={() => (window.location = '/signup')}
                    style={{ outline: 'none', fontSize: 18 }}
                    className="bg-black hover:bg-green-700 text-white font-bold py-2 px-8 rounded"
                  >
                    Sign Up
                  </button>
                </div>
                <br />
                <div className="footer-heading mt-8">Follow Us On</div>
              </div>
              <div>
                <img
                  style={{ position: 'absolute', bottom: 0, right: 0 }}
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
