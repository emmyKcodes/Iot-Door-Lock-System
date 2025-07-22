#define BLYNK_TEMPLATE_ID "Your_Template_ID"
#define BLYNK_TEMPLATE_NAME "Door Unlock"
#define BLYNK_AUTH_TOKEN "Your_Auth_Token"

#define BLYNK_PRINT Serial

#include <WiFi.h>
#include <WiFiClient.h>
#include <BlynkSimpleEsp32.h>
#include <Keypad.h>
#include <ESP32Servo.h>  // ✅ USE THIS LIBRARY for ESP32

// WiFi credentials
char ssid[] = "Your_SSID";      // Replace with your WiFi Name
char pass[] = "Your_PASSWORD";          // Replace with your WiFi Password

// Pins
#define SERVO_PIN 25
#define BUZZER_PIN 26

Servo myservo;

// Keypad setup
const byte ROWS = 4;
const byte COLS = 4;

char keys[ROWS][COLS] = {
  {'1','2','3','A'},
  {'4','5','6','B'},
  {'7','8','9','C'},
  {'*','0','#','D'}
};

byte rowPins[ROWS] = {18, 19, 21, 22};
byte colPins[COLS] = {13, 12, 14, 27};

Keypad keypad = Keypad(makeKeymap(keys), rowPins, colPins, ROWS, COLS);

// Password logic
String password = "1234";
String input = "";

void setup() {
  Serial.begin(115200);
  Blynk.begin(BLYNK_AUTH_TOKEN, ssid, pass);

  pinMode(BUZZER_PIN, OUTPUT);
  myservo.setPeriodHertz(50); // 50 Hz for servo
  myservo.attach(SERVO_PIN);
  myservo.write(0); // Locked position
  Serial.println("System Ready");
}

void loop() {
  Blynk.run();

  char key = keypad.getKey();
  if (key) {
    Serial.print(key);

    if (key == '#') {
      checkPassword();
      input = "";
    } else if (key == '*') {
      input = "";
      Serial.println("\nInput Cleared");
    } else {
      input += key;
    }
  }
}

void smoothMove(int startAngle, int endAngle, int stepDelay = 10) {
  if (startAngle < endAngle) {
    for (int pos = startAngle; pos <= endAngle; pos++) {
      myservo.write(pos);
      delay(stepDelay);
    }
  } else {
    for (int pos = startAngle; pos >= endAngle; pos--) {
      myservo.write(pos);
      delay(stepDelay);
    }
  }
}

void checkPassword() {
  if (input == password) {
    Serial.println("\n✅ Access Granted!");
    smoothMove(0, 90);  // Smooth unlock
    Blynk.logEvent("door_unlocked", "Door unlocked via correct password");
    delay(5000);
    smoothMove(90, 0);  // Smooth lock
  } else {
    Serial.println("\n❌ Wrong Password!");
    digitalWrite(BUZZER_PIN, HIGH);
    delay(1000);
    digitalWrite(BUZZER_PIN, LOW);
    Blynk.logEvent("wrong_attempt", "Wrong password entered!");
  }
}
