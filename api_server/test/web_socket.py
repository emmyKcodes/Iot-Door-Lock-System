from typing import Optional
from fastapi import FastAPI, WebSocket
from fastapi.responses import HTMLResponse
from dataclasses import dataclass

# FastAPI application setup
title = "D.L.I.S. - Door Lock IoT System"
web = FastAPI(title=title, description="IoT Door Lock System API", version="1.0.0")

client_connections = []

@dataclass
class Data:
    state: Optional[bool] = False
    lock: Optional[bool] = True
    pin: Optional[str] = None

data = Data()

@web.websocket("/DLIS/state")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    client_connections.append(websocket)
    try:
        while True:
            condition = await websocket.receive_bytes()

            print(condition)

            if condition == b'0110': # GET
                print(f"[WEB] Received data: {condition}")
                for client in client_connections:
                    await client.send_text(str(data.state))

            elif condition == b'1001': # POST
                print("[WEB] Received data: {condition}")
                state =  await websocket.receive_text()
                data.state = state.lower()
                for client in client_connections:
                    await client.send_text("Door state updated successfully")

    except Exception as e:
        client_connections.remove(websocket)
        # await websocket.close()
        print("[WEB] WebSocket currently has an Error: ", e)