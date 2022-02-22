#include "RFCommunicator.h"
#define RECEIVE_TIMEOUT_AFTER 400

RF24 radio(9, 8);  // CE, CSN
const byte addresses[][6] = {"00001", "00010", "00020", "00025", "00030", "00035"};
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

bool RFCommunicatorListen(char data[], bool withTimeout) {  
  bool error = false;
  radio.startListening();
  listenRepeats = 0;
  while(!radio.available()) {
    if(withTimeout) {
      if(listenRepeats > RECEIVE_TIMEOUT_AFTER) {
        error = true;
        return true;
      }
      listenRepeats ++;    
    }
    delay(10);
  }
  char text[32] = "";
  radio.read(&text, sizeof(text));
  strcpy(data, text);
  return false;
}
