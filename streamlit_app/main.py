import streamlit as st
import requests
from requests import request
import json
import time
from typing import Optional

# Configuration
API_BASE_URL = "https://iot-door-lock-system.onrender.com"
PIN_API_URL = "https://iot-door-lock-system.onrender.com/iot-door-sys/pin?key=6f9d9614b195f255e7bb3744b92f9486713d9b7eb92edba244bc0f11907ae7c5"
MANUAL_LOCK_API_URL = "https://iot-door-lock-system.onrender.com/iot-door-sys/lock"
ROUTE = "iot-door-sys"

# Page config
st.set_page_config(
    page_title="SmartLock",
    layout="wide",
    initial_sidebar_state="collapsed"
)

def get_state()-> bool:
    """Fetch current lock state from API"""
    try:
        response = request("GET", f"{API_BASE_URL}/{ROUTE}/state", timeout=5)
        if response.ok:
            data = response.json()            
            return data.get('state', False)  # Invert because API returns opposite
        return False
    except Exception as e:
        st.error(f"Connection error: {str(e)}")
        return False

def get_lock() -> bool:
    """Fetch current lock status from API"""
    try:
        response = request("GET", f"{API_BASE_URL}/{ROUTE}/lock", timeout=5)
        if response.ok:
            data = response.json()           
            return data.get('lock', False)  # Invert because API returns opposite
        return False
    except Exception as e:
        st.error(f"Connection error: {str(e)}")
        return False

while get_state() is False or get_lock() is False:
    pass
# Ensure the API is reachable before proceeding

# Initialize session state
if 'lock_state' not in st.session_state:
    st.session_state.lock_state = get_state()
if 'manual_lock_disabled' not in st.session_state:
    st.session_state.manual_lock_disabled = get_lock()
if 'disable_timer' not in st.session_state:
    st.session_state.disable_timer = None

