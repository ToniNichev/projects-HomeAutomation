import PageData from '../src/containers/PageLayout/PageData'; 
const url = require('url');
const querystring = require('querystring');
import queries from '../src/queries';

const stringToObject = (str) => {
  const fullString = str == '' ? '[]' : '[' + str.split("][").join("],[") + ']';
  return JSON.parse(fullString);
}

const requestDataFromAPI = async (req, res, devicesData, usersData, next) => { 
  
  let userFromCookie;
  if(typeof req.cookies.user === 'undefined') {
    req.cookies.user  = undefined;
   }
   else {
      try {
        userFromCookie = JSON.parse(req.cookies.user);
      }catch(e) {
          req.cookies.user  = undefined;
      }
   }

  
  if(typeof userFromCookie !== 'undefined') {
    // add user
    const userId = userFromCookie.id;
    usersData[userId] = userFromCookie;
  }

  req.parsedUrl = url.parse(req.url);
  const pathname = req.parsedUrl.pathname;  
  const parsedQs = querystring.parse(req.parsedUrl.query);
  
  if(pathname === '/setup' || typeof parsedQs.data === 'undefined') {
    // shortcut to run setup without credentials !!! REMOVE IT ONCE DONE !
    req.templateName = 'Html'; 
    req.apiData = {};
    next();
    return;
  }

  if(typeof parsedQs.data === 'undefined') {
    console.log("#####################################################################");
    console.log("ERROR ! NO `data` Query String Param!!!");
    console.log("#####################################################################");
  }

  const validDataObj = stringToObject(parsedQs.data); // device(s) ids

  if(typeof validDataObj === 'undefined' ||  validDataObj.length == 0) {
    // user does not have this device ID
    req.error = {
      code : 'invalid_device_id'
    }
    req.templateName = 'InternalError'; 
    next();
    return;
  }

  const hubId = validDataObj[0][0];
  const isValidHubIdForThisUser = userFromCookie?.deviceHubs?.find(element => element === hubId);

  if(typeof isValidHubIdForThisUser === 'undefined' && typeof userFromCookie !== 'undefined') {
    // user does not have this device ID
    req.error = {
      code : 'invalid_device_id'
    }
    req.templateName = 'InternalError';
  }
  else {  
    req.fullData = validDataObj;
    req.hubId = hubId;
    if(typeof devicesData[hubId] === 'undefined') {
      // get devices for this hub from DB if it's not fetched yet.
      const deviceFromDB = await queries.getDevicesBySearchTerm({hubId: hubId});
      devicesData[hubId] =deviceFromDB;
    }

    // send devices data for this specific hub from the request
    req.apiData = {"hubId": hubId, "devicesData" : devicesData[hubId]};
    const templateName = typeof PageData[pathname] != 'undefined' ? PageData[pathname].template : '';    
    req.templateName = templateName;
  }
  next(); // continue once the data is available.

}

export default requestDataFromAPI;