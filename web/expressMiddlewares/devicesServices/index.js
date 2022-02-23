import { 
    getDeviceListFromDB,
    getReadings,
    getFullReadings,
    setDesiredTemperature,
    setDeviceMode,
    setDeviceFanMode,
    setAddDeviceMode,
    cancelAddDeviceMode,
    deleteDevice
} from './services';



const stringToObject = (str) => {
    const fullString = str == '' ? '[]' : '[' + str.split('][').join('],[') + ']';
    return JSON.parse(fullString);
}

const sendResponse = (res, responseString) => {
    res.status(200);
    res.removeHeader('X-Powered-By');
    res.removeHeader('Set-Cookie');
    res.removeHeader('Connection');
    res.send(responseString);  
}

const DeviceServices = async (req, res, devicesData, hubPreferences, usersData) => {
    if(typeof req?.query?.data === 'undefined') {
        sendResponse(res, {error: 1, message: 'missing `data` parameter.'});
    }
    const action = req.params[0];
    const requestData = stringToObject(req.query.data);
    const hubId = requestData[0][0];
    if(typeof hubPreferences[hubId] === 'undefined') {
        hubPreferences[hubId] = {
            mode: 0
        }
    }

    let userFromCookie;
    if(typeof req.cookies.user === 'undefined') {
        req.cookies.user  = undefined;
     }
     else {
        try {
            userFromCookie = JSON.parse(req.cookies.user);
        }catch(e) {
            req.cookies.user  = undefined;
            sendResponse(res,  {error:1, message: "Invalid json object for user"});
            return;
        }
     }

    const userId = userFromCookie?.id;
    if( action !== 'get-data') {
        if( typeof userId === 'undefined') {
            console.log("Invalid accessToken");
            sendResponse(res, {error:1, message: "Invalid accessToken"});
            return;
        }
        if(userFromCookie.accessToken !== usersData[userId].accessToken) {
            console.log("Invalid accessToken");
            sendResponse(res, {error:1, message: "Invalid token"});
            return;
        }
    }
    //if(userFromCookie.accessToken !== usersData)

    switch(action) {
        case 'get-full-data':
            await getFullReadings(req, res, devicesData[hubId]);
            break;
        case 'get-data':
            getReadings(req, res, devicesData[hubId], requestData, hubPreferences[hubId]);
            break;   
        case 'delete-device': 
            await deleteDevice(req, res, devicesData[hubId], requestData, hubPreferences[hubId]);
            devicesData[hubId] = await getDeviceListFromDB(hubId);
            break;            
        case 'set-desired-temperature': 
            await setDesiredTemperature(req, res, devicesData[hubId], requestData);
            break;
        case 'set-device-mode': 
            await setDeviceMode(req, res, devicesData[hubId], requestData);
            break;  
        case 'set-device-fan-mode': 
            await setDeviceFanMode(req, res, devicesData[hubId], requestData);
            break;
        case 'add-device': 
            await setAddDeviceMode(req, res, devicesData[hubId], requestData, hubPreferences[hubId]);        
            break;     
            case 'cancel-add-device': 
            await cancelAddDeviceMode(req, res, devicesData[hubId], requestData, hubPreferences[hubId]);        
            break;                
    }
}

export default DeviceServices;