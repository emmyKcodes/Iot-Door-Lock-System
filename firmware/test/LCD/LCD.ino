#include <LiquidCrystal_I2C.h>
#include <ESP32Servo.h> 
#include <Keypad.h>

//SDA 21
//SCL 22
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

byte RowPins[ROWS] = {R1, R2, R3, R4};
byte ColPins[COLS] = {C1, C2, C3, C4};

char keys[ROWS][COLS] = {
  {'1', '2', '3', 'A'},
  {'4', '5', '6', 'B'},
  {'7', '8', '9', 'C'},
  {'*', '0', '#', 'D'},
};

LiquidCrystal_I2C lcd(0x27, 16, 2);
Keypad keypad = Keypad(makeKeymap(keys), RowPins, ColPins, ROWS, COLS);
const int PIN_CURSOR_COL = 6;
String InputPin;
enum Page { WELCOME, FADE_IN, SLIDE_IN, HOME, RUNNING };
Page currentPage = WELCOME;
unsigned long lastUpdate = 0;
int animFrame = 0;
long duration;
float distance;
float prev_dist;
unsigned long pastTime; 
int distance_, xDistance;
int AdjCol = 6;
Servo servo;

void setup() {
  ESP32PWM::allocateTimer(0);
	ESP32PWM::allocateTimer(1);
	ESP32PWM::allocateTimer(2);
	ESP32PWM::allocateTimer(3);

  servo.setPeriodHertz(50);
  servo.attach(SERVO, 500, 2400);
  pinMode(TRIG, OUTPUT);
  pinMode(ECHO, INPUT);
  Serial.begin(115200);
  lcd.init();
  lcd.backlight();
  lcd.clear();
  servo.write(0);
}

// Smooth fade-in effect by toggling backlight
void fadeIn() {
  for (int i = 0; i < 3; i++) {
    lcd.noBacklight();
    delay(100);
    lcd.backlight();
    delay(100);
  }
}

// Slide text in from right
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

// Center text on LCD (16 chars wide)
void printCentered(String text, int row) {
  int pos = (16 - text.length()) / 2;
  lcd.setCursor(pos, row);
  lcd.print(text);
}

// Typewriter effect
void typeWriter(String text, int col, int row, int delayMs = 150) {
  for (int i = 0; i < text.length(); i++) {
    lcd.setCursor(col + i, row);
    lcd.print(text[i]);
    delay(delayMs);
  }
}

// Animated welcome sequence
void showWelcome() {
  lcd.clear();
  lcd.noCursor();
  lcd.noBlink();
  
  // Fade in
  // fadeIn();
  // delay(300);
  
  // Slide in "Welcome"
  slideText("Welcome", 0, 4, 40);
  delay(500);

  delay(1000);
  
  // Smooth transition to home
  // for (int i = 0; i < 16; i++) {
  //   lcd.scrollDisplayLeft();
  //   delay(100);
  // }
}

// Animated transition to home page
void transitionToHome() {
  lcd.clear();
  
  // Wipe effect - reveal text line by line
  String line1 = "Enter Your PIN";
  String line2 = "____";
  
  for (int i = 0; i <= line1.length(); i++) {
    lcd.setCursor(1, 0);
    lcd.print(line1.substring(0, i));
    delay(40);
  }
  
  delay(200);
  
  for (int i = 0; i <= line2.length(); i++) {
    lcd.setCursor(((16-line2.length())/2), 1);
    lcd.print(line2.substring(0, i));
    delay(40);
  }
  
  // Animate cursor to PIN position
  delay(300);
  lcd.setCursor(((16-line2.length())/2), 1);
  lcd.blink();
}

// Pulsing cursor effect for idle state
void pulseEffect() {
  static bool blinkState = false;
  if (millis() - lastUpdate > 500) {
    blinkState = !blinkState;
    if (blinkState) lcd.blink();
    else lcd.noBlink();
    lastUpdate = millis();
  }
}

// Loading animation (for after PIN entry)
void showLoading() {
  lcd.clear();
  lcd.noBlink();
  printCentered("Processing", 0);
  
  char loadChars[] = {'|', '/', '-', '\\'};
  for (int i = 0; i < 12; i++) {
    lcd.setCursor(7, 1);
    lcd.print(loadChars[i % 4]);
    delay(150);
  }
}

// Success animation
void showSuccess() {
  lcd.clear();
  
  // Expand from center
  String msg = "Access Granted!";
  int center = 8;
  for (int i = 0; i <= msg.length() / 2; i++) {
    lcd.clear();
    int start = center - i;
    lcd.setCursor(start, 0);
    lcd.print(msg.substring(msg.length()/2 - i, msg.length()/2 + i));
    delay(80);
  }
  
  printCentered(msg, 0);
  
  // Flash effect
  for (int i = 0; i < 7; i++) {
    delay(200);
    lcd.noBacklight();
    delay(100);
    lcd.backlight();
  }
}

// Error animation
void showError() {
  lcd.clear();
  lcd.noBlink();
  
  // Shake effect
  for (int i = 0; i < 3; i++) {
    printCentered("Access Denied!", 0);
    printCentered("Try Again", 1);
    delay(100);
    lcd.clear();
    delay(100);
  }
  
  printCentered("Access Denied!", 0);
  printCentered("Try Again", 1);
  delay(2000);
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

void CheckPassword(){
  lcd.noBlink();
  if(InputPin.length() == 4){
    showLoading();
    if(InputPin == "2134"){
      showSuccess();
    }else{
      showError();
    }
    delay(1000);
    currentPage = HOME;
  }
}

void loop() {
  switch (currentPage) {
    case WELCOME:
      pastTime = millis();
      showWelcome();
      currentPage = HOME;
      break;
      
    case HOME:
      transitionToHome();
      currentPage = RUNNING;
      InputPin = "";
      Serial.println("Ready for PIN input");
      break;
      
    case RUNNING:
      // lcd.noBlink();
      // lcd.noCursor();
      // if(millis() - pastTime > 250){
      //   distance_ = getDist();
      //   if((String)xDistance != (String)distance_){
      //   lcd.setCursor(6, 1);
      //   lcd.print("        ");
      //   xDistance = distance_;
      //   }
      //   pastTime = millis();
      // }else{
      //   xDistance = distance;
      //   lcd.setCursor(6, 1);
      //   lcd.print((String)distance_);
      //   Serial.println(distance_);
      //   Serial.println(millis() - pastTime);
      // }

      // if(distance_ < 35){
      //   servo.write(90);
      // }else{
      //   servo.write(0);
      // }

      // pulseEffect();

      char key = keypad.getKey();

      if (key) {
        // BuzzerInput();
        if (key == '*'){
          unsigned long CheckDelay = millis();
          AdjCol = 6;
          CheckPassword();
        }else if (key == '#'){
          BackSpace();
        }else{
          InputPin += String(key);
          HandleInput(key);
        };
      };

      // Simulate PIN input (replace with actual keypad logic)
      if (Serial.available()) {
        char key = Serial.read();
        if (key >= '0' && key <= '9') {
          InputPin += key;
          lcd.print("*"); // Show asterisk for security
          
          if (InputPin.length() >= 4) {
            showLoading();
            
            // Check PIN (example)
            if (InputPin == "1234") {
              showSuccess();
            } else {
              showError();
            }
            
            delay(1000);
            currentPage = HOME; // Return to home
          }
        }
      }
      break;
  }
}