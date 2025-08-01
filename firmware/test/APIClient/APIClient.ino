#include <WiFi.h>
#include <HTTPClient.h>
#include <Arduino_JSON.h>

//  Macro
#define SSID "THATDUBEMGUY"
#define PSWD "thatdubemguy"
#define API "https://iot-door-lock-system.onrender.com/"
#define LedPin 2

// Global Variables
// Reminder: Store all state in perf especially pin
struct DataState {
  bool PastState;
  bool PastLock;
  int FailRate;
  const String hash = "6f9d9614b195f255e7bb3744b92f9486713d9b7eb92edba244bc0f11907ae7c5";
  String pin;
  bool Lock = true;
};

enum Mode {
  STATE,
  LOCK,
  PIN,
  DFLT
};

Mode mode;
DataState datastate;

HTTPClient HttpState;
HTTPClient HttpLock;
HTTPClient HttpPin;

void ConnectToWifi(){
  Serial.print("[WIFI] Connecting to ");
  Serial.printf("%s ", SSID);
  WiFi.setHostname("D.L.I.S");
  WiFi.begin(SSID, PSWD);
  uint16_t PastTime = millis();

  while(WiFi.status() != WL_CONNECTED){
    delay(550);
    Serial.print(".");
    uint16_t CurrentTime = millis() - PastTime;
    if(CurrentTime >= 30000){
      break;
    }
  }
  Serial.println("");
}

void ReconnectToWifi(int no = 10){
  for (int i=0; i<=no; i++){
    ConnectToWifi();
    delay(2500);
    if(WiFi.status() == WL_CONNECTED){
      Serial.print("[WIFI] Connected to ");
      Serial.print(SSID);
      Serial.println(" Successfully!!");
      break;
    }
  }
}

void EstablishHttp(Mode _mode_ = DFLT){
  Serial.println("[HTTP] Making http request to the api");
  switch (_mode_){
    case STATE:
        HttpState.begin((String)API + "DLIS/state");
        break;
    case LOCK:
        HttpLock.begin((String)API + "DLIS/lock");
        break;
    case PIN:
        HttpPin.begin((String)API + "DLIS/pin?key=" + datastate.hash);
        break;
    default:
        HttpState.begin((String)API + "DLIS/state");
        HttpLock.begin((String)API + "DLIS/lock");
        HttpPin.begin((String)API + "DLIS/pin?key=" + datastate.hash);
        break;
  }
}

void LedSequence(int _delay_ = 250, int n = 10){
  for(int i=0; i<=n; i++){
  digitalWrite(LedPin, HIGH);
  delay(_delay_);
  digitalWrite(LedPin, LOW);
  delay(_delay_);
  }
}


void HandleGetRequest(Mode _mode_){
  int StatusCode;

  switch (_mode_){
    case STATE:
        StatusCode = HttpState.GET();
        
        if (StatusCode == HTTP_CODE_OK){
        // String content = http.getString();
          JSONVar data = JSON.parse(HttpState.getString());
          if(data.hasOwnProperty("state")){
            if(datastate.PastState != (bool)data["state"]){
              Serial.print("[BODY] state: "); Serial.println((bool) data["state"]);
              if((bool)data["state"] == true){
                LedSequence();
              }
              datastate.PastState = (bool)data["state"];
              Serial.print("[BODY] ");
              Serial.println(data);
            }
          }      
        }else{
          if(datastate.FailRate >= 10){
            ReconnectToWifi();
          }
          EstablishHttp();
          datastate.FailRate++;
        }
        break;
    case LOCK:
        StatusCode = HttpLock.GET();
        
        if (StatusCode == HTTP_CODE_OK){
        // String content = http.getString();
          JSONVar data = JSON.parse(HttpLock.getString());
          if(data.hasOwnProperty("lock")){
            if(datastate.PastLock != (bool)data["lock"]){
              Serial.print("[BODY] Lock: "); Serial.println((bool) data["lock"]);
              if((bool)data["lock"] == false){
                LedSequence(1000, 3);
                Serial.println("Doing Something Here!!");
              }
              datastate.Lock = (bool)data["lock"];
              datastate.PastLock = (bool)data["lock"];
              Serial.print("[BODY] ");
              Serial.println(data);
            };
          };    
        }else{
          if(datastate.FailRate >= 10){
            ReconnectToWifi();
          };
          EstablishHttp();
          datastate.FailRate++;
        }
        break;
    case PIN:
        StatusCode = HttpPin.GET();

        if (StatusCode == HTTP_CODE_OK){
        // String content = http.getString();
          JSONVar data = JSON.parse(HttpPin.getString());
          if(data.hasOwnProperty("pin")){
            if(String(data["pin"]).length() == 4){
              if(datastate.pin != (String)data["pin"]){
                Serial.print("[BODY] Pin changed successfully");
                LedSequence(100, 20);
                datastate.pin = (String)data["pin"];
                Serial.print("[BODY] ");
                Serial.println((String)data["pin"]);
              }
            }
          }      
        }else{
          if(datastate.FailRate >= 10){
            ReconnectToWifi();
          }
          EstablishHttp();
          datastate.FailRate++;
        }
        break;
  }
}

void setup() {
  Serial.begin(115200);
  pinMode(2, OUTPUT);
  while (!Serial) {
    delay(100);
  }
  ReconnectToWifi();
  EstablishHttp();
}

void loop() {
  if(WiFi.status() != WL_CONNECTED){
    ReconnectToWifi();
    EstablishHttp();
  }else{
    HandleGetRequest(STATE);
    HandleGetRequest(LOCK);
    HandleGetRequest(PIN);
    // http.end();
    // delay(1);
  }
}
