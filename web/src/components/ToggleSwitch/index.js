import React from 'react';
import styles from './styles.scss';
import {Poster} from '../../utils/Poster';
import { apiUrl } from '../../utils/getParams';

const switchToggled = async (featureFlagName) => {
  const flag = findFlagByName(featureFlagName);
  flag.value = flag.value === 'on' ? 'off' : 'on';
  const postData = {
    updateFlag: {
      "flagName": featureFlagName
    },
    newFlagData: flag
  }
  console.log(">>>", apiUrl);
  const result = await Poster(`${apiUrl}/update`, postData);
}

const findFlagByName = (flagName) => {
  const flags = window.__API_DATA__;
  let result;
  flags.forEach(element => {
    if(element.flagName == flagName) {
      result = element;
    }
  });
  return result;
}

const Renderer = ({featureFlagName, val}) => {
  const checked = val === 'on' ? 'checked' : '';
  return (    
    <label className={styles.switch}>
        <input className={featureFlagName} onChange={ () => { switchToggled(featureFlagName) }} type="checkbox" defaultChecked={checked} />
        <span className={styles.slider} />
    </label>
  );
}

export default Renderer;