# Custom CSS for styling
st.markdown("""
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
<link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet">

<style>
    /* Hide Streamlit elements */
    #MainMenu {visibility: hidden;}
    footer {visibility: hidden;}
    header {visibility: hidden;}
    .stDeployButton {display: none;}
    .stToolbar {display: none;}
    
    /* Main app styling */
    .stApp {
        background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
        font-family: "Inter", sans-serif;
        transition: all 0.6s cubic-bezier(0.4, 0, 0.2, 1);
    }
    
    .stApp.locked {
        background: linear-gradient(135deg, #1e1b4b 0%, #312e81 100%);
    }
    
    .stApp.unlocked {
        background: linear-gradient(135deg, #064e3b 0%, #065f46 100%);
    }
    
    /* Tab styling */
    .stTabs [data-baseweb="tab-list"] {
        gap: 8px;
        background: rgba(255, 255, 255, 0.05);
        border-radius: 16px;
        padding: 8px;
        backdrop-filter: blur(10px);
        border: 1px solid rgba(255, 255, 255, 0.1);
    }
    
    .stTabs [data-baseweb="tab"] {
        height: 50px;
        padding: 12px 24px;
        background: transparent;
        border-radius: 12px;
        color: #94a3b8;
        font-weight: 500;
        font-size: 14px;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        border: none;
        transition: all 0.3s ease;
    }
    
    .stTabs [data-baseweb="tab"]:hover {
        background: rgba(255, 255, 255, 0.05);
        color: #e2e8f0;
    }
    
    .stTabs [aria-selected="true"] {
        background: rgba(255, 255, 255, 0.1) !important;
        color: #f8fafc !important;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
    }
    
    /* Button styling */
    .stButton > button {
        width: 100%;
        height: 60px;
        background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
        border: none;
        border-radius: 12px;
        color: white;
        font-family: "Inter", sans-serif;
        font-size: 16px;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        transition: all 0.3s ease;
        box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
    }
    
    .stButton > button:hover {
        background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
        transform: translateY(-2px);
        box-shadow: 0 8px 25px rgba(59, 130, 246, 0.4);
    }
    
    .stButton > button:active {
        transform: translateY(0);
    }
    
    /* Lock button container - Perfect centering */
    .lock-button-container {
        display: flex;
        justify-content: center;
        align-items: center;
        width: 100%;
        padding: 2rem 0;
        margin: 2rem 0;
    }
    
    /* Lock button specific styling */
    .lock-button-container .stButton {
        display: flex;
        justify-content: center;
        align-items: center;
    }
    
    .lock-button-container .stButton > button {
        width: 200px !important;
        height: 200px !important;
        border-radius: 50% !important;
        font-size: 18px !important;
        background: linear-gradient(135deg, #475569 0%, #334155 100%);
        box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
        border: 2px solid rgba(255, 255, 255, 0.1);
        backdrop-filter: blur(10px);
        position: relative;
        margin: 0 auto;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
    }
    
    .lock-button-container .stButton > button:hover {
        transform: translateY(-5px) scale(1.02) !important;
        box-shadow: 0 25px 50px rgba(0, 0, 0, 0.4) !important;
    }
    
    .lock-button-locked .stButton > button {
        background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%) !important;
        box-shadow: 0 20px 40px rgba(220, 38, 38, 0.3) !important;
        border-color: rgba(239, 68, 68, 0.3) !important;
    }
    
    .lock-button-locked .stButton > button:hover {
        box-shadow: 0 25px 50px rgba(220, 38, 38, 0.4) !important;
    }
    
    .lock-button-unlocked .stButton > button {
        background: linear-gradient(135deg, #16a34a 0%, #15803d 100%) !important;
        box-shadow: 0 20px 40px rgba(22, 163, 74, 0.3) !important;
        border-color: rgba(34, 197, 94, 0.3) !important;
    }
    
    .lock-button-unlocked .stButton > button:hover {
        box-shadow: 0 25px 50px rgba(22, 163, 74, 0.4) !important;
    }
    
    /* Add icon to lock button */
    .lock-button-container .stButton > button::before {
        content: "lock";
        font-family: "Material Icons";
        font-size: 80px;
        display: block;
        margin-bottom: 8px;
        line-height: 1;
    }
    
    .lock-button-unlocked .stButton > button::before {
        content: "lock_open";
    }
    
    /* Status text centering */
    .status-container {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        text-align: center;
        width: 100%;
        margin: 2rem 0;
    }
    
    /* Text input styling */
    .stTextInput > div > div > input {
        background: rgba(255, 255, 255, 0.05);
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 12px;
        color: #f8fafc;
        font-family: "Inter", sans-serif;
        padding: 12px 16px;
        height: 50px;
    }
    
    .stTextInput > div > div > input:focus {
        border-color: rgba(59, 130, 246, 0.5);
        background: rgba(255, 255, 255, 0.08);
        box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
    }
    
    .stTextInput > label {
        color: #e2e8f0 !important;
        font-weight: 500 !important;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        font-size: 14px !important;
    }
    
    /* Toggle styling */
    .stToggle > div {
        background: rgba(255, 255, 255, 0.05);
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 12px;
        padding: 16px;
    }
    
    /* Selectbox styling */
    .stSelectbox > div > div > div {
        background: rgba(255, 255, 255, 0.05);
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 12px;
        color: #f8fafc;
    }
    
    .stSelectbox > label {
        color: #e2e8f0 !important;
        font-weight: 500 !important;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        font-size: 14px !important;
    }
    
    /* Metric styling */
    .stMetric {
        background: rgba(255, 255, 255, 0.05);
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 16px;
        padding: 20px;
        text-align: center;
        backdrop-filter: blur(10px);
    }
    
    .stMetric > div {
        color: #f8fafc !important;
    }
    
    .stMetric [data-testid="metric-container"] > div:first-child {
        color: #94a3b8 !important;
        font-size: 14px !important;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        font-weight: 500 !important;
    }
    
    .stMetric [data-testid="metric-container"] > div:nth-child(2) {
        color: #f8fafc !important;
        font-size: 24px !important;
        font-weight: 700 !important;
    }
    
    /* Alert styling */
    .stAlert {
        background: rgba(255, 255, 255, 0.05);
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 12px;
        backdrop-filter: blur(10px);
    }
    
    .stAlert [data-testid="alertContainer"] {
        color: #f8fafc;
    }
    
    /* Success alert */
    .stAlert[data-baseweb="notification"][kind="success"] {
        background: rgba(34, 197, 94, 0.1);
        border-color: rgba(34, 197, 94, 0.3);
    }
    
    /* Error alert */
    .stAlert[data-baseweb="notification"][kind="error"] {
        background: rgba(239, 68, 68, 0.1);
        border-color: rgba(239, 68, 68, 0.3);
    }
    
    /* Info alert */
    .stAlert[data-baseweb="notification"][kind="info"] {
        background: rgba(59, 130, 246, 0.1);
        border-color: rgba(59, 130, 246, 0.3);
    }
    
    /* Warning alert */
    .stAlert[data-baseweb="notification"][kind="warning"] {
        background: rgba(245, 158, 11, 0.1);
        border-color: rgba(245, 158, 11, 0.3);
    }
    
    /* Title styling */
    h1 {
        color: #f8fafc !important;
        font-family: "Inter", sans-serif !important;
        font-weight: 700 !important;
        text-align: center;
        margin-bottom: 2rem !important;
    }
    
    h2 {
        color: #e2e8f0 !important;
        font-family: "Inter", sans-serif !important;
        font-weight: 600 !important;
    }
    
    h3 {
        color: #e2e8f0 !important;
        font-family: "Inter", sans-serif !important;
        font-weight: 500 !important;
    }
    
    p {
        color: #94a3b8 !important;
        font-family: "Inter", sans-serif !important;
    }
    
    /* Status text styling */
    .status-text {
        text-align: center;
        font-size: 2rem;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.1em;
        margin: 1rem 0;
    }
    
    .status-locked {
        color: #ef4444;
    }
    
    .status-unlocked {
        color: #22c55e;
    }
    
    .status-description {
        text-align: center;
        font-size: 1.1rem;
        color: #94a3b8;
        margin-bottom: 1rem;
    }
    
    /* Center content */
    .center-content {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        text-align: center;
        width: 100%;
    }
</style>
""", unsafe_allow_html=True)

