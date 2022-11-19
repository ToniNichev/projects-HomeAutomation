#include "RFCommunicator.h"
#include "SR04.h"
#define RECEIVE_TIMEOUT_AFTER 420

RF24 radio(9, 8);  // CE, CSN
const byte addresses[][6] = {"00001", "00002", "00003", "00004", "00005", "00006","00007", "00008","00009", "00010", "00011", "00012", "00013", "00014", "00015", "00016", "00017"  };
short int listenRepeats;

void RFCommunicatorSetup(short int writeAddress, short int readAddress) {
  radio.begin();
  radio.openWritingPipe(addresses[writeAddress]); 
  radio.openReadingPipe(0, addresses[readAddress]); // 00001
  radio.setPALevel(RF24_PA_MIN);
  radio.setDataRate( RF24_250KBPS );
} 

void RFCommunicatorSend(char sendText[]) {
  radio.stopListening();
  const char text[128] = {0};
  strcpy(text,sendText);
  radio.write(&text, sizeof(text));
}

long * RFCommunicatorListen(char data[], SR04 sr04, bool withTimeout) {  
  bool error = false;
  static long result[2];
  long distance;
  radio.startListening();
  listenRepeats = 0;
  while(!radio.available()) {

    distance=sr04.Distance();
    Serial.print(distance);
    Serial.println("cm");
    if(withTimeout) {
      if(listenRepeats > RECEIVE_TIMEOUT_AFTER) {
        error = true;
        result[0] = 1;
        result[1] = distance;
        return result;
      }
      listenRepeats ++;    
    }
    delay(10);
  }
  char text[32] = "";
  radio.read(&text, sizeof(text));
  strcpy(data, text);
  result[0] = 0;
  result[1] = distance;  
  return result;
}
