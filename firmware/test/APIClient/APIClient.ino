#include <WiFi.h>
#include <WiFiMulti.h>
#include <WiFiClientSecure.h>
#include <Arduino_JSON.h>
#include <Preferences.h>

// Configuration
#define SSID_PRIMARY "Dubem's Phone"
#define PSWD_PRIMARY "password7"
#define SSID_SECONDARY "THATDUBEMGUY"
#define PSWD_SECONDARY "thatdubemguy."
#define HOST "iot-door-lock-system.onrender.com"
#define PORT 443
#define LED_PIN 2
#define HASH "6f9d9614b195f255e7bb3744b92f9486713d9b7eb92edba244bc0f11907ae7c5"

// Optimized polling intervals
#define STATE_CHECK_INTERVAL 500
#define LOCK_CHECK_INTERVAL 2000
#define PIN_CHECK_INTERVAL 10000
#define WIFI_CHECK_INTERVAL 10000

// Connection timeouts
#define HTTP_TIMEOUT 3000
#define WIFI_CONNECT_TIMEOUT 8000

// Global objects
Preferences prefs;
WiFiMulti wifiMulti;

// System state
struct {
  bool state = false;
  bool prevState = false;
  bool lock = false;
  bool prevLock = false;
  String pin = "2134";
} sys;

// Timing
unsigned long tState = 0;
unsigned long tLock = 0;
unsigned long tPin = 0;
unsigned long tWifi = 0;

// LED controller
struct {
  bool active = false;
  unsigned long start = 0;
  uint16_t interval = 0;
} led;

// Function declarations
void connectWifi();
bool isWifiConnected();
void blinkLed(uint16_t duration);
void updateLed();
bool apiGet(const char* endpoint, JSONVar& response);
void checkState();
void checkLock();
void checkPin();

void setup() {
  Serial.begin(115200);
  pinMode(LED_PIN, OUTPUT);
  digitalWrite(LED_PIN, LOW);
  
  // Load saved state
  prefs.begin("DLIS", false);
  sys.pin = prefs.getString("pin", "2134");
  sys.lock = prefs.getBool("lock", false);
  sys.prevLock = sys.lock;
  
  Serial.println("\n[INIT] Door Lock System v2.0");
  Serial.printf("[INIT] Lock: %s\n", sys.lock ? "LOCKED" : "UNLOCKED");
  
  connectWifi();
}

void loop() {
  unsigned long now = millis();
  
  // Update LED (non-blocking)
  updateLed();
  
  // Check WiFi periodically
  if (now - tWifi >= WIFI_CHECK_INTERVAL) {
    tWifi = now;
    if (!isWifiConnected()) {
      connectWifi();
      return;
    }
  }
  
  // Skip API calls if WiFi down
  if (wifiMulti.run() != WL_CONNECTED) return;
  
  // Stagger API calls for load distribution
  if (now - tLock >= LOCK_CHECK_INTERVAL) {
    tLock = now;
    checkLock();
  }
  
  if (now - tState >= STATE_CHECK_INTERVAL) {
    tState = now;
    checkState();
  }

  if (now - tPin >= PIN_CHECK_INTERVAL) {
    tPin = now;
    checkPin();
  }

  yield();
}

void connectWifi() {
  if (wifiMulti.run() == WL_CONNECTED) return;
  
  Serial.print("[WIFI] Connecting");
  WiFi.setHostname("DLIS");
  wifiMulti.addAP(SSID_PRIMARY, PSWD_PRIMARY);
  wifiMulti.addAP(SSID_SECONDARY, PSWD_SECONDARY);
  
  unsigned long start = millis();
  while (wifiMulti.run() != WL_CONNECTED) {
    if (millis() - start >= WIFI_CONNECT_TIMEOUT) {
      Serial.println("\n[WIFI] Timeout!");
      return;
    }
    delay(500);
    Serial.print(".");
  }
  
  Serial.printf("\n[WIFI] Connected: %s\n", WiFi.SSID().c_str());
  Serial.printf("[WIFI] IP: %s | RSSI: %d dBm\n", 
                WiFi.localIP().toString().c_str(), WiFi.RSSI());
}

