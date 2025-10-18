#include <WiFi.h>
#include <HTTPClient.h>
#include <Arduino_JSON.h>
#include <Preferences.h>

// Configuration
#define SSID "THATDUBEMGUY"
#define PSWD "thatdubemguy."
#define API_BASE "https://iot-door-lock-system.onrender.com/DLIS/"
#define LED_PIN 2
#define HASH "6f9d9614b195f255e7bb3744b92f9486713d9b7eb92edba244bc0f11907ae7c5"

// Polling intervals (in milliseconds)
#define STATE_CHECK_INTERVAL 500
#define LOCK_CHECK_INTERVAL 2000
#define PIN_CHECK_INTERVAL 5000
#define WIFI_CHECK_INTERVAL 5000

// WiFi reconnection settings
#define WIFI_CONNECT_TIMEOUT 5000
#define MAX_WIFI_RETRIES 3

Preferences prefs;
HTTPClient http;  // Single HTTP client instance

// State management
struct SystemState {
  bool currentState = false;
  bool previousState = false;
  bool currentLock = true;
  bool previousLock = true;
  String pin = "2134";
  uint8_t consecutiveFailures = 0;
} state;

// Timing variables
unsigned long lastStateCheck = 0;
unsigned long lastLockCheck = 0;
unsigned long lastPinCheck = 0;
unsigned long lastWifiCheck = 0;

// Non-blocking LED state
struct LEDController {
  bool active = false;
  unsigned long startTime = 0;
  unsigned long interval = 0;
  uint8_t blinkCount = 0;
  uint8_t currentBlink = 0;
  bool ledState = false;
} ledCtrl;

// Function declarations
void connectToWifi();
bool checkWifiConnection();
void startLedSequence(uint16_t interval, uint8_t count);
// void updateLedSequence();
void updateLedSequence_();
bool makeApiRequest(const char* endpoint, JSONVar& response);
void handleStateUpdate();
void handleLockUpdate();
void handlePinUpdate();

void setup() {
  Serial.begin(115200);
  pinMode(LED_PIN, OUTPUT);
  
  // Initialize preferences
  prefs.begin("DLIS", false);
  state.pin = prefs.getString("pin", "2134");
  state.currentLock = prefs.getBool("lock", true);
  state.previousLock = state.currentLock;
  
  Serial.println("\n[SYSTEM] Door Lock IoT System Starting...");
  Serial.printf("[CONFIG] PIN: SECURED, Lock: %s\n", 
                state.currentLock ? "LOCKED" : "UNLOCKED");
  
  // Connect to WiFi
  connectToWifi();
}

void loop() {
  unsigned long currentMillis = millis();
  
  updateLedSequence();
  
  if (currentMillis - lastWifiCheck >= WIFI_CHECK_INTERVAL) {
    lastWifiCheck = currentMillis;
    if (!checkWifiConnection()) {
      connectToWifi();
      return;
    }
  }
  

  if (WiFi.status() != WL_CONNECTED) {
    return;
  }
  
  // Check state endpoint
  if (currentMillis - lastStateCheck >= STATE_CHECK_INTERVAL) {
    lastStateCheck = currentMillis;
    handleStateUpdate();
  }
  
  // Check lock endpoint
  if (currentMillis - lastLockCheck >= LOCK_CHECK_INTERVAL) {
    lastLockCheck = currentMillis;
    JSONVar data;
    handleLockUpdate();
    Serial.print("Google: ");
    Serial.println(makeApiRequest("https://www.google.com/",data));
  }
  
  // Check pin endpoint
  if (currentMillis - lastPinCheck >= PIN_CHECK_INTERVAL) {
    lastPinCheck = currentMillis;
    handlePinUpdate();
  }
  
  yield();
}

void connectToWifi() {
  if (WiFi.status() == WL_CONNECTED) {
    return;
  }
  
  Serial.printf("[WIFI] Connecting to %s", SSID);
  WiFi.setHostname("D.L.I.S");
  WiFi.begin(SSID, PSWD);
  
  unsigned long startTime = millis();
  
  while (WiFi.status() != WL_CONNECTED) {
    if (millis() - startTime >= WIFI_CONNECT_TIMEOUT) {
      Serial.println("\n[WIFI] Connection timeout!");
      return;
    }
    delay(500);
    Serial.print(".");
  }
  
  Serial.print("\n[WIFI] Connected successfully to ");
  Serial.println(SSID);
  Serial.printf("[WIFI] IP Address: %s\n", WiFi.localIP().toString().c_str());
  Serial.printf("[WIFI] Signal Strength: %d dBm\n", WiFi.RSSI());
  
  state.consecutiveFailures = 0;
}

bool checkWifiConnection() {
  if (WiFi.status() == WL_CONNECTED) {
    return true;
  }
  
  Serial.println("[WIFI] Connection lost!");
  return false;
}

