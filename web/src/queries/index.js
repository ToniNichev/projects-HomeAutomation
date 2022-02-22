
import mongoDB  from'../connectors/database/mongodb';

const thermostatCollectionName = 'thermostat';
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
    // Thermostat functions
    // #######################################
    getAllThermostats: async () => {
      const result = await mongoDB.find({}, thermostatCollectionName);
      return result;
    }, 

    getThermostatsBySearchTerm: async (searchObject) => {
      const result = await mongoDB.find(searchObject, thermostatCollectionName);
      return result;
    },


    remove: async (flagData) => {
      mongoDB.remove(flagData, thermostatCollectionName, () => {
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
      const result = await mongoDB.find({ "UserId": userId }, thermostatCollectionName);
      return result;
    },

    getUserIdByThermostatId: async (thermostatId) => {
      return mongoDB.find({thermostatHubs: thermostatId}, usersCollectionName);
    },    


    /**
     * 
     * @returns thermostatsObject
     */
    getThermostatData: async () => {
      const result = await mongoDB.find({}, thermostatCollectionName);
      return result;     
     },    
    
    getThermostatDataForHubId: async (hubId) => {
      const result = await mongoDB.find({ hubId: hubId }, thermostatCollectionName);
    return result;     
   },

   updateFeatureFlag: async (searchObject, newObject) => {
     delete newObject._id;
    mongoDB.update(searchObject, newObject, thermostatCollectionName, (result) => {
      return true;
    });     
   },    

   addFeatureFlag: async (flagData) => {
    mongoDB.add(flagData, thermostatCollectionName, () => {
      return true;
    });     
   },   


   dropdb: async () => {
    const result = mongoDB.dropDB();
    return result;
   },
  
   addThermostat: async (thermostatObject) => {    
    mongoDB.add(thermostatObject, thermostatCollectionName, () => {}); 
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
         
     const thermostatsObj = [
      {
        "thermostatId": "0",
        "userId": "0",
        "thermostatName" : "Living Room",
        "hubId": "AXCS12",
        "group": "My home",        
        "humidity": "0",
        "curentTemp": "0",
        "requiredTemp": "0",
        "mode": "1",
        "fanMode": "0"
      },

      {
        "thermostatId": "0",
        "userId": "1",
        "thermostatName" : "My Studio thermostat",
        "hubId": "B2CF62",
        "group": "My Studio",        
        "humidity": "0",
        "curentTemp": "0",
        "requiredTemp": "0",
        "mode": "1",
        "fanMode": "0"
      },
      
      {
        "thermostatId": "1",
        "userId": "0",
        "thermostatName" : "Bedroom",
        "hubId": "AXCS12",
        "group": "My home",        
        "humidity": "0",
        "curentTemp": "0",
        "requiredTemp": "0",
        "mode": "1",
        "fanMode": "0"
      },  
      
      {
        "thermostatId": "2",
        "userId": "0",
        "thermostatName" : "BlueRoom thermostat",
        "hubId": "AXCS12",
        "group": "My Home",        
        "humidity": "0",
        "curentTemp": "0",
        "requiredTemp": "0",
        "mode": "1",
        "fanMode": "0"
      },      
     ];
    mongoDB.add(thermostatsObj, thermostatCollectionName, () => {}); 

    // create users collection
    const usersObj = [
      {
        "id": "AXCS12-u",
        "email" : "toni.nichev@gmail.com",
        "password": "1234",
        "group": "some group",
        "thermostatHubs": [
          "AXCS12"
        ]     
      },
      {
        "id": "B2CF62",
        "email" : "john.smith@gmail.com",
        "password": "1234",
        "group": "some group",     
        "thermostatHubs": [
          "B2CF62"
        ]     
      }                
     ];    
     mongoDB.add(usersObj, usersCollectionName, () => {}); 
   },

   setupHubsDb: async () => {
    mongoDB.dropDB();
    const thermostatsObj = [{ONE:1}];
    mongoDB.add(thermostatsObj, thermostatCollectionName, () => {}); 
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
    const thermostatsObj = [];
    mongoDB.add(thermostatsObj, thermostatCollectionName, () => {}); 

    // create users collection
    const usersObj = [
      {
        "userId": "0",
        "email" : "toni.nichev@gmail.com",
        "password": "1234",
        "group": "some group",
        "thermostatHubs": [
          "AXCS12"
        ]     
      },
      {
        "userId": "1",
        "email" : "john.smith@gmail.com",
        "password": "1234",
        "group": "some group",     
        "thermostatHubs": [
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
