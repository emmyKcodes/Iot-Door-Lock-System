import asyncio
import websockets

# Replace with your FastAPI WebSocket server URL
WS_URL = "ws://localhost:8000/DLIS/state"

async def test_websocket():
    try:
        while True:
            # Connect to the WebSocket server   
            async with websockets.connect(WS_URL) as websocket:
                print("[CLIENT] Connected to server")

                # # Example message to send to server
                # await websocket.send("Hello from test client!")
                # print("[CLIENT] Sent: Hello from test client!")

                await websocket.send(b'0110')  # Example message to trigger state update
                print("[CLIENT] Sent: 0110")

                # Receive response (optional)
                response = await websocket.recv()
                print("[CLIENT] Received:", response)

    except Exception as e:
        print("[ERROR]", e)

asyncio.run(test_websocket())
