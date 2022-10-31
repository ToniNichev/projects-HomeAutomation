import React, { useState } from 'react';
import styles from './styles.scss';
import Poster from '../../utils/Poster';
import { apiUrl } from '../../utils/getParams';

const setupFullDatabase = async () => {
  const result = await Poster(`${apiUrl}/setup-full`, {});
  console.log(result);
}

const setupDatabase = async () => {
  const result = await Poster(`${apiUrl}/setup`, {});
  console.log(result);
}

const setupHubsDatabase = async () => {
  const result = await Poster(`${apiUrl}/setup-hubs-db`, {});
  console.log(result);
}

const dropDatabase = async () => {
  const result = await Poster(`${apiUrl}/dropdb`, {});
  console.log(result);
}

if(typeof window !== 'undefined') {
  window.getRegion = () => {
    return "US";
  }
}


function Setup() {

  const [notAvailableModalVisible, setNotAvailableModalVisible] = useState(true);

  const notAvailableModalClose = () => {
    setNotAvailableModalVisible(false);
    return true;
  };


  return(<div className={styles.wrapper}>
    {notAvailableModalVisible && <p>##### SHOW / HIDE #######</p>}
    <p>Wellcome to the setup page</p>
    <p><button onClick={ () => { dropDatabase() }}>!!!!DROP DATABASE</button></p>
    <p><button onClick={ () => { setupHubsDatabase() }}>CREATE TWO UNREGISTERED HUBS DATABASE</button></p>
    <p><button onClick={ () => { setupDatabase() }}>CREATE DATABASE</button></p>
    <p><button onClick={ () => { setupFullDatabase() }}>CREATE AND POPULATE DATABASE</button></p>
    <button onClick={ () => { notAvailableModalClose() }}>SHOW / HIDE</button>
  </div>);
}

export { Setup }
export default Setup;