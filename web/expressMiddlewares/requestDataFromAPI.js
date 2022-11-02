import PageData from '../src/containers/PageLayout/PageData'; 
const url = require('url');
const querystring = require('querystring');
import queries from '../src/queries';

const stringToObject = (str) => {
  const fullString = str == '' ? '[]' : '[' + str.split("][").join("],[") + ']';
  return JSON.parse(fullString);
}

const sendResponse = (res, responseString) => {
  res.status(200);
  res.removeHeader('X-Powered-By');
  res.removeHeader('Set-Cookie');
  res.removeHeader('Connection');
  res.send(responseString);  
}

/**
 * 
 * @param {*} req 
 * @param {*} res 
 * @param {*} devicesData 
 * @param {*} usersData 
 * @param {*} next 
 * @returns 
 */
const requestDataFromAPI = async (req, res, devicesData, usersData, next) => {

  /*
  let userFromCookie;
  let userId;
  if(req?.cookies?.user) {  
    try {
      userFromCookie = JSON.parse(req.cookies.user);
      userId = userFromCookie?.id;
      usersData[userId] = userFromCookie;  
    }catch(e) {
      console.log("no user stored in cookie");
    }
  }
  
  if(!userId) {
    // get user from the DB if not present in cookies
    const userResponse = await queries.getUser({id: userId});
    if( userResponse.length === 0) {
      // user can't be found
      req.apiData = { error: 7, message: "Can't find user" };
      req.templateName = 'Html'; 
      next();
      return;          
    }
    usersData[userId] = userResponse[0];
  }
  
  if(usersData[userId].accessToken !== userFromCookie.accessToken) {
    req.apiData = { error: 5, message: "invalid token" };
    req.templateName = 'Html'; 
    next();
    return;
  }
  */
  
  req.parsedUrl = url.parse(req.url);
  const pathname = req.parsedUrl.pathname;  
  const parsedQs = querystring.parse(req.parsedUrl.query);
  
  if(pathname === '/setup' || pathname === '/sign-in') {
    req.templateName = 'Html'; 
    req.apiData = {};
    next();
    return;
  }
  
  if(!parsedQs.data) {
    console.log("#####################################################################");
    console.log("ERROR ! NO `data` Query String Param!!!");
    console.log("#####################################################################");
    next();
    return;
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
  
  /*
  const isValidHubIdForThisUser = userFromCookie?.deviceHubs?.find(element => element === hubId);
  if(typeof isValidHubIdForThisUser === 'undefined' && typeof userFromCookie !== 'undefined') {
    // user does not have this device ID
    req.error = {
      code : 'invalid_device_id'
    }
    req.templateName = 'InternalError';
  }
  else {  
  */
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

  next();  
}

export default requestDataFromAPI;