#include <Ethernet.h>
#include "EthernetWebClient.h"
#include "RFCommunicator.h"

#define ethernetDomain "toni-develops.com"
#define ethernetUrl "GET /device-services/get-data?data="
#define ethernetPort 8061

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

  // add hub ID
  setHubId();
      
  char data[32] = "";  
  short int deviceId = 0; // starting from first device
  short int communicationChannel;
  int pos = 0;

  if(serverData[1] == '#') {
    // #########################
    // add device hub mode
    // #########################    
    if(serverData[2] == '#') {
      programMode = 0;
    }
    else {
      // set up hub to `add device mode`
      RFCommunicatorSetup(0,1);
      // send device ID to the device: [#,0]
      Serial.print("0 | ⌂ >>> ⍑: ");
      Serial.println(serverData);

      
      RFCommunicatorSend(serverData);
      delay(100);
      Serial.println("(adding device) waiting for ⍑ response ...");
      char tempTwo[32] = "";
      RFCommunicatorListen(tempTwo, false);
      Serial.print("0 | ⍑ >>> ⌂ : ");
      Serial.println(tempTwo);
      strcat(devicesData, tempTwo);
      programMode = 0;
      RFCommunicatorSetup(2, 3);
      delay(2000);
    }
  }
  else {
    // #########################
    // regular hub mode
    // #########################
    Serial.print("programMode: ");
    Serial.println(programMode);
    
    for(int i = 0; i < 100; i ++) {      
      if(serverData[i] == '\0') {
        break;
      }
      data[pos] = serverData[i];
      pos ++;
      if(serverData[i] == ']') {
        // sending data to the device
        RFCommunicatorSend(data);  
        printToSerial(communicationChannel, data, true);     
        delay(1000);       
        
        // clear data
        memset(data, 0, 32);            

        // listen for data from the device
        char temp[32] = "";         
        if(!RFCommunicatorListen(temp, true)) {
          printToSerial(communicationChannel, temp, false);
          strcat(devicesData, temp);
        }
        else {
          Serial.println(" ..... Timed out .....");
        }


        delay(1000);
        deviceId ++;
        pos = 0;
        Serial.println();
      }
    }
    
  }
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
