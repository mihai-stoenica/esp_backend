#include <Arduino.h>
#include <ArduinoJson.h>
#include <WiFi.h>
#include <WebSocketsClient.h>
#include <HTTPClient.h>
#include "functions.h"

float sampleSum = 0;
int sampleCount = 0;

unsigned long lastSent = 0;

void connectToNetwork() {
  
  WiFi.begin(ssid, password);
  Serial.print("Connecting to WiFi");
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("\nConnected!");
}

void webSocketEvent(WStype_t type, uint8_t * payload, size_t length) {
  switch(type) {
    case WStype_CONNECTED:
      Serial.println("WebSocket Connected");
      webSocket.sendTXT("{\"event\":\"register\",\"client\":\"esp32\"}");
      break;
    case WStype_TEXT:
      Serial.printf("Received: %s\n", payload);
      DynamicJsonDocument doc(256);
      deserializeJson(doc, payload);
      if (doc["event"] == "motor") {
        int seconds = doc["seconds"];
        Serial.printf("Motor ON for %d seconds\n", seconds);
        digitalWrite(MOTOR_PIN, HIGH);
        delay(seconds * 1000);
        digitalWrite(MOTOR_PIN, LOW);
      }
      break;
  }
}


int takeSample() {
  int rawValue = analogRead(SENSOR_PIN);
  Serial.print("Raw ADC Value: ");
  Serial.print(rawValue);
  int humidity = map(rawValue, dryValue, wetValue, 0, 100);
  humidity = constrain(humidity, 0, 100);
  
  Serial.printf("Sample : %d%%\n",  humidity);

  return humidity;
}

void processAndSend(int &sum, int &reads) {
  while (reads < 3) {
    unsigned long now = millis();
    if (now - lastSent > 600000) {  // 10 minutes
      lastSent = now;
      int sample = takeSample();
      sum += sample;
      reads++;
    } else {
      return;  
    }
  }

  int avgHumidity = sum / reads;
  Serial.printf("Humidity: %d%%\n", avgHumidity);

  sum = 0;
  reads = 0;

  if (avgHumidity < 40) {
    Serial.println("Humidity low! Turning motor ON");
    digitalWrite(MOTOR_PIN, HIGH);
    delay(100);
    digitalWrite(MOTOR_PIN, LOW);
    Serial.println("Motor OFF");
  }

  if (WiFi.status() == WL_CONNECTED) {
    HTTPClient http;
    http.begin(serverUrl);
    http.addHeader("Content-Type", "application/json");

    String payload = "{\"humidity\": " + String(avgHumidity) + "}";
    int httpResponseCode = http.POST(payload);

    Serial.printf("Server response: %d\n", httpResponseCode);
    http.end();
  } else {
    Serial.println("WiFi not connected!");
  }
}

