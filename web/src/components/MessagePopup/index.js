import React, { useState, useEffect, useRef }  from 'react';
import styles from './styles.scss';



const MessagePopup = ({msg, closeMessagePopup}) => {    
  return (
    <div className={styles.modal}>
      <div className={styles.modalContent}>
        <span onClick={ () => { closeMessagePopup() } } className={styles.close}>&times;</span>
        <div className={styles.flagProperties}>
          <div dangerouslySetInnerHTML={{__html: msg}}></div>
        </div>          
      </div>      
    </div>
  );
}

export default MessagePopup;