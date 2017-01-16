import React from 'react'
import classes from './Footer.scss'


const styles = {
};

export default class Header extends React.Component {
  
  constructor(props) {
    super(props);
    this.state = {open: false};
  }

  handleToggle = () => this.setState({open: !this.state.open});

  handleClose = () => this.setState({open: false});

  render() {
    return (
      <div className={classes.footerContainer}>
        <div>
          <i className={classes.facebook + ' ' + "fa fa-facebook"} aria-hidden="true"></i>
        </div>
        <p>All Rights Reserved ©Doitloud.in</p>
      </div>
    );
  }
}
