#ifndef STRING_TO_FLOAT_H
#define STRING_TO_FLOAT_H
#include <Arduino.h>


float *parseToValues(String serverBodyResponse);
String valuesToString(double valueAray[], short int count);
#endif
