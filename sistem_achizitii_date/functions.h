#ifndef FUNCTIONS_H
#define FUNCTIONS_H

#include <WebSocketsClient.h>

void connectToNetwork();
void setupWebSocket();
void webSocketEvent(WStype_t type, uint8_t * payload, size_t length);
int takeSample();
void processAndSend(int &sum, int &reads, unsigned long now);
void sendHumidity(int humidity);

extern const int SENSOR_PIN;
extern const int MOTOR_PIN;

extern const int dryValue;
extern const int wetValue;

extern const char* serverUrl;
extern const char* wsUrl;

extern const char* ssid;
extern const char* password;

extern WebSocketsClient webSocket;

#endif
