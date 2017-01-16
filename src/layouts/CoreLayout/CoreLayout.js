import React from 'react'
import Header from '../../components/Header'
import Footer from 'components/Footer'
import classes from './CoreLayout.scss'
import '../../styles/core.scss'

export const CoreLayout = ({ children }) => (
  <div className='root-container text-center' className={classes.background}>
    <div className={classes.container}>
    	<Header />
	    <div className={classes.mainContainer}>
	      {children}
	    </div>
	    <Footer />
    </div>
  </div>
)

CoreLayout.propTypes = {
  //children: React.PropTypes.element.isRequired
}

export default CoreLayout
