from flask import Flask, request, jsonify, abort
from functools import wraps
import json
import threading
import time
from typing import Optional

_key_ = "6f9d9614b195f255e7bb3744b92f9486713d9b7eb92edba244bc0f11907ae7c5"

_memory_cache = {}
_write_lock = threading.Lock()


class Storage:
    @staticmethod
    def load_data():
        global _memory_cache
        try:
            with open("api_data.json", "r") as f:
                _memory_cache = json.load(f)
        except FileNotFoundError:
            _memory_cache = {"state": False, "lock": False, "pin": None}

    @staticmethod
    def store_data(key: str, value):
        _memory_cache[key] = value
        # Async write in background thread
        threading.Thread(target=Storage._write_to_file, daemon=True).start()

    @staticmethod
    def _write_to_file():
        time.sleep(0.1)  # Simulate async delay
        with _write_lock:
            with open("api_data.json", "w") as f:
                json.dump(_memory_cache, f)


# Initialize Flask app
web = Flask(__name__)
web.config['JSON_SORT_KEYS'] = False

route = "DLIS"

# Load data on startup
Storage.load_data()


# Save data on shutdown
def save_on_exit():
    with open("api_data.json", "w") as f:
        json.dump(_memory_cache, f)


import atexit

atexit.register(save_on_exit)


# Auth decorator
def require_key(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        key = request.headers.get('key')
        if key != _key_:
            abort(401, description="Invalid key")
        return f(*args, **kwargs)

    return decorated_function


# Routes
@web.route(f'/{route}/state', methods=['GET'])
def get_state():
    return jsonify({"state": _memory_cache.get("state", False)})


@web.route(f'/{route}/state', methods=['POST'])
def set_state():
    data = request.get_json()
    if data is None or 'state' not in data:
        abort(400, description="Missing 'state' field")

    if not isinstance(data['state'], bool):
        abort(400, description="'state' must be a boolean")

    Storage.store_data("state", data['state'])
    return jsonify({"result": "ok", "state": data['state']})


@web.route(f'/{route}/lock', methods=['GET'])
def get_lock_state():
    return jsonify({"lock": _memory_cache.get("lock", False)})


@web.route(f'/{route}/lock', methods=['POST'])
def set_lock_state():
    data = request.get_json()
    if data is None or 'lock' not in data:
        abort(400, description="Missing 'lock' field")

    if not isinstance(data['lock'], bool):
        abort(400, description="'lock' must be a boolean")

    Storage.store_data("lock", data['lock'])
    return jsonify({"result": "ok", "lock": data['lock']})


@web.route(f'/{route}/pin', methods=['GET'])
@require_key
def check_pin():
    return jsonify({"pin": _memory_cache.get("pin")})


@web.route(f'/{route}/pin', methods=['POST'])
@require_key
def update_pin():
    data = request.get_json()
    if data is None or 'pin' not in data:
        abort(400, description="Missing 'pin' field")

    pin = data['pin']
    if not isinstance(pin, str) or len(pin) < 1:
        abort(400, description="'pin' must be a non-empty string")

    Storage.store_data("pin", pin)
    return jsonify({"result": "ok"})


# Error handlers
@web.errorhandler(400)
def bad_request(e):
    return jsonify({"detail": str(e.description)}), 400


@web.errorhandler(401)
def unauthorized(e):
    return jsonify({"detail": str(e.description)}), 401


if __name__ == "__main__":
    web.run(
        host="0.0.0.0",
        port=8000,
        debug=False,
        threaded=True
    )