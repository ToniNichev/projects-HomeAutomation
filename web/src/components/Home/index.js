import React, {Component} from 'react';
import styles from './styles.scss';
import ToggleSwitch from '../ToggleSwitch';
import BulletPoint from '../BulletPoint';
import AddPopup from './AddPopup';
import MessagePopup from '../MessagePopup';
import {Poster} from '../../utils/Poster';
import EditDelete from '../EditDelete';
import { apiUrl } from '../../utils/getParams';
import Dialer from '../Dialer';
import RangeSlider from '../RangeSlider';
import TemperatureBar from '../TemperatureBar';
import Cookies from 'universal-cookie';
const {WEATHER_API_URL} = process.env;
import EventsManager from  '../../containers/EventsManager';

class Home extends Component {
  
  
  constructor(props) {
    super(props);
    this.getDevicesSettings();
    this.changeRange = [];
    this.setTempAndHumidity = [];
    this.setDialersForTheFirstTime = false;
    this.setDevicesliderMode = [];
    this.setDeviceFanSliderMode = [];
    this.disableFetchData = false;
    this.hubId = null;
    this.dataLength = 0;
    this.newDeviceAdded = false;
    this.cookies = new Cookies();

    this.addFlagVisible = false;
    
    this.state = {
      addFlagVisible: false,
      messagePopup: false,   
      messagePopupText: '',      
      flagEditable: false,
      deviceBodyCSS: [],
      Devices: []
    };
    // get api data
    const apiData = typeof global.__API_DATA__ !== 'undefined' ? global.__API_DATA__ : typeof window === 'undefined' ? {} : window.__API_DATA__;
    this.DevicesData = apiData.DevicesData;
    this.hubId = apiData.hubId;
    if( typeof window !== 'undefined' && typeof this.hubId === 'undefined') {
      window.location = '/sign-in';
    }
    // fetch device and weather data
    this.fetching = false;
    this.fetchData();
    this.fetchWeatherData();      
    EventsManager.registerEvent('Devices-deleted', () => {
      this.setState({messagePopupText: '<h2>Selected Devices removed!</h2><hr/><p>Make sure that you reset all erased Devices to set them up into add mode so you will be able to add them later.</p>'});
      this.setState({messagePopup: true});
    });
  }  

  addFlag() {
    this.setState({addFlagVisible: true});
  }

  closePopup() {
    this.setState({addFlagVisible: false});    
    this.getDevicesSettings();
  }  

  closeMessagePopup() {
    //this.setState({messagePopup: false});    
    window.location.reload();    
  }

  isNewDeviceAdded() {
    const result = this.newDeviceAdded;
    return result;
  }

  deviceAddedClear() {
    this.newDeviceAdded = false;
  }  


  editFlag() {
    this.setState({flagEditable: !this.state.flagEditable});     
  }

  getDevicesSettings() {
    // empty for now
  }

  fetchWeatherData = () => {
    if(typeof window == 'undefined') return;
    const refreshRate = 60000;
  
    fetch('/weather-services/get-local-weather')
      .then(response => response.json())
      .then(data => { 
        const outsideTemp = data.main.temp;
        const feelsLike = data.main.feels_like;
        const humidity = data.main.humidity;
        const icon = data.weather[0].icon;

        const minTemp = data.main.temp_min;
        const maxTemp = data.main.temp_max;
        const pressure = data.main.pressure;
        //const windSpeed = data.main.wind.speed;
        document.querySelector('.weatherTitle').innerHTML = 
          `<div>
            <img src='weather/icons/${icon}.png' />
          </div> 
          <p>outside: <span>${outsideTemp} °C</span>" feels like: <span>${feelsLike} °C</span> humidity: <span>${humidity}</span></p>        
          `;

        setTimeout( () => {
          this.fetchWeatherData();
        }, refreshRate);        
      });
  }

  fetchData = () => {
    const user = this.cookies.get('user');
    if(typeof window == 'undefined' || this.fetching === true || typeof user === 'undefined') return;
    this.fetching = true;
    const refreshRate = 2000;
    if(this.disableFetchData === true) {
      setTimeout( () => {
        this.fetchData();
      }, refreshRate);
      return;
    }
    console.log("fetch ...");
    fetch(`${process.env.APP_HOST}:${process.env.SERVER_PORT}/device-services/get-full-data?data=["${this.hubId}"]`)
      .then(response => response.json())
      .then(data => { 
        if(typeof data?.error !== 'undefined') {
          console.log("######################")
          console.log("error: ", data.error)
          console.log("######################")
          //window.location = '/sign-out';
        }
        if(this.dataLength < data.length) {
          this.dataLength = data.length;
          this.DevicesData = data;
          this.newDeviceAdded = true;
        }
        for(let i = 0; i < data.length; i ++) {
          const id = data[i].id;
          const curentTemp = data[i].curentTemp;
          const curentHumidity = data[i].humidity;
          const requiredTemp = data[i].requiredTemp;
          const mode = data[i].mode;
          const fanMode = data[i].fanMode;
          
          if (typeof data[i].lastConnected === 'undefined' || (new Date() - new Date(data[i].lastConnected)) / 1000 > 20) {            
            const newDeviceBodyCSS =  [...this.state.deviceBodyCSS]; 
            newDeviceBodyCSS[i] = [styles.flagWrapper, styles.flagWrapperError];            
            this.setState({deviceBodyCSS: newDeviceBodyCSS}); 
          }
          else {
            const newDeviceBodyCSS =  [...this.state.deviceBodyCSS];
            newDeviceBodyCSS[i] = [styles.flagWrapper];
            this.setState({deviceBodyCSS: newDeviceBodyCSS }); 
          }

          if(typeof this.changeRange[i] != 'undefined') {
            this.changeRange[i](requiredTemp);
            this.setTempAndHumidity[i](curentHumidity, curentTemp);
            this.setDevicesliderMode[i](mode);
            this.setDeviceFanSliderMode[i](fanMode);
            this.connected = false;
          }
        } 
        this.fetching = false;       
        setTimeout( () => {
          this.fetchData();
        }, refreshRate);        
      });
  }

