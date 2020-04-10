import * as React from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import moment from 'moment';
import Avatar from '../../../components/Avatar/Avatar';
import './NewsFeedCard.css';
import Tag from '../../../components/Tag/Tag';

class NewsFeedCard extends React.Component {

  constructor(props) {
    super(props);

    this.state = { }
  }

  componentDidMount() {
    this.setTags();
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
   * Get the zip code of the task from the item properties
   *
   * @memberof NewsFeedCard
   */
  getZipCode() {

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
          <p>Zip code: </p>
          <p>Due date: </p>
          <p>Description: </p>
          <p>Due date: </p>
          <p>Phone No.: </p>
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
