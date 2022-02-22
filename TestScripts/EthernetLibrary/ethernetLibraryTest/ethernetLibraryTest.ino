#include <Ethernet.h>
#include "EthernetWebClient.h"

#define ethernetDomain "toni-develops.com"
#define ethernetUrl "GET /thermostat-services/get-data?data="
#define ethernetPort 8061
#define hubId "AXCS12"

char thermostatsData[100] = ""; 

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

}

void loop() {
  char ethernetURL[150] = "";

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
    
  delay(3000);
}
