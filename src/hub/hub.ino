#include <Ethernet.h>
#include "EthernetWebClient.h"
#include "RFCommunicator.h"

#define ethernetDomain "toni-develops.com"
#define ethernetUrl "GET /thermostat-services/get-data?data="
#define ethernetPort 8061

#define hubId "AXCS12"
//#define hubId "B2CF62"


char thermostatsData[100] = ""; 
short int programMode = 0;

void setHubId() {
  strcpy(thermostatsData, "[\"");
  strcat(thermostatsData, hubId);  
  strcat(thermostatsData, "\"]");  
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

  // construct the url and append thermostat id
  if(thermostatsData[0] != '[') {
    setHubId();
  }

  strcpy(ethernetURL, ethernetUrl);
  strcat(ethernetURL, thermostatsData);
  strcat(ethernetURL, " HTTP/1.1");

  Serial.println();
  Serial.print("⌂ >>> ♁ :"); // request from the hub to the web server, passing thermostat's readings
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
  short int thermostatId = 0; // starting from first thermostat
  short int communicationChannel;
  int pos = 0;

  if(serverData[1] == '#') {
    // #########################
    // add thermostat hub mode
    // #########################    
    if(serverData[2] == '#') {
      programMode = 0;
    }
    else {
      // set up hub to `add thermostat mode`
      RFCommunicatorSetup(0,1);
      // send thermostat ID to the thermostat: [#,0]
      Serial.print("0 | ⌂ >>> ⍑: ");
      Serial.println(serverData);

      
      RFCommunicatorSend(serverData);
      delay(100);
      Serial.println("(adding thermostat) waiting for ⍑ response ...");
      char tempTwo[32] = "";
      RFCommunicatorListen(tempTwo, false);
      Serial.print("0 | ⍑ >>> ⌂ : ");
      Serial.println(tempTwo);
      strcat(thermostatsData, tempTwo);
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
        // sending data to the thermostat
        RFCommunicatorSend(data);  
        printToSerial(communicationChannel, data, true);     
        delay(1000);       
        
        // clear data
        memset(data, 0, 32);            

        // listen for data from the thermostat
        char temp[32] = "";         
        if(!RFCommunicatorListen(temp, true)) {
          printToSerial(communicationChannel, temp, false);
          strcat(thermostatsData, temp);
        }
        else {
          Serial.println(" ..... Timed out .....");
        }


        delay(1000);
        thermostatId ++;
        pos = 0;
        Serial.println();
      }
    }
    
  }
  Serial.println();
  Serial.println("delaying 1 sec before the next cycle ...");
  delay(1000);
}



void printToSerial(short int thermostatId, char data[32], bool hubToThermostat) {
  Serial.println();
  Serial.print(thermostatId);     
  Serial.print(" | ");
  if(hubToThermostat)
    Serial.print("⌂ >>> ⍑ ");
  else
    Serial.print("⍑ >>> ⌂ ");
  Serial.print(" : ");
  Serial.print(data);
}
