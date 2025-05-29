#include <WiFi.h>
#include <WebSocketsClient.h>
#include <Arduino.h>
#include <ArduinoJson.h>
#include <HTTPClient.h>
#include "functions.h"


float sampleSum = 0;
int sampleCount = 0;

bool motorWasOn = false;

unsigned long lastSampleTime = 0;

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
    case WStype_DISCONNECTED:
      Serial.println("WebSocket Disconnected");
      break;

    case WStype_CONNECTED:
      Serial.println("WebSocket Connected");
      webSocket.sendTXT("{\"event\":\"register\", \"client\":\"esp32\"}"); //this
      break;

    case WStype_TEXT: {
      Serial.printf("Received: %s\n", payload);

      DynamicJsonDocument doc(256);
      DeserializationError error = deserializeJson(doc, payload);
      if (error) {
        Serial.print("deserializeJson() failed: ");
        Serial.println(error.c_str());
        return;
      }

      const char* event = doc["event"];
      
      if (strcmp(event, "motor") == 0) {
        int duration = doc["seconds"] | 0; 
        Serial.printf("Motor event received! Duration: %d ms\n", duration);
        digitalWrite(MOTOR_PIN, HIGH);
        delay(duration * 1000);
        digitalWrite(MOTOR_PIN, LOW);
        Serial.println("Motor OFF");
      }

      break;
    }
      

    default:
      break;
  }
}

void setupWebSocket() {
  webSocket.beginSSL("espbackend-production.up.railway.app", 443, "/api/ws");
  webSocket.onEvent(webSocketEvent);
  webSocket.setReconnectInterval(5000);
  webSocket.enableHeartbeat(15000, 3000, 2);
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

void processAndSend(int &sum, int &reads, unsigned long now) {
  // Sample every 10 minutes (600000 ms)
  if (reads < 3 && now - lastSampleTime >= 600000) {
    lastSampleTime = now;
    int sample = takeSample();
    sum += sample;
    reads++;
    Serial.printf("Sample %d taken: %d\n", reads, sample);
  }

  // Once we have 3 samples, calculate average and send
  if (reads == 3) {
    int avgHumidity = sum / 3;
    Serial.printf("Average Humidity: %d%%\n", avgHumidity);

    sum = 0;
    reads = 0;

    // Activate motor if humidity too low
    if (avgHumidity < 40 && !motorWasOn) {
      motorWasOn = true;
      Serial.println("Humidity low! Turning motor ON");
      digitalWrite(MOTOR_PIN, HIGH);
      delay(100); // 100 ms motor activation
      digitalWrite(MOTOR_PIN, LOW);
      Serial.println("Motor OFF");
    } else if(avgHumidity > 45) {
      motorWasOn = false;
    }

    // Send to server
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

}


void sendHumidity(int humidity) {
  DynamicJsonDocument doc(128);
  doc["event"] = "humidity";
  doc["value"] = humidity;

  String message;
  serializeJson(doc, message);
  Serial.println(message);
  webSocket.sendTXT(message);
}
