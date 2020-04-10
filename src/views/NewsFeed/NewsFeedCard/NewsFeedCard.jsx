import * as React from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import moment from 'moment';
import Avatar from '../../../components/Avatar/Avatar';
import './NewsFeedCard.css';
import Tag from '../../../components/Tag/Tag';
import { getDistance } from 'geolib';

class NewsFeedCard extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      details: {}
    }
  }

  componentDidMount() {
    this.setTags();
    this.setDetails();
  }

  componentDidUpdate(prevProps, prevState) { }

  /**
   * Set the tags that will be shown on this card. Also sets the status tags.
   *
   * @memberof NewsFeedCard
   */
  setTags() {
    const tags = [];

    // Iterate over the categories and build tags.
    this.props.item.categories.forEach((cat, i) => {
      tags.push(<Tag label={cat} type="category" key={i} />);
    })

    // Set status based on assigned user
    if (this.props.item.assignedUser) { 
      const status = (this.props.completed) ? 'Completed' : 'In progress';
      tags.push(<Tag label={status} type={status} key={tags.length} />)
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
      console.log(obj);
      this.setState({ 
        details: obj 
      }, () => {
        console.log('CARD STATE', this.state);
      })
      
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

  render() {

    return (
      <article onClick={() => {
        this.props.history.push('/user/' + this.props.item.authorId.username)
        window.scrollTo(0,0);
      }}
      className="NewsFeedCard rounded shadow bg-white p-4 block cursor-pointer">
        <div className="flex items-center flex-wrap mb-4">
          <Avatar user={this.props.item.authorId} isLink={true} />
          <strong className="mx-3 text-sm">
            {this.props.item.authorId.username}
          </strong>
          <small>
            {moment(new Date(this.props.item.createdAt)).fromNow()}
          </small>
          <div className="flex items-center ml-auto">
            {this.setTags()}
          </div>
        </div>
        <div className="pl-8">
          <h3 className="text-xl font-semibold mb-4">
            {this.props.item.title}
          </h3>
          {this.props.match.url === '/home/ongoing' ? (
            <p className="text-sm mb-3">Address: {this.state.details.address}</p>
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
            <p className="text-sm mb-3">Due Date: {moment(new Date(this.state.details.dueDate)).fromNow()} 
            ({this.state.details.dueDate})</p>
          }
          {this.state.details.description &&
            <p className="text-sm mb-3">
              Description: {this.state.details.description}
            </p>
          }
        </div>
      </article>
    );
  }
}

const mapDispatchToProps = dispatch => ({});

const mapStateToProps = state => ({});

export default withRouter(
  connect(mapStateToProps, mapDispatchToProps)(NewsFeedCard)
);
