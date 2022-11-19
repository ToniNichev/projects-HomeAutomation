#ifndef RFCOMMUNICATOR_H
#define RFCOMMUNICATOR_H
#include <Arduino.h>
#include <nRF24L01.h>
#include <RF24.h>
#include "SR04.h"

/*
 * This is modified version with proximity sensor measuring 
 */

void RFCommunicatorSetup(short int writeAddress, short int readAddress);
long * RFCommunicatorListen(char data[], SR04 sr04, bool withTimeout);

void RFCommunicatorSend(char sendText[]);


#endif