bool isWifiConnected() {
  if (wifiMulti.run() == WL_CONNECTED) return true;
  Serial.println("[WIFI] Disconnected!");
  return false;
}

void blinkLed(uint16_t duration) {
  led.active = true;
  led.start = millis();
  led.interval = duration;
  digitalWrite(LED_PIN, HIGH);
}

void updateLed() {
  if (led.active && (millis() - led.start >= led.interval)) {
    led.active = false;
    digitalWrite(LED_PIN, LOW);
  }
}

bool apiGet(const char* endpoint, JSONVar& payload) {
  if (wifiMulti.run() != WL_CONNECTED) return false;

  WiFiClientSecure *client = new WiFiClientSecure;
  if (!client) return false;
  
  client->setInsecure();
  
  // Connect with timeout
  if (!client->connect(HOST, PORT)) {
    delete client;
    return false;
  }

  Serial.printf("✓ Connecting to %s:%d\n", HOST, PORT);

  // Build request
  String req = String("GET ") + endpoint + " HTTP/1.1\r\n" +
               "Host: " + HOST + "\r\n" +
               "User-Agent: ESP32\r\n";
  
  if (strcmp(endpoint, "/DLIS/pin") == 0) {
    req += "key: " + String(HASH) + "\r\n";
  }
  
  req += "Connection: close\r\n\r\n";
  client->print(req);

  // Wait for response
  unsigned long timeout = millis();
  while (!client->available()) {
    if (millis() - timeout > HTTP_TIMEOUT) {
      client->stop();
      delete client;
      return false;
    }
    yield();
  }

  // Serial.println("[HTTPS] Reading response:");
  // Parse response
  String body = "";
  bool inBody = false;
  int statusCode = 0;
  
  while (client->available()) {
    String line = client->readStringUntil('\n');
    
    if (statusCode == 0 && line.startsWith("HTTP/")) {
      statusCode = line.substring(9, 12).toInt();
    }
    
    if (line == "\r" || line.isEmpty()) {
      inBody = true;
      continue;
    }
    
    if (inBody) body += line;
  }

  int jsonStart = body.indexOf('{');          
  int jsonEnd = body.lastIndexOf('}');
  String json;

  if (jsonStart != -1 && jsonEnd != -1) {
  json = body.substring(jsonStart, jsonEnd + 1);
  // Serial.println(json);
  } else {
    Serial.println("JSON not found in response");
  }

  client->stop();
  delete client;
  
  if (statusCode != 200) return false;
  Serial.printf("[HTTPS] Status: %d\n", statusCode);
  payload = JSON.parse(json);
  return JSON.typeof(payload) != "undefined";
}

void checkState() {
  JSONVar data;
  
  if (!apiGet("/DLIS/state", data)) return;
  
  if (data.hasOwnProperty("state")) {
    sys.state = (bool)data["state"];
    
    if (sys.state != sys.prevState) {
      Serial.printf("[STATE] %s\n", sys.state ? "ACTIVE" : "INACTIVE");
      
      if (sys.state) {
        blinkLed(500);
      }else{
        blinkLed(100);
      }
      
      sys.prevState = sys.state;
    }
  }
}

void checkLock() {
  JSONVar data;
  
  if (!apiGet("/DLIS/lock", data)) return;
  
  if (data.hasOwnProperty("lock")) {
    sys.lock = (bool)data["lock"];
    
    if (sys.lock != sys.prevLock) {
      Serial.printf("[LOCK] %s\n", sys.lock ? "LOCKED" : "UNLOCKED");
      
      if (sys.lock) {
        blinkLed(300);
      }
      
      sys.prevLock = sys.lock;
      prefs.putBool("lock", sys.lock);
    }
  }
}

void checkPin() {
  JSONVar data;
  
  if (!apiGet("/DLIS/pin", data)) return;
  
  if (data.hasOwnProperty("pin")) {
    String newPin = String((const char*)data["pin"]);
    
    if (newPin.length() == 4 && newPin != sys.pin) {
      Serial.printf("[PIN] Updated: %s\n", newPin.c_str());

      blinkLed(2000);
      
      sys.pin = newPin;
      prefs.putString("pin", newPin);
    }
  }
}