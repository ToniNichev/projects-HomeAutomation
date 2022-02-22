import queries from "../../src/queries";

let newDeviceName = "NO NAME";

const sendResponse = (res, responseString) => {

  res.status(200);
  res.removeHeader('X-Powered-By');
  res.removeHeader('Set-Cookie');
  res.removeHeader('Connection');
  res.send(responseString);  
}

const validateAccessToken = () => {}

const getThermostatListFromDB = async (hubId) => {
  const response = await queries.getThermostatDataForHubId(hubId);
  return response;
}

/**
 * getFullReadings - returns all thermostat data
 * @param {*} req 
 * @param {*} res 
 * @param {*} thermostatData 
 */
const getFullReadings = async (req, res, thermostatData) => {
  const response = JSON.stringify(thermostatData);
  sendResponse(res, response);
}

/**
 * getReadings returns desired temperature and receive thermostat curent humidity and temperature.
 * @param {*} req 
 * @param {*} res 
 */
const getReadings = async (req, res, thermostatData, thermostatResponse, hubPreferences) => {
  let result = '';  
  const hubId = req.hubId;
  if(hubPreferences.mode === 1) {
    // adding thermostat mode
    if(req.fullData.length > 1 && req.fullData[1][0] == `added`) {
      const users = await queries.getUserIdByThermostatId(hubId);
      if(users.length === 0) {
        sendResponse(res, "{'error': 'no user data'}");
      }
      const userId = users[0].userId;   
      
      const thermostatObj =  {
        "thermostatId": thermostatData.length.toString(),
        "userId": userId,
        "thermostatName" : newDeviceName,
        "hubId": hubId,
        "group": "My home",        
        "humidity": "0",
        "curentTemp": "0",
        "requiredTemp": "0",
        "mode": "1",
        "fanMode": "0"
      };

      thermostatData.push(thermostatObj);
      queries.addThermostat(thermostatObj);
      hubPreferences.mode = 0;
      result = `[##]`;
    }
    else {      
      // Add thermostat mode - send next available thermostat ID to the HUB
      result = `[#,${thermostatData.length}]`; 
    }
  }
  else if(hubPreferences.mode == 2) {
    sendResponse(res, '[##, 1]'); // ## - thermostat added, 1 - ok
    console.log("Thermostat added!");
  }
  else if(hubPreferences.mode == 3) {
    sendResponse(res, '[##, 1]'); // ## - thermostat deleted, 1 - ok
    console.log("Thermostat deleted!");
  }  
  else {
    //////////////////////////////////////
    // Normal operationg mode
    //////////////////////////////////////
    for(let i = 0; i < thermostatData.length; i ++) {
      // set up thermostatData with the real data from thermostats
      if(typeof thermostatResponse[i] != 'undefined' && thermostatResponse.length > 1) {
        // thermostatResponse[0][0] is the hub ID
        if(typeof thermostatResponse[i + 1] !== 'undefined' && typeof thermostatResponse[i + 1] == 'object') {
          const thermostatId = thermostatResponse[i + 1][0];
          thermostatData[thermostatId].humidity = thermostatResponse[i + 1][1];
          thermostatData[thermostatId].curentTemp = thermostatResponse[i + 1][2];
          thermostatData[thermostatId].lastConnected = new Date();
        }
      }
      // get the desired temperature
      result += '[' + thermostatData[i].thermostatId + ',' + thermostatData[i].requiredTemp + ',' + thermostatData[i].mode + ',' + thermostatData[i].fanMode + ']'; 
    }
    //if(result == '')
      //result = '[]';    
  }
  sendResponse(res, result);
}

const setDesiredTemperature = async (req, res, thermostatData, requestData) => {
  const data = requestData[1];
  const id = data[0];
  const temp = data[1];
  thermostatData[id].requiredTemp = temp;
  const result = `{"status": "success"}`;
  sendResponse(res, result);
}

const setThermostatMode = async (req, res, thermostatData, requestData) => {
  const data = requestData[1];
  const id = data[0];
  const mode = data[1];
  thermostatData[id].mode = mode;
  const result = `{"status": "success"}`;
  sendResponse(res, result);
}

const setThermostatFanMode = async (req, res, thermostatData, requestData) => {
  const data = requestData[1];
  const id = data[0];
  const mode = data[1];
  thermostatData[id].fanMode = mode;
  const result = `{"status": "success"}`;
  sendResponse(res, result);
}

const cancelAddThermostatMode = async (req, res, thermostatData, requestData, hubPreferences) => {
  const result = `{"status": "adding canceled"}`;
  hubPreferences.mode = 0; // adding thermostat
  sendResponse(res, result);
}

const setAddThermostatMode = async (req, res, thermostatData, requestData, hubPreferences) => {
  newDeviceName = requestData[0][1];
  const result = `{"status": "adding"}`;
  hubPreferences.mode = 1; // adding thermostat
  sendResponse(res, result);
}

const deleteThermostat = async (req, res, thermostatData, requestData, hubPreferences) => {

  const hubId = requestData[0][0];
  const removeThermostatList = requestData[1];

  for(var i in thermostatData) {
    const data = thermostatData[i];
    const tId = data.thermostatId;
    
    if(removeThermostatList.indexOf(tId) !== -1 ) {
        queries.remove({ thermostatId: tId }, );        
    }
}
  thermostatData = await queries.getThermostatDataForHubId(hubId);
  const result = `{"status": "deleted"}`;
  sendResponse(res, result);
}

export { 
  getThermostatListFromDB,
  getFullReadings,
  getReadings,
  setDesiredTemperature,
  setThermostatMode,
  setThermostatFanMode,
  setAddThermostatMode,
  cancelAddThermostatMode,
  deleteThermostat
};