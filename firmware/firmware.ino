#include <WiFi.h>
#include <WiFiMulti.h>
#include <WiFiClientSecure.h>
#include <Arduino_JSON.h>
#include <Preferences.h>
#include <ESP32Servo.h>
#include <Keypad.h>
#include <LiquidCrystal_I2C.h>

// Configuration
#define SSID_PRIMARY "Dubem's Phone"
#define PSWD_PRIMARY "password7"
#define SSID_SECONDARY "THATDUBEMGUY"
#define PSWD_SECONDARY "thatdubemguy."
// #define HOST "iot-door-lock-system.onrender.com"
#define HOST "dubemchukwu.pythonanywhere.com"
#define PORT 443
#define LED_PIN 2
#define HASH "6f9d9614b195f255e7bb3744b92f9486713d9b7eb92edba244bc0f11907ae7c5"
#define TRIG 16
#define ECHO 17
#define SERVO 23
#define R1 13
#define R2 12
#define R3 14
#define R4 27
#define C1 26
#define C2 25
#define C3 33
#define C4 32
#define ROWS 4
#define COLS 4
#define BUZZ 4

// Optimized polling intervals
#define STATE_CHECK_INTERVAL 500
#define LOCK_CHECK_INTERVAL 2000
#define PIN_CHECK_INTERVAL 10000
#define WIFI_CHECK_INTERVAL 10000

// Connection timeouts
#define HTTP_TIMEOUT 1500
#define WIFI_CONNECT_TIMEOUT 10000

