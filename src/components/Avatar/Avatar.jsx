import * as React from 'react';
import { connect } from 'react-redux';

class Avatar extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      src: '',
      isLink: false,
      initial: ''
    }
  }

  componentDidMount() {
    this.setSource();
  }

  componentDidUpdate(prevProps, prevState) { }

  /**
   * TODO: Add description of what this function does.
   * @param {*} username
   * @param {*} version
   */
  generateHash(username = '', version = 0) {
    const secret = 'givingtree';
    const hash = require('crypto')
      .createHmac('sha256', secret)
      .update(username.toLowerCase())
      .digest('hex');

    const suffix =
      Number(version) === 0 || !version ? '' : `%3Fver%3D${version}`;
    const url =
      `https://d1ppmvgsdgdlyy.cloudfront.net/user/${hash}${suffix}`;
    return url;
  }

  setSource() {
    this.setState({ 
      src: this.generateHash(
        this.props.user.username, this.props.user.profileVersion)
    });

    if (!this.state.src) this.setFallBack();
  }

  setFallBack() {
    const letter = this.props.user.username.charAt(0).toUpperCase();
    this.setState({ initial: letter })
  }

  render() {
    if (this.props.isLink) {
      return (
        <a href={`/user/${this.props.user.username}`}
        className="Avatar inline-block w-8 h-8">
          {/* {this.state.src ? (
            <img src={this.props.profilePictureUrl} 
            alt={`Avatar for User: ${this.props.user.username}`}/>
          ) : (
            <span>{this.state.initial}</span>
          )} */}
        </a>
      );
    } else {
      return (
        <div className="Avatar inline-block w-8 h-8">
          {/* <img src={this.props.profilePictureUrl}
          alt={`Avatar for User: ${this.props.user.username}`} /> */}
        </div>
      );
    }
  }
}

const mapDispatchToProps = dispatch => ({});

const mapStateToProps = state => ({});

export default connect(mapStateToProps, mapDispatchToProps)(Avatar);
