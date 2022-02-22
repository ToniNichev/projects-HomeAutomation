const {WEATHER_API_URL} = process.env;

let cachedResponse = null;
let lastCachedTime = null;
const refreshInterval = 60; // seconds

const sendResponse = (res, responseString) => {

  res.status(200);
  res.removeHeader('X-Powered-By');
  res.removeHeader('Set-Cookie');
  res.removeHeader('Connection');
  res.send(responseString);  
}

const fetchWeatherData = async () => {
  lastCachedTime = new Date();
  const data = await fetch(WEATHER_API_URL);
  return data;
  /*
  await fetch(WEATHER_API_URL)
    .then(response => response.json())
    .then(data => { 
      return data;
    });
    */
}

/**
 * getLocalWeather - returns local weather data.
 * @param {*} req 
 * @param {*} res 
 */
const getLocalWeather = async (req, res) => {
  const datenow = new Date();
  if( lastCachedTime != null && ((datenow - lastCachedTime) * 0.001) < refreshInterval ) {
    sendResponse(res, cachedResponse);
  }
  else {
    console.log(">>>>>> Updating weather data !");
    const response = await fetchWeatherData();
    const responseStr = await response.json();    
    cachedResponse = responseStr;
    lastCachedTime = new Date();
    sendResponse(res, responseStr);
  }
}



export { 
  getLocalWeather
};