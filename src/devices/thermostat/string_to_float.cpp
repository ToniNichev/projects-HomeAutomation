#include "string_to_float.h"
float parsedValues[50];


int charToInt(char val[], short int decimalNumbers) {
  int multiplier = 1;
  int result = 0;
  for(short int i = decimalNumbers - 1; i > -1; i --) {
    int n = val[i] - '0'; 
    result = result + (n * multiplier);
    multiplier = multiplier * 10;
  }  
  return result;
}

double charToFloat(char val[], short int decimalNumbers, short int fractionNumbers) {
 
  
  float decimalVal = charToInt(val, decimalNumbers);      
  char dec[6] = { 0 };
  short int ii = 0;
  for(short int i = decimalNumbers + 1; i < (decimalNumbers + (fractionNumbers)); i++) {
    dec[ii] = val[i];
    ii ++;
  }
     
  float fractialVal = charToInt(dec, fractionNumbers - 1);
    
  double fractialMultiplier = 1.0000;
  for(short int i = 0; i < fractionNumbers - 1; i ++) {
    fractialMultiplier = fractialMultiplier * 0.1;
  }
    
  double result = (fractialVal * fractialMultiplier) + decimalVal;
  return result;
}

float *parseToValues(String serverBodyResponse) {
  int l = serverBodyResponse.length();

  short int mode = 0;
  char val[] = "      ";
  short int co = 0;
  short int decimalNumbers = 0;
  short int fractionNumbers = 0;
  float results[10] = { };
  int resultsCount = 0;
  for(int i = 0;i < l + 1;i ++) {
    char c = serverBodyResponse[i];
    if(c == ',' || c == '[' || c == ']') {
      if(co == 0) {
        mode = 1;
      }
      else {
        float result = charToFloat(val, decimalNumbers, fractionNumbers);

        parsedValues[resultsCount] = result;
        resultsCount ++;
        co = 0;
        mode = 1;
        decimalNumbers = 0;
        fractionNumbers = 0;
        memset(val, 0, sizeof(val));       
      }
    }
    else if(mode > 0) {
      val[co] = c;
      if(c != '.' && mode == 1) {
        decimalNumbers ++;
      }
      else {
        mode = 2;
        fractionNumbers ++;
      }
      co ++;
    }

  }
  return parsedValues;
}


String valuesToString(double valueAray[], short int count) {
  String result = "[";
  for(short int i = 0; i < count; i ++) {
    result = result + valueAray[i] + ',';
    
  }
  result = result + "0]";
  return result;
}
