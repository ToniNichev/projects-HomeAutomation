
#include <Ethernet.h>

char ethernetWebClientServerName[100]; // name address for Google (using DNS)


// Set the static IP address to use if the DHCP fails to assign
EthernetClient client;

unsigned int ethernetDataBufferLen = 0;
short int ethernetMode = 0;


bool setupEthernetWebClient(char url[100], char Server[100], int ethernetWebClientPort, char ethernetServerData[], int serverDataLen) {
  if(ethernetMode == 0) {
    byte mac[] = { 0xDE, 0xAD, 0xBE, 0xEF, 0xFE, 0xED };
    IPAddress ip(192, 168, 0, 177);
    IPAddress myDns(192, 168, 0, 1);
    
    strcpy(ethernetWebClientServerName,Server);
    
    //server = *Server;
    // start the Ethernet connection:
    Serial.print("Initialize Ethernet with DHCP:");
    if (Ethernet.begin(mac) == 0) {
      Serial.println("Failed to configure Ethernet using DHCP");
      // Check for Ethernet hardware present
      if (Ethernet.hardwareStatus() == EthernetNoHardware) {
        Serial.println("Ethernet shield was not found.  Sorry, can't run without hardware. :(");
        while (true) {
          delay(1); // do nothing, no point running without Ethernet hardware
        }
      }
      if (Ethernet.linkStatus() == LinkOFF) {
        Serial.println("Ethernet cable is not connected.");
      }
      // try to congifure using IP address instead of DHCP:
      Ethernet.begin(mac, ip, myDns);
    } else {
      Serial.print("  DHCP assigned IP ");
      Serial.println(Ethernet.localIP());
    }
    // give the Ethernet shield a second to initialize:
    delay(1000);
  
    // if you get a connection, report back via serial:
    if (client.connect(ethernetWebClientServerName, ethernetWebClientPort)) {
      Serial.print("connected to ");
      Serial.println(client.remoteIP());

      client.println(url);
      client.println("Connection: close");
      client.println();
      ethernetMode = 1;
    } else {
      // if you didn't get a connection to the server:
      Serial.println("connection failed");
    }    
  }
  else if(ethernetMode > 0) {
    // if there are incoming bytes available, from the server, read them and print them
    int len = client.available();
    
    if (len > 0) {
      byte buffer[80];
      if (len > 80) len = 80;
      client.read(buffer, len);
      
      for(int i = 0; i < len; i ++) {
        if(buffer[i] == '[') {
          // body data started
          ethernetMode = 2;        
        }
        if(ethernetMode == 2) {
          ethernetServerData[ethernetDataBufferLen] = (char)buffer[i];
          ethernetDataBufferLen ++;
        }
      }
      
    }
  
    // if the server's disconnected, stop the client:
    if (!client.connected()) {
      Serial.println("disconnecting.");
      //Serial.println();      
      client.stop();

      ethernetDataBufferLen = 0;
      ethernetMode = 0;
      return true;
    }     
  }  
  return false;
}
