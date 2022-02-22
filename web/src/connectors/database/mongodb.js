import { MongoClient } from 'mongodb';
//import assert from 'assert';

// Connection URL
const url = `mongodb://localhost:${process.env.DB_DATABASE_PORT}`;
// Database Name
const dbName = process.env.DB_DATABASE_NAME;


const connect = async () => {
  let db = null;
  try {
    const client = await MongoClient.connect(url);
    db = client.db(dbName);  
  } 
  catch (err) {
    console.log("Error connectiong to Mongo DB!");
    console.log(err.stack);
  }     
  return db;
}

export default {

  add: async (docObject, collectionName) => {
    let result;

    try  {
      const db = await connect();
      result = await db.collection(collectionName).insert(docObject);
      return result;
    }
    catch (err) {
      console.log(err.stack);
    }  
  },
	
	find: async (searchObject, collectionName) => {
    let client;
    let result;

    try  {
      const db = await connect();
      result = await db.collection(collectionName).find(searchObject).toArray();
    }
    catch (err) {
      console.log(err.stack);
    }    
    if(client)
      client.close();
    return result;
  },

  remove: async (searchObject, collectionName) => {
    let client;
    let result;

    try  {
      client = await MongoClient.connect(url);
      console.log("Connected correctly to server");
  
      const db = client.db(dbName);
      result = await db.collection(collectionName).remove(searchObject);
    }
    catch (err) {
      console.log(err.stack);
    }    
    // Close connection
    if(client)
      client.close();
    return result;  
  },

	updateOneField: async (searchObject, newObject, collectionName) => {
    let client;
    let result;

    try  {
      client = await MongoClient.connect(url);
      console.log("Connected correctly to server");
  
      const db = client.db(dbName);
      result = await db.collection(collectionName).updateOne(searchObject, {$set:newObject} );
    }
    catch (err) {
      console.log(err.stack);
    }    
    // Close connection
    if(client)
      client.close();
    return result;
  },    

	update: async (searchObject, newObject, collectionName) => {
    let client;
    let result;

    try  {
      client = await MongoClient.connect(url);
      console.log("Connected correctly to server");
  
      const db = client.db(dbName);

      result = await db.collection(collectionName).update(searchObject, { $set: newObject }).toArray();
    }
    catch (err) {
      console.log(err.stack);
    }    
    // Close connection
    if(client)
      client.close();
    return result;
  },  
  
  dropDB: async () => {
    try  {
      const db = await connect();
      db.dropDatabase();
    }
    catch (err) {
      console.log(err.stack);
    }  
  }
}

