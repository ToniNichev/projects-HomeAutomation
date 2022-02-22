#include "RFCommunicator.h"
#include <EEPROM.h>
#define THERMOSTAT_EPROM_ADDRESS 3


int q = 0;
short int id = 0;
int chanel = (id * 2) + 1;

void setup() {
  Serial.begin(9600);
  while (!Serial) {
    ; // wait for serial port to connect. Needed for native USB port only
  }
  Serial.println();
  Serial.println("PROGRAM STARTED");  
  RFCommunicatorSetup(chanel, chanel + 1);
}

void loop() {
  // LISTEN
  Serial.print("Listening ...");
  char data[32];
  RFCommunicatorListen(data, false);
  Serial.println(data); 

  // SEND  
  delay(100);
  const char msg[32];
  sprintf(msg, "thermostat %d - %d", id, q);
  RFCommunicatorSend(msg);


  delay(1000);
  q++;
}
