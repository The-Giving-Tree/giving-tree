import * as React from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import moment from 'moment';
import Avatar from '../../../components/Avatar/Avatar';
import './NewsFeedCard.css';
import Tag from '../../../components/Tag/Tag';
import { getDistance } from 'geolib';

import { upvote, downvote } from '../../../store/actions/auth/auth-actions';

import { ChevronUp, ChevronDown } from 'baseui/icon';

class NewsFeedCard extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      details: {},
      upvoteIndex: [],
      downvoteIndex: [],
      upvoteHover: [],
      downvoteHover: []
    }
  }

  componentDidMount() {
    this.setTags();
    this.setDetails();
  }

  componentDidUpdate(prevProps, prevState) {
    
  }

  // setVoteIndex() {
  //   if (
  //     this.props.item.downVotes.includes(this.props.user._id) &&
  //     !this.state.downvoteIndex.includes(this.props.key) &&
  //     !this.props.item.initialDownvotes.includes(this.props.key)
  //   ) {
  //     this.props.item.initialDownvotes.push(this.props.key);
  //     this.state.downvoteIndex.push(this.props.key);
  //   }
  //   if (
  //     this.props.item.item.upVotes.includes(this.props.user._id) &&
  //     !this.state.upvoteIndex.includes(this.props.key) &&
  //     !this.props.item.initialUpvotes.includes(this.props.key)
  //   ) {
  //     this.props.item.initialUpvotes.push(this.props.key);
  //     this.state.upvoteIndex.push(this.props.key);
  //   }
  // }

  /**
   * Set the tags that will be shown on this card. Also sets the status tags.
   *
   * @memberof NewsFeedCard
   */
  setTags() {
    const tags = [];

    // Iterate over the categories and build tags.
    this.props.item.categories.forEach((cat, i) => {
      tags.push(
        <Tag label={cat} type="category" key={i} className="ml-1 mb-1" />
      );
    })

    // Set status based on assigned user
    if (this.props.item.assignedUser) { 
      const status = (this.props.completed) ? 'Completed' : 'In progress';
      tags.push(
        <Tag label={status} type={status} key={tags.length} 
        className="ml-1 mb-1" />
      )
    }

    return tags;
  }

  /**
   * Get the details of the task from the item.text string
   *
   * @memberof NewsFeedCard
   */
  setDetails() {
    const item = this.props.item.text;

    if (item) {
      const obj = JSON.parse(item);
      this.setState({ 
        details: obj 
      })  
    }
  }

  /**
   * Mask the users telephone number until the task has been claimed.
   *
   * @param {*} number
   * @memberof NewsFeedCard
   */
  maskPhoneNumber(number) {
    return `***-***-${number.substring(
      number - 4)}`;
  }
  
  /**
   * Return the user's phone number if the task is ongoing, otherwise, mask
   * the phone number
   *
   * @returns
   * @memberof NewsFeedCard
   */
  getPhoneNumber() {
    if (this.props.match.url === '/home/ongoing') {
      return this.state.details.phoneNumber;
    } else {
      return this.maskPhoneNumber(this.state.details.phoneNumber);
    }
  }

  /**
   * Calculate the distance to the user from the request location
   *
   * @param {*} requestLocation
   * @returns
   * @memberof NewsFeedCard
   */
  calculateDistance(requestLocation) {
    if (requestLocation.lat && requestLocation.lng && this.props.coords) {
      var request = {
        latitude: requestLocation.lat,
        longitude: requestLocation.lng
      };

      var user = {
        latitude: this.props.coords.latitude,
        longitude: this.props.coords.longitude
      };

      let distance = getDistance(request, user); // meters
      let km = distance / 1000;
      let mi = km * 0.621371;

      return mi.toFixed(2);
    } else {
      return '-';
    }
  }

  foodCartJSX(cart) {
    return cart.length === 0 ? (
      <p className="text-center">no items in cart</p>
    ) : (
      <table className="table-auto w-full">
        <thead>
          <tr>
            <th className="px-4 py-2 text-left">Item</th>
            <th className="px-4 py-2 text-right">Quantity</th>
          </tr>
        </thead>
        <tbody>
          {cart.map((item, i) => (
            <tr key={i} className={(i % 2 === 0) ? `bg-gray-100` : ''}>
              <td className={`px-4 py-2 text-left`}>{item.name}</td>
              <td className={`px-4 py-2 text-right`}>{item.quantity}</td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  };

  // completed order details
  completedOrderJSX(trackingDetails) {
    return trackingDetails.length === 0 ? (
      <div className="text-center">no tracking details added yet</div>
    ) : (
      <React.Fragment>
        <div
          className="bg-indigo-100 border-l-4 border-indigo-500 text-indigo-700 p-4 mt-8"
          role="alert"
        >
          <div className="font-bold mb-4 underline capitalize">
            Order Details:
          </div>
          <p className="capitalize">order created: {trackingDetails.created}</p>
          <p className="capitalize">dropoff ETA: {trackingDetails.dropoffEta}</p>
          <p className="capitalize">method: {trackingDetails.method}</p>
          <p className="capitalize">notes: {trackingDetails.notes}</p>
        </div>
      </React.Fragment>
    );
  };

  completedOrderGlobalJSX = item => {
    return item.length === 0 || !item.assignedUser ? (
      <div className="text-center">no completed details available yet</div>
    ) : (
      <React.Fragment>
        <div
          className="bg-indigo-100 border-l-4 border-indigo-500 text-indigo-700 p-4 mt-8"
          role="alert"
        >
          {item.trackingDetails && (
            <React.Fragment>
              <div
                style={{
                  textTransform: 'capitalize',
                  fontSize: 16,
                  fontWeight: 600,
                  marginBottom: 10,
                  textDecoration: 'underline'
                }}
              >
                Order Details:
              </div>
              <p className="capitalize">
                order created: {moment(item.trackingDetails.created).format('MMM D, YYYY h:mm A')}
              </p>
              <p className="capitalize">
                dropoff ETA: {item.trackingDetails.dropoffEta}
              </p>
              <p className="capitalize">method: {item.trackingDetails.method}</p>
              <p className="capitalize">notes: {item.trackingDetails.notes}</p>
            </React.Fragment>
          )}

          <div
            style={{
              fontSize: 16,
              fontWeight: 600,
              marginTop: item.trackingDetails ? 15 : 0,
              textDecoration: 'underline'
            }}
          >
            Fulfilled By:
          </div>
          <p
            style={{ textTransform: 'lowercase', cursor: 'pointer' }}
            className="flex items-center"
          >
            <span
              onClick={() => this.props.history.push(`/user/${item.assignedUser.username}`)}
              className="hover:text-indigo-800"
            >
              {item.assignedUser.username}
            </span>
            {Number(item.assignedUser.karma) >= 0 && (
              <span>&nbsp;&bull; {item.assignedUser.karma} karma</span>
            )}
          </p>
          <p style={{ textTransform: 'lowercase' }}>
            email: <a href={`mailto:${item.assignedUser.email}`}>{item.assignedUser.email}</a>
          </p>
        </div>
      </React.Fragment>
    );
  };

  mouseOutUp(i) {
    this.setState({
      upvoteHover: this.state.upvoteHover.filter(item => item !== i)
    });
  }

  mouseOverUp(i) {
    this.setState({
      upvoteHover: this.state.upvoteHover.concat(i)
    });
  }

  mouseOutDown(i) {
    this.setState({
      downvoteHover: this.state.downvoteHover.filter(item => item !== i)
    });
  }

  mouseOverDown(i) {
    this.setState({
      downvoteHover: this.state.downvoteHover.concat(i)
    });
  }

  async handleUpClick(type, _id, postId = '') {
    switch (type) {
      case 'Post':
        await this.props.upvoteDispatch({
          env: process.env.NODE_ENV,
          postId: _id
        });
        break;
      case 'Comment':
        await this.props.upvoteDispatch({
          env: process.env.NODE_ENV,
          postId,
          commentId: _id
        });
        break;
      default:
        break;
    }
  }

  async handleDownClick(type, _id, postId = '') {
    switch (type) {
      case 'Post':
        await this.props.downvoteDispatch({
          env: process.env.NODE_ENV,
          postId: _id
        });
        break;
      case 'Comment':
        await this.props.downvoteDispatch({
          env: process.env.NODE_ENV,
          postId,
          commentId: _id
        });
        break;
      default:
        break;
    }
  }

  render() {
    const authenticated = localStorage.getItem('giving_tree_jwt');
    console.log("THIS CARDS STATE: ", this.state)
    return (
      <article onClick={(e) => {
        this.props.history.push(`/post/${this.props.item._id}`)
        window.scrollTo(0,0);
      }}
      className="NewsFeedCard rounded shadow bg-white p-4 block cursor-pointer">
        <div id="newsfeed-avatar-wrapper" 
        className="flex items-center flex-wrap mb-3">
          <a href={`/user/${this.props.item.authorId.username}`} onClick={(e) => {
            e.stopPropagation();
          }}
          className="inline-block">
            <Avatar id="author-avatar"user={this.props.item.authorId} />
          </a>
          <strong className="mx-2 text-sm">
            {this.props.item.authorId.username}
          </strong>
          <small className="mr-3">
            {moment(new Date(this.props.item.createdAt)).fromNow()}
          </small>
          {/* TAGS GO HERE */}
          <div className="flex items-center ml-auto">
            {this.setTags()}
          </div>
        </div>
        <div className="flex">

          <div className="text-center flex flex-col items-center w-8">
            <ChevronUp
            size={25}
            color={
              this.state.upvoteIndex.includes(this.props.key) || 
                this.state.upvoteHover.includes(this.props.key) ? 
                  '#268bd2' : '#aaa'
            }
            style={{ alignContent: 'center', cursor: 'pointer' }}
            onMouseEnter={() => this.mouseOverUp(this.props.key)}
            onMouseLeave={() => this.mouseOutUp(this.props.key)}
            onClick={async () => {
              if (authenticated) {
                await this.handleUpClick(
                  this.props.item.type,
                  this.props.item._id,
                  this.props.item.type === 'Comment' && this.props.item.postId
                );

                if (this.state.downvoteIndex.includes(this.props.key)) {
                  this.removeIndex(this.state.downvoteIndex, this.props.key);
                }

                if (this.state.upvoteIndex.includes(this.props.key)) {
                  this.removeIndex(this.state.upvoteIndex, this.props.key);
                } else {
                  this.state.upvoteIndex.push(this.props.key);
                }
              } else {
                alert('please signup first');
                this.props.history.push('/signup');
              }
            }}
          />            
            <span>
              {this.props.item.voteTotal +
                Number(
                  this.state.upvoteIndex.includes(this.props.key)
                    ? this.props.item.upVotes.includes(this.props.user._id)
                      ? 0
                      : 1
                    : this.props.item.upVotes.includes(this.props.user._id)
                    ? -1
                    : 0
                ) -
                Number(
                  this.state.downvoteIndex.includes(this.props.key)
                    ? this.props.item.downVotes.includes(this.props.user._id)
                      ? 0
                      : 1
                    : this.props.item.downVotes.includes(this.props.user._id)
                    ? -1
                    : 0
                )}
            </span>

          </div>
          
          <div className="pl-2 w-full">
            <h3 className="text-xl font-semibold mb-4">
              {this.props.item.title}
            </h3>
            {this.props.match.url === '/home/ongoing' ? (
              <p className="text-sm mb-3">
                Address: {this.state.details.address}
              </p>
            ) : (
              <p className="text-sm mb-3">{
                this.props.coords ? 
                  this.calculateDistance(this.state.details.location) + 
                  ' miles from you' : this.state.details.postal 
                      ? `Zip code: ${this.state.details.postal.split('-')[0] || 
                        this.state.details.postal}` : ''
              }</p>
            ) }
            {this.state.details.dueDate && 
              <p className="text-sm mb-3">Due Date: 
              {` ${moment(new Date(this.state.details.dueDate)).fromNow()}`} 
              ({this.state.details.dueDate})</p>
            }
            {this.state.details.description &&
              <p className="text-sm mb-3">
                Description: {this.state.details.description}
              </p>
            }
            {this.state.details.phoneNumber &&
              <p className="text-sm my-1 mt-4">
                Phone Number: {this.getPhoneNumber()}
              </p>
            }
            <div className="mt-1">
              {this.props.item.type === 'Post' ? (
                <div className="mt-5">
                  {this.props.match.url !== '/home/ongoing' &&
                    this.state.details.type === 'food' &&
                    this.foodCartJSX(this.state.details.cart)
                  }
                  {this.state.trackingDetails &&
                    this.props.match.url === '/home/completed' &&
                    this.props.item.trackingDetails &&
                    this.completedOrderJSX(this.props.item.trackingDetails)}
                  {this.props.match.url === '/home/global' &&
                    this.completedOrderGlobalJSX(this.props.item)
                  }
                </div>
              ) : (
                this.props.item.content
              )}
            </div>
          </div>
          
        </div>

        
      </article>
    );
  }
}

const mapDispatchToProps = dispatch => ({
  upvoteDispatch: payload => dispatch(upvote(payload)),
  downvoteDispatch: payload => dispatch(downvote(payload)),
});

const mapStateToProps = state => ({});

export default withRouter(
  connect(mapStateToProps, mapDispatchToProps)(NewsFeedCard)
);