// System state
struct {
  bool state = false;
  bool prevState = false;
  bool lock = false;
  bool prevLock = false;
  String pin = "2134";
  int LoadCtrl = 0;
  unsigned long LoadTime = millis();
  unsigned long CheckDelay = millis();
  bool CheckPassword = false;
  bool WatchingAPI = false;
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

// variables
char keys[ROWS][COLS] = {
  {'1', '2', '3', 'A'},
  {'4', '5', '6', 'B'},
  {'7', '8', '9', 'C'},
  {'*', '0', '#', 'D'},
};

byte RowPins[ROWS] = {R1, R2, R3, R4};
byte ColPins[COLS] = {C1, C2, C3, C4};
const int PIN_CURSOR_COL = 6;
String InputPin = "";
enum Page { WELCOME, HOME, RUNNING, RESPONSE};
Page currentPage = WELCOME;
enum WPage { once, other};
WPage StatPage = other;
unsigned long lastUpdate = 0;
int animFrame = 0;
long duration;
float distance;
float prev_dist;
unsigned long pastTime; 
int distance_, xDistance;
int AdjCol = 6;
int ScreenDelay = 5000;

// Global objects
Preferences prefs;
WiFiMulti wifiMulti;
Servo servo;
Keypad keypad = Keypad(makeKeymap(keys), RowPins, ColPins, ROWS, COLS);
LiquidCrystal_I2C lcd(0x27, 16, 2);

// Function declarations
void connectWifi();
bool isWifiConnected();
void blinkLed(uint16_t duration);
void updateLed();
bool apiGet(const char* endpoint, JSONVar& response);
void checkState();
void checkLock();
void checkPin();
void BackSpace();
void HomePage();
int getDist();
void WelcomePage();
void ErrorPage();
void SuccessPage();
void printCentered();
void HandleInput();
bool CheckPassword(String Password);
void PageTemplate(String FirstText, String SecondText);

void setup() {
  Serial.begin(115200);
  pinMode(LED_PIN, OUTPUT);
  pinMode(TRIG, OUTPUT);
  pinMode(ECHO, INPUT);
  pinMode(BUZZ, OUTPUT);
  lcd.init();
  lcd.clear();
  lcd.backlight();
  servo.setPeriodHertz(50);
  servo.attach(SERVO, 500, 2400);
  servo.write(0);

  digitalWrite(LED_PIN, LOW);
  // Load saved state
  prefs.begin("DLIS", false);
  sys.pin = prefs.getString("pin", "2134");
  sys.lock = prefs.getBool("lock", false);
  sys.prevLock = sys.lock;
  
  Serial.println("\n[INIT] Door Lock System v1.0");
  Serial.printf("[INIT] Lock: %s\n", sys.lock ? "LOCKED" : "UNLOCKED");
  PageTemplate("System","Starting up");
  
  connectWifi();
  sys.CheckDelay = millis();
}

void loop() {
  unsigned long now = millis();
  
  // Non blocking functions
  updateLed();
  
  // Check WiFi periodically
  if (now - tWifi >= WIFI_CHECK_INTERVAL) {
    tWifi = now;
    if (!isWifiConnected()) {
      connectWifi();
      switch(StatPage){
        case once:
          WifiPage();
          StatPage = other;
          Serial.println("[WIFI] Wifi - Not Connected");
          break;
        case other:
          break;
      }
      return;
    }else{
      StatPage = other;
    }
  }

  // Skip API calls if WiFi down
  if (wifiMulti.run() != WL_CONNECTED) return;
  
  // Stagger API calls for load distribution
  if (now - tLock >= LOCK_CHECK_INTERVAL) {
    tLock = now;
    checkLock();
  }else if (now - tState >= STATE_CHECK_INTERVAL) {
    tState = now;
    checkState();
  }else if (now - tPin >= PIN_CHECK_INTERVAL) {
    tPin = now;
    checkPin();
  }

  switch (currentPage) {
    case WELCOME:
      pastTime = millis();
      WelcomePage();
      if(millis() - sys.CheckDelay > 250){
        currentPage = HOME;
      }
      break;
      
    case HOME:
      HomePage();
      currentPage = RUNNING;
      InputPin = "";
      Serial.println("[MANUAL] Ready for PIN input");
      break;
      
    case RUNNING:
      if (Serial.available()) {
        String key = Serial.readString();
        InputPin = key;
        lcd.print("****"); // Show asterisk for security
        Serial.println(InputPin);

        sys.CheckDelay = millis();
        sys.CheckPassword = true;
        if(CheckPassword(key)){
          SuccessPage();
        }else{
          ErrorPage();
        }
        currentPage = HOME;
      }
      if(millis() - sys.CheckDelay > 1000){
        InputPin = "";
        sys.CheckDelay = millis();
      }
      break;
  }

  Serial.flush();
  yield();
}

void printCentered(String text, int row) {
  int pos = (16 - text.length()) / 2;
  lcd.setCursor(pos, row);
  lcd.print(text);
}

void WifiPage(){
  lcd.clear();
  lcd.noBlink();
  printCentered("Wifi Not", 0);
  printCentered("Connected", 1);
}

void PageTemplate(String FirstText = "", String SecondText = ""){
  lcd.clear();
  lcd.noBlink();
  printCentered(FirstText, 0);
  printCentered(SecondText, 1);
}

void HomePage(){
  InputPin = "";
  lcd.clear();
  lcd.noBlink();
  lcd.setCursor(1, 0);
  lcd.print("Input Your Pin");
  lcd.setCursor(AdjCol, 1);
  lcd.blink();
}

void SuccessPage(){
  tone(BUZZ, 500, int(3*ScreenDelay/4));
  noTone(BUZZ);
  lcd.clear();
  lcd.noBlink();
  lcd.setCursor(4, 0);
  lcd.print("Unlocked");
  lcd.setCursor(2, 1);
  lcd.print("SuccessFully");
  // HandleDoorLock();
  // delay(ScreenDelay);
  servo.write(180);
}

void ErrorPage(){
  lcd.clear();
  lcd.noBlink();
  lcd.setCursor(3, 0);
  lcd.print("Incorrect");
  lcd.setCursor(3, 1);
  lcd.print("Password!");
  // delay(ScreenDelay);
}

void slideText(String text, int row, int finalPos, int delayMs = 50) {
  int startPos = 16;
  for (int pos = startPos; pos >= finalPos; pos--) {
    lcd.setCursor(0, row);
    lcd.print("                "); // Clear row
    lcd.setCursor(pos, row);
    lcd.print(text);
    delay(delayMs);
  }
}

void WelcomePage(){
  lcd.clear();
  lcd.noCursor();
  lcd.noBlink();
  printCentered("Welcome", 0);
}

int getDist(){
  digitalWrite(TRIG, LOW);
  delayMicroseconds(2);

  digitalWrite(TRIG, HIGH);
  delayMicroseconds(10);
  digitalWrite(TRIG, LOW);

  duration = pulseIn(ECHO, HIGH);

  distance = (duration * 0.0343)/2;

  distance = (distance * 0.7) + (prev_dist * 0.3);
  prev_dist = distance;
  return distance;
}

void HandleInput(char key){
  String _key_ = String(key);
  lcd.setCursor(AdjCol, 1);
  lcd.print("-");
  AdjCol++;
}

void BackSpace(){
  lcd.noBlink();
  int Amt = AdjCol - 7;
  String TempStr = InputPin;
  String Spacer;
  InputPin = "";
  for(int i=0; i<Amt; i++){
    InputPin += TempStr[i];
  }
  lcd.setCursor(6, 1);
  for(int a=0; a<=Amt; a++){
      Spacer += " ";
  }
  lcd.print(Spacer);
  lcd.setCursor(6, 1);
  lcd.print(InputPin);
  if (AdjCol > 6){
    AdjCol --;
  };
  lcd.blink();
}

bool CheckPassword(String Password){
  lcd.noBlink();
  if(Password.length() == 4){
    showLoading();
    if(Password == sys.pin){
      return true;
    }else{
      return false;
    }
  }else{
    return false;
  }
}

void showLoading() {
  lcd.clear();
  lcd.noBlink();
  printCentered("Processing", 0);
  
  char loadChars[] = {'|', '/', '-', '\\'};
  // something has to count to 11
  {
    if(millis() - sys.LoadTime >= 150){
      if(sys.LoadCtrl >= 11){
        sys.LoadCtrl = 0;
        return;
      }
      lcd.setCursor(7, 1);
      lcd.print(loadChars[sys.LoadCtrl % 4]);
      sys.LoadCtrl++;
      sys.LoadTime = millis();
    }
  }
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
    StatPage = once;
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
    if(!sys.WatchingAPI){
      Serial.printf("✓ Connecting to %s:%d\n", HOST, PORT);
      sys.WatchingAPI = !sys.WatchingAPI;
    }
    delete client;
    return false;
  }

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
  
  if (statusCode != 200){
    Serial.printf("[HTTPS] ❌ Status: %d\n", statusCode);
    return false;
  }
  payload = JSON.parse(json);
  sys.WatchingAPI = !sys.WatchingAPI;
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