void startLedSequence(uint16_t interval, uint8_t count) {
  ledCtrl.active = true;
  ledCtrl.startTime = millis();
  ledCtrl.interval = interval;
  ledCtrl.blinkCount = count;
  ledCtrl.currentBlink = 0;
  ledCtrl.ledState = false;
  digitalWrite(LED_PIN, LOW);
}

void updateLedSequence_(){
  if(millis() - ledCtrl.startTime > ledCtrl.interval){
    digitalWrite(LED_PIN, ledCtrl.active ? HIGH : LOW);
  }
}

// void updateLedSequence() {
//   if (!ledCtrl.active) {
//     return;
//   }
  
//   unsigned long elapsed = millis() - ledCtrl.startTime;
//   unsigned long cycleTime = ledCtrl.interval * 2;
  
//   if (ledCtrl.currentBlink >= ledCtrl.blinkCount) {
//     // Sequence complete
//     ledCtrl.active = false;
//     digitalWrite(LED_PIN, LOW);
//     return;
//   }
  
//   // Toggle LED state
//   bool newState = (elapsed % cycleTime) < ledCtrl.interval;
//   if (newState != ledCtrl.ledState) {
//     ledCtrl.ledState = newState;
//     digitalWrite(LED_PIN, newState ? HIGH : LOW);
    
//     // Count blinks on falling edge
//     if (!newState) {
//       ledCtrl.currentBlink++;
//     }
//   }
// }

bool makeApiRequest(const char* endpoint, JSONVar& response) {
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("[HTTP] WiFi not connected!");
    return false;
  }
  
  String url = String(API_BASE) + endpoint;
  
  http.begin(url);
  // http.setTimeout(5000); // 5 second timeout
  
  int statusCode = http.GET();
  
  if (statusCode == HTTP_CODE_OK) {
    String payload = http.getString();
    response = JSON.parse(payload);
    http.end();
    
    // Reset failure counter on success
    state.consecutiveFailures = 0;
    
    if (JSON.typeof(response) == "undefined") {
      Serial.println("[HTTP] JSON parse error!");
      return false;
    }
    
    return true;
  } else {
    if((String)endpoint == "pin?key=6f9d9614b195f255e7bb3744b92f9486713d9b7eb92edba244bc0f11907ae7c5"){
      Serial.printf("[HTTP] Request failed: pin (Code: %d)\n", statusCode);
    }else{
      Serial.printf("[HTTP] Request failed: %s (Code: %d)\n", endpoint, statusCode);
    }
    state.consecutiveFailures++;
    http.end();
    
    // Exponential backoff on repeated failures
    if (state.consecutiveFailures >= 3) {
      Serial.println("[HTTP] Multiple failures detected, increasing check interval...");
      delay(1000); // Brief pause before next attempt
    }
    
    return false;
  }
}

void handleStateUpdate() {
  JSONVar data;
  
  if (makeApiRequest("state", data)) {
    if (data.hasOwnProperty("state")) {
      state.currentState = (bool)data["state"];
      
      if (state.currentState != state.previousState) {
        Serial.printf("[STATE] Changed: %s\n", 
                     state.currentState ? "ACTIVE" : "INACTIVE");
        
        if (state.currentState) {
          startLedSequence(250, 10);
          Serial.printf("[STATE] Data: %s\n", JSON.stringify(data).c_str());
        }
        
        state.previousState = state.currentState;
      }
    }
  }
}

void handleLockUpdate() {
  JSONVar data;
  
  if (makeApiRequest("lock", data)) {
    if (data.hasOwnProperty("lock")) {
      state.currentLock = (bool)data["lock"];
      
      if (state.currentLock != state.previousLock) {
        Serial.printf("[LOCK] Changed: %s\n", 
                     state.currentLock ? "LOCKED" : "UNLOCKED");
        
        if (!state.currentLock) {
          startLedSequence(100, 3);
          Serial.println("[LOCK] Door unlocked - performing action!");
          // Add your door unlock logic here
        }
        
        state.previousLock = state.currentLock;
        prefs.putBool("lock", state.currentLock);
        
        Serial.printf("[LOCK] Data: %s\n", JSON.stringify(data).c_str());
      }
    }
  }
}

void handlePinUpdate() {
  JSONVar data;
  String endpoint = String("pin?key=") + HASH;
  
  if (makeApiRequest(endpoint.c_str(), data)) {
    if (data.hasOwnProperty("pin")) {
      String newPin = String((const char*)data["pin"]);
      
      // Validate PIN length
      if (newPin.length() == 4) {
        if (newPin != state.pin) {
          Serial.println("[PIN] PIN changed successfully!");
          startLedSequence(100, 20);
          
          state.pin = newPin;
          prefs.putString("pin", newPin);
          
          Serial.printf("[PIN] New PIN: %s\n", newPin.c_str());
        }
      } else {
        Serial.printf("[PIN] Invalid PIN length: %d (expected 4)\n", newPin.length());
      }
    }
  }
}