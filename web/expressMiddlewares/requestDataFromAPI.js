import PageData from '../src/containers/PageLayout/PageData'; 
const url = require('url');
const querystring = require('querystring');
import queries from '../src/queries';

const stringToObject = (str) => {
  const fullString = str == '' ? '[]' : '[' + str.split("][").join("],[") + ']';
  return JSON.parse(fullString);
}

const requestDataFromAPI = async (req, res, thermostatsData, usersData, next) => { 
  
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
    //const user = queries.getUser({email: userFromCookie.email, userFromCookie: userFromCookie.accessToken});
    const userId = userFromCookie.id;
    //const accessToken = userFromCookie.accessToken;
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

  const validDataObj = stringToObject(parsedQs.data); // thermostat(s) ids

  if(typeof validDataObj === 'undefined' ||  validDataObj.length == 0) {
    // user does not have this thermostat ID
    req.error = {
      code : 'invalid_thermostat_id'
    }
    req.templateName = 'InternalError'; 
    next();
    return;
  }

  const hubId = validDataObj[0][0];
  const isValidHubIdForThisUser = userFromCookie?.thermostatHubs?.find(element => element === hubId);

  if(typeof isValidHubIdForThisUser === 'undefined' && typeof userFromCookie !== 'undefined') {
    // user does not have this thermostat ID
    req.error = {
      code : 'invalid_thermostat_id'
    }
    req.templateName = 'InternalError';
  }
  else {  
    req.fullData = validDataObj;
    req.hubId = hubId;
    if(typeof thermostatsData[hubId] === 'undefined') {
      // get thermostats for this hub from DB if it's not fetched yet.
      const thermostatFromDB = await queries.getThermostatsBySearchTerm({hubId: hubId});
      thermostatsData[hubId] =thermostatFromDB;
    }

    // send thermostats data for this specific hub from the request
    req.apiData = {"hubId": hubId, "thermostatsData" : thermostatsData[hubId]};
    const templateName = typeof PageData[pathname] != 'undefined' ? PageData[pathname].template : '';    
    req.templateName = templateName;
  }
  next(); // continue once the data is available.

}

export default requestDataFromAPI;