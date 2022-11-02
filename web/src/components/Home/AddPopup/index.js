import React, { useState, useEffect, useRef }  from 'react';
import styles from './styles.scss';
import { deviceApiUrl } from '../../../utils/getParams';

let mode = 0;

const AddPopup = ({closePopup, newDeviceAdded, deviceAddedClear}) => {  

  const [msg, setMsg] = useState('ADD DEVICE NAME');
  const [buttonText, setButtonText] = useState('ADD DEVICE');  
  //const [isMounted, setIsMounted] = useState(false);

  const mounted = useRef(false);

  useEffect(() => {
    setInterval( () => {      
      if (!mounted.current) 
        return;      

      if(mode == 2 && newDeviceAdded()) {
        setMsg('New device was successfuly added!');
        setButtonText('DONE');   
        mode = 3;        

      }
    }, 4000);

    mounted.current = true;
    return () => (mounted.current = false);
});

  const addNewDevice = () => {
    const apiData = typeof global.__API_DATA__ !== 'undefined' ? global.__API_DATA__ : window.__API_DATA__;
    const hubId = apiData.hubId;

    if(mode == 0) {
      mode = 1;
      const deviceName = document.querySelector("#popup-device-name").value;
      const url = `${deviceApiUrl}/add-device?data=["${hubId}", "${deviceName}"]`;
      fetch(url)
        .then(response => response.json())
        .then(data => { 
          setMsg('Looking for the new device ...');
          setButtonText('CANCEL');
          mode = 2;
      });
    }    
    else if(mode == 1) {      
      // waiting to finish fetch from mode 0
    }
    if(mode == 2) {
      if(document.querySelector('#addFeatureFlag > div > div button').innerHTML === 'CANCEL') {
        fetch(`${deviceApiUrl}/cancel-add-device?data=["${hubId}"]`)
        .then(response => response.json())
        .then(data => { 
          closePopup();
          mode = 0;
      });
        mode = 0;
        return;
      }
      else {
        setMsg('New device was successfuly added!');
        setButtonText('DONE');   
        mode = 3;
      }
    }
    if(mode == 3) { 
      // done      
      mode = 0;
      setMsg('...');
      setButtonText('ADD DEVICE');      
      deviceAddedClear();
      closePopup();
    }    
    else if(mode == 3) {
      // done 
      mode = 0;
      setMsg('...');
      setButtonText('ADD DEVICE');      
      closePopup();     
    }
  }
  
  
  return (
    <div id="addFeatureFlag" className={styles.modal}>
      <div className={styles.modalContent}>
        <span onClick={ () => { closePopup() } } className={styles.close}>&times;</span>
        <div className={styles.flagProperties}>
          <p>{msg}</p>
          <p><input id="popup-device-name" type="text" defaultValue="new device name"/></p>
          <p><button onClick={ () => { addNewDevice() } }>{buttonText}</button></p>
        </div>          
      </div>      
    </div>
  );
}

export default AddPopup;