#include <Ethernet.h>
#include "RFCommunicator.h"
#include "string_to_float.h"
#include <DHT.h>
#include <EEPROM.h>

#define RELAY_FAN_LOW 7
#define RELAY_FAN_HIGH 6
#define RELAY_COOL 5
#define RELAY_HEAT 3
#define DEVICE_EPROM_ADDRESS 3
#define RESET_PIN 2

// device settings
short int deviceId = 0;

// program variables
int len;
short int programMode = 0;
short int communicationChannel = 0;

//Constants
#define DHTPIN 4     // what pin we're connected to
#define DHTTYPE DHT22   // DHT 22  (AM2302)
DHT dht(DHTPIN, DHTTYPE); //// Initialize DHT sensor for normal 16mhz Arduino

float hum;  //Stores humidity value
float temp; //Stores temperature value
char t[4] = "";
char msg[32] = "";
short int deviceMode = 0;


void setup() {  

  
  
  Serial.begin(9600);
  dht.begin();
  // set up 4 relay pins
  pinMode(RELAY_FAN_LOW, OUTPUT);
  pinMode(RELAY_FAN_HIGH, OUTPUT);
  pinMode(RELAY_COOL, OUTPUT);
  pinMode(RELAY_HEAT, OUTPUT);

  pinMode(LED_BUILTIN, OUTPUT);

  pinMode(RESET_PIN, OUTPUT);

  // set up all relays to 0
  digitalWrite(RELAY_FAN_LOW, HIGH);
  digitalWrite(RELAY_FAN_HIGH, HIGH);
  digitalWrite(RELAY_COOL, HIGH);
  digitalWrite(RELAY_HEAT, HIGH);
  
  while (!Serial) {
    ; // wait for serial port to connect. Needed for native USB port only
  } 
  Serial.println(""); 
  Serial.println("#############################################");
  Serial.println("⍑ STARTING ...");

  //writeIntIntoEEPROM(DEVICE_EPROM_ADDRESS, -1);  // !!!  force to set up device in ADD device mode !!!!
  
  short int Id = readIntFromEEPROM(DEVICE_EPROM_ADDRESS);
  if(Id == -1) {
    communicationChannel = 0;
    RFCommunicatorSetup(1,0); // set up device to add mode
    programMode = 1;          // set add new device mode
    Serial.println("⍑ is in ADD mode ...");
  }
  else {
    deviceId = Id;
    RFCommunicatorSetup(3, 2);
    Serial.print("⍑ ID : ");
    Serial.println(deviceId);
    Serial.print("⍑ chanel :");
    Serial.println(communicationChannel);
    Serial.println("#############################################");
  }

  for(int q = 0; q < 10; q ++) {
    digitalWrite(LED_BUILTIN, HIGH);   // turn the LED on 
    delay(500);                       // wait for half a second
    digitalWrite(LED_BUILTIN, LOW);    // turn the LED off 
    delay(500); 
  }  
}



