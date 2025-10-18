from fastapi import FastAPI, HTTPException, Header
from typing import Optional
from pydantic import BaseModel, Field
import uvicorn
from fastapi.responses import ORJSONResponse
import orjson
from functools import lru_cache
import asyncio
from contextlib import asynccontextmanager

_key_ = "6f9d9614b195f255e7bb3744b92f9486713d9b7eb92edba244bc0f11907ae7c5"

_memory_cache = {}


@asynccontextmanager
async def lifespan(app: FastAPI):
    global _memory_cache
    try:
        with open("api_data.json", "r") as f:
            _memory_cache = orjson.loads(f.read())
    except FileNotFoundError:
        _memory_cache = {"state": False, "lock": False, "pin": None}

    yield

    with open("api_data.json", "wb") as f:
        f.write(orjson.dumps(_memory_cache))


class Storage:
    @staticmethod
    def load_data():
        return _memory_cache

    @staticmethod
    async def store_data(key: str, value):
        _memory_cache[key] = value

        await asyncio.create_task(Storage._async_write())

    @staticmethod
    async def _async_write():
        await asyncio.sleep(0.1)
        with open("api_data.json", "wb") as f:
            f.write(orjson.dumps(_memory_cache))


class StateModel(BaseModel):
    state: bool


class LockModel(BaseModel):
    lock: bool


class PinModel(BaseModel):
    pin: str = Field(min_length=1)


web = FastAPI(
    title="D.L.I.S. - Door Lock IoT System",
    description="IoT Door Lock System API",
    version="2.0.0",
    default_response_class=ORJSONResponse,  # Faster JSON serialization
    lifespan=lifespan
)

route = "DLIS"


@web.get(f'/{route}/state', response_model=StateModel)
async def get_state():
    return {"state": _memory_cache.get("state", False)}


@web.post(f'/{route}/state')
async def set_state(data: StateModel):
    await Storage.store_data("state", data.state)
    return {"result": "ok", "state": data.state}


@web.get(f'/{route}/lock', response_model=LockModel)
async def get_lock_state():
    return {"lock": _memory_cache.get("lock", False)}


@web.post(f'/{route}/lock')
async def set_lock_state(data: LockModel):
    await Storage.store_data("lock", data.lock)
    return {"result": "ok", "lock": data.lock}


@web.get(f'/{route}/pin')
async def check_pin(key: str = Header(..., alias="key")):
    if key != _key_:
        raise HTTPException(status_code=401, detail="Invalid key")
    return {"pin": _memory_cache.get("pin")}


@web.post(f'/{route}/pin')
async def update_pin(data: PinModel, key: str = Header(..., alias="key")):
    if key != _key_:
        raise HTTPException(status_code=401, detail="Invalid key")

    await Storage.store_data("pin", data.pin)
    return {"result": "ok"}


if __name__ == "__main__":
    uvicorn.run(
        web,
        host="0.0.0.0",
        port=8000,
        # Production optimizations
        workers=2,  # Adjust based on CPU cores
        limit_concurrency=100,
        limit_max_requests=10000
    )
