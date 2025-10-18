import streamlit as st
import requests
import json
from typing import Optional
import time

# Configuration
API_BASE_URL = "http://localhost:8000"
API_KEY = "6f9d9614b195f255e7bb3744b92f9486713d9b7eb92edba244bc0f11907ae7c5"
ROUTE = "iot-door-sys"

# Page config
st.set_page_config(
    page_title="SmartLock",
    page_icon=":material/token:",
    layout="wide",
    initial_sidebar_state="expanded"
)

man_ctrl = st.Page()
pin = st.Page()


pg = st.navigation(
    position='top', expanded=True,
    pages={
        "Home": st.Page(
            key="home",
            icon=":material/home:",
            on_click=lambda: st.session_state.update({"door_state": True})
        ),
        "Manual Control": st.
    }
)

# Title
with st.sidebar:
    _title = st.container(
        height=60, border=False,
    )
    _title.markdown("""
    <link href="https://fonts.googleapis.com/css2?family=Bitcount+Grid+Double:wght@100..900&display=swap" rel="stylesheet">
    <style>
        .custom-title {
            font-family:  "Bitcount Grid Double", system-ui;
            font-size: 30px;
            color: #1f77b4;
            text-align: top;
            margin-bottom: 0px;
        }
    </style>
    <div class="custom-title">SmartLock</div>
""", unsafe_allow_html=True)
    
    st.button(
            label="Home",
            icon=":material/home:",
            key="lock",
            on_click=lambda: st.session_state.update({"door_state": True})
        )
    
    st.button(
            label="Manual Control",
            icon=":material/lock:",
            key="man_ctrl",
            on_click=lambda: st.session_state.update({"door_state": True})
    )

    st.button(
            label="Change Pin",
            icon=":material/key:",
            key="pin",
            on_click=lambda: st.session_state.update({"door_state": True})
    )