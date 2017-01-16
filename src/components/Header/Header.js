import React from 'react'
import { IndexLink, Link } from 'react-router'
import AppBar from 'material-ui/AppBar';
import RaisedButton from 'material-ui/RaisedButton'
import classes from './Header.scss'
import Drawer from 'material-ui/Drawer'
import MenuItem from 'material-ui/MenuItem'
import IconMenu from 'material-ui/IconMenu'
import IconButton from 'material-ui/IconButton'
import MoreVertIcon from 'material-ui/svg-icons/navigation/more-vert'
import MapsPlace from 'material-ui/svg-icons/maps/place'


const styles = {
  AppBar: {
    backgroundColor : '#2B2B2B'
  },
  iconButton : {
    color : 'red'
  },
  mainTitle : {
    
  },
  drawer : {
    backgroundColor : 'white'
  }
};

export default class Header extends React.Component {
  
  constructor(props) {
    super(props);
    this.state = {
      open: false,
      locationOpen : true,
      locationValue : 1
    };
  }
  //use in case of login
  handleToggle = () => this.setState({open: !this.state.open});

  handleClose = () => this.setState({open: false});

  handleLocationChange = function(event, index, value){
    debugger;
    this.setState({locationOpen : false,locationValue : value});
  }

  render() {
    return (
      <div className={classes.headerContainer}>
        <div className={classes.drawerConatiner}>
          <Drawer 
            style={styles.drawer}
            docked={false}
            width={200}
            open={this.state.open}
            onRequestChange={(open) => this.setState({open})}
          > 
            <AppBar title="Menu"
            style={styles.AppBar}
            iconClassNameLeft={'hidden'} />
            <div className={classes.navbar}>
              
              <IndexLink to='/' activeClassName={classes.activeRoute}>
                <MenuItem onTouchTap={this.handleClose}>
                  Home
                 </MenuItem>
              </IndexLink>
            </div>
          </Drawer>
        </div>
        <AppBar 
          style={styles.AppBar}
          title="Fabhotels Demo Search Functionality"
          iconStyleLeft={styles.iconButton}
          onLeftIconButtonTouchTap={this.handleToggle}
          iconElementRight={
            <div className={classes.iconContainer}>
              <IconMenu
                iconButtonElement={<IconButton><MoreVertIcon color={'white'} /></IconButton>}
                anchorOrigin={{horizontal: 'right', vertical: 'top'}}
                targetOrigin={{horizontal: 'right', vertical: 'top'}}
              >
                <MenuItem primaryText="Refresh" />
                <MenuItem primaryText="Send feedback" />
                <MenuItem primaryText="Settings" />
                <MenuItem primaryText="Help" />
                <MenuItem primaryText="Sign out" />
              </IconMenu>
            </div>
          }
          titleStyle={styles.mainTitle} />
      </div>
    );
  }
}
