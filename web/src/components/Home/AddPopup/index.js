import React, { useState, useEffect, useRef }  from 'react';
import styles from './styles.scss';
import { thermostatApiUrl } from '../../../utils/getParams';
import EventsManager from  '../../../containers/EventsManager';
import {Poster} from '../../../utils/Poster';

let mode = 0;

const AddPopup = ({closePopup, newThermostatAdded, thermostatAddedClear}) => {  

  const [msg, setMsg] = useState('ADD DEVICE NAME');
  const [buttonText, setButtonText] = useState('ADD THERMOSTAT');  
  //const [isMounted, setIsMounted] = useState(false);

  const mounted = useRef(false);

  useEffect(() => {
    setInterval( () => {
       console.log('mode :', mode);
      if (!mounted.current) 
        return;      
      if(mode == 2 && newThermostatAdded()) {
        setMsg('New thermostat was successfuly added!');
        setButtonText('DONE');   
        mode = 3;        

      }
    }, 4000);

    mounted.current = true;
    return () => (mounted.current = false);
});

  const addFlag = () => {
    const apiData = typeof global.__API_DATA__ !== 'undefined' ? global.__API_DATA__ : window.__API_DATA__;
    const hubId = apiData.hubId;

    if(mode == 1) {      
      // waiting to finish fetch from mode 0
    }
    if(mode == 2) {
      if(document.querySelector('#addFeatureFlag > div > div button').innerHTML === 'CANCEL') {
        fetch(`${thermostatApiUrl}/cancel-add-thermostat?data=["${hubId}"]`)
        .then(response => response.json())
        .then(data => { 
          closePopup();
          mode = 0;
      });
        mode = 0;
        return;
      }
      else {
        setMsg('New thermostat was successfuly added!');
        setButtonText('DONE');   
        mode = 3;
      }
    }
    if(mode == 3) { 
      // done      
      mode = 0;
      setMsg('...');
      setButtonText('ADD THERMOSTAT');      
      thermostatAddedClear();
      closePopup();
    }    
    else if(mode == 3) {
      // done 
      mode = 0;
      setMsg('...');
      setButtonText('ADD DEVICE');      
      closePopup();     
    }    
    else if(mode == 0) {
      mode = 1;
      const deviceName = document.querySelector("#popup-device-name").value;
      fetch(`${thermostatApiUrl}/add-thermostat?data=["${hubId}", "${deviceName}"]`)
        .then(response => response.json())
        .then(data => { 
          setMsg('Looking for the new thermostat ...');
          setButtonText('CANCEL');
          mode = 2;
      });
    }
  }
  
  
  return (
    <div id="addFeatureFlag" className={styles.modal}>
      <div className={styles.modalContent}>
        <span onClick={ () => { closePopup() } } className={styles.close}>&times;</span>
        <div className={styles.flagProperties}>
          <p>{msg}</p>
          <p><input id="popup-device-name" type="text" defaultValue="new device name"/></p>
          <p><button onClick={ () => { addFlag() } }>{buttonText}</button></p>
        </div>          
      </div>      
    </div>
  );
}

export default AddPopup;