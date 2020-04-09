import * as React from 'react';
import './Tag.css';

class Tag extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      class: 'tag-generic',
    }
  }

  componentDidMount() {
    this.setTagClass();
  }

  /**
   * Set the tag class based on the type of tag
   *
   * @memberof Tag
   */
  setTagClass() {
    if (this.props.type) {
      this.setState({
        class: 'tag-' + this.props.type.replace(/\s+/g, '-').toLowerCase()
      })
    }
  }

  componentDidUpdate(prevProps, prevState) { }

  render() {

    return (
      <span 
      className={`Tag ${this.state.class} text-xs inline-block py-1 px-3 
      max-w-32 bg-blue rounded-full`}>
        {this.props.label}
      </span>
    );
  }
}

export default Tag;
