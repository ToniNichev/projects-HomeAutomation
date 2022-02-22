
#ifndef ETHERNET_WEB_CLIENT_H
#define ETHERNET_WEB_CLIENT_H
#include <Arduino.h>
#include "EthernetWebClient.h"

bool setupEthernetWebClient(char url[100], char Server[100], int ethernetWebClientPort, char ethernetServerData[], int serverDataLen);

#endif
