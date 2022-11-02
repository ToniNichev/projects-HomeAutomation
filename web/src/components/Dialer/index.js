import React, { useEffect } from 'react';
import styles from './styles.scss';


/**
 * 
 * @param {function} onChangeCallback - callback function in the HOC to be called on dialer value changed
 * @param {number} SliderId
 * @param {number} Min
 * @param {number} max
 * @param {number} Step - steps between value and value + 1 (2 will make the dailer to do 0, 0.5, 1 on drag.) 10 will go through all 10 values between 0 and 1
 * @param {number} ShowPrecision - how many digints after decimal point to show
 * @param {function} SetRangeValue - the function in HOC to be called when the value of the dialer should be changed.
 * @param {function} setTempAndHumidity
 * @param {function} onEditingMode - returns either the diler is dragged or not. Helpfull to disable update when the user drag it.
 * 
 * @returns 
 */

let dialerSetUp = [];

const Dialer = ({onChangeCallback, SliderId, Min, Max, Step, ShowPrecision, SetRangeValue, setTempAndHumidity, onEditingMode}) => {  

  let beginDrag = false;
  let val = 0;
  const min = parseFloat(Min);
  const max = parseFloat(Max);
  const step = parseFloat(Step);
  const ratio = 360 / (max - min);
  

  const rangeSelectorValueChanged = () => {
    const val = document.querySelectorAll('.labelPrimary')[SliderId].innerText;
    onChangeCallback(SliderId, val);
  }  

  const setValue = (val) => {
    val = parseFloat(val).toFixed(ShowPrecision);
    const rotateAngle = (360 / (max - min) ) * val;
    if(typeof document == 'undefined') return;
    document.querySelectorAll('.labelPrimary')[SliderId].innerText = val + ' °C';      
    document.querySelectorAll('.circle > .dot')[SliderId].style.transform = `rotate(${rotateAngle}deg)`;
  }

  const _setTempAndHumidity = (humidity, temperature) => {
    document.querySelectorAll('.labelSecondary')[SliderId].innerText = parseFloat(temperature).toFixed(ShowPrecision) + ' °C';
    document.querySelectorAll('.labelThird')[SliderId].innerText = parseFloat(humidity).toFixed(ShowPrecision) + ' %';
  }

  setTempAndHumidity(_setTempAndHumidity);

  SetRangeValue(setValue); // pass setValue to be accessed from parent component.

  const mouseMoveAction = (e) => {
    if(beginDrag == false) return;

    const center_x = ( document.querySelectorAll('.circle')[SliderId].offsetWidth / 2) + document.querySelectorAll('.circle')[SliderId].offsetLeft;
    const center_y = ( document.querySelectorAll('.circle')[SliderId].offsetHeight / 2) + document.querySelectorAll('.circle')[SliderId].offsetTop;
    let eventObj;
  
    if(e.touches)
        eventObj = e.touches[0];
    else    
        eventObj = e;
  
    const pos_x = eventObj.pageX;
    const pos_y = eventObj.pageY;
  
  
    const delta_y =  center_y - pos_y;
    const delta_x = center_x - pos_x;
    let angle = Math.atan2(delta_y, delta_x) * (180 / Math.PI) // Calculate Angle between circle center and mouse pos
    angle -= 90;
    if(angle < 0)
        angle = 360 + angle // Always show angle positive
    angle = Math.round(angle);
    document.querySelectorAll('.circle > .dot')[SliderId].style.transform = `rotate(${angle}deg)`;
    
    const m = parseFloat(min);
    const a = (Math.round((angle / ratio) * step) / step);

    val = (m + a).toFixed(ShowPrecision);
    document.querySelectorAll('.labelPrimary')[SliderId].innerText = val;  
  }

  const dialerPressed = () => {
    beginDrag = true;
    onEditingMode(true);
    document.querySelector('body').classList.add('preventScrolling');
  }

  const dialerReleased = () => {
    beginDrag = false;
    rangeSelectorValueChanged();
    onEditingMode(false);
    document.querySelector('body').classList.remove('preventScrolling');
  }

  useEffect(() => {
    if(dialerSetUp[SliderId]) {
      return;
    }
    dialerSetUp[SliderId] = true;
    console.log("useEffect");

    document.querySelectorAll('.circle > .dot')[SliderId].addEventListener('touchstart', e => {
      dialerPressed();
    });    

    document.querySelectorAll('.circle > .dot')[SliderId].addEventListener('touchend', e => {
      dialerReleased();
    });    

    document.querySelectorAll('.circle > .dot')[SliderId].addEventListener('mousedown', e => {
      dialerPressed();
    });

    document.querySelectorAll('.circle > .dot')[SliderId].addEventListener('mouseup', e => {
      dialerReleased();
    });

    document.addEventListener('mousemove', e => {
      mouseMoveAction(e);
    });

    document.addEventListener('touchmove', e => {
      mouseMoveAction(e);
    });  
  });


  return (    
    <div className={styles.wrapper}>

      <div className={[styles.circle, 'circle'].join(' ')}>
        <div className={[styles.labelPrimary, 'labelPrimary'].join(' ')}> -- </div>
        <div className={[styles.labelSecondary, 'labelSecondary'].join(' ')}> -- </div>
        <div className={[styles.labelThird, 'labelThird'].join(' ')}> -- </div>
        <div className={[styles.dot, 'dot'].join(' ')}></div>
      </div>
    </div>
  );
}

export default Dialer;