import PageData from '../src/containers/PageLayout/PageData'; 

function requestDataFromAPI(req, res, next) {
  const templateName = PageData[req.url].template;    
  console.log(">>>>>", templateName);
  req.templateName = templateName;
  req.apiData = apiData;
  next(); // continue once the data is available.
}

export default requestDataFromAPI;