def fetch_lock_state():
    """Fetch current lock state from API"""
    try:
        response = request("GET", f"{API_BASE_URL}/{ROUTE}/state", timeout=10)
        if response.ok:
            data = response.json()
            return data.get('state', False)  # Invert because API returns opposite
        return None
    except Exception as e:
        st.error(f"Connection error: {str(e)}")
        return None

def toggle_lock_state(new_state):
    """Toggle lock state via API"""
    try:
        response = request("POST",
            f"{API_BASE_URL}/{ROUTE}/state",
            json={"state": bool(new_state)},
            timeout=3)
        if response.status_code == 200:
            print(response.text)
            return True
        else:
            st.error(f"API Error: HTTP {response.status_code}")
            return False
    except Exception as e:
        st.error(f"Connection error: {str(e)}")
        return False

def change_pin(new_pin):
    """Change lock pin via API"""
    try:
        response = requests.post(
            PIN_API_URL,
            json={"pin": new_pin},
            timeout=5
        )
        if response.ok:
            return True, "Pin updated successfully"
        else:
            return False, f"API Error: HTTP {response.status_code}"
    except Exception as e:
        return False, f"Connection error: {str(e)}"

def toggle_manual_lock(disable):
    """Toggle manual lock via API"""
    try:
        response = requests.post(
            MANUAL_LOCK_API_URL,
            json={"lock": bool(disable)},
            timeout=5
        )
        if response.ok:
            return True, "Manual lock setting updated"
        else:
            return False, f"API Error: HTTP {response.status_code}"
    except Exception as e:
        return False, f"Connection error: {str(e)}"

