import queries from "../../src/queries";
var crypto = require('crypto');

const sendResponse = (res, responseString) => {
  res.status(200);
  res.removeHeader('X-Powered-By');
  res.removeHeader('Set-Cookie');
  res.removeHeader('Connection');
  res.send(responseString);  
}

const registerUser = async (req, res) => {
  let requestObj = JSON.parse(req.body);
  const email = requestObj.email;
  const password = requestObj.password;
  const hubId = requestObj.hubId;
  if(email === '' && password === '' && hubId ==='') {
    sendResponse(res, {message: 'Some of fields are empty!', errorCode: 1});  
    return;
  }
  const user = await queries.getUser({email: email});
  if(user.length > 0) {
    sendResponse(res, {message: 'Email exists!', errorCode: 1});  
    return;
  } 
  const hubResult = await queries.getHub({id: hubId});
  if(hubResult.length === 0) {
    sendResponse(res, {message: 'Cannot find purchased hub with this id!', errorCode: 2});  
    return;
  }  

  const updateHubResult = await queries.updateHub({id: hubId}, {registered: true});

  requestObj.id = hubId + '-u';
  requestObj.group = 'user';
  requestObj.deviceHubs = [hubId];
  const resultUpdate = await queries.addUser(requestObj);
  if(resultUpdate.result.ok === 1) {
    sendResponse(res, {message: `User addded !`});

  }
  else {
    sendResponse(res, {message: `Unknown error !`, errorCode: 1});
  }
}

const logIn = async (req, res, usersData) => {
  const requestObj = JSON.parse(req.body);
  const email = requestObj.email;
  const password = requestObj.password;
  const users = await queries.getUser({email: email, password: password });
  if(users.length === 0) {
    sendResponse(res, {error:1, message: 'Username or password do not match!'});  
    return;
  }
  let user = users[0];
  delete(user.password);
  const name = `${user.email}salt${user.userId}`;
  const hash = crypto.createHash('md5').update(name).digest('hex');
  const userId = user.id;
  user.accessToken = hash;
  await queries.updateUser({email: email, password: password}, {accessToken: hash});
  if( typeof usersData[userId] === 'undefined') {
    usersData[userId] = user;
  }

  sendResponse(res, user);  
}

const logOut = async (req, res, usersData) => {
  const requestObj = JSON.parse(req.body);
  const email = requestObj.email;
  const accessToken = requestObj.accessToken;
  const users = await queries.getUser({email: email });
  const userId = users[0].id;
  usersData[userId].accessToken = '';
  if(users.length === 0) {
    sendResponse(res, {error:1, message: 'Username can`t be found!'});  
    return;
  }
  if(accessToken !== requestObj.accessToken) {
    sendResponse(res, {error:1, message: 'Access token is invalid'});  
    return;    
  }

  queries.updateUser({email: email, accessToken: accessToken}, {accessToken: ''});
  sendResponse(res, {message: "You are logged out !"});  
}

const updateUser = async (req, res, usersData) => {
  let requestObj = JSON.parse(req.body);

  const userFromCookie = JSON.parse(req.cookies.user);
  if(userFromCookie.accessToken !== requestObj.accessToken || userFromCookie.email !== requestObj.email) {
    sendResponse(res, {message: 'Invalid access token while updating user data!', errorCode: 1});  
    return;
  }

  if(userFromCookie.password !== requestObj.oldPassword) {
    sendResponse(res, {message: 'Invalid password!', errorCode: 1});  
    return;
  }


  const searchObj = {
    email: userFromCookie.email,
    accessToken: userFromCookie.accessToken
  }

  let updateObj = {};
  if(typeof requestObj?.password !== 'undefined') {
    updateObj.password = requestObj.newPassword
  }
  if(typeof requestObj?.hubId !== 'undefined') {
    const hub = await queries.getHub({id: requestObj.hubId});    
    if(hub.length === 0 ) {
      sendResponse(res, {message: `Can't find this hub id !`, errorCode: 1});
      return;
    }
    if(hub[0].registered === true ) {
      sendResponse(res, {message: `Hub with this id is already registered !`, errorCode: 1});
      return;
    }
    const hubUpdateResult = await queries.updateHub({id: requestObj.hubId}, {registered: true});
    updateObj.deviceHubs = [];
    updateObj.deviceHubs[0] = requestObj.hubId
  }  
  const result = await queries.updateUser(searchObj, updateObj);
  if( result.matchedCount !== 1) {
    sendResponse(res, {message: `Unknown error !`, errorCode: 1});
  }
  else 
    sendResponse(res, {message: `success!`});
}


export { 
  registerUser,
  logIn,
  logOut,
  updateUser
};