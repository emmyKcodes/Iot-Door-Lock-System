#include <ESP32Servo.h>
#include <Keypad.h>
#include <LiquidCrystal_I2C.h>
#include <WiFi.h>

// constants
#define c1 16
#define c2 4
#define c3 0
#define c4 2
#define r1 19
#define r2 18
#define r3 5 
#define r4 17
#define ServoPin 23
#define BuzzerPin 22
#define LedPin 15
#define SDA 33
#define SCL 32
#define PSWD "WHATEVER YOU WANT"
#define SSID "ANYTHING HERE" 
const byte ROWS = 4;
const byte COLS = 4;

// variables
char keys[ROWS][COLS] = {
  {'1', '2', '3', 'A'},
  {'4', '5', '6', 'B'},
  {'7', '8', '9', 'C'},
  {'*', '0', '#', 'D'},
};
byte RowPins[ROWS] = {r1, r2, r3, r4};
byte ColPins[COLS] = {c1, c2, c3, c4};
String password = "2134";
String InputPin;
String FalseInput;
int AdjCol = 6;
int ScreenDelay = 5000;

// instances
Servo servo;
Keypad keypad = Keypad(makeKeymap(keys), RowPins, ColPins, ROWS, COLS);
LiquidCrystal_I2C lcd(0x27, 16, 4);

void SetupWifi(){
  WiFi.begin(SSID, PSWD);
}


// Functions
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
  tone(BuzzerPin, 500, int(3*ScreenDelay/4));
  noTone(BuzzerPin);
  lcd.clear();
  lcd.noBlink();
  lcd.setCursor(4, 0);
  lcd.print("Unlocked");
  lcd.setCursor(2, 1);
  lcd.print("SuccessFully");
  HandleDoorLock();
  delay(ScreenDelay);
  servo.write(0);
  HomePage();
}

void ErrorPage(){
  lcd.clear();
  lcd.noBlink();
  lcd.setCursor(3, 0);
  lcd.print("Incorrect");
  lcd.setCursor(3, 1);
  lcd.print("Password!");
  delay(ScreenDelay);
  HomePage();
}

void WelcomePage(){
  String WelcomeMessage = "Home";
  lcd.clear();
  lcd.noBlink();
  lcd.setCursor(4, 0);
  lcd.print("Welcome");
  delay(1000);
  lcd.setCursor(6, 1);
  lcd.blink();
  for(int i=0; i<4; i++){
    lcd.setCursor(6+i, 1);
    lcd.print(WelcomeMessage[i]);
    delay(250);
  }
  delay(2000);
  HomePage();
}

void setup() {
  Serial.begin(115200);
  Wire.begin(SDA, SCL);
  lcd.init();
  WelcomePage();
  servo.setPeriodHertz(50);
  servo.attach(ServoPin);
  pinMode(LedPin, OUTPUT);
  pinMode(BuzzerPin, OUTPUT);
  servo.write(180);
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

void loop() {
  char key = keypad.getKey();
  if (key) {
    BuzzerInput();
    if (key == '*'){
      AdjCol = 6;
      CheckPassword();
    }else if (key == '#'){
      BackSpace();
    }else{
      InputPin += String(key);
      HandleInput(key);
    };
  };
}

void HandleInput(char key){
  String _key_ = String(key);
  lcd.setCursor(AdjCol, 1);
  lcd.print(_key_);
  AdjCol++;
}

void BuzzerInput(){
  tone(BuzzerPin, 500, 10);
  noTone(BuzzerPin);
}

void HandleDoorLock(){
  for(int i=0; i<=90; i=i+5){
    servo.write(i);
    delay(250);
  }
}

void LedSequence(){
  for(int i=0; i<=10; i++){
  digitalWrite(LedPin, HIGH);
  delay(250);
  digitalWrite(LedPin, LOW);
  delay(250);
  }
}

void ErrorSequence(){
  for(int i=0; i<3; i++){
    digitalWrite(LedPin, HIGH);
    delay(800);
    digitalWrite(LedPin, LOW);
    delay(200);
  }
  for(int j=0; j<2; j++){
    digitalWrite(LedPin, HIGH);
    delay(200);
    digitalWrite(LedPin, LOW);
    delay(200);
  }
}

void CheckPassword(){
  lcd.noBlink();
  if (InputPin.length() == 4){
    if(InputPin == password){
      SuccessPage();
    } else {
      ErrorPage();
    };
  }else{
    ErrorPage();
  };
}
