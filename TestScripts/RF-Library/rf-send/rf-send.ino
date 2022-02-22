#include "RFCommunicator.h"
#include <EEPROM.h>


int q = 0;
short int id = 0;

void setup() {
  Serial.begin(9600);
  while (!Serial) {
    ; // wait for serial port to connect. Needed for native USB port only
  }
  Serial.println();
  Serial.println("PROGRAM STARTED ....");  
}

void loop() {
  id = 0;
  while(id != 2) { 
    // set up communication chanel
    int chanel = (id * 2) + 1;
    RFCommunicatorSetup(chanel + 1, chanel);
    char msg[32];
    sprintf(msg, "receiver %d", id);  
    Serial.println("=============================");
    Serial.println(msg);
    Serial.println("_____________________________");  
    
    // # 2 - send    
    const char text[32];
    sprintf(text, "hello world %d", q);
    RFCommunicatorSend(text);
    Serial.println("Sending ...");
    
    // # 3 - receive
    Serial.println("Listening ...");
    char data[32];
    
    if(RFCommunicatorListen(data, true)) {
      Serial.println("TIMEOUT !!!!!!!!!!!!!!!!!!");
    } else {
      char textTwo[32] = "";
      Serial.println(data);    
    }
    
  
    Serial.println();  
    delay(1000);
    q ++;
    id ++;
  }
}


void constructMessage(short int communicationChannel, int payload, char msg[128]) {
  sprintf(msg, "(%d | ⌂ 12345678910 says: payload:  %d)", communicationChannel, payload);
}

void printToSerial(short int communicationChannel, char data[128], bool hubToThermostat) {
  Serial.println();
  Serial.print(communicationChannel);     
  Serial.print(" | ");
  if(hubToThermostat)
    Serial.print("⌂ >>> ⍑ ");
  else
    Serial.print("⍑ >>> ⌂ ");
  Serial.print(" : ");
  Serial.print(data);
}
