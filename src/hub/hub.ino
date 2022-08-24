#include <Ethernet.h>
#include "EthernetWebClient.h"
#include "RFCommunicator.h"

#define ethernetDomain "toni-develops.com"
#define ethernetUrl "GET /device-services/get-data?data="
#define ethernetPort 8085

#define hubId "AXCS12"
//#define hubId "B2CF62"


char devicesData[100] = ""; 
short int programMode = 0;

void setHubId() {
  strcpy(devicesData, "[\"");
  strcat(devicesData, hubId);  
  strcat(devicesData, "\"]");  
}
      
void setup() {
  Serial.begin(9600);
  while (!Serial) {
    ; // wait for serial port to connect. Needed for native USB port only
  }
  Serial.println();
  Serial.println("######################");
  Serial.println("PROGRAM STARTED");
  Serial.println("######################");
  delay(500);
  RFCommunicatorSetup(2, 3);
}


void loop() {
  char ethernetURL[150] = "";
  Serial.println();

  // construct the url and append device id
  if(devicesData[0] != '[') {
    setHubId();
  }

  strcpy(ethernetURL, ethernetUrl);
  strcat(ethernetURL, devicesData);
  strcat(ethernetURL, " HTTP/1.1");

  Serial.println();
  Serial.print("⌂ >>> ♁ :"); // request from the hub to the web server, passing device's readings
  Serial.print(ethernetURL);
  Serial.println();
    
  char serverData[100] = {0};  
  int len;       
  while(setupEthernetWebClient(ethernetURL, ethernetDomain, ethernetPort, serverData, len) == false) {
    ; // wait untill get server data
  }

  Serial.print("⌂ <<< ♁ :"); // response from the web server to the hub
  Serial.print("Server data:");
  Serial.print(serverData);
  Serial.println();
  Serial.println();

 
  Serial.println();
  Serial.println("delaying 1 sec before the next cycle ...");
  delay(1000);
}



void printToSerial(short int deviceId, char data[32], bool hubToDevice) {
  Serial.println();
  Serial.print(deviceId);     
  Serial.print(" | ");
  if(hubToDevice)
    Serial.print("⌂ >>> ⍑ ");
  else
    Serial.print("⍑ >>> ⌂ ");
  Serial.print(" : ");
  Serial.print(data);
}
