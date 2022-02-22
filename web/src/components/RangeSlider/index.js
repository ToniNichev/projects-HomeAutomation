import React from 'react';
import styles from './styles.scss';


const RangeSlider = ({name, SliderId, labels, onChangeCallback, SetRangeValue, min}) => {  

  const inputId = `${name}-${SliderId}`;
  const max = min + labels.length - 1;
  
  const modeChanged = (e) => {
    onChangeCallback(SliderId, e.target.value);
  }

  const _SetRangeValue = (range) => {
    document.querySelector(`.${inputId}`).value = range;
  }

  SetRangeValue(_SetRangeValue);

  return (    
    <div className={styles.wrapper}>
        <div className={styles.labels}>
          {
            labels.map( (label, id) => {
              return(
                <span key={id}>{label}</span>
              );
            })
          }        
        </div>
        <input 
          className={[inputId].join(' ')}
          onMouseUp={ (e) => { modeChanged(e) } }
          onTouchEnd={ (e) => { modeChanged(e) } }
          type="range" 
          min={min} max={max} />  
    </div>
  );
}

export default RangeSlider;