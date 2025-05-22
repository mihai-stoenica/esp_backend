#include <WiFi.h>
#include <HTTPClient.h>

#define SENSOR_PIN 34     
#define MOTOR_PIN 33

const char* ssid = "DIGI_c19b09";
const char* password = "6db1c892";
const char* serverUrl = "https://espbackend-production.up.railway.app/api/humidity"; // Replace with your actual URL

const int dryValue = 3500;
const int wetValue = 800;


void setup() {
  Serial.begin(115200);
  pinMode(MOTOR_PIN, OUTPUT);
  digitalWrite(MOTOR_PIN, LOW);

  WiFi.begin(ssid, password);
  Serial.print("Connecting to WiFi");
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("\nConnected!");
}

void loop() {
  float sum = 0;
  int reads = 0;

  while(reads <3) {

    int rawValue = analogRead(SENSOR_PIN);
    Serial.print("Raw ADC Value: ");
    Serial.print(rawValue);
    int humidityPercent = map(rawValue, dryValue, wetValue, 0, 100);
    humidityPercent = constrain(humidityPercent, 0, 100);

    sum += humidityPercent;
    reads++;
    
    delay(600000);
  }


  int avgHumidityPercent = sum/reads;
  Serial.printf("Humidity: %d%%\n", avgHumidityPercent);

  if (avgHumidityPercent < 40) {
    Serial.println("Humidity low! Turning motor ON");
    digitalWrite(MOTOR_PIN, HIGH);
    delay(50);
    digitalWrite(MOTOR_PIN, LOW);
    Serial.println("Motor OFF");
  }

  // Send data to server
  if (WiFi.status() == WL_CONNECTED) {
    HTTPClient http;
    http.begin(serverUrl);
    http.addHeader("Content-Type", "application/json");

    String payload = "{\"humidity\": " + String(avgHumidityPercent) + "}";
    int httpResponseCode = http.POST(payload);

    Serial.printf("Server response: %d\n", httpResponseCode);
    http.end();
  } else {
    Serial.println("WiFi not connected!");
  }
}
