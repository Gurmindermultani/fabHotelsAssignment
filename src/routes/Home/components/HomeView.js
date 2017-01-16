import React from 'react'
import classes from './HomeView.scss'
import {Card, CardMedia} from 'material-ui/Card'
import DropDownMenu from 'material-ui/DropDownMenu';
import MenuItem from 'material-ui/MenuItem';

//constant countries to be search into
const countries = [
  {
    name: "USA",
    center: {lat: 37.1, lng: -95.7},
    zoom: 3,
    value : "us"
  },
  {
    name: "UK",
    center: {lat: 54.8, lng: -4.6},
    zoom: 5,
    value : "uk"
  },
  {
    name: "India",
    center: {lat: 20.5, lng: 78.9},
    zoom: 4,
    value : "in"
  }
];	
//styles for selected components
const styles = {
  overlayConatainer : {
      top : 0,
      background : 'none',
      fontSize : '1.5em',
      color : "white"
  },
  searchButton : {  
      margin : "0px 0 0 20px"
  },
  location : {
  }
}
//marker path to show on map
const MARKER_PATH = 'https://developers.google.com/maps/documentation/javascript/images/marker_green';

export class HomeView extends React.Component {
    constructor(){
        super();
        //setting intial state for component
        this.state = {
          countries: countries,
          currentCountry : countries[2],
          placeholder : "Enter Name of City",
          hotels : [],
          currentMarker : {}
        };

    }
    handleChange = (event, index, value) => {
      this.setState({currentCountry : this.state.countries[value]});
      this.setState({searchString : ""});
      this.autocomplete.setComponentRestrictions({'country': this.state.countries[value].value});
      this.map.setCenter(this.state.countries[value].center);
      this.map.setZoom(this.state.countries[value].zoom);
      //reseting placeholder of input
      this.setState({hotels : []});
      document.getElementById('autocomplete').value = "";
      document.getElementById('autocomplete').placeholder = this.state.placeholder;
    };
    //functions run after the component is mounted
    componentDidMount(){
      //setting the view for map
      this.map = new google.maps.Map(document.getElementById('map'), {
        zoom: this.state.currentCountry.zoom,
        center: this.state.currentCountry.center,
        mapTypeControl: false,
        panControl: false,
        zoomControl: false,
        streetViewControl: false
      });
      //info window to show details of hotels
      this.infoWindow = new google.maps.InfoWindow({
        content: document.getElementById('info-content')
      });
      // Create the autocomplete object and associate it with the UI input control.
      // Restrict the search to the default country, and to place type "cities".
      this.autocomplete = new google.maps.places.Autocomplete(
        /** @type {!HTMLInputElement} */ (
            document.getElementById('autocomplete')), {
          types: ['(cities)'],
          componentRestrictions: {'country': this.state.currentCountry.value}
        });
      this.places = new google.maps.places.PlacesService(this.map);
      this.autocomplete.addListener('place_changed', this.onPlaceChanged.bind(this));
    }
    //when user selects of autocomplete
    onPlaceChanged(){
      // When the user selects a city, get the place details for the city and
      // zoom the map in on the city.
      var place = this.autocomplete.getPlace();
      if (place.geometry) {
        this.map.panTo(place.geometry.location);
        this.map.setZoom(15);
        this.search();
      } else {
        document.getElementById('autocomplete').placeholder = 'Enter a city';
      }
    }
    //shoeing info window about place
    showInfoWindow(marker){
      var that = this;
      this.places.getDetails({placeId: marker.placeResult.place_id},
        function(place, status) {
          if (status !== google.maps.places.PlacesServiceStatus.OK) {
            return;
          }
          //setting current place as marker
          that.setState({currentMarker : place});
          that.infoWindow.open(that.map, marker);
          //buildIWContent(place);
        });
    }
    //drop markers on map for hotels
    dropMarker(i){
      var that = this;
      return function() {
        that.markers[i].setMap(that.map);
      };
    }
    //show deatails of marker with click
    showMarker(index){
      google.maps.event.trigger(this.markers[index], 'click');
    }
    //search function on based of autocomplete select
    search(){
      var search = {
        bounds: this.map.getBounds(),
        types: ['lodging']
      };
      this.markers = [];
      var markers = this.markers;
      var that = this;
      this.places.nearbySearch(search, function(results, status) {
        if (status === google.maps.places.PlacesServiceStatus.OK) {
          //clearResults();
          //clearMarkers();
          // Create a marker for each hotel found, and
          // assign a letter of the alphabetic to each marker icon.
          for (var i = 0; i < results.length; i++) {
            var markerLetter = String.fromCharCode('A'.charCodeAt(0) + (i % 26));
            var markerIcon = MARKER_PATH + markerLetter + '.png';
            // Use marker animation to drop the icons incrementally on the map.
            markers[i] = new google.maps.Marker({
              position: results[i].geometry.location,
              animation: google.maps.Animation.DROP,
              icon: markerIcon
            });
            // If the user clicks a hotel marker, show the details of that hotel
            // in an info window.
            markers[i].placeResult = results[i];
            google.maps.event.addListener(markers[i], 'click', function(){that.showInfoWindow.call(that,this)});
            setTimeout(that.dropMarker(i), i * 100);
          }
        }
        //setting hotels to result
        that.state.hotels = [];
        that.setState({hotels : results});
      });
    }
    render() {
        var that = this;
        return (
    		  <div className={classes.homeContainer}>
    		      <Card>
                    <CardMedia
                      overlay={
                        <div>
                            <div className={classes.toolsContainer}>
                                <span className={classes.searchHotel} >Search Hotels In : </span>
                                <input 
                                  id="autocomplete" 
                                  placeholder={this.state.placeholder}  
                                  type="text" />
                                <DropDownMenu//dropdown for selecting country
                                    value={this.state.countries.indexOf(this.state.currentCountry)}
                                    onChange={this.handleChange}
                                    style={styles.customWidth}
                                    autoWidth={false}
                                  >
                                  {
                                    this.state.countries.map((country,index) => (
                                        <MenuItem key={index} value={index} primaryText={country.name} />
                                    ))
                                  }
                                  </DropDownMenu>
                                <div className={classes.resultContainer}>
                                  <div id="map" className={classes.map}></div>
                                  <div id="listing">
                                    <table id="resultsTable">
                                      <tbody id="results">
                                      {
                                        this.state.hotels.map((hotel,index) => (
                                          <tr key={index}>
                                            <td key={index} onClick={function(){that.showMarker.call(that,index)}}>{hotel.name}</td>
                                          </tr>
                                        ))
                                      }
                                      </tbody>
                                    </table>
                                  </div>
                                </div>
                            </div>
                            <div className={classes.hidden}>
                              <div id="info-content">
                                <table>
                                  <tbody>
                                    <tr id="iw-url-row" className="iw_table_row">
                                      <td id="iw-icon" className="iw_table_icon">Name:</td>
                                      <td id="iw-url">{this.state.currentMarker.name}</td>
                                    </tr>
                                    <tr id="iw-address-row" className="iw_table_row">
                                      <td className="iw_attribute_name">Address:</td>
                                      <td id="iw-address">{this.state.currentMarker.formatted_address}</td>
                                    </tr>
                                    <tr id="iw-phone-row" className="iw_table_row">
                                      <td className="iw_attribute_name">Telephone:</td>
                                      <td id="iw-phone">{this.state.currentMarker.formatted_phone_number}</td>
                                    </tr>
                                    <tr id="iw-website-row" className="iw_table_row">
                                      <td className="iw_attribute_name">Website:</td>
                                      <td id="iw-website"><a href={this.state.currentMarker.website}>{this.state.currentMarker.website}</a></td>
                                    </tr>
                                  </tbody>
                                </table>
                              </div>
                            </div>
                        </div>
                      }
                      overlayContentStyle={styles.overlayConatainer}
                    >
                    </CardMedia>
                  </Card>
    		  </div>
		    );
    }
}
export default HomeView
