import * as React from 'react';
import { geolocated } from 'react-geolocated';
import PlacesAutocomplete from 'react-places-autocomplete';
import { geocodeByAddress, getLatLng } from 'react-places-autocomplete';

class LocationBar extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      showChangeLocation: false,
      locationName: '',
      latLng: {
        lat: '',
        lng: ''
      }
    }
  }

  onChange(val) {
    this.setState({locationName: val});
  }

  onSelect(address) {
    this.setState({locationName: address});
    geocodeByAddress(address)
      .then(res => getLatLng(res[0]))
      .then(latLng => {
        this.setState({ latLng: latLng });
        console.log(this.state);
      })
  }

  /**
   * Toggle the state of the location bar. Show/Hide the input field
   *
   * @param {Boolean} val
   * @memberof LocationBar
   */
  toggleChangeLocation(val) {
    this.setState({ showChangeLocation: val })
  }

  render() {
    return(
      <div>
        { // What to display when the location is set
          !this.state.showChangeLocation ?
          <div>
            <span>{
              !this.props.location.name ? 'Earth 🌍' :
                this.props.location.name}
            </span>
            <button className="ml-2 underline text-indigo-600"
              onClick={() => this.toggleChangeLocation(true)}>
              (Edit)
            </button>
          </div>
        : // What to display when the user clicks to change location
          <div>
            <div className="flex items-center">
              <div className="flex justify-between items-center mt-2">
                <PlacesAutocomplete value={this.state.locationName}
                  onChange={(address) => this.onChange(address)}
                  onSelect={(address) => this.onSelect(address)}>
                  {({ getInputProps, suggestions, getSuggestionItemProps, loading }) => (
                    <div style={{ width: '100%' }}>
                      <input
                        {...getInputProps({
                          placeholder: 'Enter an address',
                          className: 'location-search-input'
                        })}
                        value={this.state.locationName}
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none"
                        id="address"
                        type="text"
                      />
                      <div className="autocomplete-dropdown-container">
                        {loading && <div className="loading-spinner"></div>}
                        {suggestions.map(suggestion => {
                          const className = suggestion.active
                            ? 'suggestion-item--active'
                            : 'suggestion-item';
                          // inline style for demonstration purpose
                          const style = suggestion.active
                            ? { backgroundColor: '#fafafa', cursor: 'pointer' }
                            : { backgroundColor: '#ffffff', cursor: 'pointer' };
                          return (
                            <div
                              {...getSuggestionItemProps(suggestion, {
                                className,
                                style
                              })}
                            >
                              <span>{suggestion.description}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </PlacesAutocomplete>
              </div>
              <button className="rounded-full px-4 py-2 bg-transparent border border-gray-600 mr-3"
                onClick={() => this.toggleChangeLocation(false)}>
                  Cancel
              </button>
              <button className="rounded-full px-4 py-2 bg-blue-600 text-white font-semibold"
                onClick={() => {
                  this.props.setLocation({
                    name: this.state.locationName,
                    lat: this.state.latLng.lat,
                    lng: this.state.latLng.lng
                  })
                  this.toggleChangeLocation(false);
                }}>
                  Save
              </button>
            </div>
          </div>
        }
      </div>
      
    );
  }
}

export default LocationBar;