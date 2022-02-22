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
const {WEATHER_API_URL} = process.env;
import EventsManager from  '../../containers/EventsManager';

class Home extends Component {
  
  
  constructor(props) {
    super(props);
    this.getThermostatsSettings();
    this.changeRange = [];
    this.setTempAndHumidity = [];
    this.setDialersForTheFirstTime = false;
    this.setThermostatSliderMode = [];
    this.setThermostatFanSliderMode = [];
    this.disableFetchData = false;
    this.hubId = null;
    this.dataLength = 0;
    this.newThermostatAdded = false;

    this.addFlagVisible = false;
    
    this.state = {
      addFlagVisible: false,
      messagePopup: false,   
      messagePopupText: '',      
      flagEditable: false,
      thermostatBodyCSS: [],
      thermostats: []
    };
    // get api data
    const apiData = typeof global.__API_DATA__ !== 'undefined' ? global.__API_DATA__ : typeof window === 'undefined' ? {} : window.__API_DATA__;
    this.thermostatsData = apiData.thermostatsData;
    this.hubId = apiData.hubId;
    if( typeof window !== 'undefined' && typeof this.hubId === 'undefined') {
      window.location = '/sign-in';
    }
    // fetch thermostat and weather data
    this.fetching = false;
    this.fetchData();
    this.fetchWeatherData();      
    EventsManager.registerEvent('thermostats-deleted', () => {
      this.setState({messagePopupText: '<h2>Selected Thermostats removed!</h2><hr/><p>Make sure that you reset all erased thermostats to set them up into add mode so you will be able to add them later.</p>'});
      this.setState({messagePopup: true});
    });
  }  

  addFlag() {
    this.setState({addFlagVisible: true});
  }

  closePopup() {
    this.setState({addFlagVisible: false});    
    this.getThermostatsSettings();
  }  

  closeMessagePopup() {
    //this.setState({messagePopup: false});    
    window.location.reload();    
  }

  isNewThermostatAdded() {
    const result = this.newThermostatAdded;
    return result;
  }

  thermostatAddedClear() {
    this.newThermostatAdded = false;
  }  


  editFlag() {
    this.setState({flagEditable: !this.state.flagEditable});     
  }

