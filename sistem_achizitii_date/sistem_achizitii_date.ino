#include "functions.h"

const char* ssid = "DIGI_c19b09";
const char* password = "6db1c892";

const char* serverUrl = "https://espbackend-production.up.railway.app/api/humidity"; 
const char* wsUrl = "espbackend-production.up.railway.app";

const int dryValue = 3500;
const int wetValue = 800;

const int SENSOR_PIN = 34;     
const int MOTOR_PIN = 33;


int reads = 0, sum = 0;

WebSocketsClient webSocket;

void setup() {
  pinMode(MOTOR_PIN, OUTPUT);
  digitalWrite(MOTOR_PIN, LOW);
  Serial.begin(115200);
  connectToNetwork();
  setupWebSocket();
}

//live humidity
unsigned long lastSendTime = 0;
const unsigned long sendInterval = 5000;
int lastSentHumidity = 0;

void loop() {
  webSocket.loop();
  unsigned long now = millis();

  //processAndSend(sum, reads, now);

  if (now - lastSendTime >= sendInterval) {
    int currentHumidity = takeSample();
    if(currentHumidity != lastSentHumidity) {
      lastSendTime = now;
      sendHumidity(currentHumidity);
      lastSentHumidity = currentHumidity;
    }
    
  }
}
