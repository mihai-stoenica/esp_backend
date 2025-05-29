#include <Arduino.h>
#include "functions.h"
const char* ssid = "DIGI_c19b09";
const char* password = "6db1c892";

const char* serverUrl = "https://espbackend-production.up.railway.app/api/humidity"; 
const char* wsUrl = "websocket-fdbm.onrender.com";

const int dryValue = 3500;
const int wetValue = 800;

const int SENSOR_PIN = 34;     
const int MOTOR_PIN = 33;

unsigned long lastHumidityCheck = 0;
int humidityState = 0;

int reads = 0, sum = 0;

WebSocketsClient webSocket;

void setup() {
  Serial.begin(115200);
  pinMode(MOTOR_PIN, OUTPUT);
  digitalWrite(MOTOR_PIN, LOW);

  connectToNetwork();
}

void loop() {
  
  processAndSend(sum, reads);
}
