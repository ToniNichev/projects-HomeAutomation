/*
* Arduino Wireless Communication Tutorial
*       Example 1 - Receiver Code
*                
* by Dejan Nedelkovski, www.HowToMechatronics.com
* 
* Library: TMRh20/RF24, https://github.com/tmrh20/RF24/
*/
#include <SPI.h>
#include <nRF24L01.h>
#include <RF24.h>
RF24 radio(9, 8); // CE, CSN

const byte addresses[][6] = {"00001", "00010", "00020", "00025", "00030", "00035"};

int id = 1;
int chanel = (id * 2) + 1;
int q = 0;


void setup() {
  Serial.begin(9600);
  radio.begin();
  radio.openWritingPipe(addresses[chanel]);
  radio.openReadingPipe(0, addresses[chanel + 1]);
  radio.setPALevel(RF24_PA_MIN);
  //radio.setRetries(15,15);
  radio.setDataRate( RF24_250KBPS );
  //radio.printDetails();
}
void loop() {
  
  // RECEIVE
  Serial.println("Listening ...");
  radio.startListening();  
    while(!radio.available()) {      
  }
  char text[32] = "";
  radio.read(&text, sizeof(text));
  Serial.println(text);

  // SEND
  delay(1000);
  radio.stopListening();
  const char textTwo[32];
  sprintf(textTwo, "thermostat %d - %d", id, q);
  radio.write(&textTwo, sizeof(textTwo));
  Serial.println("Sending ...");

  delay(1000);
  q ++;
}
