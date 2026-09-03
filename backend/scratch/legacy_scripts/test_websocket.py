
import asyncio
import websockets
import json

async def test_websocket():
    uri = "ws://localhost:8000/ws/1"
    print(f"🔌 Conectando a {uri}...")
    try:
        async with websockets.connect(uri) as websocket:
            print("✅ Conexión establecida!")
            
            message = "Hola ON"
            print(f"📤 Enviando: {message}")
            await websocket.send(message)
            
            response = await websocket.recv()
            print(f"dt Recibido: {response}")
            
            data = json.loads(response)
            if data["text"] == message and data["sender"] == "You":
                 print("✅ TEST PASSED: Echo recibido correctamente.")
            else:
                 print("❌ TEST FAILED: Respuesta incorrecta.")
                 
    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    asyncio.run(test_websocket())
