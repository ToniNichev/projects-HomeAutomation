import React from 'react';
import styles from './styles.scss';
import {Poster} from '../../utils/Poster';
import { apiUrl } from '../../utils/getParams';


const handleTemperatureChange = (event) => {
  console.log(event.target.value);
}


const TemperatureBar = ({temp}) => {
  return (    
    <div>
      <label>Curent Temperature: </label>
      {temp}
    </div>
  );
}

export default TemperatureBar;