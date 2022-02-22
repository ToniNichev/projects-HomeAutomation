import React from 'react';
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

function Greetings({props}) {
  return(<div className={styles.wrapper}>
          <p><button onClick={ () => { dropDatabase() }}>DROP DATABASE</button></p>
          <p><button onClick={ () => { setupHubsDatabase() }}>CREATE TWO UNREGISTERED HUBS DATABASE</button></p>
          <p><button onClick={ () => { setupDatabase() }}>CREATE DATABASE</button></p>
          <p><button onClick={ () => { setupFullDatabase() }}>CREATE AND POPULATE DATABASE</button></p>
        </div>);
}
export default Greetings;