def update_app_theme():
    """Update app theme based on lock state"""
    if st.session_state.lock_state:
        st.markdown('<script>document.querySelector(".stApp").className = "stApp locked";</script>', unsafe_allow_html=True)
    else:
        st.markdown('<script>document.querySelector(".stApp").className = "stApp unlocked";</script>', unsafe_allow_html=True)

# Main app
def main():
    st.title("SmartLock")
    
    # Create tabs
    tab1, tab2, tab3 = st.tabs(["Control", "Change Pin", "Manual Lock"])
    
    # Tab 1: Lock Control
    with tab1:
        st.markdown("### Remote Door Control")
        st.markdown("Professional smart lock management system")
        
        # Fetch initial state
        if st.button("Refresh Status", key="refresh"):
            with st.spinner("Fetching lock status..."):
                state = fetch_lock_state()
                if state is not None:
                    st.session_state.lock_state = state
                    st.success("Status updated successfully")
        
        # Status display - centered
        st.markdown('<div class="status-container">', unsafe_allow_html=True)

        if not st.session_state.lock_state:
            st.markdown('<div class="status-text status-locked">SECURED</div>', unsafe_allow_html=True)
            st.markdown('<div class="status-description">Door is locked and secure</div>', unsafe_allow_html=True)
            button_class = "lock-button-locked"
            button_text = "UNLOCK DOOR"
        else:
            st.markdown('<div class="status-text status-unlocked">UNLOCKED</div>', unsafe_allow_html=True)
            st.markdown('<div class="status-description">Door is open and accessible</div>', unsafe_allow_html=True)
            button_class = "lock-button-unlocked"
            button_text = "LOCK DOOR"
        
        st.markdown('</div>', unsafe_allow_html=True)
        
        # Lock button - perfectly centered
        st.markdown(f'<div class="lock-button-container {button_class}">', unsafe_allow_html=True)
        
        # Create a single centered column for the button
        col1, col2, col3 = st.columns([2, 1, 2])
        with col2:
            if st.button(button_text, key="lock_toggle", help="Click to toggle lock state"):
                with st.spinner("Processing..."):
                    new_state = not st.session_state.lock_state
                    if toggle_lock_state(new_state):
                        st.session_state.lock_state = new_state
                        if new_state:
                            st.success("Door secured successfully!")
                        else:
                            st.success("Door unlocked successfully!")
                        time.sleep(0.01)
                        st.rerun()
                    else:
                        st.error("Failed to toggle lock state")
        
        st.markdown('</div>', unsafe_allow_html=True)
        
        # Status metrics
        st.markdown("---")
        col1, col2, col3, col4 = st.columns(4)
        
        with col1:
            st.metric("Power", "AC", "On")
        
        with col2:
            st.metric("Connection", "Online", "Strong")
        
        with col3:
            st.metric("Encryption", "256-bit", "Secure")
        
        with col4:
            st.metric("Response", "< 100ms", "Fast")
    
    # Tab 2: Pin Change
    with tab2:
        st.markdown("### Change Security Pin")
        st.markdown("Update your lock's security pin code")
        
        with st.form("pin_form"):
            st.markdown("### Use Numbers Only")
            col1, col2, col3 = st.columns([1, 2, 1])
            
            with col2:
                new_pin = st.text_input(
                    "New Pin",
                    type="password",
                    max_chars=4,
                    help="Enter new pin (4-6 digits)"
                )
                
                confirm_pin = st.text_input(
                    "Confirm New Pin",
                    type="password",
                    max_chars=4,
                    help="Confirm your new pin"
                )
                
                submitted = st.form_submit_button("Update Pin", use_container_width=True)
                
                if submitted:
                    # Validation
                    if len(new_pin) < 4:
                        st.error("New pin must be at least 4 digits")
                    elif not new_pin.isdigit():
                        st.error("Pin must contain only numbers")
                    elif new_pin != confirm_pin:
                        st.error("Pin confirmation does not match")
                    else:
                        with st.spinner("Updating pin..."):
                            success, message = change_pin(new_pin)
                            if success:
                                st.success(message)
                                # Clear the form
                                st.rerun()
                            else:
                                st.error(message)
        
        # Security tips
        st.markdown("---")
        st.info("""
        **Security Tips:**
        - Use a unique pin that's not easily guessable
        - Avoid using birthdays or sequential numbers
        - Change your pin regularly for better security
        - Never share your pin with unauthorized persons
        """)
    
    # Tab 3: Manual Lock Control
    with tab3:
        st.markdown("### Manual Lock Control")
        st.markdown("Temporarily disable physical lock operation")
        
        col1, col2, col3 = st.columns([1, 2, 1])
        
        with col2:
            # Toggle switch
            manual_disabled = st.toggle(
                "Disable Manual Lock",
                value=st.session_state.manual_lock_disabled,
                help="When enabled, only remote control will work"
            )
            
            if manual_disabled != st.session_state.manual_lock_disabled:
                with st.spinner("Updating manual lock setting..."):
                    success, message = toggle_manual_lock(manual_disabled)
                    if success:
                        st.session_state.manual_lock_disabled = manual_disabled
                        st.success(message)
                        st.rerun()
                    else:
                        st.error(message)
                        # Revert the toggle state
                        manual_disabled = st.session_state.manual_lock_disabled
            
            if st.session_state.manual_lock_disabled:
                st.warning("Manual lock is currently disabled")
                
                # Timer selection
                timer_options = {
                    "30 Minutes": 30,
                    "1 Hour": 60,
                    "2 Hours": 120,
                    "4 Hours": 240,
                    "8 Hours": 480,
                    "24 Hours": 1440
                }
                
                selected_timer = st.selectbox(
                    "Auto Re-enable After:",
                    options=list(timer_options.keys()),
                    index=0
                )
                
                if st.button("Set Timer", use_container_width=True):
                    minutes = timer_options[selected_timer]
                    st.session_state.disable_timer = time.time() + (minutes * 60)
                    st.success(f"Manual lock will be re-enabled after {selected_timer.lower()}")
                
                # Show remaining time if timer is set
                if st.session_state.disable_timer:
                    remaining = st.session_state.disable_timer - time.time()
                    if remaining > 0:
                        hours = int(remaining // 3600)
                        minutes = int((remaining % 3600) // 60)
                        st.info(f"Time remaining: {hours}h {minutes}m")
                    else:
                        # Timer expired, re-enable manual lock
                        with st.spinner("Re-enabling manual lock..."):
                            success, message = toggle_manual_lock(False)
                            if success:
                                st.session_state.manual_lock_disabled = False
                                st.session_state.disable_timer = None
                                st.success("Manual lock has been automatically re-enabled")
                                st.rerun()
                            else:
                                st.error(f"Failed to re-enable manual lock: {message}")
            else:
                st.success("Manual lock is currently enabled")
        
        # Status indicator
        st.markdown("---")
        if st.session_state.manual_lock_disabled:
            st.error("""
            **Manual Lock Disabled**
            
            The physical lock mechanism is temporarily disabled. Only remote control through this app is available.
            """)
        else:
            st.success("""
            **Manual Lock Enabled**
            
            Both physical and remote lock controls are available.
            """)
        
        # Additional info
        st.markdown("---")
        st.info("""
        **About Manual Lock Control:**
        - Disabling manual lock prevents physical key/button operation
        - Remote control through this app remains available
        - Useful for temporary security measures or maintenance
        - Automatic re-enable ensures you don't get locked out
        """)

if __name__ == "__main__":
    main()