  disableFetch = (mode) => {
    this.disableFetchData = mode;
  }

  onChangeTemperatureCallback = (deviceId, requiredTemperature) => {
    fetch(`${process.env.APP_HOST}:${process.env.SERVER_PORT}/device-services/set-desired-temperature?data=["${this.hubId}"][${deviceId},${requiredTemperature}]`)
      .then(response => response.json())
      .then(data => { 
      });
  }


  onChangeDeviceModeCallback = (deviceId, requiredMode) => {
    fetch(`${process.env.APP_HOST}:${process.env.SERVER_PORT}/device-services/set-device-mode?data=["${this.hubId}"][${deviceId},${requiredMode}]`)
      .then(response => response.json())
      .then(data => { 
      });
  }  
  

  onChangeDeviceFanCallback = (deviceId, requiredMode) => {
    fetch(`${process.env.APP_HOST}:${process.env.SERVER_PORT}/device-services/set-device-fan-mode?data=["${this.hubId}"][${deviceId},${requiredMode}]`)
      .then(response => response.json())
      .then(data => { 
      });
  }  
  

  render() {
    const Devices = this.DevicesData;

    return (
      <div className={styles.wrapper}>
          <div className={styles.leftRail}>
            <div className={[styles.weatherTitle, 'weatherTitle'].join(' ')}>...</div>
            <div className={styles.rightRail}>
              <button className={this.state.flagEditable ? styles.addButtonHidden : styles.addButtonVisible } onClick={() => { this.addFlag()} }>ADD</button>
              <EditDelete flagEditable={ this.state.flagEditable } editFlag={ () => { this.editFlag() } } hubId={ this.hubId } />
            </div>
              {Devices && Devices.map( (device, tId) => {
                const id = parseInt(device.deviceId);
                const key = `device-control-${id}`;
                const deviceModeKey = `device-mode-${id}`;
                const deviceFanModeKey = `device-fan-mode-${id}`;
                const deviceName = device.deviceName;
                const wrapperClass = typeof this.state.deviceBodyCSS[tId] === 'undefined' ? [] : this.state.deviceBodyCSS[tId].join(' ');
                return(
                <div key={key} className={wrapperClass}  >
                  <BulletPoint flagName={deviceName} flagId={id} status={this.state.flagEditable} />
                  <span className={styles.roomName}>{deviceName}</span>                  

                  <RangeSlider 
                    min = {1}
                    key={deviceModeKey}
                    name="device-mode-selector"
                    onChangeCallback={this.onChangeDeviceModeCallback}  
                    SetRangeValue={ (func) => { this.setDevicesliderMode[id] = func;  } }                     
                    SliderId={id} labels={['OFF', 'COOL', 'HOT']} />

                  <p className={styles.fanModeText}>FAN MODE</p>
                  <RangeSlider 
                    min={0}
                    key={deviceFanModeKey}
                    name="device-fan-mode-selector"                
                    onChangeCallback={this.onChangeDeviceFanCallback}  
                    SetRangeValue={ (func) => { this.setDeviceFanSliderMode[id] = func;  } } 
                    SliderId={id} labels={['AUTO', 'LOW', 'HIGH' ]} />                    

                  <Dialer 
                    onChangeCallback={this.onChangeTemperatureCallback} 
                    onEditingMode={this.disableFetch}
                    SliderId={id} 
                    Min={0} 
                    Max={90} 
                    Step={2}
                    ShowPrecision={1}
                    SetRangeValue={ (func) => { this.changeRange[id] = func;  } } 
                    setTempAndHumidity={ (func) => { this.setTempAndHumidity[id] = func;  } } />                  
                </div>);}
              )}
          </div>      
          {this.state.addFlagVisible ? <AddPopup newDeviceAdded={ () =>{ return this.isNewDeviceAdded() } } eviceAddedClear={ () => { this.deviceAddedClear() } } closePopup={ () => { this.closePopup() } } /> : null}
          {this.state.messagePopup ? <MessagePopup msg={ this.state.messagePopupText } closeMessagePopup = { () =>{ this.closeMessagePopup() } } />: null }
      </div>
    );
  }

}

export default Home;