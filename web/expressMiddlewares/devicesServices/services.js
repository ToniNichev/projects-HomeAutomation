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

const getDeviceListFromDB = async (hubId) => {
  const response = await queries.getdeviceDataForHubId(hubId);
  return response;
}

/**
 * getFullReadings - returns all device data
 * @param {*} req 
 * @param {*} res 
 * @param {*} deviceData 
 */
const getFullReadings = async (req, res, deviceData) => {
  const response = JSON.stringify(deviceData);
  sendResponse(res, response);
}

/**
 * getReadings returns desired temperature and receive device curent humidity and temperature.
 * @param {*} req 
 * @param {*} res 
 */
const getReadings = async (req, res, deviceData, deviceResponse, hubPreferences) => {
  let result = '';  
  const hubId = req.hubId;
  if(hubPreferences.mode === 1) {
    // adding device mode
    if(req.fullData.length > 1 && req.fullData[1][0] == `added`) {
      const users = await queries.getUserIdByDeviceId(hubId);
      if(users.length === 0) {
        sendResponse(res, "{'error': 'no user data'}");
      }
      const userId = users[0].userId;   
      
      const deviceObj =  {
        "deviceId": deviceData.length.toString(),
        "userId": userId,
        "deviceName" : newDeviceName,
        "hubId": hubId,
        "group": "My home",        
        "humidity": "0",
        "curentTemp": "0",
        "requiredTemp": "0",
        "mode": "1",
        "fanMode": "0"
      };

      deviceData.push(deviceObj);
      queries.addDevice(deviceObj);
      hubPreferences.mode = 0;
      result = `[##]`;
    }
    else {      
      // Add device mode - send next available device ID to the HUB
      result = `[#,${deviceData.length}]`; 
    }
  }
  else if(hubPreferences.mode == 2) {
    sendResponse(res, '[##, 1]'); // ## - device added, 1 - ok
    console.log("Device added!");
  }
  else if(hubPreferences.mode == 3) {
    sendResponse(res, '[##, 1]'); // ## - device deleted, 1 - ok
    console.log("Device deleted!");
  }  
  else {
    //////////////////////////////////////
    // Normal operationg mode
    //////////////////////////////////////
    for(let i = 0; i < deviceData.length; i ++) {
      // set up deviceData with the real data from devices
      if(typeof deviceResponse[i] != 'undefined' && deviceResponse.length > 1) {
        // deviceResponse[0][0] is the hub ID
        if(typeof deviceResponse[i + 1] !== 'undefined' && typeof deviceResponse[i + 1] == 'object') {
          const deviceId = deviceResponse[i + 1][0];
          deviceData[deviceId].humidity = deviceResponse[i + 1][1];
          deviceData[deviceId].curentTemp = deviceResponse[i + 1][2];
          deviceData[deviceId].lastConnected = new Date();
        }
      }
      // get the desired temperature
      result += '[' + deviceData[i].deviceId + ',' + deviceData[i].requiredTemp + ',' + deviceData[i].mode + ',' + deviceData[i].fanMode + ']'; 
    }
    //if(result == '')
      //result = '[]';    
  }
  sendResponse(res, result);
}

const setDesiredTemperature = async (req, res, deviceData, requestData) => {
  const data = requestData[1];
  const id = data[0];
  const temp = data[1];
  deviceData[id].requiredTemp = temp;
  const result = `{"status": "success"}`;
  sendResponse(res, result);
}

const setDeviceMode = async (req, res, deviceData, requestData) => {
  const data = requestData[1];
  const id = data[0];
  const mode = data[1];
  deviceData[id].mode = mode;
  const result = `{"status": "success"}`;
  sendResponse(res, result);
}

const setDeviceFanMode = async (req, res, deviceData, requestData) => {
  const data = requestData[1];
  const id = data[0];
  const mode = data[1];
  deviceData[id].fanMode = mode;
  const result = `{"status": "success"}`;
  sendResponse(res, result);
}

const cancelAddDeviceMode = async (req, res, deviceData, requestData, hubPreferences) => {
  const result = `{"status": "adding canceled"}`;
  hubPreferences.mode = 0; // adding device
  sendResponse(res, result);
}

const setAddDeviceMode = async (req, res, deviceData, requestData, hubPreferences) => {
  newDeviceName = requestData[0][1];
  const result = `{"status": "adding"}`;
  hubPreferences.mode = 1; // adding device
  sendResponse(res, result);
}

const deleteDevice = async (req, res, deviceData, requestData, hubPreferences) => {

  const hubId = requestData[0][0];
  const removeDeviceList = requestData[1];

  for(var i in deviceData) {
    const data = deviceData[i];
    const tId = data.deviceId;
    
    if(removeDeviceList.indexOf(tId) !== -1 ) {
        queries.remove({ deviceId: tId }, );        
    }
}
  deviceData = await queries.getdeviceDataForHubId(hubId);
  const result = `{"status": "deleted"}`;
  sendResponse(res, result);
}

export { 
  getDeviceListFromDB,
  getFullReadings,
  getReadings,
  setDesiredTemperature,
  setDeviceMode,
  setDeviceFanMode,
  setAddDeviceMode,
  cancelAddDeviceMode,
  deleteDevice
};