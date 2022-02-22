import React from 'react';
import styles from './styles.scss';
import EventsManager from '../../containers/EventsManager';

const toggleSelect = (element, flagName, flagId) => {
  if(element.target.className.search('BulletPoint-flagBuletSelected')) {
    element.target.className = styles.flagBuletSelected;
    EventsManager.callEvent('setSelectedList')(flagId);
  }
  else {
    element.target.className = styles.flagBuletEditable;
    EventsManager.callEvent('unsetSelectedList')(flagId);
  }
}


const BulletPoint = ({status, flagName, flagId}) => {  
  return (
    <span>
        {status ? 
            <span className={styles.flagBuletEditable} onClick={ (element) => {toggleSelect(element, flagName, flagId)} }></span> :
            <span className={styles.flagBulet }></span>
        }        
        <span className={styles.spacing}></span>
    </span>
  );
}

export default BulletPoint;