  getThermostatsSettings() {
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
    if(typeof window == 'undefined' || this.fetching === true) return;
    this.fetching = true;
    const refreshRate = 2000;
    if(this.disableFetchData === true) {
      setTimeout( () => {
        this.fetchData();
      }, refreshRate);
      return;
    }
    console.log("fetch ...");
    fetch(`${process.env.APP_HOST}:${process.env.SERVER_PORT}/thermostat-services/get-full-data?data=["${this.hubId}"]`)
      .then(response => response.json())
      .then(data => { 
        if(data?.error) {
          window.location = '/sign-out';
        }
        if(this.dataLength < data.length) {
          this.dataLength = data.length;
          //EventsManager.callEvent("newThermostatAdded")();
          this.thermostatsData = data;
          this.newThermostatAdded = true;
        }
        for(let i = 0; i < data.length; i ++) {
          const id = data[i].id;
          const curentTemp = data[i].curentTemp;
          const curentHumidity = data[i].humidity;
          const requiredTemp = data[i].requiredTemp;
          const mode = data[i].mode;
          const fanMode = data[i].fanMode;

          //const newThermostatBodyCSS = typeof this.state.thermostatBodyCSS[i] === 'undefined' ?  [styles.flagWrapper] :  [...this.state.thermostatBodyCSS]; 
          

          if (typeof data[i].lastConnected === 'undefined' || (new Date() - new Date(data[i].lastConnected)) / 1000 > 20) {
            
            const newThermostatBodyCSS =  [...this.state.thermostatBodyCSS]; 
            newThermostatBodyCSS[i] = [styles.flagWrapper, styles.flagWrapperError];            
            this.setState({thermostatBodyCSS: newThermostatBodyCSS}); 
          }
          else {
            const newThermostatBodyCSS =  [...this.state.thermostatBodyCSS];
            newThermostatBodyCSS[i] = [styles.flagWrapper];
            this.setState({thermostatBodyCSS: newThermostatBodyCSS }); 
          }

          if(typeof this.changeRange[i] != 'undefined') {
            this.changeRange[i](requiredTemp);
            this.setTempAndHumidity[i](curentHumidity, curentTemp);
            this.setThermostatSliderMode[i](mode);
            this.setThermostatFanSliderMode[i](fanMode);
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

  onChangeTemperatureCallback = (thermostatId, requiredTemperature) => {
    fetch(`${process.env.APP_HOST}:${process.env.SERVER_PORT}/thermostat-services/set-desired-temperature?data=["${this.hubId}"][${thermostatId},${requiredTemperature}]`)
      .then(response => response.json())
      .then(data => { 
      });
  }


  onChangeThermostatModeCallback = (thermostatId, requiredMode) => {
    fetch(`${process.env.APP_HOST}:${process.env.SERVER_PORT}/thermostat-services/set-thermostat-mode?data=["${this.hubId}"][${thermostatId},${requiredMode}]`)
      .then(response => response.json())
      .then(data => { 
      });
  }  
  

  onChangeThermostatFanCallback = (thermostatId, requiredMode) => {
    fetch(`${process.env.APP_HOST}:${process.env.SERVER_PORT}/thermostat-services/set-thermostat-fan-mode?data=["${this.hubId}"][${thermostatId},${requiredMode}]`)
      .then(response => response.json())
      .then(data => { 
      });
  }  
  

  render() {
    const Thermostats = this.thermostatsData;

    return (
      <div className={styles.wrapper}>
          <div className={styles.leftRail}>
            <div className={[styles.weatherTitle, 'weatherTitle'].join(' ')}>...</div>
            <div className={styles.rightRail}>
              <button className={this.state.flagEditable ? styles.addButtonHidden : styles.addButtonVisible } onClick={() => { this.addFlag()} }>ADD</button>
              <EditDelete flagEditable={ this.state.flagEditable } editFlag={ () => { this.editFlag() } } hubId={ this.hubId } />
            </div>
              {Thermostats && Thermostats.map( (thermostat, tId) => {
                const id = parseInt(thermostat.thermostatId);
                const key = `thermostat-control-${id}`;
                const thermostatModeKey = `thermostat-mode-${id}`;
                const thermostatFanModeKey = `thermostat-fan-mode-${id}`;
                const thermostatName = thermostat.thermostatName;
                const wrapperClass = typeof this.state.thermostatBodyCSS[tId] === 'undefined' ? [] : this.state.thermostatBodyCSS[tId].join(' ');
                return(
                <div key={key} className={wrapperClass}  >
                  <BulletPoint flagName={thermostatName} flagId={id} status={this.state.flagEditable} />
                  <span className={styles.roomName}>{thermostatName}</span>                  

                  <RangeSlider 
                    min = {1}
                    key={thermostatModeKey}
                    name="thermostat-mode-selector"
                    onChangeCallback={this.onChangeThermostatModeCallback}  
                    SetRangeValue={ (func) => { this.setThermostatSliderMode[id] = func;  } }                     
                    SliderId={id} labels={['OFF', 'COOL', 'HOT']} />

                  <p className={styles.fanModeText}>FAN MODE</p>
                  <RangeSlider 
                    min={0}
                    key={thermostatFanModeKey}
                    name="thermostat-fan-mode-selector"                
                    onChangeCallback={this.onChangeThermostatFanCallback}  
                    SetRangeValue={ (func) => { this.setThermostatFanSliderMode[id] = func;  } } 
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
          {this.state.addFlagVisible ? <AddPopup newThermostatAdded={ () =>{ return this.isNewThermostatAdded() } } thermostatAddedClear={ () => { this.thermostatAddedClear() } } closePopup={ () => { this.closePopup() } } /> : null}
          {this.state.messagePopup ? <MessagePopup msg={ this.state.messagePopupText } closeMessagePopup = { () =>{ this.closeMessagePopup() } } />: null }
      </div>
    );
  }

}

export default Home;