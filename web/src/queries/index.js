
import mongoDB  from'../connectors/database/mongodb';

const devicesCollectionName = 'devices';
const usersCollectionName = 'users';
const hubsCollectionName = 'hubs';

export default {

    // #######################################
    // Hub functions
    // #######################################  

    getHub: async (searchObject) => {
      const result = await mongoDB.find(searchObject, hubsCollectionName);
      return result;
    },     

    updateHub: async (searchObject, updateObject) => {       
      const result = await mongoDB.updateOneField(searchObject, updateObject, hubsCollectionName);
      return result;
    },     

    // #######################################
    // Devices functions
    // #######################################
    getAllDevices: async () => {
      const result = await mongoDB.find({}, devicesCollectionName);
      return result;
    }, 

    getDevicesBySearchTerm: async (searchObject) => {
      const result = await mongoDB.find(searchObject, devicesCollectionName);
      return result;
    },


    remove: async (flagData) => {
      mongoDB.remove(flagData, devicesCollectionName, () => {
        return true;
      });     
     },      

    // #######################################
    // Users functions
    // #######################################

    getUser: async (searchObject) => {
      const result = await mongoDB.find(searchObject, usersCollectionName);
      return result;
    },  

    addUser: async (userObject) => {    
      const result = await mongoDB.add(userObject, usersCollectionName);
      return result;
     },

     updateUser: async (searchObject, updateObject) => {    
      const result = await mongoDB.updateOneField(searchObject, updateObject, usersCollectionName);
      return result;
    },       

    getAllUsers: async (userId) => {
      const result = await mongoDB.find({}, usersCollectionName);
      return result;
    },  

    getUserByUserId: async (userId) => {
      const result = await mongoDB.find({ "UserId": userId }, devicesCollectionName);
      return result;
    },

    getUserIdBydeviceId: async (deviceId) => {
      return mongoDB.find({deviceHubs: deviceId}, usersCollectionName);
    },    


    /**
     * 
     * @returns devicesObject
     */
    getDevicesData: async () => {
      const result = await mongoDB.find({}, devicesCollectionName);
      return result;     
     },    
    
    getDevicesDataForHubId: async (hubId) => {
      const result = await mongoDB.find({ hubId: hubId }, devicesCollectionName);
    return result;     
   },

   updateFeatureFlag: async (searchObject, newObject) => {
     delete newObject._id;
    mongoDB.update(searchObject, newObject, devicesCollectionName, (result) => {
      return true;
    });     
   },    

   addFeatureFlag: async (flagData) => {
    mongoDB.add(flagData, devicesCollectionName, () => {
      return true;
    });     
   },   


   dropdb: async () => {
    const result = mongoDB.dropDB();
    return result;
   },
  
   addDevice: async (deviceObject) => {    
    mongoDB.add(deviceObject, devicesCollectionName, () => {}); 
   },

   setup: async () => {
     mongoDB.dropDB();

     const hubs = [
      {
        "id": "AXCS12",
        "registered": false,
        "partition": 1
      },
      {
        "id": "B2CF62",
        "registered": false,
        "partition": 1
      }      
    ];
    mongoDB.add(hubs, hubsCollectionName, () => {}); 
         
     const devicesObj = [
      {
        "deviceId": "0",
        "userId": "0",
        "deviceName" : "Living Room",
        "hubId": "AXCS12",
        "group": "My home",        
        "humidity": "0",
        "curentTemp": "0",
        "requiredTemp": "0",
        "mode": "1",
        "fanMode": "0"
      },

      {
        "deviceId": "0",
        "userId": "1",
        "deviceName" : "My Studio thermostat",
        "hubId": "B2CF62",
        "group": "My Studio",        
        "humidity": "0",
        "curentTemp": "0",
        "requiredTemp": "0",
        "mode": "1",
        "fanMode": "0"
      },
      
      {
        "deviceId": "1",
        "userId": "0",
        "deviceName" : "Bedroom",
        "hubId": "AXCS12",
        "group": "My home",        
        "humidity": "0",
        "curentTemp": "0",
        "requiredTemp": "0",
        "mode": "1",
        "fanMode": "0"
      },  
      
      {
        "deviceId": "2",
        "userId": "0",
        "deviceName" : "BlueRoom thermostat",
        "hubId": "AXCS12",
        "group": "My Home",        
        "humidity": "0",
        "curentTemp": "0",
        "requiredTemp": "0",
        "mode": "1",
        "fanMode": "0"
      },      
     ];
    mongoDB.add(devicesObj, devicesCollectionName, () => {}); 

    // create users collection
    const usersObj = [
      {
        "id": "AXCS12-u",
        "email" : "toni.nichev@gmail.com",
        "password": "1234",
        "group": "some group",
        "deviceHubs": [
          "AXCS12"
        ]     
      },
      {
        "id": "B2CF62",
        "email" : "john.smith@gmail.com",
        "password": "1234",
        "group": "some group",     
        "deviceHubs": [
          "B2CF62"
        ]     
      }                
     ];    
     mongoDB.add(usersObj, usersCollectionName, () => {}); 
   },

   setupHubsDb: async () => {
    mongoDB.dropDB();
    mongoDB.createEmpty("devices");
    mongoDB.createEmpty("users");

    const hubs = [
      {
        "id": "AXCS12",
        "registered": false,
        "partition": 1
      },
      {
        "id": "B2CF62",
        "registered": false,
        "partition": 1
      }      
    ];
    mongoDB.add(hubs, hubsCollectionName, () => {});     
   },
   
   setupOneUser: async () => {
    mongoDB.dropDB();
    const devicesObj = [];
    mongoDB.add(devicesObj, devicesCollectionName, () => {}); 

    // create users collection
    const usersObj = [
      {
        "userId": "0",
        "email" : "toni.nichev@gmail.com",
        "password": "1234",
        "group": "some group",
        "deviceHubs": [
          "AXCS12"
        ]     
      },
      {
        "userId": "1",
        "email" : "john.smith@gmail.com",
        "password": "1234",
        "group": "some group",     
        "deviceHubs": [
          "B2CF62"
        ]     
      }                
    ];    
    mongoDB.add(usersObj, usersCollectionName, () => {}); 

    const hubs = [
      {
        "id": "AXCS12",
        "registered": false,
        "partition": 1
      },
      {
        "id": "B2CF62",
        "registered": false,
        "partition": 1
      }      
    ];
    mongoDB.add(hubs, hubsCollectionName, () => {}); 
  }     

}
