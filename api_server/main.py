from fastapi import FastAPI
from typing import Optional
from pydantic import BaseModel
import uvicorn
# from icecream import ic as cout
from fastapi.responses import JSONResponse

_key_ = "6f9d9614b195f255e7bb3744b92f9486713d9b7eb92edba244bc0f11907ae7c5"

# TODO: 
# --> open or lock door
# --> change pin
# --> temporarily deactivate manual control
# --> others will think about them soon

#Classes 
class Data(BaseModel):
    state: Optional[bool] = False
    lock: Optional[bool] = True
    pin: Optional[str] = None

    def __getitem__(self, key):
        """Get item by key."""
        pass
        

# constants
title="D.L.I.S. - Door Lock IoT System"
web = FastAPI(title=title, description="IoT Door Lock System API", version="1.0.0")
route = "DLIS"
data = Data()

# TODO: dealing with the state of the door lock
@web.get(f'/{route}/state')
def get_state():
    return {
        "state":
        data.state}

@web.post(f'/{route}/state')
def set_state(_data: Data):
    data.state = _data.state
    return {"Result": "Successfully set state", "door-state": data.state}


# TODO: temporarily deactivating the manual lock, more like an override system
@web.get(f'/{route}/lock')
def get_lock_state():
    return {
        "lock":
        data.lock,
    }

@web.post(f'/{route}/lock')
def set_lock_state(_data: Data):
    data.lock = _data.lock
    return {"Result": "Successfully set lock state", "lock-state": data.lock}


# TODO: changing the pin without footprints in the logs and codebase
@web.get(f'/{route}/pin')
def check_pin(key: Optional[str] = None):
    if key == _key_:
        return {"pin": data.pin}
    else:
        return JSONResponse(
            content={"error": "Invalid key provided. Access denied."},
            status_code=401,
        )

@web.post(f'/{route}/pin')
def update_pin(key: Optional[str], _data : Data):
    if key == _key_:
        if _data.pin is None or _data.pin == "" :
            return JSONResponse(
                content={"error": "Pin is required."},
                status_code=400,
                )
        else:
            data.pin = _data.pin
        # return {"pin": data.pin}
        return {"Result": "Successfully updated pin"}
    else:
        return JSONResponse(
            content={"error": "Invalid key provided. Access denied."},
            status_code=401,
        )