void loop() {
  delay(200);

  if(digitalRead(RESET_PIN) == 1) {
    Serial.println("Resetting ....");
    writeIntIntoEEPROM(DEVICE_EPROM_ADDRESS, -1);
    for(int q=0; q< 5; q++) {
      digitalWrite(RELAY_FAN_LOW, HIGH);
      delay(1000);
      digitalWrite(RELAY_FAN_LOW, LOW);
      delay(1000);
    }
  }

  
  Serial.println();
  Serial.println();

  Serial.print(communicationChannel);
  Serial.print(" | ⍑ ... ⌂");
  Serial.println(); 

  char serverData[32] = "";
  RFCommunicatorListen(serverData, false);
  printToSerial(communicationChannel, serverData, true);
  delay(1500);

  if(programMode == 1) {
    // ###########################
    // adding device mode
    // ###########################    
    float *serverVals = parseToValues(serverData);
    short int id = (int) serverVals[1];
    deviceId = id;
    Serial.print("Received NEW ⍑ ID: ");
    Serial.println(id);
    writeIntIntoEEPROM(DEVICE_EPROM_ADDRESS, id);    
    delay(100);    
    char msgToServer[32] = "[\"added\"]";
    RFCommunicatorSend(msgToServer);
    Serial.println("msg sent!");
    delay(200);
    programMode = 0;
    RFCommunicatorSetup(3,2); // switch to regular communication channel.
  }
  else if(programMode == 2) {
    Serial.println("do nothing ...");
    delay(2000);
  }
  else {
    // ###########################
    // regular program mode
    // ###########################  

    float *serverVals = parseToValues(serverData);
    short int _id = serverVals[0];
    short int fanMode = (int) serverVals[3];  
    short int deviceMode = (int) serverVals[2];
    float requiredTemperature = serverVals[1];
    Serial.println();
    if(_id == deviceId) {
            
      hum = dht.readHumidity();
      temp = dht.readTemperature();  
    
      dtostrf(hum, 4, 2, t); 
      msg[0] = '[';
      msg[1] = '0' + deviceId;    
      msg[2] = ',';
      msg[3] = t[0];
      msg[4] = t[1];
      msg[5] = t[2];
      msg[6] = t[3];
      msg[7] = t[4];
      msg[8] = ',';
      dtostrf(temp, 4, 2, t); 
      msg[9] = t[0];
      msg[10] = t[1];
      msg[11] = t[2];
      msg[12] = t[3];
      msg[13] = t[4];
      msg[14] = ',';
      msg[15] = '0';
      msg[16] = ']';       
  
      delay(200);
      // ⍑ >>> ⌂ send device readings to the hub
      printToSerial(communicationChannel, msg, false);  
      RFCommunicatorSend(msg);     
   
      
      // Set fan mode
      switch(fanMode) {
        case 0:
          digitalWrite(RELAY_FAN_LOW, HIGH);
          digitalWrite(RELAY_FAN_HIGH, HIGH);
          break;
        case 1:
          digitalWrite(RELAY_FAN_LOW, LOW);
          digitalWrite(RELAY_FAN_HIGH, HIGH);    
          break;
        case 2:
          digitalWrite(RELAY_FAN_LOW, HIGH);
          digitalWrite(RELAY_FAN_HIGH, LOW);    
          break;      
      }
      
      // Set temperature
      switch(deviceMode) {
        case 1:
          digitalWrite(RELAY_COOL, HIGH);    
          digitalWrite(RELAY_HEAT, HIGH);
          break;
        case 2:
          // COOL
          digitalWrite(RELAY_HEAT, HIGH);      
          if(temp > requiredTemperature) {
            digitalWrite(RELAY_COOL, LOW);
            Serial.println("COOLING: LOW");
          }
          else {
            digitalWrite(RELAY_COOL, HIGH);
            Serial.println("COOLING: HIGH");
          }
          break;
         case 3:
          // HEAT
          digitalWrite(RELAY_COOL, HIGH);      
          if(temp < requiredTemperature) {
            digitalWrite(RELAY_HEAT, LOW);
            Serial.println("HEATING: LOW");
          }
          else {
            digitalWrite(RELAY_HEAT, HIGH);
            Serial.println("HEATING: HIGH");
          }     
          break;
        
          Serial.println("#####################");
          Serial.print("required temperature: ");
          Serial.print(requiredTemperature);
          Serial.println();      
          Serial.print("curent temp: ");
          Serial.print(temp);
          Serial.println();      
          break;
      }
    }
  }
}

// ##############################################
// Helper methods
// ##############################################


void printToSerial(short int deviceId, char data[32], bool hubToDevice) {
  Serial.print(deviceId);     
  Serial.print(" | ");
  if(hubToDevice)
    Serial.print("⌂ >>> ⍑ ");
  else
    Serial.print("⍑ >>> ⌂ ");
  Serial.print(" : ");
  Serial.print(data);
  Serial.println();  
}

void writeIntIntoEEPROM(int address, int number)
{ 
  EEPROM.write(address, number >> 8);
  EEPROM.write(address + 1, number & 0xFF);
}
int readIntFromEEPROM(int address)
{
  return (EEPROM.read(address) << 8) + EEPROM.read(address + 1);
}
