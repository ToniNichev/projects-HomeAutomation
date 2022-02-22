import React, { useState } from 'react';
import styles from './styles.scss';
import EventsManager from '../../containers/EventsManager';

const Renderer = ({showPopup}) => {  
  const [popupVisible, setPopupVisible] = useState(showPopup);
  const [message, setMessage] = useState('');


  function closePopup() {
    setPopupVisible(false);
  }

  function showPopupFunc(message) {
    setMessage(message);
    setPopupVisible(true);
  }

  // register global showPopup to be called by other components
  EventsManager.registerEvent('showPopup' ,showPopupFunc);

  return popupVisible ? (
    <div id="addFeatureFlag" className={styles.modal}>
      <div className={styles.modalContent}>
        <span onClick={ () => { closePopup() } } className={styles.close}>&times;</span>
        <div className={styles.message}>
          {message}
        </div>          
      </div>      
    </div>
  ) : ( null );
}

export default Renderer;