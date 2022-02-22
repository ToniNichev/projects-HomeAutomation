#include "RFCommunicator.h"
#define RECEIVE_TIMEOUT_AFTER 400

RF24 radio(9, 8);  // CE, CSN
const byte addresses[][6] = {"00001", "00002", "00008", "00009"};
short int listenRepeats;

void RFCommunicatorSetup(short int writeAddress, short int readAddress) {
  radio.begin();
  radio.openWritingPipe(addresses[writeAddress]); 
  radio.openReadingPipe(1, addresses[readAddress]); // 00001
  radio.setPALevel(RF24_PA_MIN);
} 

void RFCommunicatorSend(char sendText[]) {
  const char text[32] = {0};
  strcpy(text,sendText);
  radio.stopListening();
  radio.write(&text, sizeof(text));
}

void RFCommunicatorListen(char data[], bool withTimeout) {  
  radio.startListening();
  listenRepeats = 0;
  while(!radio.available()) {
    if(withTimeout) {
      if(listenRepeats > RECEIVE_TIMEOUT_AFTER) {
        Serial.print("[RFCommunicator]: didn't receive response for more than ");
        Serial.print(listenRepeats);
        Serial.println(" cycles. ! Aborting !!!");
        break;
      }
      listenRepeats ++;    
    }
    delay(10);
  }
  char text[32] = "";
  radio.read(&text, sizeof(text));
  strcpy(data, text);
}
