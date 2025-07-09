# 🔐 Iot Door Lock Security System

A hybrid smart lock system using **ESP32** for secure door control with both **manual keypad access** and **remote web-based control**. This project bridges hardware security with cloud connectivity using a custom PythonAnywhere API and Streamlit dashboard.

---

## 📦 Features

- 🔢 Local access using 4x4 Keypad with PIN verification
- 🌐 Remote unlock/lock via Streamlit interface
- 🔧 Update/change access PIN through web
- 🔒 Servo motor to physically lock/unlock door
- 📟 I2C LCD for displaying system status
- 🔊 Buzzer for audible feedback
- ☁️ ESP32 connects to Wi-Fi for IoT integration

---

## 🛠️ Hardware Components

| Component      | Description                       |
|----------------|-----------------------------------|
| ESP32          | Main controller with Wi-Fi        |
| 4x4 Keypad     | For local PIN entry               |
| Servo Motor    | Door locking mechanism            |
| Buzzer         | Feedback for access attempts      |
| I2C LCD        | Status display                    |
| Power Supply   | Stable 5V for ESP32 and peripherals |

---

## 🧠 System Overview

1. **Local Access:**  
   Users enter a PIN via the keypad. The system checks the stored PIN and unlocks the door if correct. Buzzer and LCD provide feedback.

2. **Remote Access:**  
   A user-friendly **Streamlit web dashboard** allows:
   - Remotely unlocking the door
   - Changing the door PIN
   - Viewing system status (coming soon)

3. **API Backend:**  
   A lightweight RESTful API hosted on PythonAnywhere handles secure requests from the web app to the ESP32.

---

## 🌐 IoT Stack

- **ESP32** (C++/Arduino)
- **Streamlit** (Python)
- **PythonAnywhere** (REST API)
- **HTTP/Webhooks** for commands

---

## 📂 Repository Structure

```plaintext
├── firmware/            # ESP32 firmware code
│   └── main.ino
├── streamlit_app/       # Web interface (Streamlit)
│   └── app.py
├── api_server/          # PythonAnywhere API backend
|   └── test/
|   |   └── one.py
|   |   └── api_client.py
│   └── main.py
├── circuit_prototyping/     # Fritzing or schematic files
├── README.md

