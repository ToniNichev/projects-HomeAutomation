#include <Ethernet.h>
#include "RFCommunicator.h"
#include "string_to_float.h"
#include <DHT.h>
#include <EEPROM.h>
#include "SR04.h"

#define DEVICE_TYPE 2 // 1 - Therrmostat, 2 - Proximity sensor

#define TRIG_PIN 7
#define ECHO_PIN 6

#define DEVICE_EPROM_ADDRESS 3
#define RESET_PIN 2

// device settings
short int deviceId = 0;

// program variables
int len;
short int programMode = 0;
short int communicationChannel = 0;

float hum;  //Stores humidity value
float temp; //Stores temperature value
char t[4] = "";
char msg[32] = "";
short int deviceMode = 0;


SR04 sr04 = SR04(ECHO_PIN,TRIG_PIN);


void setup() {  
  // pinMode(buzzerPin, OUTPUT);
  Serial.begin(9600);
  while (!Serial) {
    ; // wait for serial port to connect. Needed for native USB port only
  } 
    
  pinMode(LED_BUILTIN, OUTPUT);
  pinMode(RESET_PIN, OUTPUT);

  Serial.println(""); 
  Serial.println("#############################################");
  Serial.println("⍑ STARTING ...");
  delay(3000);
  
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
}



void loop() {
  delay(200);
  Serial.println("loop ....");
  Serial.println("");

  // Reseting device in ADD mode 
  if(Serial.available()) {
    char input = Serial.read();
    if(input == '1') {
      // passing '1' to the serial port will reset thermostat in ADD mode
      Serial.println("Resetting ⍑ in ADD mode");
      writeIntIntoEEPROM(DEVICE_EPROM_ADDRESS, -1);  // !!!  force to set up device in ADD device mode !!!!
      delay(3000);
    }
  }  

  if(digitalRead(RESET_PIN) == 1) {
    Serial.println("Resetting ....");
    writeIntIntoEEPROM(DEVICE_EPROM_ADDRESS, -1);
    /*
    for(int q=0; q< 5; q++) {
      digitalWrite(RELAY_FAN_LOW, HIGH);
      delay(1000);
      digitalWrite(RELAY_FAN_LOW, LOW);
      delay(1000);
    }
    */
  }
  // ==========================

  char serverData[32] = "";
  memset(serverData, 0, sizeof serverData);
  long *rfCommunicatorResult;
  while(serverData[0] == 0) {
    rfCommunicatorResult = RFCommunicatorListen(serverData, sr04, false); // Listen forever till receive data from the hub
  }
  Serial.print("#############: ");
  Serial.print(rfCommunicatorResult[1]);
  Serial.println();
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
    delay(2000);    
    char msgToServer[32] = {0};
    sprintf(msgToServer, "[\"added\"][%d]", DEVICE_TYPE);
    RFCommunicatorSend(msgToServer);
    Serial.print("msg sent to the hub: ");
    Serial.print(msgToServer);
    Serial.println();
    delay(200);
    programMode = 0;
    RFCommunicatorSetup(3,2); // switch to regular communication channel.
  }
  else if(programMode == 2) {
    Serial.println("do nothing ...");
    delay(2000);
    programMode = 0;
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
      hum = 10;
      temp = 20;
    
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
